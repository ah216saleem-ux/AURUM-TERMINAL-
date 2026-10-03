import { ClosedCandle } from './phaseXEngine.js';
import { registerLiveTickListener, LivePriceData } from './websocketServer.js';
import fs from 'fs';
import path from 'path';

export interface DataStatus {
  h1Count: number;
  m15Count: number;
  lastTickAge: number;
  spread: number;
  status: 'OK' | 'WARMING UP' | 'STALE';
  historySource?: 'BiQuote (history)' | 'BiQuote ticks only';
}

const CACHE_DIR = path.join(process.cwd(), 'data');
const H1_CACHE_FILE = path.join(CACHE_DIR, 'biquote_candles_h1.json');
const M30_CACHE_FILE = path.join(CACHE_DIR, 'biquote_candles_m30.json');
const M15_CACHE_FILE = path.join(CACHE_DIR, 'biquote_candles_m15.json');
const M5_CACHE_FILE = path.join(CACHE_DIR, 'biquote_candles_m5.json');

// In-memory candle storage for 4 internal timeframes
let closedCandlesH1: ClosedCandle[] = [];
let closedCandlesM30: ClosedCandle[] = [];
let closedCandlesM15: ClosedCandle[] = [];
let closedCandlesM5: ClosedCandle[] = [];

let historySource: 'BiQuote (history)' | 'BiQuote ticks only' = 'BiQuote ticks only';

export function getHistorySource(): 'BiQuote (history)' | 'BiQuote ticks only' {
  return historySource;
}

/**
 * Apply sanity check on consecutive candles.
 * If two consecutive candles have a close price difference > $15,
 * log the anomaly and discard all candles before that point.
 */
function applySanityCheck(candles: ClosedCandle[]): ClosedCandle[] {
  let startIndex = 0;
  for (let i = 1; i < candles.length; i++) {
    const diff = Math.abs(candles[i].close - candles[i - 1].close);
    if (diff > 15) {
      console.warn(`[CandleBuilderService] Sanity check failed: Consecutive candles close difference is $${diff.toFixed(2)} (> $15) between index ${i - 1} (close: ${candles[i - 1].close}) and index ${i} (close: ${candles[i].close}). Discarding all candles prior to index ${i}.`);
      startIndex = i;
    }
  }
  return candles.slice(startIndex);
}

export function saveCandlesToDisk(timeframe: 'H1' | 'M30' | 'M15' | 'M5', candles: ClosedCandle[]) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    let file = H1_CACHE_FILE;
    if (timeframe === 'M30') file = M30_CACHE_FILE;
    if (timeframe === 'M15') file = M15_CACHE_FILE;
    if (timeframe === 'M5') file = M5_CACHE_FILE;

    fs.writeFileSync(file, JSON.stringify(candles, null, 2), 'utf8');
  } catch (err) {
    console.error(`[CandleBuilderService] Error saving ${timeframe} candles to disk:`, err);
  }
}

function loadCandlesFromDisk(timeframe: 'H1' | 'M30' | 'M15' | 'M5'): ClosedCandle[] {
  try {
    let file = H1_CACHE_FILE;
    if (timeframe === 'M30') file = M30_CACHE_FILE;
    if (timeframe === 'M15') file = M15_CACHE_FILE;
    if (timeframe === 'M5') file = M5_CACHE_FILE;

    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8');
      const candles = JSON.parse(raw) as ClosedCandle[];
      if (Array.isArray(candles)) {
        return applySanityCheck(candles);
      }
    }
  } catch (err) {
    console.error(`[CandleBuilderService] Error loading ${timeframe} candles from disk:`, err);
  }
  return [];
}

function cleanOldCaches() {
  try {
    const legacyFiles = [
      path.join(CACHE_DIR, 'legacy_candles_h1.json'),
      path.join(CACHE_DIR, 'legacy_candles_m30.json'),
      path.join(CACHE_DIR, 'legacy_candles_m15.json'),
      path.join(CACHE_DIR, 'legacy_candles_m5.json'),
      path.join(CACHE_DIR, 'legacy_candles.json'),
    ];
    for (const f of legacyFiles) {
      if (fs.existsSync(f)) {
        fs.unlinkSync(f);
        console.log(`[CandleBuilderService] Deleted old legacy cache file: ${f}`);
      }
    }
  } catch (err) {
    // Avoid printing error if file just didn't exist
  }
}

/**
 * Attempt to fetch historical candles from Broker/BiQuote API
 */
