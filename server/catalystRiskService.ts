/**
 * AURUM CATALYST — FORWARD-VALIDATION, RISK CONTROL & PERFORMANCE TRACKING (PHASE 4)
 * 
 * Objectives:
 * 1. REAL FORWARD-VALIDATION: Tracks real-market live forward outcomes (NO simulated/paper mock data).
 * 2. UNIQUE SIGNAL & TRADE REGISTRATION: Deterministic lifecycle tracking (Entry, TP1, TP2, SL, Missed, Expired).
 * 3. DAILY RISK LIMITS: Max 5 signals/day, Max 3 SL/day -> DAILY LOCK.
 * 4. CONSECUTIVE LOSS PROTECTION: Max 3 consecutive SL hits -> RISK PAUSE.
 * 5. STRICT NO-MARTINGALE: Fixed $10 SL, $7 TP1, $11 TP2. No position size/risk inflation.
 * 6. SIGNAL EXPIRY: 30-minute validity window for pending setup entry.
 * 7. TELEGRAM DELIVERY AUDIT: Delivery verification & failure audit without duplicate trade generation.
 * 8. FEED HEALTH MONITOR: Tracks live feed latency, outage events, and offline periods.
 * 9. DETERMINISTIC RECOVERY: Server restarts preserve daily counts, consecutive loss counters, and risk locks.
 * 10. ADMIN REPORTING: Granular performance, daily stats, and trade archive endpoints.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRADES_FILE = path.join(DATA_DIR, 'catalyst_trades.json');
const DAILY_STATE_FILE = path.join(DATA_DIR, 'catalyst_daily_state.json');
const RISK_CONFIG_FILE = path.join(DATA_DIR, 'catalyst_risk_config.json');

export interface CatalystRiskConfig {
  maxDailySignals: number; // default 5
  maxDailySlTrades: number; // default 3
  maxConsecutiveLosses: number; // default 3
  signalExpiryMinutes: number; // default 30
  autoResetUtcHour: number; // default 0 (00:00 UTC)
}

export const DEFAULT_RISK_CONFIG: CatalystRiskConfig = {
  maxDailySignals: 5,
  maxDailySlTrades: 3,
  maxConsecutiveLosses: 3,
  signalExpiryMinutes: 30,
  autoResetUtcHour: 0
};

export interface CatalystCompletedTrade {
  signalId: string;
  timestamp: number;
  timeFormatted: string;
  market: 'XAU/USD';
  direction: 'BUY' | 'SELL';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  m30CandleTimestamp: number;
  h4Direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  h1ZoneResult: string;
  qualityScore: number;
  livePriceTimestamp: number;

  // Lifecycle Metrics
  tp1Hit: boolean;
  tp1Timestamp?: number;
  tp1Price?: number;
  timeToTp1Ms?: number;

  tp2Hit: boolean;
  tp2Timestamp?: number;
  tp2Price?: number;
  timeToTp2Ms?: number;

  slHit: boolean;
  slTimestamp?: number;
  slPrice?: number;
  timeToSlMs?: number;

  finalOutcome: 'TP2_HIT' | 'SL_HIT' | 'TP1_CLOSED' | 'MISSED_ENTRY' | 'EXPIRED' | 'CANCELLED';
  exitPrice: number;
  exitTimestamp: number;
  totalDurationMs: number;
  pnlDistance: number; // e.g. +11.00, +7.00, -10.00
  rMultiple: number; // +1.1R, -1.0R, 0.0R

  // Telegram verification
  telegramSignalMessageId?: number;
  telegramSignalStatus: 'SENT' | 'FAILED' | 'SKIPPED';
  telegramLifecycleStatus?: string;
}

export interface CatalystDailyState {
  dateStr: string; // YYYY-MM-DD UTC
  signalsCreatedToday: number;
  slHitsToday: number;
  tp1HitsToday: number;
  tp2HitsToday: number;
  missedEntriesToday: number;
  consecutiveSlCount: number;
  consecutiveWinCount: number;
  riskStatus: 'NORMAL' | 'RISK_PAUSE' | 'DAILY_LOCK';
  riskPauseReason?: string;
  riskPauseTimestamp?: number;
  lastUpdated: number;
}

export interface CatalystFeedHealthMetrics {
  status: 'LIVE' | 'STALE' | 'OFFLINE';
  lastTickTimestamp: number;
  tickAgeSeconds: number;
  staleEventCount: number;
  offlineEventCount: number;
  lastOutageDurationSeconds: number;
}

export interface CatalystPerformanceStats {
  mode: 'FORWARD_VALIDATION';
  totalSignals: number;
  totalCompletedTrades: number;
  tp1Hits: number;
  tp2Hits: number;
  slHits: number;
  missedEntries: number;
  expiredSetups: number;
  winRate: number; // % of resolved trades that achieved TP1 or TP2
  tp1HitRate: number;
  tp2CompletionRate: number;
  slRate: number;
  averageTimeToTp1Minutes: number;
  averageTimeToTp2Minutes: number;
  averageTimeToSlMinutes: number;
  averageQualityScore: number;
  averagePnlDistance: number;
  totalPnlDistance: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  currentConsecutiveLosses: number;
  currentConsecutiveWins: number;
  dailyStats: CatalystDailyState;
  riskConfig: CatalystRiskConfig;
  feedHealth: CatalystFeedHealthMetrics;
}

let riskConfig: CatalystRiskConfig = { ...DEFAULT_RISK_CONFIG };
let completedTrades: CatalystCompletedTrade[] = [];
let dailyState: CatalystDailyState = {
  dateStr: getUtcDateString(),
  signalsCreatedToday: 0,
  slHitsToday: 0,
  tp1HitsToday: 0,
  tp2HitsToday: 0,
  missedEntriesToday: 0,
  consecutiveSlCount: 0,
  consecutiveWinCount: 0,
  riskStatus: 'NORMAL',
  lastUpdated: Date.now()
};

let feedHealth: CatalystFeedHealthMetrics = {
  status: 'LIVE',
  lastTickTimestamp: Date.now(),
  tickAgeSeconds: 0,
  staleEventCount: 0,
  offlineEventCount: 0,
  lastOutageDurationSeconds: 0
};

function getUtcDateString(timestamp = Date.now()): string {
  const d = new Date(timestamp);
  return d.toISOString().split('T')[0];
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

export function loadCatalystRiskState(): void {
  ensureDataDir();
  try {
    if (fs.existsSync(RISK_CONFIG_FILE)) {
      const raw = fs.readFileSync(RISK_CONFIG_FILE, 'utf-8');
      const cfg = JSON.parse(raw);
      if (cfg && typeof cfg === 'object') {
        riskConfig = { ...DEFAULT_RISK_CONFIG, ...cfg };
      }
    }

    if (fs.existsSync(TRADES_FILE)) {
      const rawTrades = fs.readFileSync(TRADES_FILE, 'utf-8');
      const parsed = JSON.parse(rawTrades);
      if (Array.isArray(parsed)) {
        completedTrades = parsed;
      }
    }

    if (fs.existsSync(DAILY_STATE_FILE)) {
      const rawDaily = fs.readFileSync(DAILY_STATE_FILE, 'utf-8');
      const parsed = JSON.parse(rawDaily);
      if (parsed && typeof parsed === 'object') {
        dailyState = { ...dailyState, ...parsed };
      }
    }

    // Daily UTC reset check on startup
    checkAndResetDailyMetrics();

    // Ensure files are saved to disk immediately
    saveCatalystRiskState();
  } catch (err) {
    console.warn('[CatalystRisk] Error loading risk state from disk:', err);
  }
}

export function saveCatalystRiskState(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(RISK_CONFIG_FILE, JSON.stringify(riskConfig, null, 2), 'utf-8');
    fs.writeFileSync(TRADES_FILE, JSON.stringify(completedTrades, null, 2), 'utf-8');
    fs.writeFileSync(DAILY_STATE_FILE, JSON.stringify(dailyState, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[CatalystRisk] Error saving risk state to disk:', err);
  }
}

export function updateFeedHealthMetrics(
  status: 'LIVE' | 'STALE' | 'OFFLINE',
  tickTimestamp: number,
  ageSeconds: number
): void {
  const prevStatus = feedHealth.status;
  feedHealth.status = status;
  feedHealth.lastTickTimestamp = tickTimestamp;
  feedHealth.tickAgeSeconds = ageSeconds;

  if (prevStatus === 'LIVE' && status === 'STALE') {
    feedHealth.staleEventCount += 1;
  } else if (prevStatus !== 'OFFLINE' && status === 'OFFLINE') {
    feedHealth.offlineEventCount += 1;
  }
}

export function getFeedHealthMetrics(): CatalystFeedHealthMetrics {
  return { ...feedHealth };
}

/**
 * Verifies if date has rolled over in UTC (00:00 UTC) and resets daily signal/SL counters.
 */
