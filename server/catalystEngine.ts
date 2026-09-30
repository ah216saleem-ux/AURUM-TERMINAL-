/**
 * AURUM CATALYST — STRATEGY ENGINE (XAU/USD GOLD) — PHASE 3
 * 
 * Phase 3: Signal Quality & False-Signal Protection
 * 
 * Strict multi-timeframe confirmation chain:
 * 1. REAL LIVE XAU/USD FEED (<= 15s tick age)
 * 2. H4 TREND QUALITY (Directional filter & momentum alignment)
 * 3. H1 KEY ZONE QUALITY (Interaction with high-probability support/resistance structures)
 * 4. M30 CLOSED CANDLE ENGULFING (Genuine body engulfing on completed candle only)
 * 5. CANDLE QUALITY FILTER (Body size, wick proportions, close position, body-to-range ratio)
 * 6. CATALYST QUALITY SCORE (Internal backend score >= 75 points threshold)
 * 7. NEWS & RISK FILTER (High-impact release protection window)
 * 8. ANTI-CHASE VALIDATION (Max $3.00 movement from M30 close)
 * 9. DUPLICATE & RE-ENTRY CHECK (No duplicate signals on same candle, fresh setup required after trade)
 * 10. REAL ENTRY DETERMINATION (Dynamic from live market price)
 * 
 * Fixed Risk / Targets:
 * BUY: SL = Entry - 10.00 | TP1 = Entry + 7.00 | TP2 = Entry + 11.00
 * SELL: SL = Entry + 10.00 | TP1 = Entry - 7.00 | TP2 = Entry - 11.00
 */

import { fetchYahooCandles } from './marketDataRouter';
import { getVerifiedXauPrice, getLatestLivePrices } from './websocketServer';
import { getNewsGuardStatus } from './phaseXTelegramService';

export interface CatalystCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CatalystStatus =
  | 'SCANNING'
  | 'WAITING'
  | 'SIGNAL ACTIVE'
  | 'TP1 HIT'
  | 'TP2 HIT'
  | 'SL HIT'
  | 'MISSED ENTRY'
  | 'COOLDOWN';

export interface CatalystSignalData {
  id: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp1Hit: boolean;
  tp2Hit: boolean;
  slHit: boolean;
  status: CatalystStatus;
  timestamp: number;
  closedCandleTime: number;
  qualityScore: number;
  telegramMessageId?: number;
  expiryTimestamp?: number;
  tp1Timestamp?: number;
  tp1Price?: number;
  timeToTp1Ms?: number;
  h4Direction?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  h1ZoneResult?: string;
}

export interface CatalystQualityScoreBreakdown {
  h4TrendScore: number; // 0 - 20
  h1ZoneScore: number; // 0 - 25
  engulfingStrengthScore: number; // 0 - 25
  candleStructureScore: number; // 0 - 15
  priceFreshnessScore: number; // 0 - 15
  totalScore: number; // 0 - 100
  passThreshold: number; // 75
  isPassed: boolean;
}

export interface CatalystQualityConfig {
  minBodySize: number; // Minimum body size in $ (default: 1.80)
  maxBodySize: number; // Maximum body size in $ to prevent anomaly spikes (default: 20.00)
  minBodyToRangeRatio: number; // Minimum body-to-range ratio (default: 0.55)
  maxOpposingWickRatio: number; // Maximum opposing wick ratio (default: 0.35)
  minClosePositionRatio: number; // Minimum close position (default: 0.65)
  minBodyRatioToPrior: number; // Current body vs prior body ratio (default: 1.10)
  h1ZoneBuffer: number; // Max distance from H1 key level (default: 3.50)
  maxAntiChaseDistance: number; // Max price distance from M30 close (default: 3.00)
  minQualityScore: number; // Minimum backend quality score (default: 75)
}

export const DEFAULT_CATALYST_CONFIG: CatalystQualityConfig = {
  minBodySize: 1.80,
  maxBodySize: 20.00,
  minBodyToRangeRatio: 0.55,
  maxOpposingWickRatio: 0.35,
  minClosePositionRatio: 0.65,
  minBodyRatioToPrior: 1.10,
  h1ZoneBuffer: 3.50,
  maxAntiChaseDistance: 3.00,
  minQualityScore: 75
};

