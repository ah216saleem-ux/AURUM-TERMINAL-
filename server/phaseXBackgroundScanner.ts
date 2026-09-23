import { analyzePhaseX } from './phaseXEngine';
import { getTelegramServiceStatus } from './phaseXTelegramService';

export interface PhaseXEngineDiagnostics {
  currentMarketPrice: number;
  currentMarketStructure: string;
  currentSetupStatus: string;
  currentPhaseGate: string;
  engineState: 'WAIT' | 'SEARCHING' | 'APPROVED' | 'REJECTED' | 'SENT' | 'ACTIVE';
  rejectionReason: string | null;
  lastAnalysisTimestamp: number;
  lastSignalTimestamp: number | null;
  lastTelegramDispatchTimestamp: number | null;
  telegramDispatchResponse: {
    status: string;
    dispatched: boolean;
    recipientChatId?: string;
    timestamp?: number;
    error?: string;
  } | null;
  nextSetupSearchStatus: string;
  isContinuousScanningActive: boolean;
  setupId: string | null;
  direction: string;
  preferredEntry: number | null;
  entryZone: string | null;
  distanceFromEntry: number | null;
  distanceFromEntryAtr: number | null;
  totalScanCount: number;
  tradeConfidence: number;
  cleanWaitState: string | null;
}

let diagnosticsState: PhaseXEngineDiagnostics = {
  currentMarketPrice: 0,
  currentMarketStructure: 'INITIALIZING',
  currentSetupStatus: 'SEARCHING_SETUP',
  currentPhaseGate: 'PHASE 5 — QUALITY & EXECUTION GATE',
  engineState: 'SEARCHING',
  rejectionReason: null,
  lastAnalysisTimestamp: Date.now(),
  lastSignalTimestamp: null,
  lastTelegramDispatchTimestamp: null,
  telegramDispatchResponse: null,
  nextSetupSearchStatus: 'Continuous live engine active — scanning 5M/15M closed candle and live tick structure',
  isContinuousScanningActive: true,
  setupId: null,
  direction: 'WAIT',
  preferredEntry: null,
  entryZone: null,
  distanceFromEntry: null,
  distanceFromEntryAtr: null,
  totalScanCount: 0,
  tradeConfidence: 0,
  cleanWaitState: null
};

let scanIntervalHandle: NodeJS.Timeout | null = null;
let isScanRunning = false;

/**
 * Perform a single continuous live scanning cycle for XAU/USD
 */
