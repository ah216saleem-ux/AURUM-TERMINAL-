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
  setupType?: string;
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
  setupType?: string;
  strategyTelemetry?: PhaseXStrategyTelemetry;
  liveTradeDetails?: PhaseXLiveTradeDetails;
  dataProvenance?: PhaseXDataProvenance;
  phase5QualityGate?: Phase5QualityGateResult;
}

export interface SmcEngineTelemetry {
  asianHigh: number;
  asianLow: number;
  prevDayHigh: number;
  prevDayLow: number;
  keySwingHigh15M: number;
  keySwingLow15M: number;
  liquiditySwept: 'BUY_SIDE' | 'SELL_SIDE' | 'NONE';
  sweptLevelPrice: number | null;
  sweptLevelDescription: string;
  sweepCandleTime: number | null;
  sweepConfirmed: boolean;
  chochDetected: boolean;
  chochLevel: number | null;
  chochTime: number | null;
  displacementSpread: number;
  displacementAtrRatio: number;
  displacementConfirmed: boolean;
  fvgZoneHigh: number | null;
  fvgZoneLow: number | null;
  fvgCandleTime: number | null;
  fvgStatus: 'VALID' | 'RETESTED' | 'INVALIDATED' | 'NONE';
  fvgRetestConfirmed: boolean;
  currentSession: 'ASIAN' | 'LONDON' | 'NEW_YORK' | 'INTERBANK_CLOSE';
  setupQualified: boolean;
  direction: 'BUY' | 'SELL' | 'WAIT';
}

export interface TrendPullbackTelemetry {
  tf4HDirection: 'BULLISH' | 'BEARISH' | 'RANGING';
  tf1HDirection: 'BULLISH' | 'BEARISH' | 'RANGING';
  tf30MDirection: 'BULLISH' | 'BEARISH' | 'RANGING';
  ema20_15M: number;
  ema50_15M: number;
  pullbackTarget: '20_EMA' | '50_EMA' | 'BREAKOUT_LEVEL' | 'NONE';
  pullbackDistanceAtr: number;
  isPullbackWithinZone: boolean;
  micro5MRejectionWickPct: number;
  micro5MReclaimConfirmed: boolean;
  micro5MStructureConfirmed: boolean;
  setupQualified: boolean;
  direction: 'BUY' | 'SELL' | 'WAIT';
}

export interface WyckoffStrategyTelemetry {
  detectedPhase: string;
  activeEvent: string;
  eventStatus: string;
  springStatus: string;
  upthrustStatus: string;
  setupQualified: boolean;
  direction: 'BUY' | 'SELL' | 'WAIT';
}

export interface StrategyConfluenceTelemetry {
  detectedStrategies: string[];
  confluenceCount: number;
  agreementStatus: 'UNANIMOUS' | 'CONFLUENT' | 'SINGLE_STRATEGY' | 'CONFLICTING' | 'NONE';
  conflictDetails: string | null;
  selectedSetupType: string;
  mergedSetupId: string;
}

export interface PhaseXStrategyTelemetry {
  activeStrategyType: string;
  setupTypeLabel: string;
  smc: SmcEngineTelemetry;
  trend: TrendPullbackTelemetry;
  wyckoff: WyckoffStrategyTelemetry;
  confluence: StrategyConfluenceTelemetry;
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
  setupType?: string;
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

export interface PhaseXLiveSignalRecord {
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
  signalTimestamp: number;
  activationTimestamp: number | null;
  exitTimestamp: number | null;
  phase4FinalStatus: string;
  tp1Reached: boolean;
  tp2Reached: boolean;
  slReached: boolean;
  finalR: number | null;
  dataQualityStatus: 'VERIFIED' | 'LIMITED';
  displayStatusLabel: string;
  isLive: true;
}

export interface PhaseXPerformanceMetrics {
  totalApprovedSignals: number;
  completedTrades: number;
  tp1Hits: number;
  tp2Hits: number;
  stopLossHits: number;
  winRate: number | null;
  averageR: number | null;
  totalR: number;
  averageConfidence: number;
  signalsPerDay: number;
  isSampleSufficient: boolean;
  sampleStatus: 'INSUFFICIENT LIVE SAMPLE' | 'SUFFICIENT_SAMPLE';
}

export interface TelegramConsistencyAuditItem {
  setupId: string;
  isConsistent: boolean;
  websiteEntry: number;
  websiteSL: number;
  websiteTP1: number;
  websiteTP2: number;
  websiteDirection: string;
  telegramEntry?: number;
  telegramSL?: number;
  telegramTP1?: number;
  telegramTP2?: number;
  telegramDirection?: string;
  telegramDispatched: boolean;
  details: string;
}

export interface TelegramConsistencyReport {
  totalAudited: number;
  consistentCount: number;
  inconsistentCount: number;
  auditItems: TelegramConsistencyAuditItem[];
}

export interface LiveValidationSuiteReport {
  timestamp: number;
  system: string;
  overallStatus: 'PASS' | 'FAIL';
  liveSignalsCount: number;
  results: Array<{
    testId: string;
    title: string;
    passed: boolean;
    details: string;
  }>;
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
  setupType?: string | null;
}

export interface PhaseXDeterministicBacktestMetrics {
  strategyName: string;
  detectedSetups: number;
  passedPhase5: number;
  rejectedPhase5: number;
  completedTrades: number;
  tp1Hits: number;
  tp2Hits: number;
  slHits: number;
  realizedR: number;
  averageR: number;
  maxDrawdownR: number;
  sampleSize: number;
}

export interface PhaseXMultiStrategyValidationReport {
  timestamp: number;
  system: string;
  overallStatus: 'PASS' | 'FAIL';
  isHistoricalBacktest: true;
  checklist: Array<{
    id: string;
    title: string;
    status: 'PASS' | 'FAIL' | 'LIMITED';
    details: string;
  }>;
  scenarios: Array<{
    scenarioId: string;
    scenarioName: string;
    strategyType: string;
    description: string;
    expectedDirection: string;
    actualDirection: string;
    expectedGateStatus: string;
    actualGateStatus: string;
    expectedConfluenceStatus: string;
    actualConfluenceStatus: string;
    passed: boolean;
  }>;
  backtestMetrics: PhaseXDeterministicBacktestMetrics[];
}


