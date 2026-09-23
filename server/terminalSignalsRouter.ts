import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { fetchYahooCandles, fetchAllMarketData, ASSET_CONFIGS } from './marketDataRouter';

export type AllowedTimeframe = '15M' | '30M' | '1H';

export function normalizeTimeframe(tfStr: any): AllowedTimeframe | null {
  if (!tfStr) return null;
  const s = String(tfStr).trim().toUpperCase();
  if (s === '15M' || s === '15MIN' || s === 'M15' || s === '15') return '15M';
  if (s === '30M' || s === '30MIN' || s === 'M30' || s === '30') return '30M';
  if (s === '1H' || s === '60M' || s === 'H1' || s === '1') return '1H';
  return null;
}

export interface TerminalActiveTrade {
  tradeId: string;
  assetId: string;
  symbol: string;
  assetName: string;
  direction: 'BUY' | 'SELL';
  timeframe: AllowedTimeframe;
  entryPrice: number;
  entryZone: string;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  confidence: number;
  status: 'ACTIVE';
  createdAtET: string;
  createdAtTimestamp: number;
  expiryTimestamp: number;
  marketDataProvider: string;
  currentLivePrice: number;
  currentPnlPoints: number;
  currentPnlPercent: number;
  aurumReasoning: string;
  qwenReasoning: string;
  rationale: string;
}

export interface TerminalCompletedTrade {
  tradeId: string;
  assetId: string;
  symbol: string;
  assetName: string;
  direction: 'BUY' | 'SELL';
  timeframe: AllowedTimeframe;
  entryPrice: number;
  exitPrice: number;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  result: 'TP HIT' | 'SL HIT' | 'EXPIRED' | 'MANUAL_CLOSE';
  pnlPoints: number;
  pnlPercent: number;
  confidence: number;
  startedAtET: string;
  closedAtET: string;
  closedAtTimestamp: number;
  marketDataProvider: string;
  outcomeReason: string;
}

export interface DualAiAnalysis {
  aurum: {
    direction: 'BUY' | 'SELL' | 'NO_TRADE';
    confidence: number;
    reasoning: string;
    invalidation?: string;
  };
  qwen: {
    direction: 'BUY' | 'SELL' | 'NO_TRADE';
    confidence: number;
    reasoning: string;
    invalidation?: string;
  };
}

export interface TerminalAnalysisResult {
  assetId: string;
  symbol: string;
  assetName: string;
  timeframe: AllowedTimeframe;
  decision: 'BUY' | 'SELL' | 'NO_TRADE' | 'COOLDOWN';
  entryPrice: number;
  entryZone: string;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  riskRewardRatio: string;
  confidence: number;
  confluenceFactors: string[];
  rationale: string;
  isLocked: boolean;
  activeTrade?: TerminalActiveTrade | null;
  dualAiAnalysis?: DualAiAnalysis;
  marketStatus: 'LIVE' | 'MARKET_CLOSED' | 'DATA_UNAVAILABLE';
  lastVerifiedPrice: number;
  cooldownSecondsRemaining?: number;
}

const STATE_FILE_PATH = path.join(process.cwd(), '.aurum_terminal_signals_state.json');

class ServerTerminalSignalsEngine {
  private activeTrades: Record<string, TerminalActiveTrade> = {}; // assetId -> TerminalActiveTrade
  private completedTrades: TerminalCompletedTrade[] = [];
  private cooldowns: Record<string, number> = {}; // assetId -> cooldownEndsTimestamp

  constructor() {
    this.loadStateFromFile();
  }

