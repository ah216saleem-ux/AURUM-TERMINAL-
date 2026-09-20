import { Phase3DMarketState } from './PhaseX3DCore';

export type PhaseXFinalDirection = 'BUY' | 'SELL' | 'WAIT';

export type PhaseXExecutionStatus = 
  | 'READY' 
  | 'WAITING_FOR_ENTRY' 
  | 'MISSED_ENTRY' 
  | 'SETUP_INVALIDATED' 
  | 'SETUP_EXPIRED' 
  | 'WAIT' 
  | 'NONE';

export type PhaseXLifecycleState =
  | 'WAITING_FOR_ENTRY'
  | 'ACTIVE'
  | 'TP1_HIT'
  | 'TP2_HIT'
  | 'STOP_LOSS_HIT'
  | 'INVALIDATED_BEFORE_ENTRY'
  | 'EXPIRED'
  | 'COMPLETED'
  | 'CANCELLED_BY_USER'
  | 'NONE';

export type PhaseXWaitReasonCode = 
  | 'LOW_CONFIDENCE'
  | 'SETUP_PHASE_CONFLICT'
  | 'MACRO_REGIME_CONTRADICTION'
  | 'NO_WYCKOFF_EVENT'
  | 'EXECUTION_STRUCTURE_UNCONFIRMED'
  | 'ENTRY_EXTENDED'
  | 'STRUCTURE_INVALIDATED'
  | 'STALE_FEED'
  | 'EXTREME_VOLATILITY'
  | 'INSUFFICIENT_DATA'
  | 'RISK_STRUCTURE_UNSUITABLE'
  | 'RR_NOT_VIABLE'
  | 'NONE';

export interface PhaseXTradeConfidenceBreakdown {
  htfMacroContextScore: number;
  wyckoffPhaseQualityScore: number;
  wyckoffEventQualityScore: number;
  setupConfirmation30MScore: number;
  executionTrigger15MScore: number;
  structureQualityScore: number;
  volumeEvidenceScore: number;
  volatilityScore: number;
  timeframeAlignmentScore: number;
  totalScore: number;
}

export interface PhaseXLiveTradeDetails {
  setupId: string;
  lifecycleState: PhaseXLifecycleState;
  displayStatusLabel: string;
  userFacingDirectionLabel: string;
  lockedEntry: number | null;
  lockedSL: number | null;
  lockedTP1: number | null;
  lockedTP2: number | null;
  originalRisk: number | null;
  activationPrice: number | null;
  currentVerifiedPrice: number;
  currentLiveR: number | null;
  priceSource: string;
  bidAskAvailability: 'VERIFIED' | 'LIMITED' | 'UNAVAILABLE';
  bidPrice: number | null;
  askPrice: number | null;
  entryTimestamp: number | null;
  tp1Timestamp: number | null;
  tp2Timestamp: number | null;
  slTimestamp: number | null;
  expirationStatus: 'NOT_EXPIRED' | 'EXPIRED';
  preEntryInvalidationStatus: 'VALID' | 'INVALIDATED_BEFORE_ENTRY';
  gapExecutionUncertainty: boolean;
  gapDetails?: string;
  lastVerifiedPriceTimestamp: number;
  concurrentActiveTrades: number;
  maxConcurrentAllowed: number;
  sessionStatusAtActivation: string;
  currentSessionStatus: string;
  spreadAtActivation: number | 'UNAVAILABLE';
  cancellationSource?: 'SYSTEM' | 'USER';
  cancellationTimestamp?: number;
  isDataInterrupted: boolean;
  partialExitPctAtTP1: number;
}