export function checkAndResetDailyMetrics(): void {
  const currentUtcDate = getUtcDateString();
  if (dailyState.dateStr !== currentUtcDate) {
    console.log(`[CatalystRisk] New UTC Trading Day (${currentUtcDate}). Resetting daily Catalyst limits.`);
    dailyState.dateStr = currentUtcDate;
    dailyState.signalsCreatedToday = 0;
    dailyState.slHitsToday = 0;
    dailyState.tp1HitsToday = 0;
    dailyState.tp2HitsToday = 0;
    dailyState.missedEntriesToday = 0;
    
    // Automatically lift DAILY_LOCK on new day
    if (dailyState.riskStatus === 'DAILY_LOCK') {
      dailyState.riskStatus = 'NORMAL';
      dailyState.riskPauseReason = undefined;
    }
    dailyState.lastUpdated = Date.now();
    saveCatalystRiskState();
  }
}

/**
 * Validates whether a new Catalyst trade signal is permitted by risk controls.
 * Checks daily signal limit, daily SL limit, and consecutive loss protection.
 */
export function canCreateNewCatalystSignal(): {
  allowed: boolean;
  riskStatus: 'NORMAL' | 'RISK_PAUSE' | 'DAILY_LOCK';
  reason?: string;
} {
  checkAndResetDailyMetrics();

  // 1. Check if RISK PAUSE is active
  if (dailyState.riskStatus === 'RISK_PAUSE') {
    return {
      allowed: false,
      riskStatus: 'RISK_PAUSE',
      reason: dailyState.riskPauseReason || `Consecutive loss limit reached (${riskConfig.maxConsecutiveLosses} SL hits). Trading paused.`
    };
  }

  // 2. Check if DAILY LOCK is active
  if (dailyState.riskStatus === 'DAILY_LOCK') {
    return {
      allowed: false,
      riskStatus: 'DAILY_LOCK',
      reason: dailyState.riskPauseReason || `Daily risk limit reached (${dailyState.slHitsToday}/${riskConfig.maxDailySlTrades} SL hits). Locked until next UTC day.`
    };
  }

  // 3. Check Daily Signal Cap
  if (dailyState.signalsCreatedToday >= riskConfig.maxDailySignals) {
    return {
      allowed: false,
      riskStatus: 'DAILY_LOCK',
      reason: `Maximum daily Catalyst signals limit reached (${dailyState.signalsCreatedToday}/${riskConfig.maxDailySignals}).`
    };
  }

  // 4. Check Daily SL Cap
  if (dailyState.slHitsToday >= riskConfig.maxDailySlTrades) {
    dailyState.riskStatus = 'DAILY_LOCK';
    dailyState.riskPauseReason = `Daily SL limit reached (${dailyState.slHitsToday}/${riskConfig.maxDailySlTrades} SL hits).`;
    saveCatalystRiskState();
    return {
      allowed: false,
      riskStatus: 'DAILY_LOCK',
      reason: dailyState.riskPauseReason
    };
  }

  // 5. Check Consecutive Loss Cap
  if (dailyState.consecutiveSlCount >= riskConfig.maxConsecutiveLosses) {
    dailyState.riskStatus = 'RISK_PAUSE';
    dailyState.riskPauseReason = `Consecutive loss protection triggered (${dailyState.consecutiveSlCount} consecutive SL hits).`;
    saveCatalystRiskState();
    return {
      allowed: false,
      riskStatus: 'RISK_PAUSE',
      reason: dailyState.riskPauseReason
    };
  }

  return { allowed: true, riskStatus: 'NORMAL' };
}