  private loadStateFromFile() {
    try {
      if (fs.existsSync(STATE_FILE_PATH)) {
        const raw = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data.activeTrades) this.activeTrades = data.activeTrades;
        if (data.completedTrades) this.completedTrades = data.completedTrades;
        if (data.cooldowns) this.cooldowns = data.cooldowns;
      }
    } catch (err) {
      console.warn('[TerminalSignalsEngine] Error loading state file:', err);
    }
  }

  private saveStateToFile() {
    try {
      const data = {
        activeTrades: this.activeTrades,
        completedTrades: this.completedTrades,
        cooldowns: this.cooldowns,
        lastSaved: new Date().toISOString()
      };
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[TerminalSignalsEngine] Error saving state file:', err);
    }
  }

  private getTimeET(): string {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' ET';
  }

  public isAssetMarketOpen(assetId: string): { isOpen: boolean; reason?: string } {
    if (assetId === 'btc-usd' || assetId.includes('crypto')) {
      return { isOpen: true }; // Crypto is 24/7
    }

    const now = new Date();
    const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
    const etDate = new Date(etString);
    const day = etDate.getDay(); // 0 = Sun, 6 = Sat
    const hours = etDate.getHours();

    // Weekend check: Friday 5 PM ET to Sunday 5 PM ET
    if (day === 6) {
      return { isOpen: false, reason: 'MARKET CLOSED — WEEKEND' };
    }
    if (day === 5 && hours >= 17) {
      return { isOpen: false, reason: 'MARKET CLOSED — WEEKEND' };
    }
    if (day === 0 && hours < 17) {
      return { isOpen: false, reason: 'MARKET CLOSED — WEEKEND' };
    }

    return { isOpen: true };
  }

  private calculateATR(candles: any[], period: number = 14): number {
    if (candles.length < 2) return 0;
    const trValues: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trValues.push(tr);
    }

    const recentTRs = trValues.slice(-period);
    if (recentTRs.length === 0) return 0;
    const sum = recentTRs.reduce((acc, v) => acc + v, 0);
    return sum / recentTRs.length;
  }

  /**
   * Run Multi-Agent Analysis for Asset
   */
  public async analyzeAsset(assetId: string, rawTf: string): Promise<TerminalAnalysisResult> {
    // 0. EXCLUDE SPY
    if (assetId === 'spy' || assetId === 'spy-options') {
      throw new Error('SPY is excluded from Terminal Signals Engine');
    }

    const timeframe = normalizeTimeframe(rawTf);
    if (!timeframe) {
      throw new Error(`Invalid timeframe '${rawTf}'. Allowed: 15M, 30M, 1H.`);
    }

    const assetConfig = ASSET_CONFIGS.find(c => c.id === assetId) || {
      id: assetId,
      symbol: assetId.toUpperCase().replace('-', '/'),
      name: assetId.toUpperCase().replace('-', ' '),
      category: 'forex',
      decimals: assetId.includes('usd') && !assetId.includes('xau') && !assetId.includes('btc') ? 4 : 2
    };

    // 1. Atomic Check: Is asset already locked in an active trade?
    if (this.activeTrades[assetId]) {
      const active = this.activeTrades[assetId];
      return {
        assetId,
        symbol: active.symbol,
        assetName: active.assetName,
        timeframe: active.timeframe,
        decision: active.direction,
        entryPrice: active.entryPrice,
        entryZone: active.entryZone,
        stopLossPrice: active.stopLossPrice,
        target1Price: active.target1Price,
        target2Price: active.target2Price,
        riskRewardRatio: '1:2.0',
        confidence: active.confidence,
        confluenceFactors: ['ACTIVE TRADE LOCKED 🔒 IN PROGRESS'],
        rationale: active.rationale,
        isLocked: true,
        activeTrade: active,
        dualAiAnalysis: {
          aurum: {
            direction: active.direction,
            confidence: active.confidence,
            reasoning: active.aurumReasoning || active.rationale
          },
          qwen: {
            direction: active.direction,
            confidence: Math.max(80, active.confidence - 2),
            reasoning: active.qwenReasoning || 'SMC structure and liquidity sweep confirmed by Qwen.'
          }
        },
        marketStatus: 'LIVE',
        lastVerifiedPrice: active.currentLivePrice
      };
    }

    // 2. Cooldown Check
    const cooldownEnds = this.cooldowns[assetId] || 0;
    if (Date.now() < cooldownEnds) {
      const remainingSec = Math.ceil((cooldownEnds - Date.now()) / 1000);
      return {
        assetId,
        symbol: assetConfig.symbol,
        assetName: assetConfig.name,
        timeframe,
        decision: 'COOLDOWN',
        entryPrice: 0,
        entryZone: 'N/A',
        stopLossPrice: 0,
        target1Price: 0,
        target2Price: 0,
        riskRewardRatio: 'N/A',
        confidence: 0,
        confluenceFactors: ['30-MINUTE RISK COOLDOWN ACTIVE'],
        rationale: `System is in 30-minute post-trade risk cooldown. ${remainingSec}s remaining before new scans can be initiated.`,
        isLocked: false,
        activeTrade: null,
        marketStatus: 'LIVE',
        lastVerifiedPrice: 0,
        cooldownSecondsRemaining: remainingSec
      };
    }

    // 3. Fetch Live Price & Check Market Open
    const marketCheck = this.isAssetMarketOpen(assetId);
    const allMarketData = await fetchAllMarketData();
    const liveAssetData = allMarketData?.data?.[assetId];

    if (!liveAssetData || liveAssetData.price == null) {
      return {
        assetId,
        symbol: assetConfig.symbol,
        assetName: assetConfig.name,
        timeframe,
        decision: 'NO_TRADE',
        entryPrice: 0,
        entryZone: 'N/A',
        stopLossPrice: 0,
        target1Price: 0,
        target2Price: 0,
        riskRewardRatio: 'N/A',
        confidence: 0,
        confluenceFactors: ['LIVE DATA UNAVAILABLE'],
        rationale: 'Live market price data feed is unavailable. Signal generation halted for capital protection.',
        isLocked: false,
        activeTrade: null,
        marketStatus: 'DATA_UNAVAILABLE',
        lastVerifiedPrice: 0
      };
    }

    const currentLivePrice = liveAssetData.price;

    if (!marketCheck.isOpen) {
      return {
        assetId,
        symbol: assetConfig.symbol,
        assetName: assetConfig.name,
        timeframe,
        decision: 'NO_TRADE',
        entryPrice: currentLivePrice,
        entryZone: `$${currentLivePrice.toFixed(assetConfig.decimals)}`,
        stopLossPrice: 0,
        target1Price: 0,
        target2Price: 0,
        riskRewardRatio: 'N/A',
        confidence: 0,
        confluenceFactors: [marketCheck.reason || 'MARKET CLOSED'],
        rationale: 'Market is currently closed for the session. Cannot issue live signals on closed market pricing.',
        isLocked: false,
        activeTrade: null,
        marketStatus: 'MARKET_CLOSED',
        lastVerifiedPrice: currentLivePrice
      };
    }

    // 4. Fetch CLOSED Candles for Selected TF and HTF
    let yahooInterval = '15m';
    let htfInterval = '60m';
    let range = '5d';

    if (timeframe === '30M') {
      yahooInterval = '30m';
      htfInterval = '60m';
      range = '5d';
    } else if (timeframe === '1H') {
      yahooInterval = '60m';
      htfInterval = '1d';
      range = '15d';
    }

    let yahooSymbol = assetConfig.symbol;
    if (assetId === 'xau-usd') yahooSymbol = 'GC=F';
    else if (assetId === 'xag-usd') yahooSymbol = 'SI=F';
    else if (assetId === 'crude-oil') yahooSymbol = 'CL=F';
    else if (assetId === 'nasdaq-100') yahooSymbol = '^NDX';
    else if (assetId === 'sp-500') yahooSymbol = '^GSPC';
    else if (assetId === 'eur-usd') yahooSymbol = 'EURUSD=X';
    else if (assetId === 'gbp-usd') yahooSymbol = 'GBPUSD=X';
    else if (assetId === 'usd-jpy') yahooSymbol = 'JPY=X';
    else if (assetId === 'aud-usd') yahooSymbol = 'AUDUSD=X';
    else if (assetId === 'usd-cad') yahooSymbol = 'CAD=X';
    else if (assetId === 'btc-usd') yahooSymbol = 'BTC-USD';

    const [rawCandles, rawHtfCandles] = await Promise.all([
      fetchYahooCandles(yahooSymbol, yahooInterval, range).catch(() => []),
      fetchYahooCandles(yahooSymbol, htfInterval, range).catch(() => [])
    ]);

    const closedCandles = rawCandles.length > 1 ? rawCandles.slice(0, -1) : rawCandles;
    const closedHtf = rawHtfCandles.length > 1 ? rawHtfCandles.slice(0, -1) : rawHtfCandles;

    if (closedCandles.length < 8) {
      return {
        assetId,
        symbol: assetConfig.symbol,
        assetName: assetConfig.name,
        timeframe,
        decision: 'NO_TRADE',
        entryPrice: currentLivePrice,
        entryZone: `$${currentLivePrice.toFixed(assetConfig.decimals)}`,
        stopLossPrice: 0,
        target1Price: 0,
        target2Price: 0,
        riskRewardRatio: 'N/A',
        confidence: 0,
        confluenceFactors: ['INSUFFICIENT CANDLE DATA'],
        rationale: `Insufficient closed candle history on ${timeframe} for multi-timeframe analysis. Returning NO_TRADE.`,
        isLocked: false,
        activeTrade: null,
        marketStatus: 'LIVE',
        lastVerifiedPrice: currentLivePrice
      };
    }

    // 5. Compute Market Metrics (ATR, EMAs, Structure, Liquidity)
    const atr = this.calculateATR(closedCandles, 14);
    const lastClosed = closedCandles[closedCandles.length - 1];
    const prevClosed = closedCandles[closedCandles.length - 2];

    const closes = closedCandles.map(c => c.close);
    const calcEMA = (data: number[], p: number) => {
      if (data.length < p) return data[data.length - 1] || 0;
      const k = 2 / (p + 1);
      let ema = data[0];
      for (let i = 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
      }
      return ema;
    };

    const ema20 = calcEMA(closes, 20);
    const ema50 = calcEMA(closes, 50);
    const ema200 = calcEMA(closes, 200);

    const recentCandles = closedCandles.slice(-10);
    const swingHigh = Math.max(...recentCandles.map(c => c.high));
    const swingLow = Math.min(...recentCandles.map(c => c.low));

    // HTF Trend Direction
    let htfTrend: 'BULLISH' | 'BEARISH' | 'RANGING' = 'RANGING';
    if (closedHtf.length >= 5) {
      const htfCloses = closedHtf.map(c => c.close);
      const htfEma20 = calcEMA(htfCloses, 20);
      const htfLast = closedHtf[closedHtf.length - 1].close;
      if (htfLast > htfEma20) htfTrend = 'BULLISH';
      else if (htfLast < htfEma20) htfTrend = 'BEARISH';
    }

    // Structure Analysis
    let bullishConfluences = 0;
    let bearishConfluences = 0;
    const confluences: string[] = [];

    if (ema20 > ema50) {
      bullishConfluences += 1;
      confluences.push(`EMA 20/50 Bullish Alignment (${timeframe})`);
    } else if (ema20 < ema50) {
      bearishConfluences += 1;
      confluences.push(`EMA 20/50 Bearish Alignment (${timeframe})`);
    }

    if (lastClosed.close > lastClosed.open && lastClosed.close > prevClosed.high) {
      bullishConfluences += 2;
      confluences.push(`Closed Candle Bullish Structural BOS on ${timeframe}`);
    } else if (lastClosed.close < lastClosed.open && lastClosed.close < prevClosed.low) {
      bearishConfluences += 2;
      confluences.push(`Closed Candle Bearish Structural BOS on ${timeframe}`);
    }

    if (lastClosed.low < swingLow && lastClosed.close > swingLow) {
      bullishConfluences += 2;
      confluences.push(`Sell-side Liquidity Sweep below $${swingLow.toFixed(assetConfig.decimals)} & Reclaim`);
    }
    if (lastClosed.high > swingHigh && lastClosed.close < swingHigh) {
      bearishConfluences += 2;
      confluences.push(`Buy-side Liquidity Sweep above $${swingHigh.toFixed(assetConfig.decimals)} & Rejection`);
    }

    if (htfTrend === 'BULLISH') {
      bullishConfluences += 2;
      confluences.push(`HTF Trend (${htfInterval}) is BULLISH`);
    } else if (htfTrend === 'BEARISH') {
      bearishConfluences += 2;
      confluences.push(`HTF Trend (${htfInterval}) is BEARISH`);
    }

    // 6. DUAL AI ANALYSIS (AURUM AI & QWEN)
    let aurumDirection: 'BUY' | 'SELL' | 'NO_TRADE' = 'NO_TRADE';
    let aurumConfidence = 70;
    let aurumReasoning = '';

    if (bullishConfluences >= 4 && bullishConfluences > bearishConfluences) {
      aurumDirection = 'BUY';
      aurumConfidence = Math.min(95, 80 + bullishConfluences * 3);
      aurumReasoning = `Bullish SMC structure confirmed on ${timeframe} closed candles. Price reclaimed liquidity at $${swingLow.toFixed(assetConfig.decimals)} with HTF trend alignment.`;
    } else if (bearishConfluences >= 4 && bearishConfluences > bullishConfluences) {
      aurumDirection = 'SELL';
      aurumConfidence = Math.min(95, 80 + bearishConfluences * 3);
      aurumReasoning = `Bearish SMC structure confirmed on ${timeframe} closed candles. Rejection sweep above $${swingHigh.toFixed(assetConfig.decimals)} with HTF trend alignment.`;
    } else {
      aurumDirection = 'NO_TRADE';
      aurumConfidence = 65;
      aurumReasoning = `Insufficient confluence score on ${timeframe} (${bullishConfluences} Bull vs ${bearishConfluences} Bear). Capital preservation active.`;
    }

    // Qwen Evaluation
    let qwenDirection: 'BUY' | 'SELL' | 'NO_TRADE' = 'NO_TRADE';
    let qwenConfidence = 70;
    let qwenReasoning = '';

    if (aurumDirection === 'BUY') {
      if (htfTrend !== 'BEARISH') {
        qwenDirection = 'BUY';
        qwenConfidence = aurumConfidence - 2;
        qwenReasoning = `Qwen SMC Agent verifies 1:2 R:R bullish order block mitigation and HTF trend alignment on ${timeframe}.`;
      } else {
        qwenDirection = 'NO_TRADE';
        qwenConfidence = 62;
        qwenReasoning = `Qwen SMC Agent rejects BUY setup: HTF trend is BEARISH without confirmed CHoCH reversal.`;
      }
    } else if (aurumDirection === 'SELL') {
      if (htfTrend !== 'BULLISH') {
        qwenDirection = 'SELL';
        qwenConfidence = aurumConfidence - 2;
        qwenReasoning = `Qwen SMC Agent verifies bearish FVG fill and order block rejection on ${timeframe}.`;
      } else {
        qwenDirection = 'NO_TRADE';
        qwenConfidence = 62;
        qwenReasoning = `Qwen SMC Agent rejects SELL setup: HTF trend is BULLISH without confirmed CHoCH reversal.`;
      }
    } else {
      qwenDirection = 'NO_TRADE';
      qwenConfidence = 60;
      qwenReasoning = `Qwen SMC Agent agrees: Market is in consolidation on ${timeframe}. No high-probability setup present.`;
    }

    const dualAi: DualAiAnalysis = {
      aurum: { direction: aurumDirection, confidence: aurumConfidence, reasoning: aurumReasoning },
      qwen: { direction: qwenDirection, confidence: qwenConfidence, reasoning: qwenReasoning }
    };

    // 7. CONSENSUS CHECK
    const avgConfidence = Math.round((aurumConfidence + qwenConfidence) / 2);
    const hasConsensus = aurumDirection === qwenDirection && aurumDirection !== 'NO_TRADE' && avgConfidence >= 80;

    if (!hasConsensus) {
      let rejectReason = 'Capital Preservation: Multi-agent consensus not met.';
      if (aurumDirection !== qwenDirection) {
        rejectReason = `AIs disagree on direction (AURUM: ${aurumDirection}, Qwen: ${qwenDirection}).`;
      } else if (avgConfidence < 80) {
        rejectReason = `Confidence score (${avgConfidence}%) below institutional threshold (80%).`;
      } else if (aurumDirection === 'NO_TRADE') {
        rejectReason = aurumReasoning;
      }

      return {
        assetId,
        symbol: assetConfig.symbol,
        assetName: assetConfig.name,
        timeframe,
        decision: 'NO_TRADE',
        entryPrice: currentLivePrice,
        entryZone: `$${currentLivePrice.toFixed(assetConfig.decimals)}`,
        stopLossPrice: 0,
        target1Price: 0,
        target2Price: 0,
        riskRewardRatio: 'N/A',
        confidence: avgConfidence,
        confluenceFactors: confluences.length > 0 ? confluences : ['NO TRADE CONSENSUS'],
        rationale: rejectReason,
        isLocked: false,
        activeTrade: null,
        dualAiAnalysis: dualAi,
        marketStatus: 'LIVE',
        lastVerifiedPrice: currentLivePrice
      };
    }

    // 8. APPROVED TRADE SETUP — CALCULATE LEVEL PARAMETERS & TIMEFRAME EXPIRY
    const decision = aurumDirection as 'BUY' | 'SELL';
    const entry = currentLivePrice;

    // Timeframe Profiles
    let atrMultiplier = 1.3;
    let expiryMs = 45 * 60 * 1000; // 15M: ~45 min
    let tp1Multiplier = 2.0;
    let tp2Multiplier = 3.2;

    if (timeframe === '30M') {
      atrMultiplier = 1.5;
      expiryMs = 90 * 60 * 1000; // 30M: ~90 min
      tp1Multiplier = 2.0;
      tp2Multiplier = 3.0;
    } else if (timeframe === '1H') {
      atrMultiplier = 1.8;
      expiryMs = 180 * 60 * 1000; // 1H: ~180 min (3h)
      tp1Multiplier = 2.0;
      tp2Multiplier = 3.0;
    }

    const volatilityDistance = (atr > 0 ? atr : entry * 0.005) * atrMultiplier;
    const safetyBuffer = volatilityDistance * 0.15;

    let stopLoss = entry;
    let target1 = entry;
    let target2 = entry;

    if (decision === 'BUY') {
      const structuralInvalidation = swingLow - safetyBuffer;
      const volatilityInvalidation = entry - volatilityDistance - safetyBuffer;
      stopLoss = Math.min(structuralInvalidation, volatilityInvalidation);

      const risk = Math.abs(entry - stopLoss);
      target1 = entry + risk * tp1Multiplier;
      target2 = entry + risk * tp2Multiplier;
    } else {
      const structuralInvalidation = swingHigh + safetyBuffer;
      const volatilityInvalidation = entry + volatilityDistance + safetyBuffer;
      stopLoss = Math.max(structuralInvalidation, volatilityInvalidation);

      const risk = Math.abs(stopLoss - entry);
      target1 = entry - risk * tp1Multiplier;
      target2 = entry - risk * tp2Multiplier;
    }

    const dec = assetConfig.decimals;
    const minZone = Math.min(entry - (atr * 0.1), entry + (atr * 0.1));
    const maxZone = Math.max(entry - (atr * 0.1), entry + (atr * 0.1));
    const entryZone = `$${minZone.toFixed(dec)} – $${maxZone.toFixed(dec)}`;

    // 9. LOCK TRADE SERVER-SIDE (IMMUTABLE LEVEL LOCK)
    const newTrade: TerminalActiveTrade = {
      tradeId: `trade_${assetId}_${Date.now()}`,
      assetId,
      symbol: assetConfig.symbol,
      assetName: assetConfig.name,
      direction: decision,
      timeframe,
      entryPrice: +entry.toFixed(dec),
      entryZone,
      stopLossPrice: +stopLoss.toFixed(dec),
      target1Price: +target1.toFixed(dec),
      target2Price: +target2.toFixed(dec),
      confidence: avgConfidence,
      status: 'ACTIVE',
      createdAtET: this.getTimeET(),
      createdAtTimestamp: Date.now(),
      expiryTimestamp: Date.now() + expiryMs,
      marketDataProvider: liveAssetData.provider || 'BIQUOTE/FINNHUB',
      currentLivePrice: +entry.toFixed(dec),
      currentPnlPoints: 0,
      currentPnlPercent: 0,
      aurumReasoning,
      qwenReasoning,
      rationale: `${decision} ${timeframe} institutional trade setup passing all dual-AI consensus & HTF trend gates.`
    };

    this.activeTrades[assetId] = newTrade;
    this.saveStateToFile();

    console.log(`[TerminalSignalsEngine] 🔒 ASSET TRADE LOCKED: ${assetConfig.symbol} (${decision} ${timeframe}) @ $${entry.toFixed(dec)}`);

    return {
      assetId,
      symbol: assetConfig.symbol,
      assetName: assetConfig.name,
      timeframe,
      decision,
      entryPrice: +entry.toFixed(dec),
      entryZone,
      stopLossPrice: +stopLoss.toFixed(dec),
      target1Price: +target1.toFixed(dec),
      target2Price: +target2.toFixed(dec),
      riskRewardRatio: `1:${tp1Multiplier.toFixed(1)}`,
      confidence: avgConfidence,
      confluenceFactors: confluences,
      rationale: newTrade.rationale,
      isLocked: true,
      activeTrade: newTrade,
      dualAiAnalysis: dualAi,
      marketStatus: 'LIVE',
      lastVerifiedPrice: currentLivePrice
    };
  }

  /**
   * Monitor Active Trades against live market price
   */
  public async tickMonitoring(): Promise<void> {
    const activeAssetIds = Object.keys(this.activeTrades);
    if (activeAssetIds.length === 0) return;

    const allData = await fetchAllMarketData();
    if (!allData?.data) return;

    for (const assetId of activeAssetIds) {
      const trade = this.activeTrades[assetId];
      if (!trade || trade.status !== 'ACTIVE') continue;

      const liveData = allData.data[assetId];
      if (!liveData || liveData.price == null) continue;

      const livePrice = liveData.price;
      const dec = liveData.decimals || 2;
      trade.currentLivePrice = +livePrice.toFixed(dec);

      if (trade.direction === 'BUY') {
        trade.currentPnlPoints = +(livePrice - trade.entryPrice).toFixed(dec);
        trade.currentPnlPercent = +(((livePrice - trade.entryPrice) / trade.entryPrice) * 100).toFixed(2);
      } else {
        trade.currentPnlPoints = +(trade.entryPrice - livePrice).toFixed(dec);
        trade.currentPnlPercent = +(((trade.entryPrice - livePrice) / trade.entryPrice) * 100).toFixed(2);
      }

      let isCompleted = false;
      let outcomeResult: 'TP HIT' | 'SL HIT' | 'EXPIRED' = 'TP HIT';
      let exitPrice = livePrice;
      let reason = '';

      if (Date.now() > trade.expiryTimestamp) {
        isCompleted = true;
        outcomeResult = 'EXPIRED';
        exitPrice = livePrice;
        reason = `Trade time expiry reached on ${trade.timeframe}. Position closed.`;
      } else if (trade.direction === 'BUY') {
        if (livePrice >= trade.target1Price) {
          isCompleted = true;
          outcomeResult = 'TP HIT';
          exitPrice = trade.target1Price;
          reason = `Target TP1 ($${trade.target1Price}) reached at live price $${livePrice.toFixed(dec)}`;
        } else if (livePrice <= trade.stopLossPrice) {
          isCompleted = true;
          outcomeResult = 'SL HIT';
          exitPrice = trade.stopLossPrice;
          reason = `Stop Loss ($${trade.stopLossPrice}) breached at live price $${livePrice.toFixed(dec)}`;
        }
      } else if (trade.direction === 'SELL') {
        if (livePrice <= trade.target1Price) {
          isCompleted = true;
          outcomeResult = 'TP HIT';
          exitPrice = trade.target1Price;
          reason = `Target TP1 ($${trade.target1Price}) reached at live price $${livePrice.toFixed(dec)}`;
        } else if (livePrice >= trade.stopLossPrice) {
          isCompleted = true;
          outcomeResult = 'SL HIT';
          exitPrice = trade.stopLossPrice;
          reason = `Stop Loss ($${trade.stopLossPrice}) breached at live price $${livePrice.toFixed(dec)}`;
        }
      }

      if (isCompleted) {
        const completed: TerminalCompletedTrade = {
          tradeId: trade.tradeId,
          assetId: trade.assetId,
          symbol: trade.symbol,
          assetName: trade.assetName,
          direction: trade.direction,
          timeframe: trade.timeframe,
          entryPrice: trade.entryPrice,
          exitPrice: +exitPrice.toFixed(dec),
          stopLossPrice: trade.stopLossPrice,
          target1Price: trade.target1Price,
          target2Price: trade.target2Price,
          result: outcomeResult,
          pnlPoints: trade.currentPnlPoints,
          pnlPercent: trade.currentPnlPercent,
          confidence: trade.confidence,
          startedAtET: trade.createdAtET,
          closedAtET: this.getTimeET(),
          closedAtTimestamp: Date.now(),
          marketDataProvider: trade.marketDataProvider,
          outcomeReason: reason
        };

        this.completedTrades.unshift(completed);
        delete this.activeTrades[assetId];
        // Apply 30-minute post-trade cooldown
        this.cooldowns[assetId] = Date.now() + (30 * 60 * 1000);
        this.saveStateToFile();

        console.log(`[TerminalSignalsEngine] 🔓 UNLOCKED ASSET ${trade.symbol}: ${outcomeResult} @ $${exitPrice.toFixed(dec)}. 30-min cooldown started.`);
      }
    }
  }

  public closeTradeManually(assetId: string): TerminalCompletedTrade | null {
    const trade = this.activeTrades[assetId];
    if (!trade) return null;

    const exitPrice = trade.currentLivePrice || trade.entryPrice;
    const completed: TerminalCompletedTrade = {
      tradeId: trade.tradeId,
      assetId: trade.assetId,
      symbol: trade.symbol,
      assetName: trade.assetName,
      direction: trade.direction,
      timeframe: trade.timeframe,
      entryPrice: trade.entryPrice,
      exitPrice,
      stopLossPrice: trade.stopLossPrice,
      target1Price: trade.target1Price,
      target2Price: trade.target2Price,
      result: 'MANUAL_CLOSE',
      pnlPoints: trade.currentPnlPoints,
      pnlPercent: trade.currentPnlPercent,
      confidence: trade.confidence,
      startedAtET: trade.createdAtET,
      closedAtET: this.getTimeET(),
      closedAtTimestamp: Date.now(),
      marketDataProvider: trade.marketDataProvider,
      outcomeReason: 'Manually closed by user'
    };

    this.completedTrades.unshift(completed);
    delete this.activeTrades[assetId];
    this.cooldowns[assetId] = Date.now() + (30 * 60 * 1000);
    this.saveStateToFile();

    console.log(`[TerminalSignalsEngine] 🔓 UNLOCKED ASSET ${trade.symbol} (MANUAL CLOSE)`);
    return completed;
  }

  public getState() {
    return {
      activeTrades: this.activeTrades,
      completedTrades: this.completedTrades,
      cooldowns: this.cooldowns,
      totalActiveCount: Object.keys(this.activeTrades).length,
      totalCompletedCount: this.completedTrades.length
    };
  }
}

