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

export interface PhaseXDataProvenance {
  liveDataProvider: string;
  instrumentSymbol: string;
  livePrice: number;
  bidAskAvailability: 'VERIFIED' | 'LIMITED' | 'UNAVAILABLE';
  lastTickTimestamp: number;
  tickAgeMs: number;
  tickAgeFormatted: string;
  candleSource5M: string;
  candleSource15M: string;
  candleSource30M: string;
  candleSource1H: string;
  candleSource4H: string;
  lastClosedCandleTimestamp: number;
  historicalDataRange: string;
  dataFreshnessStatus: 'FRESH' | 'STALE' | 'OFFLINE';
  dataGapsDetected: boolean;
  dataGapsDetails: string;
  fallbackProviderUsed: boolean;
  fallbackProviderName: string;
  realDataStatus: 'VERIFIED' | 'DEGRADED' | 'UNAVAILABLE';
}

export type Phase5GateStatus = 'APPROVED' | 'REJECTED' | 'ACTIVE';

export interface Phase5QualityGateResult {
  finalGateStatus: Phase5GateStatus;
  liveDataStatus: 'VERIFIED' | 'STALE' | 'INSUFFICIENT' | 'DISRUPTED';
  tickAgeMs: number;
  tickAgeFormatted: string;
  alignment4H: 'ALIGNED' | 'CONFLICTING' | 'NEUTRAL';
  alignment4HDetails: string;
  alignment1H: 'ALIGNED' | 'CONFLICTING';
  alignment1HDetails: string;
  confirmation30M: 'CONFIRMED' | 'UNCONFIRMED';
  confirmation30MDetails: string;
  execution15M: 'TRIGGERED' | 'PENDING' | 'INVALIDATED';
  execution15MDetails: string;
  riskValidation5M: 'VALID' | 'INVALID';
  riskValidation5MDetails: string;
  entryValidation: 'VALID' | 'INVALID' | 'OUT_OF_BOUNDS';
  entryValidationDetails: string;
  antiChaseValidation: 'PASS' | 'CHASING_DETECTED' | 'MISSED_ENTRY';
  antiChaseDetails: string;
  slValidation: 'PROTECTED' | 'UNSAFE' | 'COMPROMISED';
  slValidationDetails: string;
  noiseValidation: 'PASS' | 'INSIDE_NOISE_WICK';
  noiseValidationDetails: string;
  tp1Validation: 'VALID_2R+' | 'LESS_THAN_2R' | 'OBSTACLE_DETECTED';
  tp1ValidationDetails: string;
  tp2Validation: 'VALID_3R+' | 'LESS_THAN_3R' | 'TARGET_INVALID';
  tp2ValidationDetails: string;
  rrValidation: 'QUALIFIED' | 'REJECTED';
  rrValidationDetails: string;
  volatilityStatus: 'SAFE' | 'EXTREME_VOLATILITY';
  volatilityDetails: string;
  spreadStatus: 'SAFE' | 'UNSAFE' | 'LIMITED';
  spreadDetails: string;
  newsEventStatus: 'CLEAR' | 'EVENT_RISK_IMMINENT' | 'LIMITED';
  newsEventDetails: string;
  tradeConfidenceScore: number;
  tradeConfidenceStatus: 'QUALIFIED' | 'WEAK';
  setupId: string;
  setupAgeCandles: number;
  setupAgeFormatted: string;
  expirationStatus: 'NOT_EXPIRED' | 'EXPIRED';
  finalDecision: 'READY' | 'WAIT' | 'ACTIVE';
  primaryRejectionReason: string | null;
  rejectionPriority: number | null;
  cleanWaitState: string | null;
  lockedAtTimestamp?: number;
}

export interface Phase5VerificationTestCase {
  scenarioId: string;
  scenarioName: string;
  isTestData: true;
  inputCondition: string;
  expectedGateStatus: 'APPROVED' | 'REJECTED';
  expectedWaitReason: string | null;
  actualGateStatus: 'APPROVED' | 'REJECTED';
  actualWaitReason: string | null;
  passed: boolean;
}

export interface Phase5VerificationReport {
  timestamp: number;
  system: string;
  overallStatus: 'PASS' | 'FAIL';
  checklist: Array<{
    id: string;
    title: string;
    status: 'PASS' | 'FAIL' | 'LIMITED';
    details: string;
  }>;
  testCases: Phase5VerificationTestCase[];
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
  dataProvenance?: PhaseXDataProvenance;
  phase5QualityGate?: Phase5QualityGateResult;
}

export interface PhaseXResult {
  assetId: string;
  symbol: string;
  assetName: string;
  marketPhase: Phase3DMarketState;
  confidence: number;
  detectedEventLabel?: string;
  userOutputState: string;
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
  dataProvenance?: PhaseXDataProvenance;
  phase5QualityGate?: Phase5QualityGateResult;
  engineDetails?: PhaseXEngineDetails;
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

export interface TelegramVerificationResult {
  testId: string;
  title: string;
  passed: boolean;
  details: string;
}

export interface TelegramVerificationReport {
  timestamp: number;
  system: string;
  overallStatus: 'PASS' | 'FAIL';
  results: TelegramVerificationResult[];
}

export interface TelegramServiceStatus {
  configured: boolean;
  hasBotToken: boolean;
  hasChatId: boolean;
  assetTarget: string;
  sentInitialSignalsCount: number;
  sentTP1Count: number;
  sentTP2Count: number;
  sentSLCount: number;
  totalLogsRecorded: number;
  recentLogs: Array<{
    id: string;
    setupId: string;
    assetId: string;
    type: string;
    status: string;
    timestamp: number;
    messagePreview: string;
  }>;
}