/**
 * Records the creation of a new real trade setup.
 */
export function recordSignalCreated(): void {
  checkAndResetDailyMetrics();
  dailyState.signalsCreatedToday += 1;
  dailyState.lastUpdated = Date.now();
  saveCatalystRiskState();
}

/**
 * Records the completion of a trade, updating risk limits, win/loss counters, and persistent trade history.
 */
export function recordCompletedTrade(trade: CatalystCompletedTrade): void {
  checkAndResetDailyMetrics();

  // Deduplication by signalId
  const existingIdx = completedTrades.findIndex(t => t.signalId === trade.signalId);
  if (existingIdx >= 0) {
    completedTrades[existingIdx] = trade;
  } else {
    completedTrades.unshift(trade);
  }

  // Keep last 500 completed trades
  if (completedTrades.length > 500) {
    completedTrades = completedTrades.slice(0, 500);
  }

  // Update Daily & Consecutive Risk Metrics
  if (trade.finalOutcome === 'TP2_HIT') {
    dailyState.tp2HitsToday += 1;
    dailyState.consecutiveWinCount += 1;
    dailyState.consecutiveSlCount = 0; // Reset consecutive losses
  } else if (trade.finalOutcome === 'TP1_CLOSED') {
    dailyState.tp1HitsToday += 1;
    dailyState.consecutiveWinCount += 1;
    dailyState.consecutiveSlCount = 0;
  } else if (trade.finalOutcome === 'SL_HIT') {
    dailyState.slHitsToday += 1;
    dailyState.consecutiveSlCount += 1;
    dailyState.consecutiveWinCount = 0; // Reset consecutive wins

    // Check if daily SL limit reached
    if (dailyState.slHitsToday >= riskConfig.maxDailySlTrades) {
      dailyState.riskStatus = 'DAILY_LOCK';
      dailyState.riskPauseReason = `Daily SL limit reached (${dailyState.slHitsToday}/${riskConfig.maxDailySlTrades} SL hits). Locked until 00:00 UTC.`;
      console.warn(`[CatalystRisk] DAILY RISK LOCK activated: ${dailyState.riskPauseReason}`);
    } else if (dailyState.consecutiveSlCount >= riskConfig.maxConsecutiveLosses) {
      dailyState.riskStatus = 'RISK_PAUSE';
      dailyState.riskPauseReason = `Consecutive loss limit reached (${dailyState.consecutiveSlCount} consecutive SL hits). Trading paused.`;
      console.warn(`[CatalystRisk] RISK PAUSE activated: ${dailyState.riskPauseReason}`);
    }
  } else if (trade.finalOutcome === 'MISSED_ENTRY') {
    dailyState.missedEntriesToday += 1;
  }

  dailyState.lastUpdated = Date.now();
  saveCatalystRiskState();
}