export async function executePhaseXLiveScanCycle(): Promise<PhaseXEngineDiagnostics> {
  if (isScanRunning) return diagnosticsState;
  isScanRunning = true;

  try {
    const analysis = await analyzePhaseX('xau-usd');
    const now = Date.now();
    diagnosticsState.totalScanCount += 1;
    diagnosticsState.lastAnalysisTimestamp = now;
    diagnosticsState.currentMarketPrice = analysis.currentLivePrice;
    diagnosticsState.direction = analysis.finalDirection;
    diagnosticsState.preferredEntry = analysis.preferredEntry;
    diagnosticsState.setupId = analysis.setupId;
    diagnosticsState.tradeConfidence = analysis.tradeConfidence;
    diagnosticsState.distanceFromEntry = analysis.distanceFromEntry;
    diagnosticsState.distanceFromEntryAtr = analysis.distanceFromEntryAtr;

    if (analysis.entryZoneLow != null && analysis.entryZoneHigh != null) {
      diagnosticsState.entryZone = `[${analysis.entryZoneLow.toFixed(2)} - ${analysis.entryZoneHigh.toFixed(2)}]`;
    } else {
      diagnosticsState.entryZone = null;
    }

    const structureText = `${analysis.marketPhase || 'ANALYZING'} | 15M: ${analysis.executionTriggerDescription || 'Scanning'}`;
    diagnosticsState.currentMarketStructure = structureText;

    const gate = analysis.engineDetails?.phase5QualityGate;
    const gateStatus = gate?.finalGateStatus || 'REJECTED';
    diagnosticsState.currentPhaseGate = `PHASE 5 GATE: ${gateStatus}`;
    diagnosticsState.cleanWaitState = gate?.cleanWaitState || analysis.displayStatusLabel || null;

    if (analysis.lifecycleState === 'ACTIVE' || analysis.lifecycleState === 'TP1_HIT') {
      diagnosticsState.engineState = 'ACTIVE';
      diagnosticsState.currentSetupStatus = `ACTIVE POSITION (${analysis.lifecycleState})`;
      diagnosticsState.rejectionReason = null;
      diagnosticsState.nextSetupSearchStatus = 'Active trade in progress — monitoring Stop Loss & Take Profit targets';
    } else if (gateStatus === 'APPROVED') {
      diagnosticsState.engineState = 'APPROVED';
      diagnosticsState.currentSetupStatus = `READY — APPROVED (${analysis.finalDirection})`;
      diagnosticsState.rejectionReason = null;
      diagnosticsState.lastSignalTimestamp = now;
      diagnosticsState.lastTelegramDispatchTimestamp = now;
      diagnosticsState.nextSetupSearchStatus = 'Approved signal active — monitoring entry activation and lifecycle';
      
      const tgStatus = getTelegramServiceStatus();
      diagnosticsState.telegramDispatchResponse = {
        status: 'DISPATCHED_TO_TELEGRAM',
        dispatched: true,
        recipientChatId: tgStatus.hasChatId ? 'CONFIGURED_SECURE_CHAT' : 'UNCONFIGURED',
        timestamp: now
      };
    } else {
      // REJECTED or WAIT state -> Discard old setup and continue active scanning
      const rejection = gate?.primaryRejectionReason || 'Waiting for high-confidence multi-timeframe Wyckoff setup';
      diagnosticsState.rejectionReason = rejection;

      if (analysis.executionStatus === 'MISSED_ENTRY' || gate?.cleanWaitState?.includes('MISSED ENTRY')) {
        diagnosticsState.engineState = 'SEARCHING';
        diagnosticsState.currentSetupStatus = 'MISSED ENTRY — RESET & SCANNING NEXT STRUCTURE';
        diagnosticsState.nextSetupSearchStatus = 'Old extended entry rejected by Anti-Chase — actively scanning for next structural pullback near current price';
      } else {
        diagnosticsState.engineState = 'SEARCHING';
        diagnosticsState.currentSetupStatus = analysis.displayStatusLabel || 'SEARCHING_SETUP';
        diagnosticsState.nextSetupSearchStatus = 'Continuous live engine active — scanning 5M/15M closed candle and live tick structure';
      }
    }
  } catch (err: any) {
    console.error('[PhaseXBackgroundScanner] Error in scan cycle:', err);
    diagnosticsState.rejectionReason = `Scan cycle exception: ${err?.message || 'Unknown'}`;
  } finally {
    isScanRunning = false;
  }

  return diagnosticsState;
}

/**
 * Start the continuous server background scanner (every 2.5 seconds)
 */
export function startPhaseXBackgroundScanner(): void {
  if (scanIntervalHandle) return;
  diagnosticsState.isContinuousScanningActive = true;
  console.log('[PhaseXBackgroundScanner] Starting continuous 2.5s live XAU/USD market scanner...');
  
  // Initial immediate run
  executePhaseXLiveScanCycle().catch(err => {
    console.error('[PhaseXBackgroundScanner] Initial cycle error:', err);
  });

  scanIntervalHandle = setInterval(() => {
    executePhaseXLiveScanCycle().catch(err => {
      console.error('[PhaseXBackgroundScanner] Interval cycle error:', err);
    });
  }, 2500);
}

/**
 * Stop background scanner if requested
 */
export function stopPhaseXBackgroundScanner(): void {
  if (scanIntervalHandle) {
    clearInterval(scanIntervalHandle);
    scanIntervalHandle = null;
  }
  diagnosticsState.isContinuousScanningActive = false;
  console.log('[PhaseXBackgroundScanner] Stopped background scanner.');
}

/**
 * Get current snapshot of diagnostics
 */
export function getPhaseXDiagnostics(): PhaseXEngineDiagnostics {
  const tgStatus = getTelegramServiceStatus();
  if (tgStatus.recentLogs && tgStatus.recentLogs.length > 0) {
    const latestSent = tgStatus.recentLogs.find(l => l.status === 'SENT') || tgStatus.recentLogs[0];
    if (latestSent && latestSent.status === 'SENT') {
      diagnosticsState.lastTelegramDispatchTimestamp = latestSent.timestamp;
      diagnosticsState.telegramDispatchResponse = {
        status: 'SENT',
        dispatched: true,
        recipientChatId: tgStatus.hasChatId ? 'CONFIGURED_SECURE_CHAT' : 'UNCONFIGURED',
        timestamp: latestSent.timestamp,
        error: undefined
      };
    }
  }

  return { ...diagnosticsState };
}

// Auto-start scanner on module load
startPhaseXBackgroundScanner();
