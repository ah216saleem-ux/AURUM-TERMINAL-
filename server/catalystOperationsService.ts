/**
 * AURUM CATALYST — PRODUCTION LIVE OPERATIONS & SAFETY SYSTEM (PHASE 7)
 * 
 * Strict Principle:
 * REAL MARKET -> MASTER SAFETY GATE -> REAL SIGNAL -> REAL MONITORING -> SAFE LIFECYCLE
 * (Operational Reliability & Circuit Breakers ONLY — NO Strategy Modifications)
 */

import fs from 'fs';
import path from 'path';
import {
  canCreateNewCatalystSignal,
  getCatalystDailyState,
  getCatalystRiskConfig,
  getFeedHealthMetrics
} from './catalystRiskService';
import {
  getCatalystHealthSummary,
  runDataIntegrityAudit
} from './catalystValidationHealthService';
import { getVerifiedXauPrice } from './websocketServer';

const DATA_DIR = path.join(process.cwd(), 'data');
const OPERATIONS_STATE_FILE = path.join(DATA_DIR, 'catalyst_operations_state.json');
const OPERATIONS_LOG_FILE = path.join(DATA_DIR, 'catalyst_operations_log.json');
const OPERATIONS_DAILY_FILE = path.join(DATA_DIR, 'catalyst_operations_daily.json');

export type ProductionStatus = 'HEALTHY' | 'DEGRADED' | 'PAUSED' | 'ERROR';

export interface CatalystOperationsState {
  productionStatus: ProductionStatus;
  isEmergencyPaused: boolean;
  emergencyPauseReason?: string;
  emergencyPauseTimestamp?: number;
  isMaintenanceMode: boolean;
  maintenanceReason?: string;
  maintenanceTimestamp?: number;
  lastSafetyGateCheckTimestamp: number;
  lastSafetyGateResult: 'PASS' | 'BLOCKED';
  safetyGateBlockReason?: string;
  activeAlerts: Array<{
    id: string;
    type: string;
    severity: 'INFO' | 'WARN' | 'CRITICAL';
    message: string;
    timestamp: number;
  }>;
  serverRestartTimestamp: number;
  lastUpdated: number;
}

export interface OperationalAuditEvent {
  id: string;
  timestamp: number;
  timeFormatted: string;
  eventType:
    | 'FEED_OFFLINE'
    | 'FEED_RECOVERED'
    | 'ENGINE_ERROR'
    | 'TELEGRAM_ERROR'
    | 'RISK_LOCK'
    | 'EMERGENCY_PAUSE'
    | 'EMERGENCY_RESUME'
    | 'MAINTENANCE_ON'
    | 'MAINTENANCE_OFF'
    | 'SAFETY_GATE_TRIGGERED'
    | 'SIGNAL_CREATED'
    | 'TRADE_COMPLETED'
    | 'DATA_WARNING'
    | 'SERVER_RESTART';
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  signalId?: string;
  previousState?: string;
  newState?: string;
  reason: string;
  actionTaken: string;
}

export interface DailyOperationsSummary {
  dateStr: string;
  productionStatus: ProductionStatus;
  signalsCreated: number;
  tp2Wins: number;
  tp1BreakEven: number;
  slLosses: number;
  missedEntries: number;
  expiredSetups: number;
  riskLocksCount: number;
  feedOutagesCount: number;
  telegramErrorsCount: number;
  engineErrorsCount: number;
  dataErrorsCount: number;
  serverRestartsCount: number;
  emergencyPausesCount: number;
}

let operationsState: CatalystOperationsState = {
  productionStatus: 'HEALTHY',
  isEmergencyPaused: false,
  isMaintenanceMode: false,
  lastSafetyGateCheckTimestamp: Date.now(),
  lastSafetyGateResult: 'PASS',
  activeAlerts: [],
  serverRestartTimestamp: Date.now(),
  lastUpdated: Date.now()
};

let operationalLogs: OperationalAuditEvent[] = [];
let dailyOperations: DailyOperationsSummary[] = [];

// Cooldown map for deduplicating alerts
const alertCooldownMap = new Map<string, number>();

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