/**
 * Resets risk limits manually (Admin function).
 */
export function resetCatalystRiskStatusManual(resetType: 'ALL' | 'RISK_PAUSE' | 'DAILY_LOCK' = 'ALL'): void {
  if (resetType === 'ALL' || resetType === 'RISK_PAUSE') {
    dailyState.consecutiveSlCount = 0;
    if (dailyState.riskStatus === 'RISK_PAUSE') {
      dailyState.riskStatus = 'NORMAL';
      dailyState.riskPauseReason = undefined;
    }
  }
  if (resetType === 'ALL' || resetType === 'DAILY_LOCK') {
    dailyState.slHitsToday = 0;
    dailyState.signalsCreatedToday = 0;
    if (dailyState.riskStatus === 'DAILY_LOCK') {
      dailyState.riskStatus = 'NORMAL';
      dailyState.riskPauseReason = undefined;
    }
  }
  dailyState.lastUpdated = Date.now();
  saveCatalystRiskState();
  console.log(`[CatalystRisk] Manual reset performed (${resetType}). New status: ${dailyState.riskStatus}`);
}

export function updateCatalystRiskConfig(newConfig: Partial<CatalystRiskConfig>): CatalystRiskConfig {
  riskConfig = { ...riskConfig, ...newConfig };
  saveCatalystRiskState();
  return { ...riskConfig };
}

export function getCatalystRiskConfig(): CatalystRiskConfig {
  return { ...riskConfig };
}

export function getCatalystDailyState(): CatalystDailyState {
  checkAndResetDailyMetrics();
  return { ...dailyState };
}

export function getCatalystCompletedTrades(limit = 100): CatalystCompletedTrade[] {
  return completedTrades.slice(0, limit);
}

/**
 * Calculates comprehensive Forward-Validation performance statistics.
 */
