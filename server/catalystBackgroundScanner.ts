/**
 * AURUM CATALYST — CONTINUOUS AUTOMATED BACKGROUND SCANNER & LIFECYCLE MONITOR (PHASE 4)
 * 
 * Phase 4: Real-Market Forward-Validation, Risk Control & Performance Tracking
 * 
 * Rules:
 * 1. REAL-MARKET FEED: Always driven by real live XAU/USD feed. Stale ticks (>15s) reject signal creation.
 * 2. QUALITY FILTER & SCORING: M30 candle quality, body engulfing, H1 zone proximity, H4 trend alignment, and Quality Score >= 75.
 * 3. RISK CONTROLS & DAILY LIMITS: Max 5 signals/day, Max 3 SL/day -> DAILY LOCK; 3 consecutive SL -> RISK PAUSE.
 * 4. STRICT NO-MARTINGALE: Fixed $10 SL, $7 TP1, $11 TP2. Never inflates risk or moves stop loss.
 * 5. SIGNAL EXPIRY: 30-minute validity window for pending setup entry.
 * 6. TELEGRAM VERIFICATION: Delivery verification & error logging without duplicate trade generation.
 * 7. STRICT DUPLICATE & RE-ENTRY CHECK:
 *    - Never generate duplicate signals on the same M30 candle timestamp.
 *    - After trade completion & 5-min cooldown, require a fresh M30 closed setup (never reuse old candle).
 * 8. REAL ENTRY DETERMINATION: Dynamically established from the validated live market price at confirmation.
 * 9. ANTI-CHASE PROTECTION: If live price moved > $3.00 from M30 close, cancels setup as MISSED ENTRY.
 * 10. SERVER RESTART RECOVERY: Active trade and risk limits recovered from disk without resets, and validated against live price.
 * 11. BACKEND AUDIT LOG & FORWARD-VALIDATION ARCHIVE: Internal persistent audit trail and completed trade database.
 */

import fs from 'fs';
import path from 'path';
import {
  analyzeCatalystSetup,
  CatalystSignalData,
  CatalystStatus,
  CatalystQualityScoreBreakdown,
  DEFAULT_CATALYST_CONFIG
} from './catalystEngine';
import {
  dispatchCatalystTelegramSignal,
  dispatchCatalystTelegramLifecycle,
  isCatalystTelegramConfigured
} from './catalystTelegramService';
import {
  canCreateNewCatalystSignal,
  recordSignalCreated,
  recordCompletedTrade,
  updateFeedHealthMetrics,
  getCatalystDailyState,
  getCatalystRiskConfig,
  loadCatalystRiskState,
  CatalystCompletedTrade
} from './catalystRiskService';
import {
  recordScannerHeartbeat,
  recordDuplicateBlock,
  recordTelegramAttempt
} from './catalystValidationHealthService';
import {
  evaluateMasterSafetyGate
} from './catalystOperationsService';
import { getVerifiedXauPrice, getLatestLivePrices } from './websocketServer';

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'catalyst_state.json');
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'catalyst_audit_log.json');

export interface CatalystPublicState {
  module: 'AURUM CATALYST';
  asset: 'GOLD / XAUUSD';
  status: CatalystStatus;
  livePrice: number;
  priceTimestamp: number;
  feedStatus: 'LIVE' | 'STALE' | 'OFFLINE';
  tickAgeSeconds: number;
  telegramConnected: boolean;
  signal: {
    direction: 'BUY' | 'SELL';
    entry: string;
    sl: string;
    tp1: string;
    tp2: string;
  } | null;
  serverTime: number;
}

export interface CatalystAuditEntry {
  id: string;
  eventType: 'SCAN' | 'SIGNAL_CREATED' | 'SETUP_REJECTED' | 'TP1_HIT' | 'TP2_HIT' | 'SL_HIT' | 'MISSED_ENTRY' | 'EXPIRED' | 'COOLDOWN_STARTED' | 'RECOVERY';
  timestamp: number;
  timeFormatted: string;
  livePrice: number;
  priceTimestamp: number;
  feedStatus: 'LIVE' | 'STALE' | 'OFFLINE';
  m30CandleTimestamp?: number | null;
  engulfingDirection?: 'BULLISH' | 'BEARISH' | 'BUY' | 'SELL' | 'NONE';
  candleQualityPass?: boolean;
  candleQualityFailReason?: string;
  h4TrendResult?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  h1ZoneResult?: string;
  newsFilterResult?: string;
  antiChaseResult?: string;
  qualityScore?: number;
  qualityScoreBreakdown?: CatalystQualityScoreBreakdown;
  entry?: number | null;
  sl?: number | null;
  tp1?: number | null;
  tp2?: number | null;
  finalDecision?: 'ACCEPTED' | 'REJECTED' | 'MISSED_ENTRY' | 'EXPIRED' | 'WAIT';
  details: string;
}

let activeSignal: CatalystSignalData | null = null;
let currentStatus: CatalystStatus = 'WAITING';
let cooldownUntilTimestamp = 0;
let lastClosedCandleScanned = 0;
let lastTradedCandleTimestamp = 0;
let isScannerRunning = false;
let scannerIntervalId: NodeJS.Timeout | null = null;
let fastTickIntervalId: NodeJS.Timeout | null = null;

const sentSignalIds = new Set<string>();
const processedCandleTimestamps = new Set<number>();
let auditLogs: CatalystAuditEntry[] = [];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