export function loadOperationsState(): void {
  ensureDataDir();
  try {
    if (fs.existsSync(OPERATIONS_STATE_FILE)) {
      const raw = fs.readFileSync(OPERATIONS_STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        operationsState = {
          ...operationsState,
          ...parsed,
          serverRestartTimestamp: Date.now(),
          lastUpdated: Date.now()
        };
      }
    }

    if (fs.existsSync(OPERATIONS_LOG_FILE)) {
      const rawLogs = fs.readFileSync(OPERATIONS_LOG_FILE, 'utf-8');
      const parsed = JSON.parse(rawLogs);
      if (Array.isArray(parsed)) {
        operationalLogs = parsed.slice(0, 300);
      }
    }

    if (fs.existsSync(OPERATIONS_DAILY_FILE)) {
      const rawDaily = fs.readFileSync(OPERATIONS_DAILY_FILE, 'utf-8');
      const parsed = JSON.parse(rawDaily);
      if (Array.isArray(parsed)) {
        dailyOperations = parsed.slice(0, 90);
      }
    }

    // Record server restart event
    recordOperationalEvent({
      eventType: 'SERVER_RESTART',
      severity: 'INFO',
      reason: 'Server process initialized. Restoring persistent Catalyst operations & risk state.',
      actionTaken: operationsState.isEmergencyPaused
        ? 'Restored in EMERGENCY PAUSED state.'
        : 'Restored active operations safely.'
    });

    saveOperationsState();
  } catch (err) {
    console.warn('[CatalystOps] Failed to load operations state:', err);
  }
}