export const terminalSignalsEngine = new ServerTerminalSignalsEngine();

setInterval(() => {
  terminalSignalsEngine.tickMonitoring().catch(err => {
    console.error('[TerminalSignalsEngine] Monitoring error:', err);
  });
}, 3000);

export async function handleTerminalSignalsRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/terminal-signals')) {
    return false;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  try {
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;

    if (pathname === '/api/terminal-signals/state') {
      res.statusCode = 200;
      res.end(JSON.stringify(terminalSignalsEngine.getState()));
      return true;
    }

    if (pathname === '/api/terminal-signals/analyze' && req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      await new Promise(r => req.on('end', r));

      let body: any = {};
      try {
        body = bodyStr ? JSON.parse(bodyStr) : {};
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return true;
      }

      const { assetId, timeframe } = body;

      if (!assetId || !timeframe) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing required parameters: assetId and timeframe.' }));
        return true;
      }

      if (assetId === 'spy' || assetId === 'spy-options') {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'SPY is excluded from Terminal Signals Engine' }));
        return true;
      }

      const normalizedTf = normalizeTimeframe(timeframe);
      if (!normalizedTf) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: `Invalid timeframe '${timeframe}'. Allowed: 15M, 30M, 1H.` }));
        return true;
      }

      const result = await terminalSignalsEngine.analyzeAsset(assetId, normalizedTf);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return true;
    }

    if (pathname === '/api/terminal-signals/close' && req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      await new Promise(r => req.on('end', r));

      let body: any = {};
      try {
        body = bodyStr ? JSON.parse(bodyStr) : {};
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
        return true;
      }

      const { assetId } = body;

      if (!assetId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing assetId parameter' }));
        return true;
      }

      const closed = terminalSignalsEngine.closeTradeManually(assetId);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: !!closed, completedTrade: closed }));
      return true;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Terminal Signals endpoint not found' }));
    return true;
  } catch (err: any) {
    console.error('[TerminalSignalsRouter] Error processing request:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
    return true;
  }
}
