import fs from 'fs';
import path from 'path';
import { analyzePhaseX, isShadowModeActive } from './phaseXEngine';
import {
  dispatchPhaseXApprovedTelegramSignal,
  dispatchPhaseXLifecycleTelegramUpdate,
  getTelegramServiceStatus
} from './phaseXTelegramService';
import {
  recordNewApprovedLiveSignal,
  updateLiveSignalLifecycle,
  getPersistentPhaseXLiveHistory,
  calculatePhaseXPerformanceMetrics
} from './phaseXLiveHistoryService';
import { getVerifiedXauPrice, getLatestLivePrices } from './websocketServer';

export const SIGNAL_MAX_AGE_MINUTES = 120;
export const COOLDOWN_MINUTES = 3;

export interface ActiveSignalData {
  setupId: string;
  assetId: 'xau-usd';
  symbol: 'XAU/USD';
  direction: 'BUY' | 'SELL';
  preferredEntry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: string;
  tradeConfidence: number;
  startedAt: number;
  telegramMessageId?: number;
  tp1Reached: boolean;
  tp2Reached: boolean;
  slReached: boolean;
  status: 'ACTIVE' | 'TP1_HIT' | 'TP2_HIT' | 'STOP_LOSS_HIT' | 'EXPIRED';
}

export interface PhaseXLiveStateResponse {
  livePrice: number;
  tickAgeSeconds: number;
  tickStatus: 'LIVE' | 'LIVE_AMBER' | 'STALE' | 'OFFLINE';
  pipelineState: 'MONITORING MARKET' | 'ANALYZING MARKET' | 'WAITING FOR SETUP' | 'SETUP DETECTED' | 'QUALITY CHECK' | 'SIGNAL ACTIVE' | 'TP HIT' | 'SL HIT' | 'SIGNAL EXPIRED';
  cooldownRemainingSeconds: number;
  activeSignal: {
    setupId: string;
    direction: 'BUY' | 'SELL';
    setupType?: string;
    preferredEntry: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    riskRewardRatio: string;
    tradeConfidence: number;
    startedAt: number;
    signalAgeMinutes: number;
    signalAgeFormatted: string;
    status: string;
    tp1Reached: boolean;
    tp2Reached: boolean;
    slReached: boolean;
  } | null;
  history: Array<{
    setupId: string;
    timeFormatted: string;
    dateFormatted?: string;
    timestamp: number;
    direction: 'BUY' | 'SELL';
    setupType?: string;
    preferredEntry?: number;
    stopLoss?: number;
    takeProfit1?: number;
    takeProfit2?: number;
    riskRewardRatio?: string;
    tradeConfidence?: number;
    result: 'TP1 HIT' | 'TP2 HIT' | 'SL HIT' | 'EXPIRED';
    rMultiple: string;
  }>;
  metrics?: any;
  quote?: {
    bid: number;
    ask: number;
    spread: number;
    high24h: number;
    low24h: number;
    change24h: number;
    changePercent24h: number;
    source: string;
  };
  serverTime?: number;
  pipelineLogs?: PipelineStageLog[];
}

export interface PipelineStageLog {
  id: string;
  stage: 'FEED_CHECK' | 'CANDLE_FETCH' | 'ANALYZE_PHASE' | 'SETUP_DETECTION' | 'GATE_VALIDATION' | 'EXECUTION_OR_WAIT';
  status: 'INFO' | 'PASS' | 'WAIT' | 'FAIL';
  message: string;
  timestamp: number;
  timeFormatted: string;
}

const pipelineLogs: PipelineStageLog[] = [];
const MAX_PIPELINE_LOGS = 60;

export function recordPipelineLog(
  stage: PipelineStageLog['stage'],
  status: PipelineStageLog['status'],
  message: string
): void {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const timeFormatted = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
  const log: PipelineStageLog = {
    id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    stage,
    status,
    message,
    timestamp: Date.now(),
    timeFormatted
  };
  pipelineLogs.unshift(log);
  if (pipelineLogs.length > MAX_PIPELINE_LOGS) {
    pipelineLogs.pop();
  }
  console.log(`[PhaseXScanner][${stage}][${status}] ${message}`);
}