export interface PhaseXEngineDetails {
  detectedPhase: string;
  phaseConfidence: number;
  tradingRangeHigh: number;
  tradingRangeLow: number;
  rangeMidpoint: number;
  rangeWidth: number;
  rangeWidthPct: number;
  springStatus: string;
  upthrustStatus: string;
  activeEvent: string;
  eventStatus: string;
  marketStructure: string;
  atr: number;
  volatilityPct: number;
  volumeAvailability: 'VERIFIED' | 'LIMITED';
  volumeConfirmationText: string;
  fourHourContext: string;
  oneHourPhase: string;
  thirtyMinSetup: string;
  fifteenMinStructure: string;
  timeframeAlignment: 'ALIGNED' | 'PARTIALLY ALIGNED' | 'CONFLICTING';
  lastClosedCandleTimestamp: number;
  lastClosedCandleTimeFormatted: string;
  assetSymbol: string;
  assetName: string;
  currentClose: number;
  decimals: number;
  finalDirection: PhaseXFinalDirection;
  executionStatus: PhaseXExecutionStatus;
  tradeConfidence: number;
  preferredEntry: number | null;
  entryZoneLow: number | null;
  entryZoneHigh: number | null;
  livePrice: number;
  signalConfirmationPrice: number;
  distanceFromEntry: number | null;
  distanceFromEntryAtr: number | null;
  waitReasonCode: PhaseXWaitReasonCode;
  executionTrigger15M: string;
  setupId: string;
  setupAgeCandles: number;
  setupAgeFormatted: string;
  confirmation30mTimestamp: number;
  trigger15mTimestamp: number;
  tradeConfidenceBreakdown?: PhaseXTradeConfidenceBreakdown;
  slStructuralAnchor: number | null;
  slAnchorType: string;
  slAnchorSource: '5M' | '15M-FALLBACK' | 'NONE';
  atr5M: number;
  atrBufferMultiplier: number;
  atrBufferDistance: number;
  medianRelevantWick: number;
  selectedWickThreshold: number;
  spreadAvailable: boolean;
  verifiedSpread: number;
  protectiveBuffer: number;
  rawStructuralSL: number | null;
  finalProtectedSL: number | null;
  slDistance: number | null;
  slDistanceAtr: number | null;
  is15MSafetyValidated: boolean;
  fallbackTriggered: boolean;
  targetRiskDistance: number | null;
  takeProfit1: number | null;
  tp1RMultiple: number;
  tp1Feasibility: 'FEASIBLE' | 'OBSTACLE_DETECTED' | 'NOT_APPLICABLE';
  takeProfit2: number | null;
  tp2RMultiple: number;
  targetStructure: string;
  finalRRValidation: 'VALIDATED' | 'FAILED' | 'PENDING';
  riskQualificationStatus: 'QUALIFIED' | 'UNSUITABLE_RISK' | 'RR_TOO_LOW' | 'PENDING';
  precisionExecution15M?: {
    timeframe: '15M';
    microStructure: string;
    microSwingHigh: number;
    microSwingLow: number;
    microAtr: number;
    tightInvalidationAnchor: number;
    invalidationBasis: string;
    status: 'PHASE_3_PROTECTED_SL_ACTIVE' | 'PREPARED_FOR_TIGHT_SL_PHASE_2';
  };
  setupConfirmation30M?: {
    timeframe: '30M';
    setupBias: string;
    setupConfirmed: boolean;
    springOrUtadStatus: string;
    structureShift: string;
  };
  macroRegime4H?: {
    timeframe: '4H';
    regime: string;
    macroRangeHigh: number;
    macroRangeLow: number;
  };
  liveTradeDetails?: PhaseXLiveTradeDetails;
}

export interface PhaseXResult {
  assetId: string;
  symbol: string;
  assetName: string;
  marketPhase: Phase3DMarketState;
  confidence: number;
  detectedEventLabel?: string;
  userOutputState: '🟢 BULLISH SETUP DEVELOPING' | '🔴 BEARISH SETUP DEVELOPING' | '🟡 WAIT — SETUP NOT CONFIRMED';
  finalDirection: PhaseXFinalDirection;
  executionStatus: PhaseXExecutionStatus;
  tradeConfidence: number;
  preferredEntry: number | null;
  entryZoneLow: number | null;
  entryZoneHigh: number | null;
  signalConfirmationPrice: number;
  currentLivePrice: number;
  distanceFromEntry: number | null;
  distanceFromEntryAtr: number | null;
  waitReasonCode: PhaseXWaitReasonCode;
  executionTriggerDescription: string;
  setupId: string;
  setupAgeCandles: number;
  setupAgeFormatted: string;
  stopLoss: number | null;
  takeProfit1: number | null;
  takeProfit2: number | null;
  riskRewardRatio: string | null;
  riskDistance: number | null;
  tp1RMultiple?: number;
  tp2RMultiple?: number;
  slAnchorSource?: '5M' | '15M-FALLBACK' | 'NONE';
  finalRRValidation?: 'VALIDATED' | 'FAILED' | 'PENDING';
  lifecycleState?: PhaseXLifecycleState;
  liveProgressR?: number | null;
  displayStatusLabel?: string;
  isDataInterrupted?: boolean;
  liveTradeDetails?: PhaseXLiveTradeDetails;
  engineDetails: PhaseXEngineDetails;
}

export interface PhaseXTradeHistoryRecord {
  setupId: string;
  assetId: string;
  symbol: string;
  direction: PhaseXFinalDirection;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  activationTimestamp: number | null;
  exitTimestamp: number | null;
  tp1Reached: boolean;
  tp2Reached: boolean;
  slReached: boolean;
  finalR: number | null;
  tradeConfidence: number;
  dataQualityStatus: 'VERIFIED' | 'LIMITED';
  spreadAtActivation: number | 'UNAVAILABLE';
  partialExitPctAtTP1: number;
  cancellationReason?: string;
  cancellationSource?: 'SYSTEM' | 'USER';
  completedState: PhaseXLifecycleState;
  finalStatusLabel: string;
}

export interface Phase4VerificationReport {
  timestamp: number;
  system: string;
  overallStatus: 'PASS' | 'FAIL';
  checklist: Array<{
    id: string;
    title: string;
    status: 'PASS' | 'FAIL' | 'LIMITED';
    details: string;
  }>;
  simulatedLifecycleTest: {
    testId: string;
    isTestData: true;
    asset: string;
    initialSetup: {
      setupId: string;
      direction: 'BUY';
      entry: number;
      sl: number;
      tp1: number;
      tp2: number;
      riskDistance: number;
    };
    steps: Array<{
      step: string;
      timestamp: string;
      simulatedPrice: number;
      lifecycleState: PhaseXLifecycleState;
      displayLabel: string;
      liveR: string;
      event: string;
    }>;
    finalOutcome: string;
    levelLockCheck: string;
  };
}