async function fetchBrokerCandles(symbol: string, interval: string): Promise<any[] | null> {
  try {
    const brokerSymbol = 'XAUUSD';
    const url = `https://biquote.io/api/candles/${brokerSymbol}?interval=${interval}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 10) {
        return data;
      }
    } else {
      console.warn(`[CandleBuilderService] BiQuote endpoint ${url} failed with HTTP status: ${res.status}`);
    }
  } catch (err: any) {
    console.warn(`[CandleBuilderService] BiQuote endpoint fetch error for interval ${interval}:`, err.message || err);
  }
  return null;
}

let formingCandleH1: ClosedCandle | null = null;
let formingCandleM30: ClosedCandle | null = null;
let formingCandleM15: ClosedCandle | null = null;
let formingCandleM5: ClosedCandle | null = null;

let lastTickTimestamp: number = 0;
let currentSpread: number = 0.18; // Default spot spread
let isInitialized: boolean = false;
let isInitializing: boolean = false;

// Event listener for H1 Close
type H1CloseListener = (newH1Candle: ClosedCandle, allClosedH1: ClosedCandle[]) => void;
const h1CloseListeners = new Set<H1CloseListener>();

export function registerOnH1Close(listener: H1CloseListener) {
  h1CloseListeners.add(listener);
  return () => {
    h1CloseListeners.delete(listener);
  };
}

/**
 * Align timestamp to UTC Hour start (:00:00)
 */
export function getH1Boundary(timestamp: number): number {
  const d = new Date(timestamp);
  d.setUTCMinutes(0, 0, 0);
  d.setUTCSeconds(0, 0);
  return d.getTime();
}

/**
 * Align timestamp to UTC 30-Minute start (:00, :30)
 */
export function getM30Boundary(timestamp: number): number {
  const d = new Date(timestamp);
  const m = d.getUTCMinutes();
  const alignedM = Math.floor(m / 30) * 30;
  d.setUTCMinutes(alignedM, 0, 0);
  d.setUTCSeconds(0, 0);
  return d.getTime();
}

/**
 * Align timestamp to UTC 15-Minute start (:00, :15, :30, :45)
 */
export function getM15Boundary(timestamp: number): number {
  const d = new Date(timestamp);
  const m = d.getUTCMinutes();
  const alignedM = Math.floor(m / 15) * 15;
  d.setUTCMinutes(alignedM, 0, 0);
  d.setUTCSeconds(0, 0);
  return d.getTime();
}

/**
 * Align timestamp to UTC 5-Minute start (:00, :05, :10, :15, ...)
 */
export function getM5Boundary(timestamp: number): number {
  const d = new Date(timestamp);
  const m = d.getUTCMinutes();
  const alignedM = Math.floor(m / 5) * 5;
  d.setUTCMinutes(alignedM, 0, 0);
  d.setUTCSeconds(0, 0);
  return d.getTime();
}

/**
 * Initialize candle builder with historical closed candles.
 * Deletes old legacy caches, tries Broker/BiQuote first, falls back to disk cache.
 */
export async function initializeCandleBuilder() {
  if (isInitialized || isInitializing) return;
  isInitializing = true;
  console.log('[CandleBuilderService] Preloading historical closed candles...');

  // Delete old legacy caches if present
  cleanOldCaches();

  // Load from disk caches first (so we don't lose data on restart if BiQuote history API fails)
  closedCandlesH1 = loadCandlesFromDisk('H1');
  closedCandlesM30 = loadCandlesFromDisk('M30');
  closedCandlesM15 = loadCandlesFromDisk('M15');
  closedCandlesM5 = loadCandlesFromDisk('M5');

  console.log(`[CandleBuilderService] Restored from Disk Cache: ${closedCandlesH1.length} H1, ${closedCandlesM15.length} M15 candles.`);

  try {
    // Attempt to fetch fresh history from BiQuote API
    let freshH1 = await fetchBrokerCandles('XAUUSD', '1h');
    if (freshH1 && freshH1.length > 1) {
      const closed = freshH1.slice(0, -1);
      closedCandlesH1 = applySanityCheck(closed.map(c => ({
        time: c.time,
        timeLabel: c.timeLabel || new Date(c.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        open: +c.open,
        high: +c.high,
        low: +c.low,
        close: +c.close,
        volume: +c.volume || 0
      })));
      saveCandlesToDisk('H1', closedCandlesH1);
      console.log(`[CandleBuilderService] Loaded ${closedCandlesH1.length} H1 closed candles from BiQuote API.`);
    }

    let freshM30 = await fetchBrokerCandles('XAUUSD', '30m');
    if (freshM30 && freshM30.length > 1) {
      const closed = freshM30.slice(0, -1);
      closedCandlesM30 = applySanityCheck(closed.map(c => ({
        time: c.time,
        timeLabel: c.timeLabel || new Date(c.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        open: +c.open,
        high: +c.high,
        low: +c.low,
        close: +c.close,
        volume: +c.volume || 0
      })));
      saveCandlesToDisk('M30', closedCandlesM30);
    }

    let freshM15 = await fetchBrokerCandles('XAUUSD', '15m');
    if (freshM15 && freshM15.length > 1) {
      const closed = freshM15.slice(0, -1);
      closedCandlesM15 = applySanityCheck(closed.map(c => ({
        time: c.time,
        timeLabel: c.timeLabel || new Date(c.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        open: +c.open,
        high: +c.high,
        low: +c.low,
        close: +c.close,
        volume: +c.volume || 0
      })));
      saveCandlesToDisk('M15', closedCandlesM15);
      console.log(`[CandleBuilderService] Loaded ${closedCandlesM15.length} M15 closed candles from BiQuote API.`);
    }

    let freshM5 = await fetchBrokerCandles('XAUUSD', '5m');
    if (freshM5 && freshM5.length > 1) {
      const closed = freshM5.slice(0, -1);
      closedCandlesM5 = applySanityCheck(closed.map(c => ({
        time: c.time,
        timeLabel: c.timeLabel || new Date(c.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        open: +c.open,
        high: +c.high,
        low: +c.low,
        close: +c.close,
        volume: +c.volume || 0
      })));
      saveCandlesToDisk('M5', closedCandlesM5);
    }

    // Register real-time live tick listener
    registerLiveTickListener(handleLivePriceTick);

    isInitialized = true;
    console.log('[CandleBuilderService] Candle initialization completed.');
  } catch (err) {
    console.error('[CandleBuilderService] Error preloading candle history:', err);
  } finally {
    isInitializing = false;

    // Update historySource dynamically depending on H1 count
    if (closedCandlesH1.length >= 200) {
      historySource = 'BiQuote (history)';
    } else {
      historySource = 'BiQuote ticks only';
    }
  }
}

/**
 * Retrieve current closed candles for Engine execution
 */
export function getClosedCandlesH1(): ClosedCandle[] {
  return [...closedCandlesH1];
}

export function getClosedCandlesM30(): ClosedCandle[] {
  return [...closedCandlesM30];
}

export function getClosedCandlesM15(): ClosedCandle[] {
  return [...closedCandlesM15];
}

export function getClosedCandlesM5(): ClosedCandle[] {
  return [...closedCandlesM5];
}

/**
 * Retrieve current forming candles for real-time UI/HUD display only
 */
export function getFormingCandleH1(): ClosedCandle | null {
  return formingCandleH1;
}

export function getFormingCandleM30(): ClosedCandle | null {
  return formingCandleM30;
}

export function getFormingCandleM15(): ClosedCandle | null {
  return formingCandleM15;
}

export function getFormingCandleM5(): ClosedCandle | null {
  return formingCandleM5;
}

/**
 * Retrieve data layer health and status metrics
 */
export function getCandleDataStatus(): DataStatus {
  const now = Date.now();
  const lastTickAge = lastTickTimestamp > 0 ? Math.max(0, Math.floor((now - lastTickTimestamp) / 1000)) : 999;

  // Update historySource based on actual content
  if (closedCandlesH1.length >= 200) {
    historySource = 'BiQuote (history)';
  } else {
    historySource = 'BiQuote ticks only';
  }

  let status: 'OK' | 'WARMING UP' | 'STALE' = 'OK';
  if (closedCandlesH1.length < 200) {
    status = 'WARMING UP';
  } else if (lastTickAge > 5) {
    status = 'STALE';
  }

  return {
    h1Count: closedCandlesH1.length,
    m15Count: closedCandlesM15.length,
    lastTickAge,
    spread: +currentSpread.toFixed(2),
    status,
    historySource
  };
}

/**
 * Handle incoming live price tick to construct and close candles
 */
function handleLivePriceTick(tick: LivePriceData) {
  if (tick.assetId !== 'xau-usd') return;

  const now = Date.now();
  lastTickTimestamp = now;

  // Spread calculation from bid/ask
  if (tick.ask && tick.bid) {
    currentSpread = tick.ask - tick.bid;
  }

  const price = tick.price;
  const tickTime = tick.timestamp || now;

  // 1. Process M5 Candle Building
  const m5Boundary = getM5Boundary(tickTime);
  if (!formingCandleM5) {
    formingCandleM5 = {
      time: m5Boundary,
      timeLabel: new Date(m5Boundary).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1
    };
  } else if (m5Boundary > formingCandleM5.time) {
    const alreadyClosed = closedCandlesM5.some(c => c.time === formingCandleM5!.time);
    if (!alreadyClosed) {
      closedCandlesM5.push({ ...formingCandleM5 });
      if (closedCandlesM5.length > 1000) {
        closedCandlesM5.shift();
      }
      saveCandlesToDisk('M5', closedCandlesM5);
    }
    formingCandleM5 = {
      time: m5Boundary,
      timeLabel: new Date(m5Boundary).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1
    };
  } else {
    formingCandleM5.high = Math.max(formingCandleM5.high, price);
    formingCandleM5.low = Math.min(formingCandleM5.low, price);
    formingCandleM5.close = price;
    formingCandleM5.volume += 1;
  }

  // 2. Process M15 Candle Building
  const m15Boundary = getM15Boundary(tickTime);
  if (!formingCandleM15) {
    formingCandleM15 = {
      time: m15Boundary,
      timeLabel: new Date(m15Boundary).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1
    };
  } else if (m15Boundary > formingCandleM15.time) {
    const expectedPrevBoundary = getM15Boundary(tickTime - 15 * 60000);
    const isIncomplete = formingCandleM15.time < expectedPrevBoundary;
    if (isIncomplete) {
      console.warn(`[CandleBuilderService] Gap detected on M15 candle! Expected ${new Date(expectedPrevBoundary).toISOString()} but last was ${new Date(formingCandleM15.time).toISOString()}`);
    }

    const alreadyClosed = closedCandlesM15.some(c => c.time === formingCandleM15!.time);
    if (!alreadyClosed) {
      closedCandlesM15.push({ ...formingCandleM15 });
      if (closedCandlesM15.length > 1000) {
        closedCandlesM15.shift();
      }
      saveCandlesToDisk('M15', closedCandlesM15);
    }
    formingCandleM15 = {
      time: m15Boundary,
      timeLabel: new Date(m15Boundary).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1,
      ...(isIncomplete ? { isIncomplete: true } as any : {})
    };
  } else {
    formingCandleM15.high = Math.max(formingCandleM15.high, price);
    formingCandleM15.low = Math.min(formingCandleM15.low, price);
    formingCandleM15.close = price;
    formingCandleM15.volume += 1;
  }

  // 3. Process M30 Candle Building
  const m30Boundary = getM30Boundary(tickTime);
  if (!formingCandleM30) {
    formingCandleM30 = {
      time: m30Boundary,
      timeLabel: new Date(m30Boundary).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1
    };
  } else if (m30Boundary > formingCandleM30.time) {
    const alreadyClosed = closedCandlesM30.some(c => c.time === formingCandleM30!.time);
    if (!alreadyClosed) {
      closedCandlesM30.push({ ...formingCandleM30 });
      if (closedCandlesM30.length > 1000) {
        closedCandlesM30.shift();
      }
      saveCandlesToDisk('M30', closedCandlesM30);
    }
    formingCandleM30 = {
      time: m30Boundary,
      timeLabel: new Date(m30Boundary).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1
    };
  } else {
    formingCandleM30.high = Math.max(formingCandleM30.high, price);
    formingCandleM30.low = Math.min(formingCandleM30.low, price);
    formingCandleM30.close = price;
    formingCandleM30.volume += 1;
  }

  // 4. Process H1 Candle Building
  const h1Boundary = getH1Boundary(tickTime);
  if (!formingCandleH1) {
    formingCandleH1 = {
      time: h1Boundary,
      timeLabel: new Date(h1Boundary).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1
    };
  } else if (h1Boundary > formingCandleH1.time) {
    const expectedPrevBoundary = getH1Boundary(tickTime - 60 * 60000);
    const isIncomplete = formingCandleH1.time < expectedPrevBoundary;
    if (isIncomplete) {
      console.warn(`[CandleBuilderService] Gap detected on H1 candle! Last was ${new Date(formingCandleH1.time).toISOString()}`);
    }

    const alreadyClosed = closedCandlesH1.some(c => c.time === formingCandleH1!.time);
    let closedH1Ref: ClosedCandle | null = null;
    if (!alreadyClosed) {
      closedH1Ref = { ...formingCandleH1 };
      closedCandlesH1.push(closedH1Ref);
      if (closedCandlesH1.length > 1000) {
        closedCandlesH1.shift();
      }
      saveCandlesToDisk('H1', closedCandlesH1);
    }

    // Trigger onH1Close callbacks for Engine A execution!
    if (closedH1Ref) {
      console.log(`[CandleBuilderService] H1 candle closed at ${closedH1Ref.timeLabel}. Invoking onH1Close event callbacks...`);
      h1CloseListeners.forEach(listener => {
        try {
          listener(closedH1Ref!, [...closedCandlesH1]);
        } catch (e) {
          console.error('[CandleBuilderService] Error invoking H1 close listener:', e);
        }
      });
    }

    formingCandleH1 = {
      time: h1Boundary,
      timeLabel: new Date(h1Boundary).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1,
      ...(isIncomplete ? { isIncomplete: true } as any : {})
    };
  } else {
    formingCandleH1.high = Math.max(formingCandleH1.high, price);
    formingCandleH1.low = Math.min(formingCandleH1.low, price);
    formingCandleH1.close = price;
    formingCandleH1.volume += 1;
  }
}