export function calculateCatalystPerformanceStats(): CatalystPerformanceStats {
  checkAndResetDailyMetrics();

  const totalSignals = completedTrades.length;
  const resolvedTrades = completedTrades.filter(t => t.finalOutcome === 'TP2_HIT' || t.finalOutcome === 'SL_HIT' || t.finalOutcome === 'TP1_CLOSED');
  const totalCompletedTrades = resolvedTrades.length;

  let tp1Hits = 0;
  let tp2Hits = 0;
  let slHits = 0;
  let missedEntries = 0;
  let expiredSetups = 0;

  let totalTimeToTp1Ms = 0;
  let tp1TimeCount = 0;
  let totalTimeToTp2Ms = 0;
  let tp2TimeCount = 0;
  let totalTimeToSlMs = 0;
  let slTimeCount = 0;

  let totalQualityScore = 0;
  let totalPnlDistance = 0;

  let maxConsecWins = 0;
  let maxConsecLosses = 0;
  let currentStreakWins = 0;
  let currentStreakLosses = 0;

  for (const t of completedTrades) {
    if (t.tp1Hit) tp1Hits += 1;
    if (t.finalOutcome === 'TP2_HIT') tp2Hits += 1;
    if (t.finalOutcome === 'SL_HIT') slHits += 1;
    if (t.finalOutcome === 'MISSED_ENTRY') missedEntries += 1;
    if (t.finalOutcome === 'EXPIRED') expiredSetups += 1;

    if (t.timeToTp1Ms && t.timeToTp1Ms > 0) {
      totalTimeToTp1Ms += t.timeToTp1Ms;
      tp1TimeCount += 1;
    }
    if (t.timeToTp2Ms && t.timeToTp2Ms > 0) {
      totalTimeToTp2Ms += t.timeToTp2Ms;
      tp2TimeCount += 1;
    }
    if (t.timeToSlMs && t.timeToSlMs > 0) {
      totalTimeToSlMs += t.timeToSlMs;
      slTimeCount += 1;
    }

    if (typeof t.qualityScore === 'number') {
      totalQualityScore += t.qualityScore;
    }
    if (typeof t.pnlDistance === 'number') {
      totalPnlDistance += t.pnlDistance;
    }
  }

  // Calculate maximum consecutive streaks from historical records
  for (let i = completedTrades.length - 1; i >= 0; i--) {
    const outcome = completedTrades[i].finalOutcome;
    if (outcome === 'TP2_HIT' || outcome === 'TP1_CLOSED') {
      currentStreakWins += 1;
      currentStreakLosses = 0;
      if (currentStreakWins > maxConsecWins) maxConsecWins = currentStreakWins;
    } else if (outcome === 'SL_HIT') {
      currentStreakLosses += 1;
      currentStreakWins = 0;
      if (currentStreakLosses > maxConsecLosses) maxConsecLosses = currentStreakLosses;
    }
  }

  const winRate = totalCompletedTrades > 0
    ? +(((tp2Hits + (tp1Hits - tp2Hits)) / totalCompletedTrades) * 100).toFixed(1)
    : 0;
  const tp1HitRate = totalCompletedTrades > 0
    ? +((tp1Hits / totalCompletedTrades) * 100).toFixed(1)
    : 0;
  const tp2CompletionRate = totalCompletedTrades > 0
    ? +((tp2Hits / totalCompletedTrades) * 100).toFixed(1)
    : 0;
  const slRate = totalCompletedTrades > 0
    ? +((slHits / totalCompletedTrades) * 100).toFixed(1)
    : 0;

  const averageTimeToTp1Minutes = tp1TimeCount > 0 ? +(totalTimeToTp1Ms / tp1TimeCount / 60000).toFixed(1) : 0;
  const averageTimeToTp2Minutes = tp2TimeCount > 0 ? +(totalTimeToTp2Ms / tp2TimeCount / 60000).toFixed(1) : 0;
  const averageTimeToSlMinutes = slTimeCount > 0 ? +(totalTimeToSlMs / slTimeCount / 60000).toFixed(1) : 0;

  const averageQualityScore = totalSignals > 0 ? +(totalQualityScore / totalSignals).toFixed(1) : 0;
  const averagePnlDistance = totalCompletedTrades > 0 ? +(totalPnlDistance / totalCompletedTrades).toFixed(2) : 0;

  return {
    mode: 'FORWARD_VALIDATION',
    totalSignals,
    totalCompletedTrades,
    tp1Hits,
    tp2Hits,
    slHits,
    missedEntries,
    expiredSetups,
    winRate,
    tp1HitRate,
    tp2CompletionRate,
    slRate,
    averageTimeToTp1Minutes,
    averageTimeToTp2Minutes,
    averageTimeToSlMinutes,
    averageQualityScore,
    averagePnlDistance,
    totalPnlDistance: +totalPnlDistance.toFixed(2),
    maxConsecutiveWins: maxConsecWins,
    maxConsecutiveLosses: maxConsecLosses,
    currentConsecutiveLosses: dailyState.consecutiveSlCount,
    currentConsecutiveWins: dailyState.consecutiveWinCount,
    dailyStats: { ...dailyState },
    riskConfig: { ...riskConfig },
    feedHealth: { ...feedHealth }
  };
}

// Initial bootstrap load
loadCatalystRiskState();