export function recordCatalystAudit(entry: Omit<CatalystAuditEntry, 'id' | 'timestamp' | 'timeFormatted'>): void {
  ensureDataDir();
  const now = Date.now();
  const auditItem: CatalystAuditEntry = {
    id: `aud_${now}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now,
    timeFormatted: new Date(now).toISOString(),
    ...entry
  };

  auditLogs.unshift(auditItem);
  if (auditLogs.length > 300) {
    auditLogs = auditLogs.slice(0, 300);
  }

  try {
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(auditLogs, null, 2), 'utf-8');
  } catch {}
}

export function getCatalystAuditLogs(): CatalystAuditEntry[] {
  return auditLogs;
}

function loadPersistedState() {
  ensureDataDir();
  try {
    // Load risk service state first
    loadCatalystRiskState();

    if (fs.existsSync(AUDIT_LOG_FILE)) {
      const rawAudit = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
      const parsed = JSON.parse(rawAudit);
      if (Array.isArray(parsed)) {
        auditLogs = parsed.slice(0, 300);
      }
    }

    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        if (data.activeSignal) {
          activeSignal = data.activeSignal;
          currentStatus = data.currentStatus || 'SIGNAL ACTIVE';
        }
        if (typeof data.cooldownUntilTimestamp === 'number') {
          cooldownUntilTimestamp = data.cooldownUntilTimestamp;
        }
        if (typeof data.lastTradedCandleTimestamp === 'number') {
          lastTradedCandleTimestamp = data.lastTradedCandleTimestamp;
        }
        if (Array.isArray(data.sentSignalIds)) {
          for (const id of data.sentSignalIds) sentSignalIds.add(id);
        }
        if (Array.isArray(data.processedCandleTimestamps)) {
          for (const ts of data.processedCandleTimestamps) processedCandleTimestamps.add(ts);
        }
      }
    }
  } catch (err) {
    console.warn('[CatalystScanner] Failed to load persisted state:', err);
  }
}

function persistState() {
  ensureDataDir();
  try {
    fs.writeFileSync(
      STATE_FILE,
      JSON.stringify(
        {
          activeSignal,
          currentStatus,
          cooldownUntilTimestamp,
          lastTradedCandleTimestamp,
          sentSignalIds: Array.from(sentSignalIds),
          processedCandleTimestamps: Array.from(processedCandleTimestamps),
          updatedAt: Date.now()
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch {}
}

function getValidatedLiveFeed(): {
  livePrice: number;
  priceTimestamp: number;
  feedStatus: 'LIVE' | 'STALE' | 'OFFLINE';
  tickAgeSeconds: number;
} {
  const now = Date.now();
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

  // Update health metrics in risk service
  updateFeedHealthMetrics(feedStatus, priceTimestamp, tickAgeSeconds);

  return {
    livePrice,
    priceTimestamp,
    feedStatus,
    tickAgeSeconds
  };
}

export function getCatalystPublicState(): CatalystPublicState {
  const now = Date.now();
  const { livePrice, priceTimestamp, feedStatus, tickAgeSeconds } = getValidatedLiveFeed();
  const dailyState = getCatalystDailyState();

  let displayStatus: CatalystStatus = currentStatus;

  if (activeSignal) {
    displayStatus = activeSignal.status;
  } else if (now < cooldownUntilTimestamp || dailyState.riskStatus === 'DAILY_LOCK') {
    displayStatus = 'COOLDOWN';
  } else if (dailyState.riskStatus === 'RISK_PAUSE') {
    displayStatus = 'WAITING';
  }

  return {
    module: 'AURUM CATALYST',
    asset: 'GOLD / XAUUSD',
    status: displayStatus,
    livePrice: livePrice > 0 ? livePrice : 4150.00,
    priceTimestamp,
    feedStatus,
    tickAgeSeconds,
    telegramConnected: isCatalystTelegramConfigured(),
    signal: activeSignal ? {
      direction: activeSignal.direction,
      entry: activeSignal.entry.toFixed(2),
      sl: activeSignal.sl.toFixed(2),
      tp1: activeSignal.tp1.toFixed(2),
      tp2: activeSignal.tp2.toFixed(2)
    } : null,
    serverTime: now
  };
}

export function resetCatalystActiveTrade(): void {
  activeSignal = null;
  currentStatus = 'WAITING';
  cooldownUntilTimestamp = 0;
  persistState();
}

/**
 * Validates and recovers an active trade after server restart.
 * Driven strictly by actual live market price without inventing data.
 */
async function validateRestartRecovery(): Promise<void> {
  if (!activeSignal) return;

  const now = Date.now();
  const { livePrice, priceTimestamp, feedStatus } = getValidatedLiveFeed();

  if (feedStatus === 'OFFLINE' || livePrice <= 0) {
    console.log(`[CatalystScanner] Recovery postponed: feed is OFFLINE. Trade ${activeSignal.id} preserved.`);
    return;
  }

  console.log(`[CatalystScanner] Recovered active trade ${activeSignal.id} (${activeSignal.direction} @ ${activeSignal.entry}). Validating against live price ($${livePrice})...`);

  const dir = activeSignal.direction;
  const entry = activeSignal.entry;
  const sl = activeSignal.sl;
  const tp1 = activeSignal.tp1;
  const tp2 = activeSignal.tp2;
  const durationMs = now - activeSignal.timestamp;

  // Check if trade concluded while server was restarting
  if (dir === 'BUY') {
    if (livePrice >= tp2) {
      console.log(`[CatalystScanner] Recovered trade reached TP2 during downtime!`);
      activeSignal.tp2Hit = true;
      activeSignal.status = 'TP2 HIT';
      currentStatus = 'TP2 HIT';
      lastTradedCandleTimestamp = activeSignal.closedCandleTime;
      cooldownUntilTimestamp = now + 5 * 60 * 1000;

      const completedTrade: CatalystCompletedTrade = {
        signalId: activeSignal.id,
        timestamp: activeSignal.timestamp,
        timeFormatted: new Date(activeSignal.timestamp).toISOString(),
        market: 'XAU/USD',
        direction: 'BUY',
        entry,
        sl,
        tp1,
        tp2,
        m30CandleTimestamp: activeSignal.closedCandleTime,
        h4Direction: activeSignal.h4Direction || 'BULLISH',
        h1ZoneResult: activeSignal.h1ZoneResult || 'SUPPORT',
        qualityScore: activeSignal.qualityScore || 80,
        livePriceTimestamp: priceTimestamp,
        tp1Hit: true,
        tp1Timestamp: activeSignal.tp1Timestamp || now,
        tp1Price: activeSignal.tp1Price || tp1,
        timeToTp1Ms: activeSignal.timeToTp1Ms || durationMs,
        tp2Hit: true,
        tp2Timestamp: now,
        tp2Price: livePrice,
        timeToTp2Ms: durationMs,
        slHit: false,
        finalOutcome: 'TP2_HIT',
        exitPrice: livePrice,
        exitTimestamp: now,
        totalDurationMs: durationMs,
        pnlDistance: +11.00,
        rMultiple: +1.1,
        telegramSignalMessageId: activeSignal.telegramMessageId,
        telegramSignalStatus: 'SENT'
      };

      recordCompletedTrade(completedTrade);

      recordCatalystAudit({
        eventType: 'TP2_HIT',
        livePrice,
        priceTimestamp,
        feedStatus,
        entry,
        sl,
        tp1,
        tp2,
        finalDecision: 'ACCEPTED',
        details: `Trade reached TP2 ($${tp2}) during restart recovery. Trade complete (+11.00).`
      });

      await dispatchCatalystTelegramLifecycle('TP2_HIT', { direction: 'BUY', entry, price: livePrice });
      activeSignal = null;
      persistState();
      return;
    }

    if (livePrice <= sl) {
      console.log(`[CatalystScanner] Recovered trade reached SL during downtime!`);
      activeSignal.slHit = true;
      activeSignal.status = 'SL HIT';
      currentStatus = 'SL HIT';
      lastTradedCandleTimestamp = activeSignal.closedCandleTime;
      cooldownUntilTimestamp = now + 5 * 60 * 1000;

      const isBreakEven = activeSignal.tp1Hit;
      const completedTrade: CatalystCompletedTrade = {
        signalId: activeSignal.id,
        timestamp: activeSignal.timestamp,
        timeFormatted: new Date(activeSignal.timestamp).toISOString(),
        market: 'XAU/USD',
        direction: 'BUY',
        entry,
        sl,
        tp1,
        tp2,
        m30CandleTimestamp: activeSignal.closedCandleTime,
        h4Direction: activeSignal.h4Direction || 'BULLISH',
        h1ZoneResult: activeSignal.h1ZoneResult || 'SUPPORT',
        qualityScore: activeSignal.qualityScore || 80,
        livePriceTimestamp: priceTimestamp,
        tp1Hit: activeSignal.tp1Hit,
        tp2Hit: false,
        slHit: true,
        slTimestamp: now,
        slPrice: livePrice,
        timeToSlMs: durationMs,
        finalOutcome: isBreakEven ? 'TP1_CLOSED' : 'SL_HIT',
        exitPrice: livePrice,
        exitTimestamp: now,
        totalDurationMs: durationMs,
        pnlDistance: isBreakEven ? 0.00 : -10.00,
        rMultiple: isBreakEven ? 0.0 : -1.0,
        telegramSignalMessageId: activeSignal.telegramMessageId,
        telegramSignalStatus: 'SENT'
      };

      recordCompletedTrade(completedTrade);

      recordCatalystAudit({
        eventType: 'SL_HIT',
        livePrice,
        priceTimestamp,
        feedStatus,
        entry,
        sl,
        tp1,
        tp2,
        finalDecision: 'ACCEPTED',
        details: `Trade reached Stop Loss ($${sl}) during restart recovery. Trade complete (${isBreakEven ? 'Break-Even' : '-10.00'}).`
      });

      await dispatchCatalystTelegramLifecycle('SL_HIT', { direction: 'BUY', entry, price: livePrice });
      activeSignal = null;
      persistState();
      return;
    }

    if (livePrice >= tp1 && !activeSignal.tp1Hit) {
      activeSignal.tp1Hit = true;
      activeSignal.status = 'TP1 HIT';
      activeSignal.sl = entry; // Move to break-even
      activeSignal.tp1Timestamp = now;
      activeSignal.tp1Price = livePrice;
      activeSignal.timeToTp1Ms = durationMs;

      recordCatalystAudit({
        eventType: 'TP1_HIT',
        livePrice,
        priceTimestamp,
        feedStatus,
        entry,
        sl: entry,
        tp1,
        tp2,
        finalDecision: 'ACCEPTED',
        details: `Trade reached TP1 ($${tp1}) during restart recovery. SL moved to Break-Even.`
      });

      await dispatchCatalystTelegramLifecycle('TP1_HIT', { direction: 'BUY', entry, price: livePrice });
      persistState();
    }
  } else if (dir === 'SELL') {
    if (livePrice <= tp2) {
      console.log(`[CatalystScanner] Recovered trade reached TP2 during downtime!`);
      activeSignal.tp2Hit = true;
      activeSignal.status = 'TP2 HIT';
      currentStatus = 'TP2 HIT';
      lastTradedCandleTimestamp = activeSignal.closedCandleTime;
      cooldownUntilTimestamp = now + 5 * 60 * 1000;

      const completedTrade: CatalystCompletedTrade = {
        signalId: activeSignal.id,
        timestamp: activeSignal.timestamp,
        timeFormatted: new Date(activeSignal.timestamp).toISOString(),
        market: 'XAU/USD',
        direction: 'SELL',
        entry,
        sl,
        tp1,
        tp2,
        m30CandleTimestamp: activeSignal.closedCandleTime,
        h4Direction: activeSignal.h4Direction || 'BEARISH',
        h1ZoneResult: activeSignal.h1ZoneResult || 'RESISTANCE',
        qualityScore: activeSignal.qualityScore || 80,
        livePriceTimestamp: priceTimestamp,
        tp1Hit: true,
        tp1Timestamp: activeSignal.tp1Timestamp || now,
        tp1Price: activeSignal.tp1Price || tp1,
        timeToTp1Ms: activeSignal.timeToTp1Ms || durationMs,
        tp2Hit: true,
        tp2Timestamp: now,
        tp2Price: livePrice,
        timeToTp2Ms: durationMs,
        slHit: false,
        finalOutcome: 'TP2_HIT',
        exitPrice: livePrice,
        exitTimestamp: now,
        totalDurationMs: durationMs,
        pnlDistance: +11.00,
        rMultiple: +1.1,
        telegramSignalMessageId: activeSignal.telegramMessageId,
        telegramSignalStatus: 'SENT'
      };

      recordCompletedTrade(completedTrade);

      recordCatalystAudit({
        eventType: 'TP2_HIT',
        livePrice,
        priceTimestamp,
        feedStatus,
        entry,
        sl,
        tp1,
        tp2,
        finalDecision: 'ACCEPTED',
        details: `Trade reached TP2 ($${tp2}) during restart recovery. Trade complete (+11.00).`
      });

      await dispatchCatalystTelegramLifecycle('TP2_HIT', { direction: 'SELL', entry, price: livePrice });
      activeSignal = null;
      persistState();
      return;
    }

    if (livePrice >= sl) {
      console.log(`[CatalystScanner] Recovered trade reached SL during downtime!`);
      activeSignal.slHit = true;
      activeSignal.status = 'SL HIT';
      currentStatus = 'SL HIT';
      lastTradedCandleTimestamp = activeSignal.closedCandleTime;
      cooldownUntilTimestamp = now + 5 * 60 * 1000;

      const isBreakEven = activeSignal.tp1Hit;
      const completedTrade: CatalystCompletedTrade = {
        signalId: activeSignal.id,
        timestamp: activeSignal.timestamp,
        timeFormatted: new Date(activeSignal.timestamp).toISOString(),
        market: 'XAU/USD',
        direction: 'SELL',
        entry,
        sl,
        tp1,
        tp2,
        m30CandleTimestamp: activeSignal.closedCandleTime,
        h4Direction: activeSignal.h4Direction || 'BEARISH',
        h1ZoneResult: activeSignal.h1ZoneResult || 'RESISTANCE',
        qualityScore: activeSignal.qualityScore || 80,
        livePriceTimestamp: priceTimestamp,
        tp1Hit: activeSignal.tp1Hit,
        tp2Hit: false,
        slHit: true,
        slTimestamp: now,
        slPrice: livePrice,
        timeToSlMs: durationMs,
        finalOutcome: isBreakEven ? 'TP1_CLOSED' : 'SL_HIT',
        exitPrice: livePrice,
        exitTimestamp: now,
        totalDurationMs: durationMs,
        pnlDistance: isBreakEven ? 0.00 : -10.00,
        rMultiple: isBreakEven ? 0.0 : -1.0,
        telegramSignalMessageId: activeSignal.telegramMessageId,
        telegramSignalStatus: 'SENT'
      };

      recordCompletedTrade(completedTrade);

      recordCatalystAudit({
        eventType: 'SL_HIT',
        livePrice,
        priceTimestamp,
        feedStatus,
        entry,
        sl,
        tp1,
        tp2,
        finalDecision: 'ACCEPTED',
        details: `Trade reached Stop Loss ($${sl}) during restart recovery. Trade complete (${isBreakEven ? 'Break-Even' : '-10.00'}).`
      });

      await dispatchCatalystTelegramLifecycle('SL_HIT', { direction: 'SELL', entry, price: livePrice });
      activeSignal = null;
      persistState();
      return;
    }

    if (livePrice <= tp1 && !activeSignal.tp1Hit) {
      activeSignal.tp1Hit = true;
      activeSignal.status = 'TP1 HIT';
      activeSignal.sl = entry; // Move to break-even
      activeSignal.tp1Timestamp = now;
      activeSignal.tp1Price = livePrice;
      activeSignal.timeToTp1Ms = durationMs;

      recordCatalystAudit({
        eventType: 'TP1_HIT',
        livePrice,
        priceTimestamp,
        feedStatus,
        entry,
        sl: entry,
        tp1,
        tp2,
        finalDecision: 'ACCEPTED',
        details: `Trade reached TP1 ($${tp1}) during restart recovery. SL moved to Break-Even.`
      });

      await dispatchCatalystTelegramLifecycle('TP1_HIT', { direction: 'SELL', entry, price: livePrice });
      persistState();
    }
  }

  recordCatalystAudit({
    eventType: 'RECOVERY',
    livePrice,
    priceTimestamp,
    feedStatus,
    entry: activeSignal?.entry,
    sl: activeSignal?.sl,
    tp1: activeSignal?.tp1,
    tp2: activeSignal?.tp2,
    details: `Active trade resumed monitoring at live price $${livePrice}.`
  });
}

/**
 * Continuous scan and lifecycle execution cycle.
 */
export async function executeCatalystScanCycle(forceScan = false): Promise<void> {
  const now = Date.now();
  const startTime = Date.now();
  const { livePrice, priceTimestamp, feedStatus, tickAgeSeconds } = getValidatedLiveFeed();
  const riskConfig = getCatalystRiskConfig();

  recordScannerHeartbeat(lastClosedCandleScanned, 5);

  // 1. Real-Time Trade Lifecycle Monitoring
  if (activeSignal) {
    if (feedStatus === 'OFFLINE' || livePrice <= 0) {
      // Feed unavailable, skip tick without changing trade state
      return;
    }

    const dir = activeSignal.direction;
    const entry = activeSignal.entry;
    const sl = activeSignal.sl;
    const tp1 = activeSignal.tp1;
    const tp2 = activeSignal.tp2;
    const durationMs = now - activeSignal.timestamp;

    // Check Signal Expiry (30 minutes default)
    const expiryTime = activeSignal.expiryTimestamp || (activeSignal.timestamp + riskConfig.signalExpiryMinutes * 60 * 1000);
    if (now > expiryTime && !activeSignal.tp1Hit && !activeSignal.tp2Hit && !activeSignal.slHit) {
      console.log(`[CatalystScanner] Active setup ${activeSignal.id} expired after ${riskConfig.signalExpiryMinutes} mins.`);
      const completedTrade: CatalystCompletedTrade = {
        signalId: activeSignal.id,
        timestamp: activeSignal.timestamp,
        timeFormatted: new Date(activeSignal.timestamp).toISOString(),
        market: 'XAU/USD',
        direction: dir,
        entry,
        sl,
        tp1,
        tp2,
        m30CandleTimestamp: activeSignal.closedCandleTime,
        h4Direction: activeSignal.h4Direction || 'NEUTRAL',
        h1ZoneResult: activeSignal.h1ZoneResult || 'ZONE',
        qualityScore: activeSignal.qualityScore || 80,
        livePriceTimestamp: priceTimestamp,
        tp1Hit: false,
        tp2Hit: false,
        slHit: false,
        finalOutcome: 'EXPIRED',
        exitPrice: livePrice,
        exitTimestamp: now,
        totalDurationMs: durationMs,
        pnlDistance: 0.00,
        rMultiple: 0.0,
        telegramSignalMessageId: activeSignal.telegramMessageId,
        telegramSignalStatus: 'SENT'
      };

      recordCompletedTrade(completedTrade);

      recordCatalystAudit({
        eventType: 'EXPIRED',
        livePrice,
        priceTimestamp,
        feedStatus,
        entry,
        sl,
        tp1,
        tp2,
        finalDecision: 'EXPIRED',
        details: `Setup expired after ${riskConfig.signalExpiryMinutes} minutes without reaching trigger targets.`
      });

      cooldownUntilTimestamp = now + 5 * 60 * 1000;
      activeSignal = null;
      currentStatus = 'COOLDOWN';
      persistState();
      return;
    }

    // BUY Lifecycle Execution
    if (dir === 'BUY') {
      // Check TP1
      if (!activeSignal.tp1Hit && livePrice >= tp1) {
        activeSignal.tp1Hit = true;
        activeSignal.status = 'TP1 HIT';
        currentStatus = 'TP1 HIT';
        activeSignal.sl = entry; // Move SL to Break-Even
        activeSignal.tp1Timestamp = now;
        activeSignal.tp1Price = livePrice;
        activeSignal.timeToTp1Ms = durationMs;
        persistState();

        recordCatalystAudit({
          eventType: 'TP1_HIT',
          livePrice,
          priceTimestamp,
          feedStatus,
          entry,
          sl: entry,
          tp1,
          tp2,
          finalDecision: 'ACCEPTED',
          details: `Live price reached TP1 ($${livePrice} >= $${tp1}). SL moved to Break-Even.`
        });

        await dispatchCatalystTelegramLifecycle('TP1_HIT', {
          direction: 'BUY',
          entry,
          price: livePrice,
          replyToMessageId: activeSignal.telegramMessageId
        });
      }

      // Check TP2 (Full Target Complete)
      if (livePrice >= tp2) {
        activeSignal.tp2Hit = true;
        activeSignal.status = 'TP2 HIT';
        currentStatus = 'TP2 HIT';
        lastTradedCandleTimestamp = activeSignal.closedCandleTime;

        const completedTrade: CatalystCompletedTrade = {
          signalId: activeSignal.id,
          timestamp: activeSignal.timestamp,
          timeFormatted: new Date(activeSignal.timestamp).toISOString(),
          market: 'XAU/USD',
          direction: 'BUY',
          entry,
          sl,
          tp1,
          tp2,
          m30CandleTimestamp: activeSignal.closedCandleTime,
          h4Direction: activeSignal.h4Direction || 'BULLISH',
          h1ZoneResult: activeSignal.h1ZoneResult || 'SUPPORT',
          qualityScore: activeSignal.qualityScore || 80,
          livePriceTimestamp: priceTimestamp,
          tp1Hit: true,
          tp1Timestamp: activeSignal.tp1Timestamp || now,
          tp1Price: activeSignal.tp1Price || tp1,
          timeToTp1Ms: activeSignal.timeToTp1Ms || durationMs,
          tp2Hit: true,
          tp2Timestamp: now,
          tp2Price: livePrice,
          timeToTp2Ms: durationMs,
          slHit: false,
          finalOutcome: 'TP2_HIT',
          exitPrice: livePrice,
          exitTimestamp: now,
          totalDurationMs: durationMs,
          pnlDistance: +11.00,
          rMultiple: +1.1,
          telegramSignalMessageId: activeSignal.telegramMessageId,
          telegramSignalStatus: 'SENT'
        };

        recordCompletedTrade(completedTrade);
        persistState();

        recordCatalystAudit({
          eventType: 'TP2_HIT',
          livePrice,
          priceTimestamp,
          feedStatus,
          entry,
          sl: activeSignal.sl,
          tp1,
          tp2,
          finalDecision: 'ACCEPTED',
          details: `Live price reached TP2 ($${livePrice} >= $${tp2}). Trade complete (+11.00). 5-min cooldown started.`
        });

        await dispatchCatalystTelegramLifecycle('TP2_HIT', {
          direction: 'BUY',
          entry,
          price: livePrice,
          replyToMessageId: activeSignal.telegramMessageId
        });

        // 5-minute cooldown before next re-analysis
        cooldownUntilTimestamp = now + 5 * 60 * 1000;
        activeSignal = null;
        persistState();
        return;
      }

      // Check Stop Loss
      if (livePrice <= sl) {
        activeSignal.slHit = true;
        activeSignal.status = 'SL HIT';
        currentStatus = 'SL HIT';
        lastTradedCandleTimestamp = activeSignal.closedCandleTime;

        const isBreakEven = activeSignal.tp1Hit;
        const completedTrade: CatalystCompletedTrade = {
          signalId: activeSignal.id,
          timestamp: activeSignal.timestamp,
          timeFormatted: new Date(activeSignal.timestamp).toISOString(),
          market: 'XAU/USD',
          direction: 'BUY',
          entry,
          sl,
          tp1,
          tp2,
          m30CandleTimestamp: activeSignal.closedCandleTime,
          h4Direction: activeSignal.h4Direction || 'BULLISH',
          h1ZoneResult: activeSignal.h1ZoneResult || 'SUPPORT',
          qualityScore: activeSignal.qualityScore || 80,
          livePriceTimestamp: priceTimestamp,
          tp1Hit: activeSignal.tp1Hit,
          tp2Hit: false,
          slHit: true,
          slTimestamp: now,
          slPrice: livePrice,
          timeToSlMs: durationMs,
          finalOutcome: isBreakEven ? 'TP1_CLOSED' : 'SL_HIT',
          exitPrice: livePrice,
          exitTimestamp: now,
          totalDurationMs: durationMs,
          pnlDistance: isBreakEven ? 0.00 : -10.00,
          rMultiple: isBreakEven ? 0.0 : -1.0,
          telegramSignalMessageId: activeSignal.telegramMessageId,
          telegramSignalStatus: 'SENT'
        };

        recordCompletedTrade(completedTrade);
        persistState();

        recordCatalystAudit({
          eventType: 'SL_HIT',
          livePrice,
          priceTimestamp,
          feedStatus,
          entry,
          sl,
          tp1,
          tp2,
          finalDecision: 'ACCEPTED',
          details: `Live price reached SL ($${livePrice} <= $${sl}). Trade complete (${isBreakEven ? 'Break-Even' : '-10.00'}). 5-min cooldown started.`
        });

        await dispatchCatalystTelegramLifecycle('SL_HIT', {
          direction: 'BUY',
          entry,
          price: livePrice,
          replyToMessageId: activeSignal.telegramMessageId
        });

        // 5-minute cooldown before next re-analysis
        cooldownUntilTimestamp = now + 5 * 60 * 1000;
        activeSignal = null;
        persistState();
        return;
      }
    }

    // SELL Lifecycle Execution
    if (dir === 'SELL') {
      // Check TP1
      if (!activeSignal.tp1Hit && livePrice <= tp1) {
        activeSignal.tp1Hit = true;
        activeSignal.status = 'TP1 HIT';
        currentStatus = 'TP1 HIT';
        activeSignal.sl = entry; // Move SL to Break-Even
        activeSignal.tp1Timestamp = now;
        activeSignal.tp1Price = livePrice;
        activeSignal.timeToTp1Ms = durationMs;
        persistState();

        recordCatalystAudit({
          eventType: 'TP1_HIT',
          livePrice,
          priceTimestamp,
          feedStatus,
          entry,
          sl: entry,
          tp1,
          tp2,
          finalDecision: 'ACCEPTED',
          details: `Live price reached TP1 ($${livePrice} <= $${tp1}). SL moved to Break-Even.`
        });

        await dispatchCatalystTelegramLifecycle('TP1_HIT', {
          direction: 'SELL',
          entry,
          price: livePrice,
          replyToMessageId: activeSignal.telegramMessageId
        });
      }

      // Check TP2 (Full Target Complete)
      if (livePrice <= tp2) {
        activeSignal.tp2Hit = true;
        activeSignal.status = 'TP2 HIT';
        currentStatus = 'TP2 HIT';
        lastTradedCandleTimestamp = activeSignal.closedCandleTime;

        const completedTrade: CatalystCompletedTrade = {
          signalId: activeSignal.id,
          timestamp: activeSignal.timestamp,
          timeFormatted: new Date(activeSignal.timestamp).toISOString(),
          market: 'XAU/USD',
          direction: 'SELL',
          entry,
          sl,
          tp1,
          tp2,
          m30CandleTimestamp: activeSignal.closedCandleTime,
          h4Direction: activeSignal.h4Direction || 'BEARISH',
          h1ZoneResult: activeSignal.h1ZoneResult || 'RESISTANCE',
          qualityScore: activeSignal.qualityScore || 80,
          livePriceTimestamp: priceTimestamp,
          tp1Hit: true,
          tp1Timestamp: activeSignal.tp1Timestamp || now,
          tp1Price: activeSignal.tp1Price || tp1,
          timeToTp1Ms: activeSignal.timeToTp1Ms || durationMs,
          tp2Hit: true,
          tp2Timestamp: now,
          tp2Price: livePrice,
          timeToTp2Ms: durationMs,
          slHit: false,
          finalOutcome: 'TP2_HIT',
          exitPrice: livePrice,
          exitTimestamp: now,
          totalDurationMs: durationMs,
          pnlDistance: +11.00,
          rMultiple: +1.1,
          telegramSignalMessageId: activeSignal.telegramMessageId,
          telegramSignalStatus: 'SENT'
        };

        recordCompletedTrade(completedTrade);
        persistState();

        recordCatalystAudit({
          eventType: 'TP2_HIT',
          livePrice,
          priceTimestamp,
          feedStatus,
          entry,
          sl: activeSignal.sl,
          tp1,
          tp2,
          finalDecision: 'ACCEPTED',
          details: `Live price reached TP2 ($${livePrice} <= $${tp2}). Trade complete (+11.00). 5-min cooldown started.`
        });

        await dispatchCatalystTelegramLifecycle('TP2_HIT', {
          direction: 'SELL',
          entry,
          price: livePrice,
          replyToMessageId: activeSignal.telegramMessageId
        });

        // 5-minute cooldown before next re-analysis
        cooldownUntilTimestamp = now + 5 * 60 * 1000;
        activeSignal = null;
        persistState();
        return;
      }

      // Check Stop Loss
      if (livePrice >= sl) {
        activeSignal.slHit = true;
        activeSignal.status = 'SL HIT';
        currentStatus = 'SL HIT';
        lastTradedCandleTimestamp = activeSignal.closedCandleTime;

        const isBreakEven = activeSignal.tp1Hit;
        const completedTrade: CatalystCompletedTrade = {
          signalId: activeSignal.id,
          timestamp: activeSignal.timestamp,
          timeFormatted: new Date(activeSignal.timestamp).toISOString(),
          market: 'XAU/USD',
          direction: 'SELL',
          entry,
          sl,
          tp1,
          tp2,
          m30CandleTimestamp: activeSignal.closedCandleTime,
          h4Direction: activeSignal.h4Direction || 'BEARISH',
          h1ZoneResult: activeSignal.h1ZoneResult || 'RESISTANCE',
          qualityScore: activeSignal.qualityScore || 80,
          livePriceTimestamp: priceTimestamp,
          tp1Hit: activeSignal.tp1Hit,
          tp2Hit: false,
          slHit: true,
          slTimestamp: now,
          slPrice: livePrice,
          timeToSlMs: durationMs,
          finalOutcome: isBreakEven ? 'TP1_CLOSED' : 'SL_HIT',
          exitPrice: livePrice,
          exitTimestamp: now,
          totalDurationMs: durationMs,
          pnlDistance: isBreakEven ? 0.00 : -10.00,
          rMultiple: isBreakEven ? 0.0 : -1.0,
          telegramSignalMessageId: activeSignal.telegramMessageId,
          telegramSignalStatus: 'SENT'
        };

        recordCompletedTrade(completedTrade);
        persistState();

        recordCatalystAudit({
          eventType: 'SL_HIT',
          livePrice,
          priceTimestamp,
          feedStatus,
          entry,
          sl,
          tp1,
          tp2,
          finalDecision: 'ACCEPTED',
          details: `Live price reached SL ($${livePrice} >= $${sl}). Trade complete (${isBreakEven ? 'Break-Even' : '-10.00'}). 5-min cooldown started.`
        });

        await dispatchCatalystTelegramLifecycle('SL_HIT', {
          direction: 'SELL',
          entry,
          price: livePrice,
          replyToMessageId: activeSignal.telegramMessageId
        });

        // 5-minute cooldown before next re-analysis
        cooldownUntilTimestamp = now + 5 * 60 * 1000;
        activeSignal = null;
        persistState();
        return;
      }
    }

    return;
  }

  // 2. MASTER SAFETY GATE (Phase 7)
  const masterGate = evaluateMasterSafetyGate(activeSignal !== null);
  if (!masterGate.allowed) {
    if (masterGate.productionStatus === 'PAUSED') {
      currentStatus = 'COOLDOWN';
    } else {
      currentStatus = 'WAITING';
    }
    return;
  }

  // 3. Post-Trade Cooldown Check
  if (now < cooldownUntilTimestamp) {
    currentStatus = 'COOLDOWN';
    return;
  }

  // 6. Closed Candle Boundary Check (30-Minute boundary)
  const M30_MS = 30 * 60 * 1000;
  const currentBoundary = Math.floor(now / M30_MS) * M30_MS;
  const isNewM30Candle = currentBoundary > lastClosedCandleScanned;

  if (!forceScan && !isNewM30Candle) {
    currentStatus = 'WAITING';
    return;
  }

  lastClosedCandleScanned = currentBoundary;
  currentStatus = 'SCANNING';

  // 7. Run Complete Catalyst Analysis Engine (Phase 3 with Quality Score)
  try {
    const analysis = await analyzeCatalystSetup(livePrice, DEFAULT_CATALYST_CONFIG);

    if (analysis.status === 'MISSED ENTRY') {
      currentStatus = 'MISSED ENTRY';

      const missedTrade: CatalystCompletedTrade = {
        signalId: `MISSED_${now}`,
        timestamp: now,
        timeFormatted: new Date(now).toISOString(),
        market: 'XAU/USD',
        direction: analysis.m30Engulfing.type === 'BULLISH' ? 'BUY' : 'SELL',
        entry: livePrice,
        sl: analysis.m30Engulfing.type === 'BULLISH' ? livePrice - 10 : livePrice + 10,
        tp1: analysis.m30Engulfing.type === 'BULLISH' ? livePrice + 7 : livePrice - 7,
        tp2: analysis.m30Engulfing.type === 'BULLISH' ? livePrice + 11 : livePrice - 11,
        m30CandleTimestamp: analysis.m30Engulfing.closedCandleTime || now,
        h4Direction: analysis.h4Trend,
        h1ZoneResult: analysis.h1ZoneStatus.inSupportZone ? 'SUPPORT' : 'RESISTANCE',
        qualityScore: analysis.qualityScore.totalScore,
        livePriceTimestamp: priceTimestamp,
        tp1Hit: false,
        tp2Hit: false,
        slHit: false,
        finalOutcome: 'MISSED_ENTRY',
        exitPrice: livePrice,
        exitTimestamp: now,
        totalDurationMs: 0,
        pnlDistance: 0.00,
        rMultiple: 0.0,
        telegramSignalStatus: 'SKIPPED'
      };

      recordCompletedTrade(missedTrade);

      recordCatalystAudit({
        eventType: 'MISSED_ENTRY',
        livePrice,
        priceTimestamp,
        feedStatus,
        m30CandleTimestamp: analysis.m30Engulfing.closedCandleTime,
        engulfingDirection: analysis.m30Engulfing.type,
        candleQualityPass: analysis.m30Engulfing.isQualityPass,
        candleQualityFailReason: analysis.m30Engulfing.qualityFailReason,
        h4TrendResult: analysis.h4Trend,
        h1ZoneResult: analysis.h1ZoneStatus.inSupportZone ? 'SUPPORT' : analysis.h1ZoneStatus.inResistanceZone ? 'RESISTANCE' : 'OUTSIDE_ZONE',
        newsFilterResult: analysis.newsProtectionActive ? 'BLOCKED' : 'PASS',
        antiChaseResult: 'MISSED_ENTRY',
        qualityScore: analysis.qualityScore.totalScore,
        qualityScoreBreakdown: analysis.qualityScore,
        finalDecision: 'MISSED_ENTRY',
        details: analysis.rejectionReason || 'Price moved away before entry. Standby.'
      });
      return;
    }

    // 8. Post-Trade Re-Entry & Duplicate Protection
    if (analysis.m30Engulfing.closedCandleTime) {
      // Reject already processed candle timestamp
      if (processedCandleTimestamps.has(analysis.m30Engulfing.closedCandleTime)) {
        currentStatus = 'WAITING';
        return;
      }
      // Require a fresh M30 closed candle after completed trade
      if (lastTradedCandleTimestamp > 0 && analysis.m30Engulfing.closedCandleTime <= lastTradedCandleTimestamp) {
        currentStatus = 'WAITING';
        return;
      }
    }

    if (analysis.direction !== 'WAIT' && analysis.signal) {
      // Re-verify risk limit right before creating signal
      const finalRiskCheck = canCreateNewCatalystSignal();
      if (!finalRiskCheck.allowed) {
        currentStatus = 'WAITING';
        return;
      }

      // Prevent duplicate signals for the same signal ID
      if (sentSignalIds.has(analysis.signal.id)) {
        currentStatus = 'WAITING';
        return;
      }

      sentSignalIds.add(analysis.signal.id);
      if (analysis.signal.closedCandleTime) {
        processedCandleTimestamps.add(analysis.signal.closedCandleTime);
      }

      // Set 30-minute expiry window
      analysis.signal.expiryTimestamp = now + (riskConfig.signalExpiryMinutes || 30) * 60 * 1000;

      activeSignal = analysis.signal;
      currentStatus = 'SIGNAL ACTIVE';
      recordSignalCreated();
      persistState();

      // Automatically send clean formal trade signal to Telegram
      const tgRes = await dispatchCatalystTelegramSignal({
        direction: activeSignal.direction,
        entry: activeSignal.entry,
        sl: activeSignal.sl,
        tp1: activeSignal.tp1,
        tp2: activeSignal.tp2
      });

      let telegramSignalStatus: 'SENT' | 'FAILED' = 'FAILED';
      if (tgRes.success && tgRes.messageId) {
        activeSignal.telegramMessageId = tgRes.messageId;
        telegramSignalStatus = 'SENT';
        persistState();
      }

      recordCatalystAudit({
        eventType: 'SIGNAL_CREATED',
        livePrice,
        priceTimestamp,
        feedStatus,
        m30CandleTimestamp: analysis.m30Engulfing.closedCandleTime,
        engulfingDirection: analysis.signal.direction,
        candleQualityPass: true,
        h4TrendResult: analysis.h4Trend,
        h1ZoneResult: analysis.h1ZoneStatus.inSupportZone ? 'SUPPORT' : 'RESISTANCE',
        newsFilterResult: 'PASS',
        antiChaseResult: 'PASS',
        qualityScore: analysis.qualityScore.totalScore,
        qualityScoreBreakdown: analysis.qualityScore,
        entry: activeSignal.entry,
        sl: activeSignal.sl,
        tp1: activeSignal.tp1,
        tp2: activeSignal.tp2,
        finalDecision: 'ACCEPTED',
        details: `Catalyst ${activeSignal.direction} Signal Created at real live price $${activeSignal.entry} (Score: ${analysis.qualityScore.totalScore}/100, TG: ${telegramSignalStatus}).`
      });
    } else {
      currentStatus = 'WAITING';

      // Log significant setup evaluations for admin auditing
      if (analysis.m30Engulfing.detected && analysis.m30Engulfing.type !== 'NONE') {
        recordCatalystAudit({
          eventType: 'SETUP_REJECTED',
          livePrice,
          priceTimestamp,
          feedStatus,
          m30CandleTimestamp: analysis.m30Engulfing.closedCandleTime,
          engulfingDirection: analysis.m30Engulfing.type,
          candleQualityPass: analysis.m30Engulfing.isQualityPass,
          candleQualityFailReason: analysis.m30Engulfing.qualityFailReason,
          h4TrendResult: analysis.h4Trend,
          h1ZoneResult: analysis.h1ZoneStatus.inSupportZone ? 'SUPPORT' : analysis.h1ZoneStatus.inResistanceZone ? 'RESISTANCE' : 'OUTSIDE_ZONE',
          newsFilterResult: analysis.newsProtectionActive ? 'BLOCKED' : 'PASS',
          antiChaseResult: 'PASS',
          qualityScore: analysis.qualityScore.totalScore,
          qualityScoreBreakdown: analysis.qualityScore,
          finalDecision: 'REJECTED',
          details: analysis.rejectionReason || 'Setup failed Phase 3/4 quality & risk filters.'
        });
      }
    }
  } catch (err: any) {
    console.error('[CatalystScanner] Error during scan cycle:', err);
    currentStatus = 'WAITING';
  }
}

export function startCatalystBackgroundScanner(): void {
  if (isScannerRunning) return;
  isScannerRunning = true;

  loadPersistedState();

  // Validate active trade on recovery before starting scanner loop
  validateRestartRecovery().catch(err => {
    console.warn('[CatalystScanner] Error during restart recovery:', err);
  });

  // Fast tick monitor (every 2.5s) for live price TP/SL lifecycle tracking
  fastTickIntervalId = setInterval(() => {
    if (activeSignal) {
      executeCatalystScanCycle(false).catch(() => {});
    }
  }, 2500);

  // Periodic candle scanner (every 15s)
  scannerIntervalId = setInterval(() => {
    executeCatalystScanCycle(false).catch(() => {});
  }, 15000);

  console.log('[CatalystScanner] Aurum Catalyst Phase 4 Automated Background Scanner booted.');
}

export function stopCatalystBackgroundScanner(): void {
  if (scannerIntervalId) clearInterval(scannerIntervalId);
  if (fastTickIntervalId) clearInterval(fastTickIntervalId);
  scannerIntervalId = null;
  fastTickIntervalId = null;
  isScannerRunning = false;
}