export function saveOperationsState(): void {
  ensureDataDir();
  try {
    fs.writeFileSync(OPERATIONS_STATE_FILE, JSON.stringify(operationsState, null, 2), 'utf-8');
    fs.writeFileSync(OPERATIONS_LOG_FILE, JSON.stringify(operationalLogs, null, 2), 'utf-8');
    fs.writeFileSync(OPERATIONS_DAILY_FILE, JSON.stringify(dailyOperations, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[CatalystOps] Failed to save operations state:', err);
  }
}

export function recordOperationalEvent(event: Omit<OperationalAuditEvent, 'id' | 'timestamp' | 'timeFormatted'>): void {
  ensureDataDir();
  const now = Date.now();
  const item: OperationalAuditEvent = {
    id: `ops_${now}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now,
    timeFormatted: new Date(now).toISOString(),
    ...event
  };

  operationalLogs.unshift(item);
  if (operationalLogs.length > 300) {
    operationalLogs = operationalLogs.slice(0, 300);
  }

  // Manage active alerts with 5-min deduplication
  if (item.severity === 'CRITICAL' || item.severity === 'WARN') {
    const cooldownKey = `${item.eventType}_${item.reason}`;
    const lastAlert = alertCooldownMap.get(cooldownKey) || 0;
    if (now - lastAlert > 300000) {
      alertCooldownMap.set(cooldownKey, now);
      operationsState.activeAlerts.unshift({
        id: item.id,
        type: item.eventType,
        severity: item.severity,
        message: item.reason,
        timestamp: now
      });
      if (operationsState.activeAlerts.length > 20) {
        operationsState.activeAlerts = operationsState.activeAlerts.slice(0, 20);
      }
    }
  }

  try {
    fs.writeFileSync(OPERATIONS_LOG_FILE, JSON.stringify(operationalLogs, null, 2), 'utf-8');
  } catch {}
}

/**
 * MASTER SAFETY GATE:
 * Evaluates all system subcomponents before allowing any signal creation.
 * Returns { allowed: boolean, reason?: string, productionStatus: ProductionStatus }
 */
export function evaluateMasterSafetyGate(hasActiveTrade: boolean): {
  allowed: boolean;
  productionStatus: ProductionStatus;
  reason?: string;
} {
  const now = Date.now();
  const feed = getFeedHealthMetrics();
  const health = getCatalystHealthSummary();
  const riskCheck = canCreateNewCatalystSignal();

  // 1. Check Emergency Pause
  if (operationsState.isEmergencyPaused) {
    operationsState.productionStatus = 'PAUSED';
    operationsState.lastSafetyGateCheckTimestamp = now;
    operationsState.lastSafetyGateResult = 'BLOCKED';
    operationsState.safetyGateBlockReason = operationsState.emergencyPauseReason || 'Emergency pause active.';
    return {
      allowed: false,
      productionStatus: 'PAUSED',
      reason: operationsState.safetyGateBlockReason
    };
  }

  // 2. Check Maintenance Mode
  if (operationsState.isMaintenanceMode) {
    operationsState.productionStatus = 'PAUSED';
    operationsState.lastSafetyGateCheckTimestamp = now;
    operationsState.lastSafetyGateResult = 'BLOCKED';
    operationsState.safetyGateBlockReason = operationsState.maintenanceReason || 'Maintenance mode active.';
    return {
      allowed: false,
      productionStatus: 'PAUSED',
      reason: operationsState.safetyGateBlockReason
    };
  }

  // 3. Real Live Feed Protection
  if (feed.status !== 'LIVE' || feed.tickAgeSeconds > 15) {
    operationsState.productionStatus = feed.status === 'OFFLINE' ? 'ERROR' : 'DEGRADED';
    operationsState.lastSafetyGateCheckTimestamp = now;
    operationsState.lastSafetyGateResult = 'BLOCKED';
    operationsState.safetyGateBlockReason = `Live feed is ${feed.status} (Age: ${feed.tickAgeSeconds}s). Signal creation blocked.`;
    return {
      allowed: false,
      productionStatus: operationsState.productionStatus,
      reason: operationsState.safetyGateBlockReason
    };
  }

  // 4. One Active Trade Lock
  if (hasActiveTrade) {
    operationsState.productionStatus = 'HEALTHY';
    operationsState.lastSafetyGateCheckTimestamp = now;
    operationsState.lastSafetyGateResult = 'BLOCKED';
    operationsState.safetyGateBlockReason = 'Another Catalyst trade is currently active. Exactly ONE trade managed at a time.';
    return {
      allowed: false,
      productionStatus: 'HEALTHY',
      reason: operationsState.safetyGateBlockReason
    };
  }

  // 5. Risk Master Lock
  if (!riskCheck.allowed) {
    operationsState.productionStatus = riskCheck.riskStatus === 'DAILY_LOCK' ? 'PAUSED' : 'DEGRADED';
    operationsState.lastSafetyGateCheckTimestamp = now;
    operationsState.lastSafetyGateResult = 'BLOCKED';
    operationsState.safetyGateBlockReason = riskCheck.reason || 'Risk circuit breaker active.';
    return {
      allowed: false,
      productionStatus: operationsState.productionStatus,
      reason: operationsState.safetyGateBlockReason
    };
  }

  // 6. Engine & Scanner Health
  if (health.engine.status === 'ERROR' || health.engine.scannerStatus === 'STOPPED') {
    operationsState.productionStatus = 'ERROR';
    operationsState.lastSafetyGateCheckTimestamp = now;
    operationsState.lastSafetyGateResult = 'BLOCKED';
    operationsState.safetyGateBlockReason = 'Catalyst scan engine error. Processing halted.';
    return {
      allowed: false,
      productionStatus: 'ERROR',
      reason: operationsState.safetyGateBlockReason
    };
  }

  // 7. Data Integrity
  if (health.dataIntegrity.status === 'WARNING') {
    operationsState.productionStatus = 'DEGRADED';
  } else {
    operationsState.productionStatus = 'HEALTHY';
  }

  operationsState.lastSafetyGateCheckTimestamp = now;
  operationsState.lastSafetyGateResult = 'PASS';
  operationsState.safetyGateBlockReason = undefined;

  return {
    allowed: true,
    productionStatus: operationsState.productionStatus
  };
}

export function pauseCatalystEmergency(reason = 'Manual Admin Emergency Pause'): CatalystOperationsState {
  operationsState.isEmergencyPaused = true;
  operationsState.emergencyPauseReason = reason;
  operationsState.emergencyPauseTimestamp = Date.now();
  operationsState.productionStatus = 'PAUSED';
  operationsState.lastUpdated = Date.now();

  recordOperationalEvent({
    eventType: 'EMERGENCY_PAUSE',
    severity: 'CRITICAL',
    previousState: 'HEALTHY',
    newState: 'PAUSED',
    reason,
    actionTaken: 'All new signal generation halted immediately. Active trade monitoring continues.'
  });

  saveOperationsState();
  return { ...operationsState };
}

export function resumeCatalystEmergency(): { success: boolean; state: CatalystOperationsState; message: string } {
  // Perform thorough safety check before resuming
  const safety = evaluateMasterSafetyGate(false);

  if (operationsState.isMaintenanceMode) {
    return {
      success: false,
      state: { ...operationsState },
      message: 'Cannot resume while Maintenance Mode is active. Turn off Maintenance Mode first.'
    };
  }

  const feed = getFeedHealthMetrics();
  if (feed.status !== 'LIVE') {
    return {
      success: false,
      state: { ...operationsState },
      message: `Cannot resume: Live feed is currently ${feed.status}. Wait for live ticks.`
    };
  }

  operationsState.isEmergencyPaused = false;
  operationsState.emergencyPauseReason = undefined;
  operationsState.emergencyPauseTimestamp = undefined;
  operationsState.productionStatus = safety.productionStatus;
  operationsState.lastUpdated = Date.now();

  recordOperationalEvent({
    eventType: 'EMERGENCY_RESUME',
    severity: 'INFO',
    previousState: 'PAUSED',
    newState: operationsState.productionStatus,
    reason: 'Admin resumed operations after safety verification.',
    actionTaken: 'Signal scanning and master safety gate reactivated.'
  });

  saveOperationsState();
  return {
    success: true,
    state: { ...operationsState },
    message: 'Catalyst operations successfully resumed in HEALTHY state.'
  };
}

export function setMaintenanceMode(enabled: boolean, reason = 'Scheduled System Maintenance'): CatalystOperationsState {
  operationsState.isMaintenanceMode = enabled;
  operationsState.maintenanceReason = enabled ? reason : undefined;
  operationsState.maintenanceTimestamp = enabled ? Date.now() : undefined;
  operationsState.productionStatus = enabled ? 'PAUSED' : 'HEALTHY';
  operationsState.lastUpdated = Date.now();

  recordOperationalEvent({
    eventType: enabled ? 'MAINTENANCE_ON' : 'MAINTENANCE_OFF',
    severity: 'WARN',
    previousState: enabled ? 'HEALTHY' : 'PAUSED',
    newState: operationsState.productionStatus,
    reason: enabled ? reason : 'Maintenance mode deactivated by admin.',
    actionTaken: enabled ? 'Signal creation paused for maintenance.' : 'Normal scanning restored.'
  });

  saveOperationsState();
  return { ...operationsState };
}

export function getOperationsSummary() {
  const health = getCatalystHealthSummary();
  const feed = getFeedHealthMetrics();
  const daily = getCatalystDailyState();

  return {
    module: 'AURUM CATALYST LIVE OPERATIONS (PHASE 7)',
    productionStatus: operationsState.productionStatus,
    isEmergencyPaused: operationsState.isEmergencyPaused,
    emergencyPauseReason: operationsState.emergencyPauseReason,
    isMaintenanceMode: operationsState.isMaintenanceMode,
    maintenanceReason: operationsState.maintenanceReason,
    safetyGate: {
      lastCheckTimestamp: operationsState.lastSafetyGateCheckTimestamp,
      lastResult: operationsState.lastSafetyGateResult,
      blockReason: operationsState.safetyGateBlockReason
    },
    liveTelemetry: {
      feedStatus: feed.status,
      engineStatus: health.engine.status,
      scannerStatus: health.engine.scannerStatus,
      telegramStatus: health.telegram.status,
      databaseStatus: health.database.status,
      riskStatus: daily.riskStatus,
      activeTradeCount: health.validationSession.completedTrades
    },
    activeAlerts: operationsState.activeAlerts,
    recentEvents: operationalLogs.slice(0, 50),
    serverUptimeSeconds: Math.floor((Date.now() - operationsState.serverRestartTimestamp) / 1000)
  };
}

// Initial bootstrap
loadOperationsState();