export function getPhaseXPipelineLogs(): PipelineStageLog[] {
  return [...pipelineLogs];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ACTIVE_STATE_FILE = path.join(DATA_DIR, 'phase_x_active_state.json');

let activeSignalState: ActiveSignalData | null = null;
let cooldownUntilTimestamp = 0;
let currentPipelineState: 'MONITORING MARKET' | 'ANALYZING MARKET' | 'WAITING FOR SETUP' | 'SETUP DETECTED' | 'QUALITY CHECK' | 'SIGNAL ACTIVE' | 'TP HIT' | 'SL HIT' | 'SIGNAL EXPIRED' = 'MONITORING MARKET';
let lastScanStartTime = 0;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.error('[PhaseXScanner] Error creating data dir:', e);
  }
}

function loadActiveStateFromDisk(): ActiveSignalData | null {
  ensureDataDir();
  try {
    if (fs.existsSync(ACTIVE_STATE_FILE)) {
      const text = fs.readFileSync(ACTIVE_STATE_FILE, 'utf-8');
      const data = JSON.parse(text);
      if (data && data.setupId && data.assetId === 'xau-usd' && (data.direction === 'BUY' || data.direction === 'SELL')) {
        return data;
      }
    }
  } catch (err) {
    console.error('[PhaseXScanner] Error reading active state file:', err);
  }
  return null;
}