export interface CatalystAnalysisResult {
  status: CatalystStatus;
  direction: 'BUY' | 'SELL' | 'WAIT';
  signal: CatalystSignalData | null;
  livePrice: number;
  priceTimestamp: number;
  feedStatus: 'LIVE' | 'STALE' | 'OFFLINE';
  tickAgeSeconds: number;
  h4Trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  h1ZoneStatus: {
    inSupportZone: boolean;
    inResistanceZone: boolean;
    nearestSupport: number | null;
    nearestResistance: number | null;
    supportDistance: number | null;
    resistanceDistance: number | null;
    zoneQualityScore: number;
  };
  m30Engulfing: {
    detected: boolean;
    type: 'BULLISH' | 'BEARISH' | 'NONE';
    closedCandleTime: number | null;
    engulfingCandleClose: number | null;
    bodySize: number;
    range: number;
    bodyToRangeRatio: number;
    opposingWickRatio: number;
    closePositionRatio: number;
    ratioToPrior: number;
    isQualityPass: boolean;
    qualityFailReason?: string;
  };
  qualityScore: CatalystQualityScoreBreakdown;
  newsProtectionActive: boolean;
  rejectionReason: string | null;
  timestamp: number;
}

function calculateEMA(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const emaArray: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    emaArray.push(values[i] * k + emaArray[i - 1] * (1 - k));
  }
  return emaArray;
}

function aggregate1HTo4HCandles(candles1H: CatalystCandle[]): CatalystCandle[] {
  const result: CatalystCandle[] = [];
  const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

  for (const c of candles1H) {
    const bucketTime = Math.floor(c.time / FOUR_HOURS_MS) * FOUR_HOURS_MS;
    const last = result[result.length - 1];

    if (!last || last.time !== bucketTime) {
      result.push({
        time: bucketTime,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume
      });
    } else {
      last.high = Math.max(last.high, c.high);
      last.low = Math.min(last.low, c.low);
      last.close = c.close;
      last.volume += c.volume;
    }
  }

  return result;
}

/**
 * Evaluates H4 Trend Quality:
 * Uses 20 EMA, 50 EMA, and structural swing sequence on closed 4H candles.
 * Returns direction ('BULLISH' | 'BEARISH' | 'NEUTRAL') and internal trend score (0 - 20).
 */
function evaluateH4Trend(closed4H: CatalystCandle[]): {
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
  reason: string;
} {
  if (closed4H.length < 10) {
    return { trend: 'NEUTRAL', score: 0, reason: 'Insufficient 4H candle history' };
  }

  const closes = closed4H.map(c => c.close);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);

  const lastIndex = closed4H.length - 1;
  const lastClose = closes[lastIndex];
  const lastEma20 = ema20[lastIndex];
  const lastEma50 = ema50[lastIndex];

  const recent = closed4H.slice(-6);
  const isHigherHighs = recent[recent.length - 1].high >= recent[0].high && recent[recent.length - 1].low >= recent[0].low;
  const isLowerLows = recent[recent.length - 1].high <= recent[0].high && recent[recent.length - 1].low <= recent[0].low;

  // Strong Bullish Trend: Price > EMA20 > EMA50 + Structural Higher Highs
  if (lastClose > lastEma20 && lastEma20 >= lastEma50 && isHigherHighs) {
    return { trend: 'BULLISH', score: 20, reason: 'Strong Bullish: Price > EMA20 > EMA50 with Higher Highs' };
  }
  
  // Moderate Bullish: Price > EMA20 > EMA50
  if (lastClose > lastEma20 && lastEma20 >= lastEma50) {
    return { trend: 'BULLISH', score: 16, reason: 'Bullish: EMA20 above EMA50 alignment' };
  }

  // Strong Bearish Trend: Price < EMA20 < EMA50 + Structural Lower Lows
  if (lastClose < lastEma20 && lastEma20 <= lastEma50 && isLowerLows) {
    return { trend: 'BEARISH', score: 20, reason: 'Strong Bearish: Price < EMA20 < EMA50 with Lower Lows' };
  }

  // Moderate Bearish: Price < EMA20 < EMA50
  if (lastClose < lastEma20 && lastEma20 <= lastEma50) {
    return { trend: 'BEARISH', score: 16, reason: 'Bearish: EMA20 below EMA50 alignment' };
  }

  // Weak Bullish above EMA50
  if (lastClose > lastEma50 && lastClose > lastEma20) {
    return { trend: 'BULLISH', score: 12, reason: 'Mild Bullish above EMA50' };
  }

  // Weak Bearish below EMA50
  if (lastClose < lastEma50 && lastClose < lastEma20) {
    return { trend: 'BEARISH', score: 12, reason: 'Mild Bearish below EMA50' };
  }

  return { trend: 'NEUTRAL', score: 0, reason: '4H trend is sideways / conflicting. Directional filter failed.' };
}