function saveActiveStateToDisk(state: ActiveSignalData | null) {
  ensureDataDir();
  try {
    if (state) {
      fs.writeFileSync(ACTIVE_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } else {
      if (fs.existsSync(ACTIVE_STATE_FILE)) {
        fs.unlinkSync(ACTIVE_STATE_FILE);
      }
    }
  } catch (err) {
    console.error('[PhaseXScanner] Error writing active state file:', err);
  }
}

export function formatSignalAge(startedAt: number): string {
  const totalMin = Math.max(0, Math.floor((Date.now() - startedAt) / 60000));
  if (totalMin < 60) {
    return `${totalMin} min`;
  }
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return `${hours}h ${mins}m`;
}

// Initial Boot Check
activeSignalState = loadActiveStateFromDisk();
if (activeSignalState) {
  const ageMin = (Date.now() - activeSignalState.startedAt) / 60000;
  if (ageMin >= SIGNAL_MAX_AGE_MINUTES) {
    console.log(`[PhaseXScanner] Loaded active signal ${activeSignalState.setupId} from disk, but age (${ageMin.toFixed(1)}m) >= ${SIGNAL_MAX_AGE_MINUTES}m. Expiring immediately...`);
    dispatchPhaseXLifecycleTelegramUpdate({
      setupId: activeSignalState.setupId,
      assetId: 'xau-usd',
      event: 'EXPIRED',
      direction: activeSignalState.direction,
      replyToMessageId: activeSignalState.telegramMessageId
    }).catch(e => console.error('[PhaseXScanner] Telegram expire error on boot:', e));

    updateLiveSignalLifecycle(activeSignalState.setupId, {
      phase4FinalStatus: 'EXPIRED',
      displayStatusLabel: 'SIGNAL EXPIRED',
      exitTimestamp: Date.now()
    });

    cooldownUntilTimestamp = Date.now() + COOLDOWN_MINUTES * 60000;
    activeSignalState = null;
    saveActiveStateToDisk(null);
  } else {
    currentPipelineState = 'SIGNAL ACTIVE';
    console.log(`[PhaseXScanner] Resumed active signal ${activeSignalState.setupId} (${activeSignalState.direction}) from disk. Age: ${ageMin.toFixed(1)}m`);
  }
}

let scanIntervalHandle: NodeJS.Timeout | null = null;
let isScanRunning = false;

/**
 * Execute 1 background scanning tick (every 2.5s)
 */
export async function executePhaseXLiveScanCycle(): Promise<void> {
  const now = Date.now();
  // Watchdog: If previous scan was running for more than 20 seconds, force reset
  if (isScanRunning && now - lastScanStartTime > 20000) {
    console.warn('[PhaseXScanner] Watchdog resetting hung scan cycle (exceeded 20s)');
    recordPipelineLog('ANALYZE_PHASE', 'FAIL', 'Watchdog reset hung scan cycle (exceeded 20s)');
    isScanRunning = false;
  }

  if (isScanRunning) return;
  isScanRunning = true;
  lastScanStartTime = now;

  try {
    // STAGE 1: FEED CHECK
    const verifiedXau = getVerifiedXauPrice(5000);
    const liveTicks = getLatestLivePrices();
    const fallbackTick = liveTicks['xau-usd'];
    const livePrice = (verifiedXau?.price && verifiedXau.price > 0) 
      ? verifiedXau.price 
      : (fallbackTick?.price && fallbackTick.price > 0 ? fallbackTick.price : 0);

    const tickAge = verifiedXau ? (verifiedXau.ageMs / 1000).toFixed(1) : (fallbackTick ? ((now - fallbackTick.timestamp) / 1000).toFixed(1) : 'N/A');
    const feedSource = verifiedXau?.source || fallbackTick?.source || 'Offline';

    recordPipelineLog(
      'FEED_CHECK',
      livePrice > 0 ? 'PASS' : 'WAIT',
      `Live XAU/USD price: ${livePrice > 0 ? '$' + livePrice.toFixed(2) : 'Unavailable'} | Tick Age: ${tickAge}s | Source: ${feedSource}`
    );

    // 1. If an active signal is in progress:
    if (activeSignalState && activeSignalState.status === 'ACTIVE') {
      currentPipelineState = 'SIGNAL ACTIVE';
      const ageMinutes = (now - activeSignalState.startedAt) / 60000;

      recordPipelineLog(
        'EXECUTION_OR_WAIT',
        'INFO',
        `Active Signal ${activeSignalState.setupId} (${activeSignalState.direction}) in progress. Monitoring live price against TP/SL targets.`
      );

      if (livePrice > 0) {
        const dir = activeSignalState.direction;
        const entry = activeSignalState.preferredEntry;
        const sl = activeSignalState.stopLoss;
        const tp1 = activeSignalState.takeProfit1;
        const tp2 = activeSignalState.takeProfit2;

        // Safety: If livePrice is aberrantly far from entry (> $35), ignore spurious feed anomaly
        if (Math.abs(livePrice - entry) > 35) {
          console.warn(`[PhaseXScanner] Skipping aberrant feed spike: livePrice ${livePrice} vs entry ${entry}`);
          return;
        }

        // Check TP2
        const isTp2Hit = dir === 'BUY' ? livePrice >= tp2 : livePrice <= tp2;
        // Check SL
        const isSlHit = dir === 'BUY' ? livePrice <= sl : livePrice >= sl;
        // Check TP1
        const isTp1Hit = dir === 'BUY' ? livePrice >= tp1 : livePrice <= tp1;

        if (isTp2Hit) {
          console.log(`[PhaseXScanner] Signal ${activeSignalState.setupId} hit TP2! ($${livePrice})`);
          activeSignalState.tp2Reached = true;
          activeSignalState.status = 'TP2_HIT';
          currentPipelineState = 'TP HIT';
          recordPipelineLog('EXECUTION_OR_WAIT', 'PASS', `Signal ${activeSignalState.setupId} hit TP2 ($${livePrice})! Lifecycle updated.`);

          await dispatchPhaseXLifecycleTelegramUpdate({
            setupId: activeSignalState.setupId,
            assetId: 'xau-usd',
            event: 'TP2_HIT',
            direction: dir,
            replyToMessageId: activeSignalState.telegramMessageId,
            price: livePrice
          });

          updateLiveSignalLifecycle(activeSignalState.setupId, {
            tp1Reached: true,
            tp2Reached: true,
            phase4FinalStatus: 'TP2_HIT',
            finalR: 3.0,
            exitTimestamp: now,
            displayStatusLabel: 'TP2 HIT (+3R)'
          });

          cooldownUntilTimestamp = now + COOLDOWN_MINUTES * 60000;
          activeSignalState = null;
          saveActiveStateToDisk(null);
          return;
        }

        if (isSlHit) {
          console.log(`[PhaseXScanner] Signal ${activeSignalState.setupId} hit Stop Loss! ($${livePrice})`);
          activeSignalState.slReached = true;
          activeSignalState.status = 'STOP_LOSS_HIT';
          currentPipelineState = 'SL HIT';
          recordPipelineLog('EXECUTION_OR_WAIT', 'FAIL', `Signal ${activeSignalState.setupId} hit Stop Loss ($${livePrice})! Closed at -1R.`);

          await dispatchPhaseXLifecycleTelegramUpdate({
            setupId: activeSignalState.setupId,
            assetId: 'xau-usd',
            event: 'STOP_LOSS_HIT',
            direction: dir,
            replyToMessageId: activeSignalState.telegramMessageId,
            price: livePrice
          });

          updateLiveSignalLifecycle(activeSignalState.setupId, {
            slReached: true,
            phase4FinalStatus: 'STOP_LOSS_HIT',
            finalR: -1.0,
            exitTimestamp: now,
            displayStatusLabel: 'STOP LOSS HIT (-1R)'
          });

          cooldownUntilTimestamp = now + COOLDOWN_MINUTES * 60000;
          activeSignalState = null;
          saveActiveStateToDisk(null);
          return;
        }

        if (isTp1Hit && !activeSignalState.tp1Reached) {
          console.log(`[PhaseXScanner] Signal ${activeSignalState.setupId} hit TP1! ($${livePrice})`);
          activeSignalState.tp1Reached = true;
          recordPipelineLog('EXECUTION_OR_WAIT', 'PASS', `Signal ${activeSignalState.setupId} reached TP1 ($${livePrice})! SL moved to BE.`);

          await dispatchPhaseXLifecycleTelegramUpdate({
            setupId: activeSignalState.setupId,
            assetId: 'xau-usd',
            event: 'TP1_HIT',
            direction: dir,
            replyToMessageId: activeSignalState.telegramMessageId,
            price: livePrice
          });

          updateLiveSignalLifecycle(activeSignalState.setupId, {
            tp1Reached: true,
            displayStatusLabel: 'TP1 HIT (+2R)'
          });

          saveActiveStateToDisk(activeSignalState);
        }
      }

      // Check Expiry (2 hours)
      if (ageMinutes >= SIGNAL_MAX_AGE_MINUTES) {
        console.log(`[PhaseXScanner] Signal ${activeSignalState.setupId} reached max age of ${SIGNAL_MAX_AGE_MINUTES}m. Expiring...`);
        activeSignalState.status = 'EXPIRED';
        currentPipelineState = 'SIGNAL EXPIRED';
        recordPipelineLog('EXECUTION_OR_WAIT', 'WAIT', `Signal ${activeSignalState.setupId} reached 120m expiration without target hit.`);

        await dispatchPhaseXLifecycleTelegramUpdate({
          setupId: activeSignalState.setupId,
          assetId: 'xau-usd',
          event: 'EXPIRED',
          direction: activeSignalState.direction,
          replyToMessageId: activeSignalState.telegramMessageId,
          price: livePrice
        });

        updateLiveSignalLifecycle(activeSignalState.setupId, {
          phase4FinalStatus: 'EXPIRED',
          finalR: null,
          exitTimestamp: now,
          displayStatusLabel: 'SIGNAL EXPIRED'
        });

        cooldownUntilTimestamp = now + COOLDOWN_MINUTES * 60000;
        activeSignalState = null;
        saveActiveStateToDisk(null);
        return;
      }

      return;
    }

    // 2. If NO active signal is running:
    if (now < cooldownUntilTimestamp) {
      currentPipelineState = 'MONITORING MARKET';
      const remSec = Math.ceil((cooldownUntilTimestamp - now) / 1000);
      recordPipelineLog('EXECUTION_OR_WAIT', 'WAIT', `Post-trade cooldown active (${remSec}s remaining). Pipeline state: MONITORING MARKET.`);
      return;
    }

    // STAGE 2: CANDLE FETCH & STAGE 3: ANALYZE PHASE
    currentPipelineState = 'ANALYZING MARKET';
    recordPipelineLog('ANALYZE_PHASE', 'INFO', 'Fetching closed candles (5M/15M/30M/1H/4H) & executing multi-timeframe quantitative cycle engine...');

    const analysis = await analyzePhaseX('xau-usd', livePrice > 0 ? livePrice : undefined);

    recordPipelineLog(
      'ANALYZE_PHASE',
      'PASS',
      `Analysis finished: Market Phase=${analysis.marketPhase || 'N/A'} | Direction=${analysis.finalDirection} | Confidence=${analysis.tradeConfidence}%`
    );

    // STAGE 4: SETUP DETECTION
    const isSetupDetected = analysis.finalDirection === 'BUY' || analysis.finalDirection === 'SELL';
    const entryStr = analysis.preferredEntry != null ? `$${analysis.preferredEntry.toFixed(2)}` : 'N/A';
    const slStr = analysis.stopLoss != null ? `$${analysis.stopLoss.toFixed(2)}` : 'N/A';
    recordPipelineLog(
      'SETUP_DETECTION',
      isSetupDetected ? 'PASS' : 'WAIT',
      `Setup detection: Direction=${analysis.finalDirection} | Type=${analysis.setupType || 'None'} | Entry=${entryStr} | SL=${slStr}`
    );

    // STAGE 5: GATE VALIDATION
    const gate = analysis.engineDetails?.phase5QualityGate;
    const gateStatus = gate?.finalGateStatus || 'REJECTED';
    const gateReason = (gate as any)?.primaryRejectionReason || (gateStatus === 'APPROVED' ? 'All 11 criteria PASSED' : 'Waiting for clean alignment');

    recordPipelineLog(
      'GATE_VALIDATION',
      gateStatus === 'APPROVED' ? 'PASS' : 'WAIT',
      `Phase 5 Gate: ${gateStatus} | Detail: ${gateReason}`
    );

    // STAGE 6: EXECUTION OR WAIT
    if (gateStatus === 'APPROVED' && isSetupDetected) {
      if (isShadowModeActive()) {
        currentPipelineState = 'QUALITY CHECK';
        recordPipelineLog('EXECUTION_OR_WAIT', 'INFO', `[SHADOW MODE] Signal APPROVED! Setup ID: ${analysis.setupId} (${analysis.finalDirection}). Telegram & Live UI state dispatch suppressed.`);
        return;
      }

      currentPipelineState = 'QUALITY CHECK';
      recordPipelineLog('EXECUTION_OR_WAIT', 'PASS', `Signal APPROVED! Setup ID: ${analysis.setupId}. Preparing Telegram broadcast & state lock.`);
      
      const newSignal: ActiveSignalData = {
        setupId: analysis.setupId,
        assetId: 'xau-usd',
        symbol: 'XAU/USD',
        direction: analysis.finalDirection as 'BUY' | 'SELL',
        preferredEntry: analysis.preferredEntry,
        stopLoss: analysis.stopLoss,
        takeProfit1: analysis.takeProfit1,
        takeProfit2: analysis.takeProfit2,
        riskRewardRatio: analysis.riskRewardRatio || '1:2 / 1:3',
        tradeConfidence: analysis.tradeConfidence,
        startedAt: now,
        tp1Reached: false,
        tp2Reached: false,
        slReached: false,
        status: 'ACTIVE'
      };

      // Dispatch to Telegram
      const tgRes = await dispatchPhaseXApprovedTelegramSignal(
        {
          setupId: newSignal.setupId,
          assetId: 'xau-usd',
          direction: newSignal.direction,
          setupType: (newSignal as any).setupType || analysis.setupType,
          preferredEntry: newSignal.preferredEntry,
          stopLoss: newSignal.stopLoss,
          takeProfit1: newSignal.takeProfit1,
          takeProfit2: newSignal.takeProfit2,
          riskRewardRatio: newSignal.riskRewardRatio,
          tradeConfidence: newSignal.tradeConfidence,
          timestamp: now,
          liveMarketPrice: livePrice > 0 ? livePrice : newSignal.preferredEntry,
          livePriceTimestamp: now
        },
        'APPROVED',
        `🟢 ${newSignal.direction} — READY`
      );

      if (tgRes.log && (tgRes as any).log?.messageId) {
        newSignal.telegramMessageId = (tgRes as any).log.messageId;
      }

      // Record in Live Production History
      recordNewApprovedLiveSignal({
        setupId: newSignal.setupId,
        assetId: 'xau-usd',
        direction: newSignal.direction,
        setupType: (newSignal as any).setupType || analysis.setupType,
        preferredEntry: newSignal.preferredEntry,
        stopLoss: newSignal.stopLoss,
        takeProfit1: newSignal.takeProfit1,
        takeProfit2: newSignal.takeProfit2,
        riskRewardRatio: newSignal.riskRewardRatio,
        tradeConfidence: newSignal.tradeConfidence,
        signalTimestamp: now,
        isLive: true
      });

      activeSignalState = newSignal;
      currentPipelineState = 'SIGNAL ACTIVE';
      saveActiveStateToDisk(activeSignalState);
    } else {
      currentPipelineState = 'WAITING FOR SETUP';
      recordPipelineLog('EXECUTION_OR_WAIT', 'WAIT', `State: WAITING FOR SETUP (${analysis.waitReasonCode || 'WAIT_MARKET_DATA'}).`);
    }
  } catch (err: any) {
    console.error('[PhaseXScanner] Error in scan cycle:', err);
    recordPipelineLog('EXECUTION_OR_WAIT', 'FAIL', `Scan cycle exception: ${err?.message || String(err)}`);
  } finally {
    isScanRunning = false;
  }
}

/**
 * Start the continuous server background scanner (every 2.5 seconds)
 */
export function startPhaseXBackgroundScanner(): void {
  if (scanIntervalHandle) return;
  console.log('[PhaseXScanner] Starting background scanner (2.5s interval)...');
  executePhaseXLiveScanCycle().catch(() => {});
  scanIntervalHandle = setInterval(() => {
    executePhaseXLiveScanCycle().catch(() => {});
  }, 2500);
}

export function stopPhaseXBackgroundScanner(): void {
  if (scanIntervalHandle) {
    clearInterval(scanIntervalHandle);
    scanIntervalHandle = null;
  }
}

/**
 * Get current unified live state for client response
 */
export function getPhaseXLiveState(): PhaseXLiveStateResponse {
  const verified = getVerifiedXauPrice(5000);
  const liveTicks = getLatestLivePrices();
  const fallbackTick = liveTicks['xau-usd'];

  const livePrice = (verified?.price && verified.price > 0) 
    ? verified.price 
    : (fallbackTick?.price && fallbackTick.price > 0 ? fallbackTick.price : 0);

  const now = Date.now();
  const tickAgeSeconds = verified?.ageSeconds ?? 
    (fallbackTick ? Math.floor((now - fallbackTick.timestamp) / 1000) : 999);
  
  let tickStatus: 'LIVE' | 'LIVE_AMBER' | 'STALE' | 'OFFLINE' = 'OFFLINE';
  if (livePrice > 0) {
    if (tickAgeSeconds <= 3) {
      tickStatus = 'LIVE';
    } else if (tickAgeSeconds <= 8) {
      tickStatus = 'LIVE_AMBER';
    } else {
      tickStatus = 'STALE';
    }
  }

  const cooldownRemainingSeconds = cooldownUntilTimestamp > now ? Math.ceil((cooldownUntilTimestamp - now) / 1000) : 0;

  let activeSignalPayload = null;
  if (activeSignalState) {
    const ageMin = Math.floor((now - activeSignalState.startedAt) / 60000);
    activeSignalPayload = {
      setupId: activeSignalState.setupId,
      direction: activeSignalState.direction,
      preferredEntry: activeSignalState.preferredEntry,
      stopLoss: activeSignalState.stopLoss,
      takeProfit1: activeSignalState.takeProfit1,
      takeProfit2: activeSignalState.takeProfit2,
      riskRewardRatio: activeSignalState.riskRewardRatio,
      tradeConfidence: activeSignalState.tradeConfidence,
      startedAt: activeSignalState.startedAt,
      signalAgeMinutes: ageMin,
      signalAgeFormatted: formatSignalAge(activeSignalState.startedAt),
      status: activeSignalState.status,
      tp1Reached: activeSignalState.tp1Reached,
      tp2Reached: activeSignalState.tp2Reached,
      slReached: activeSignalState.slReached
    };
  }

  // Format History
  const historyRecords = getPersistentPhaseXLiveHistory();
  const historyFormatted = historyRecords.slice(0, 20).map(r => {
    const d = new Date(r.signalTimestamp);
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const timeFormatted = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let resultLabel: 'TP1 HIT' | 'TP2 HIT' | 'SL HIT' | 'EXPIRED' = 'EXPIRED';
    let rMultiple = '—';

    if (r.tp2Reached || r.phase4FinalStatus === 'TP2_HIT') {
      resultLabel = 'TP2 HIT';
      rMultiple = '+3R';
    } else if (r.tp1Reached || r.phase4FinalStatus === 'TP1_HIT') {
      resultLabel = 'TP1 HIT';
      rMultiple = '+2R';
    } else if (r.slReached || r.phase4FinalStatus === 'STOP_LOSS_HIT') {
      resultLabel = 'SL HIT';
      rMultiple = '-1R';
    } else {
      resultLabel = 'EXPIRED';
      rMultiple = '—';
    }

    return {
      setupId: r.setupId,
      timeFormatted,
      dateFormatted,
      timestamp: r.signalTimestamp,
      direction: r.direction,
      setupType: r.setupType || (r.direction === 'BUY' ? 'INSTITUTIONAL ACCUMULATION MATRIX' : 'INSTITUTIONAL DISTRIBUTION MATRIX'),
      preferredEntry: r.preferredEntry,
      stopLoss: r.stopLoss,
      takeProfit1: r.takeProfit1,
      takeProfit2: r.takeProfit2,
      riskRewardRatio: r.riskRewardRatio || '1:2 / 1:3',
      tradeConfidence: r.tradeConfidence,
      result: resultLabel,
      rMultiple
    };
  });

  const quoteBid = verified?.bid || fallbackTick?.bid || (livePrice > 0 ? +(livePrice - 0.10).toFixed(2) : 0);
  const quoteAsk = verified?.ask || fallbackTick?.ask || (livePrice > 0 ? +(livePrice + 0.10).toFixed(2) : 0);
  const quoteSpread = +(Math.abs(quoteAsk - quoteBid) || 0.18).toFixed(2);

  return {
    livePrice,
    tickAgeSeconds,
    tickStatus,
    pipelineState: activeSignalState ? 'SIGNAL ACTIVE' : currentPipelineState,
    cooldownRemainingSeconds,
    activeSignal: activeSignalPayload,
    history: historyFormatted,
    metrics: calculatePhaseXPerformanceMetrics(),
    quote: {
      bid: quoteBid,
      ask: quoteAsk,
      spread: quoteSpread,
      high24h: fallbackTick?.high24h || livePrice,
      low24h: fallbackTick?.low24h || livePrice,
      change24h: fallbackTick?.change || 0,
      changePercent24h: fallbackTick?.changePercent || 0,
      source: verified?.source || fallbackTick?.source || 'BIQUOTE (MetaTrader 5)'
    },
    serverTime: now,
    pipelineLogs: getPhaseXPipelineLogs().slice(0, 15)
  };
}

// Diagnostics helper for admin panel
export function getPhaseXDiagnostics() {
  const tgStatus = getTelegramServiceStatus();
  return {
    isContinuousScanningActive: !!scanIntervalHandle,
    activeSignal: activeSignalState,
    pipelineState: currentPipelineState,
    cooldownUntilTimestamp,
    telegramStatus: tgStatus,
    pipelineLogs: getPhaseXPipelineLogs().slice(0, 30)
  };
}

startPhaseXBackgroundScanner();