/**
 * Evaluates H1 Key Support / Demand or Resistance / Supply Zones:
 * Identifies key swing pivots and demand/supply bases on 1H closed candles.
 * Requires meaningful interaction with the zone (within configurable buffer).
 */
function evaluateH1KeyZones(
  closed1H: CatalystCandle[],
  currentPrice: number,
  config: CatalystQualityConfig = DEFAULT_CATALYST_CONFIG
): {
  inSupportZone: boolean;
  inResistanceZone: boolean;
  nearestSupport: number | null;
  nearestResistance: number | null;
  supportDistance: number | null;
  resistanceDistance: number | null;
  zoneQualityScore: number;
  reason: string;
} {
  if (closed1H.length < 15) {
    return {
      inSupportZone: true,
      inResistanceZone: true,
      nearestSupport: null,
      nearestResistance: null,
      supportDistance: null,
      resistanceDistance: null,
      zoneQualityScore: 15,
      reason: 'Limited 1H history: fallback zone validation'
    };
  }

  const swingLows: number[] = [];
  const swingHighs: number[] = [];

  // Find swing pivots (2 bars left, 2 bars right) over recent 36 hours (36 bars)
  const window = closed1H.slice(-36);
  for (let i = 2; i < window.length - 2; i++) {
    const c = window[i];
    if (c.low < window[i - 1].low && c.low < window[i - 2].low && c.low < window[i + 1].low && c.low < window[i + 2].low) {
      swingLows.push(c.low);
    }
    if (c.high > window[i - 1].high && c.high > window[i - 2].high && c.high > window[i + 1].high && c.high > window[i + 2].high) {
      swingHighs.push(c.high);
    }
  }

  // Also include 24h high/low
  const highs24h = Math.max(...window.slice(-24).map(c => c.high));
  const lows24h = Math.min(...window.slice(-24).map(c => c.low));
  if (!swingHighs.includes(highs24h)) swingHighs.push(highs24h);
  if (!swingLows.includes(lows24h)) swingLows.push(lows24h);

  const buffer = config.h1ZoneBuffer; // $3.50
  let inSupportZone = false;
  let nearestSupport: number | null = null;
  let minSupportDist = Infinity;

  for (const s of swingLows) {
    const dist = Math.abs(currentPrice - s);
    if (dist < minSupportDist) {
      minSupportDist = dist;
      nearestSupport = s;
    }
    // Price reached support/demand area within buffer
    if (dist <= buffer || (currentPrice >= s && currentPrice <= s + buffer)) {
      inSupportZone = true;
    }
  }

  let inResistanceZone = false;
  let nearestResistance: number | null = null;
  let minResistDist = Infinity;

  for (const r of swingHighs) {
    const dist = Math.abs(currentPrice - r);
    if (dist < minResistDist) {
      minResistDist = dist;
      nearestResistance = r;
    }
    // Price reached resistance/supply area within buffer
    if (dist <= buffer || (currentPrice <= r && currentPrice >= r - buffer)) {
      inResistanceZone = true;
    }
  }

  const supportDistance = nearestSupport !== null ? +minSupportDist.toFixed(2) : null;
  const resistanceDistance = nearestResistance !== null ? +minResistDist.toFixed(2) : null;

  // Calculate zone quality score (0 to 25 pts)
  let zoneQualityScore = 0;
  if (inSupportZone || inResistanceZone) {
    const bestDist = Math.min(minSupportDist, minResistDist);
    if (bestDist <= 1.50) zoneQualityScore = 25; // Perfect key-level reaction
    else if (bestDist <= 2.50) zoneQualityScore = 20;
    else if (bestDist <= buffer) zoneQualityScore = 16;
  }

  return {
    inSupportZone,
    inResistanceZone,
    nearestSupport,
    nearestResistance,
    supportDistance,
    resistanceDistance,
    zoneQualityScore,
    reason: inSupportZone
      ? `Interacting with H1 Support ($${nearestSupport}, dist: $${supportDistance})`
      : inResistanceZone
      ? `Interacting with H1 Resistance ($${nearestResistance}, dist: $${resistanceDistance})`
      : `Outside H1 key structure (Nearest support: $${nearestSupport} [$${supportDistance} away], resistance: $${nearestResistance} [$${resistanceDistance} away])`
  };
}

/**
 * Evaluates M30 Closed Engulfing Candle Strength & Quality:
 * Strictly on completed CLOSED candles.
 * 
 * Detailed Quality Filters:
 * 1. Genuine Body Engulfing: Current body must fully engulf prior body.
 * 2. Minimum Body Size: Body >= $1.80 (Rejects weak / doji candles).
 * 3. Maximum Body Size: Body <= $20.00 (Avoids chasing explosive blowout candles).
 * 4. Body-to-Range Ratio: Body / Range >= 0.55 (Rejects indecision spinning tops).
 * 5. Opposing Wick Ratio: Opposing wick / Range <= 0.35 (Rejects heavy counter-rejections).
 * 6. Closing Position: Closes in top 35% of range for Bullish, bottom 35% for Bearish.
 * 7. Relationship to Prior: Current body >= 1.10x prior body.
 */
function evaluateM30EngulfingAndQuality(
  closedM30: CatalystCandle[],
  config: CatalystQualityConfig = DEFAULT_CATALYST_CONFIG
): {
  detected: boolean;
  type: 'BULLISH' | 'BEARISH' | 'NONE';
  closedCandleTime: number | null;
  engulfingCandleClose: number | null;
  bodySize: number;
  range: number;
  bodyToRangeRatio: number;
  opposingWickRatio: number;
  closePositionRatio: number;
  ratioToPrior: number;
  isQualityPass: boolean;
  engulfingStrengthScore: number;
  candleStructureScore: number;
  qualityFailReason?: string;
} {
  const defaultFail = {
    detected: false,
    type: 'NONE' as const,
    closedCandleTime: null,
    engulfingCandleClose: null,
    bodySize: 0,
    range: 0,
    bodyToRangeRatio: 0,
    opposingWickRatio: 0,
    closePositionRatio: 0,
    ratioToPrior: 0,
    isQualityPass: false,
    engulfingStrengthScore: 0,
    candleStructureScore: 0
  };

  if (closedM30.length < 3) {
    return { ...defaultFail, qualityFailReason: 'Insufficient M30 closed candle data' };
  }

  // Examine the last two completed closed candles
  const current = closedM30[closedM30.length - 1];
  const prior = closedM30[closedM30.length - 2];

  const currentBody = +(Math.abs(current.close - current.open)).toFixed(2);
  const priorBody = +(Math.abs(prior.close - prior.open)).toFixed(2);
  const range = +(current.high - current.low).toFixed(2);

  if (range <= 0) {
    return { ...defaultFail, qualityFailReason: 'Invalid zero-range M30 candle' };
  }

  const bodyToRangeRatio = +(currentBody / range).toFixed(2);
  const ratioToPrior = priorBody > 0 ? +(currentBody / priorBody).toFixed(2) : 2.0;

  const isCurrentBullish = current.close > current.open;
  const isPriorBearish = prior.close < prior.open;

  const isCurrentBearish = current.close < current.open;
  const isPriorBullish = prior.close > prior.open;

  // 1. BULLISH ENGULFING EVALUATION
  if (isCurrentBullish && isPriorBearish) {
    // Check True Body Engulfing:
    // Current open is at or below prior close (allowing tiny 0.10 tolerance)
    // Current close is at or above prior open (allowing tiny 0.10 tolerance)
    const isBodyEngulfing = current.open <= prior.close + 0.10 && current.close >= prior.open - 0.10;
    
    // Upper wick (opposing wick for bullish candle)
    const upperWick = +(current.high - current.close).toFixed(2);
    const opposingWickRatio = +(upperWick / range).toFixed(2);

    // Close position: distance from low to close / range (1.0 = close at high)
    const closePositionRatio = +((current.close - current.low) / range).toFixed(2);

    // Filter Checks:
    if (!isBodyEngulfing) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BULLISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: 'M30 candle does not fully engulf previous candle body.'
      };
    }

    if (currentBody < config.minBodySize) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BULLISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Weak engulfing body ($${currentBody} < $${config.minBodySize} min). Doji-like structure rejected.`
      };
    }

    if (currentBody > config.maxBodySize) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BULLISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Unusually large impulse candle ($${currentBody} > $${config.maxBodySize} max). Blowout risk.`
      };
    }

    if (bodyToRangeRatio < config.minBodyToRangeRatio) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BULLISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Low body-to-range ratio (${bodyToRangeRatio} < ${config.minBodyToRangeRatio}). High wick indecision.`
      };
    }

    if (opposingWickRatio > config.maxOpposingWickRatio) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BULLISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Heavy selling rejection wick at top (${opposingWickRatio} > ${config.maxOpposingWickRatio}).`
      };
    }

    if (closePositionRatio < config.minClosePositionRatio) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BULLISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Candle did not close in upper 35% of range (${closePositionRatio} < ${config.minClosePositionRatio}).`
      };
    }

    if (ratioToPrior < config.minBodyRatioToPrior) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BULLISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Current body does not clearly dominate previous body (${ratioToPrior}x < ${config.minBodyRatioToPrior}x).`
      };
    }

    // Scores Calculation
    let engulfingStrengthScore = 20;
    if (ratioToPrior >= 1.30 && currentBody >= 2.50) engulfingStrengthScore = 25;

    let candleStructureScore = 10;
    if (bodyToRangeRatio >= 0.70 && opposingWickRatio <= 0.20 && closePositionRatio >= 0.80) {
      candleStructureScore = 15;
    }

    return {
      detected: true,
      type: 'BULLISH',
      closedCandleTime: current.time,
      engulfingCandleClose: current.close,
      bodySize: currentBody,
      range,
      bodyToRangeRatio,
      opposingWickRatio,
      closePositionRatio,
      ratioToPrior,
      isQualityPass: true,
      engulfingStrengthScore,
      candleStructureScore
    };
  }

  // 2. BEARISH ENGULFING EVALUATION
  if (isCurrentBearish && isPriorBullish) {
    // Check True Body Engulfing:
    // Current open is at or above prior close (allowing tiny 0.10 tolerance)
    // Current close is at or below prior open (allowing tiny 0.10 tolerance)
    const isBodyEngulfing = current.open >= prior.close - 0.10 && current.close <= prior.open + 0.10;

    // Lower wick (opposing wick for bearish candle)
    const lowerWick = +(current.close - current.low).toFixed(2);
    const opposingWickRatio = +(lowerWick / range).toFixed(2);

    // Close position: distance from high to close / range (1.0 = close at low)
    const closePositionRatio = +((current.high - current.close) / range).toFixed(2);

    // Filter Checks:
    if (!isBodyEngulfing) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BEARISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: 'M30 candle does not fully engulf previous candle body.'
      };
    }

    if (currentBody < config.minBodySize) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BEARISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Weak engulfing body ($${currentBody} < $${config.minBodySize} min). Doji-like structure rejected.`
      };
    }

    if (currentBody > config.maxBodySize) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BEARISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Unusually large impulse candle ($${currentBody} > $${config.maxBodySize} max). Blowout risk.`
      };
    }

    if (bodyToRangeRatio < config.minBodyToRangeRatio) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BEARISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Low body-to-range ratio (${bodyToRangeRatio} < ${config.minBodyToRangeRatio}). High wick indecision.`
      };
    }

    if (opposingWickRatio > config.maxOpposingWickRatio) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BEARISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Heavy buying rejection wick at bottom (${opposingWickRatio} > ${config.maxOpposingWickRatio}).`
      };
    }

    if (closePositionRatio < config.minClosePositionRatio) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BEARISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Candle did not close in lower 35% of range (${closePositionRatio} < ${config.minClosePositionRatio}).`
      };
    }

    if (ratioToPrior < config.minBodyRatioToPrior) {
      return {
        ...defaultFail,
        detected: true,
        type: 'BEARISH',
        closedCandleTime: current.time,
        engulfingCandleClose: current.close,
        bodySize: currentBody,
        range,
        bodyToRangeRatio,
        opposingWickRatio,
        closePositionRatio,
        ratioToPrior,
        qualityFailReason: `Current body does not clearly dominate previous body (${ratioToPrior}x < ${config.minBodyRatioToPrior}x).`
      };
    }

    // Scores Calculation
    let engulfingStrengthScore = 20;
    if (ratioToPrior >= 1.30 && currentBody >= 2.50) engulfingStrengthScore = 25;

    let candleStructureScore = 10;
    if (bodyToRangeRatio >= 0.70 && opposingWickRatio <= 0.20 && closePositionRatio >= 0.80) {
      candleStructureScore = 15;
    }

    return {
      detected: true,
      type: 'BEARISH',
      closedCandleTime: current.time,
      engulfingCandleClose: current.close,
      bodySize: currentBody,
      range,
      bodyToRangeRatio,
      opposingWickRatio,
      closePositionRatio,
      ratioToPrior,
      isQualityPass: true,
      engulfingStrengthScore,
      candleStructureScore
    };
  }

  return { ...defaultFail, qualityFailReason: 'No valid Bullish or Bearish Engulfing candle pattern detected.' };
}

/**
 * Primary Catalyst Strategy Analysis Engine (Phase 3):
 * Evaluates the full selective confirmation chain and calculates internal backend quality score.
 */
export async function analyzeCatalystSetup(
  livePriceOverride?: number,
  config: CatalystQualityConfig = DEFAULT_CATALYST_CONFIG
): Promise<CatalystAnalysisResult> {
  const now = Date.now();

  // 1. Fetch Real Live Verified Price
  const verifiedXau = getVerifiedXauPrice(15000);
  const fallbackTicks = getLatestLivePrices();
  const fallbackTick = fallbackTicks['xau-usd'];

  let livePrice = 0;
  let priceTimestamp = now;
  let tickAgeSeconds = 999;
  let feedStatus: 'LIVE' | 'STALE' | 'OFFLINE' = 'OFFLINE';

  if (verifiedXau && verifiedXau.price > 0) {
    livePrice = +verifiedXau.price.toFixed(2);
    priceTimestamp = verifiedXau.timestamp;
    tickAgeSeconds = verifiedXau.ageSeconds;
    feedStatus = verifiedXau.ageSeconds <= 15 ? 'LIVE' : (verifiedXau.ageSeconds <= 60 ? 'STALE' : 'OFFLINE');
  } else if (fallbackTick && fallbackTick.price > 0) {
    livePrice = +fallbackTick.price.toFixed(2);
    priceTimestamp = fallbackTick.timestamp;
    const age = Math.floor((now - fallbackTick.timestamp) / 1000);
    tickAgeSeconds = age;
    feedStatus = age <= 15 ? 'LIVE' : (age <= 60 ? 'STALE' : 'OFFLINE');
  }

  if (livePriceOverride && livePriceOverride > 0) {
    livePrice = +livePriceOverride.toFixed(2);
    priceTimestamp = now;
    tickAgeSeconds = 0;
    feedStatus = 'LIVE';
  }

  const defaultQualityScore: CatalystQualityScoreBreakdown = {
    h4TrendScore: 0,
    h1ZoneScore: 0,
    engulfingStrengthScore: 0,
    candleStructureScore: 0,
    priceFreshnessScore: 0,
    totalScore: 0,
    passThreshold: config.minQualityScore,
    isPassed: false
  };

  // Reject stale / offline market feed
  if (feedStatus !== 'LIVE' || livePrice <= 0) {
    return {
      status: 'WAITING',
      direction: 'WAIT',
      signal: null,
      livePrice,
      priceTimestamp,
      feedStatus,
      tickAgeSeconds,
      h4Trend: 'NEUTRAL',
      h1ZoneStatus: {
        inSupportZone: false,
        inResistanceZone: false,
        nearestSupport: null,
        nearestResistance: null,
        supportDistance: null,
        resistanceDistance: null,
        zoneQualityScore: 0
      },
      m30Engulfing: {
        detected: false,
        type: 'NONE',
        closedCandleTime: null,
        engulfingCandleClose: null,
        bodySize: 0,
        range: 0,
        bodyToRangeRatio: 0,
        opposingWickRatio: 0,
        closePositionRatio: 0,
        ratioToPrior: 0,
        isQualityPass: false
      },
      qualityScore: defaultQualityScore,
      newsProtectionActive: false,
      rejectionReason: `Live market feed is ${feedStatus} (${tickAgeSeconds}s age). Signal creation rejected until fresh tick.`,
      timestamp: now
    };
  }

  // 2. Fetch Closed Candles across Timeframes: 30m, 60m (1h)
  let rawM30: any[] = [];
  let raw1H: any[] = [];

  try {
    const [m30Res, h1Res] = await Promise.all([
      fetchYahooCandles('GC=F', '30m', '5d'),
      fetchYahooCandles('GC=F', '60m', '1mo')
    ]);
    rawM30 = m30Res || [];
    raw1H = h1Res || [];
  } catch (err) {
    console.warn('[CatalystEngine] Failed to fetch market candles:', err);
  }

  // STRICT CLOSED-CANDLE RULE: Drop the last forming/unfinished candle
  const filterClosed = (list: any[]): CatalystCandle[] => {
    if (!list || list.length <= 1) return [];
    return list.slice(0, -1).map(c => ({
      time: c.time,
      open: +c.open,
      high: +c.high,
      low: +c.low,
      close: +c.close,
      volume: +c.volume || 0
    }));
  };

  let closedM30 = filterClosed(rawM30);
  let closed1H = filterClosed(raw1H);

  // Basis synchronization with live spot price if necessary
  if (closedM30.length > 0 && livePrice > 0) {
    const lastM30Close = closedM30[closedM30.length - 1].close;
    const offset = Math.abs(livePrice - lastM30Close) > 4.0 ? +(livePrice - lastM30Close).toFixed(2) : 0;
    if (offset !== 0) {
      closedM30 = closedM30.map(c => ({
        ...c,
        open: +(c.open + offset).toFixed(2),
        high: +(c.high + offset).toFixed(2),
        low: +(c.low + offset).toFixed(2),
        close: +(c.close + offset).toFixed(2)
      }));
      closed1H = closed1H.map(c => ({
        ...c,
        open: +(c.open + offset).toFixed(2),
        high: +(c.high + offset).toFixed(2),
        low: +(c.low + offset).toFixed(2),
        close: +(c.close + offset).toFixed(2)
      }));
    }
  }

  const closed4H = aggregate1HTo4HCandles(closed1H);

  // 3. Step 1: H4 Trend Quality
  const h4Result = evaluateH4Trend(closed4H);
  const h4Trend = h4Result.trend;

  // 4. Step 2: H1 Key Zone Quality
  const h1Zones = evaluateH1KeyZones(closed1H, livePrice, config);

  // 5. Step 3: M30 Closed Engulfing & Candle Quality Filter
  const m30Engulfing = evaluateM30EngulfingAndQuality(closedM30, config);

  // 6. Step 4: News Filter Protection
  const newsStatus = getNewsGuardStatus();
  const newsProtectionActive = !!(newsStatus && newsStatus.enabled && newsStatus.isInNewsWindow);

  // 7. Calculate Price Freshness & Anti-Chase Margin Score (0 - 15 pts)
  let priceFreshnessScore = 15;
  const engClose = m30Engulfing.engulfingCandleClose || livePrice;
  const priceDistance = Math.abs(livePrice - engClose);
  if (priceDistance > 1.50) priceFreshnessScore = 10;
  if (priceDistance > config.maxAntiChaseDistance) priceFreshnessScore = 0;

  // 8. Quality Score Synthesis
  const totalScore = (
    h4Result.score +
    h1Zones.zoneQualityScore +
    m30Engulfing.engulfingStrengthScore +
    m30Engulfing.candleStructureScore +
    priceFreshnessScore
  );

  const qualityScoreBreakdown: CatalystQualityScoreBreakdown = {
    h4TrendScore: h4Result.score,
    h1ZoneScore: h1Zones.zoneQualityScore,
    engulfingStrengthScore: m30Engulfing.engulfingStrengthScore,
    candleStructureScore: m30Engulfing.candleStructureScore,
    priceFreshnessScore,
    totalScore,
    passThreshold: config.minQualityScore,
    isPassed: totalScore >= config.minQualityScore
  };

  // 9. Full Confirmation Chain Evaluation
  let direction: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  let rejectionReason: string | null = null;

  if (newsProtectionActive) {
    rejectionReason = `High impact economic release imminent (${newsStatus?.upcomingEvent || 'News Window'}). Capital protected.`;
  } else if (!m30Engulfing.detected || m30Engulfing.type === 'NONE') {
    rejectionReason = 'Waiting for confirmed M30 closed engulfing candle.';
  } else if (!m30Engulfing.isQualityPass) {
    rejectionReason = `Engulfing quality filter failed: ${m30Engulfing.qualityFailReason || 'Substandard candle'}`;
  } else if (m30Engulfing.type === 'BULLISH') {
    // BUY Verification Chain:
    if (h4Trend !== 'BULLISH') {
      rejectionReason = `H4 trend is not bullish (${h4Trend} - ${h4Result.reason}). Counter-trend BUY blocked.`;
    } else if (!h1Zones.inSupportZone) {
      rejectionReason = `Price has not reached a confirmed H1 support/demand area (${h1Zones.reason}).`;
    } else if (livePrice > engClose + config.maxAntiChaseDistance) {
      return {
        status: 'MISSED ENTRY',
        direction: 'WAIT',
        signal: null,
        livePrice,
        priceTimestamp,
        feedStatus,
        tickAgeSeconds,
        h4Trend,
        h1ZoneStatus: h1Zones,
        m30Engulfing,
        qualityScore: qualityScoreBreakdown,
        newsProtectionActive,
        rejectionReason: `Price extended > $${config.maxAntiChaseDistance} past M30 close. MISSED ENTRY — Do not chase.`,
        timestamp: now
      };
    } else if (totalScore < config.minQualityScore) {
      rejectionReason = `Catalyst Quality Score (${totalScore}/100) below minimum threshold (${config.minQualityScore}). Setup rejected for low conviction.`;
    } else {
      direction = 'BUY';
    }
  } else if (m30Engulfing.type === 'BEARISH') {
    // SELL Verification Chain:
    if (h4Trend !== 'BEARISH') {
      rejectionReason = `H4 trend is not bearish (${h4Trend} - ${h4Result.reason}). Counter-trend SELL blocked.`;
    } else if (!h1Zones.inResistanceZone) {
      rejectionReason = `Price has not reached a confirmed H1 resistance/supply area (${h1Zones.reason}).`;
    } else if (livePrice < engClose - config.maxAntiChaseDistance) {
      return {
        status: 'MISSED ENTRY',
        direction: 'WAIT',
        signal: null,
        livePrice,
        priceTimestamp,
        feedStatus,
        tickAgeSeconds,
        h4Trend,
        h1ZoneStatus: h1Zones,
        m30Engulfing,
        qualityScore: qualityScoreBreakdown,
        newsProtectionActive,
        rejectionReason: `Price extended > $${config.maxAntiChaseDistance} past M30 close. MISSED ENTRY — Do not chase.`,
        timestamp: now
      };
    } else if (totalScore < config.minQualityScore) {
      rejectionReason = `Catalyst Quality Score (${totalScore}/100) below minimum threshold (${config.minQualityScore}). Setup rejected for low conviction.`;
    } else {
      direction = 'SELL';
    }
  }

  // 10. Construct Real Signal with Exact Catalyst Risk & Targets
  let signal: CatalystSignalData | null = null;
  let status: CatalystStatus = 'WAITING';

  if (direction === 'BUY') {
    const entry = livePrice;
    const sl = +(entry - 10.00).toFixed(2);
    const tp1 = +(entry + 7.00).toFixed(2);
    const tp2 = +(entry + 11.00).toFixed(2);

    signal = {
      id: `CATALYST_XAUUSD_BUY_${m30Engulfing.closedCandleTime || now}`,
      direction: 'BUY',
      entry,
      sl,
      tp1,
      tp2,
      tp1Hit: false,
      tp2Hit: false,
      slHit: false,
      status: 'SIGNAL ACTIVE',
      timestamp: now,
      closedCandleTime: m30Engulfing.closedCandleTime || now,
      qualityScore: totalScore,
      h4Direction: h4Trend,
      h1ZoneResult: 'SUPPORT'
    };
    status = 'SIGNAL ACTIVE';
  } else if (direction === 'SELL') {
    const entry = livePrice;
    const sl = +(entry + 10.00).toFixed(2);
    const tp1 = +(entry - 7.00).toFixed(2);
    const tp2 = +(entry - 11.00).toFixed(2);

    signal = {
      id: `CATALYST_XAUUSD_SELL_${m30Engulfing.closedCandleTime || now}`,
      direction: 'SELL',
      entry,
      sl,
      tp1,
      tp2,
      tp1Hit: false,
      tp2Hit: false,
      slHit: false,
      status: 'SIGNAL ACTIVE',
      timestamp: now,
      closedCandleTime: m30Engulfing.closedCandleTime || now,
      qualityScore: totalScore,
      h4Direction: h4Trend,
      h1ZoneResult: 'RESISTANCE'
    };
    status = 'SIGNAL ACTIVE';
  } else {
    status = 'WAITING';
  }

  return {
    status,
    direction,
    signal,
    livePrice,
    priceTimestamp,
    feedStatus,
    tickAgeSeconds,
    h4Trend,
    h1ZoneStatus: h1Zones,
    m30Engulfing,
    qualityScore: qualityScoreBreakdown,
    newsProtectionActive,
    rejectionReason,
    timestamp: now
  };
}
