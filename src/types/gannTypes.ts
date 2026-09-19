import { Timeframe } from '../types';

export type GannFanAngleType = '1x1' | '1x2' | '2x1' | '1x4' | '4x1';

export interface GannFanAngleInfo {
  angle: GannFanAngleType;
  ratioText: string;
  degrees: number;
  currentPriceLevel: number;
  priceRelation: 'ABOVE' | 'BELOW' | 'AT_ANGLE';
  isBroken: boolean;
  breakType?: 'BULLISH_BREAK' | 'BEARISH_BREAK';
}

export interface GannFanResult {
  anchorType: 'SWING_LOW' | 'SWING_HIGH';
  anchorPrice: number;
  anchorTime: string;
  oneByOnePrice: number;
  isPriceAboveOneByOne: boolean;
  fanStructure: 'BULLISH_STRUCTURE' | 'BEARISH_STRUCTURE';
  angles: Record<GannFanAngleType, GannFanAngleInfo>;
  momentumShiftConfirmed: boolean;
  momentumShiftNote: string;
}

export interface GannSquareOf9Level {
  angleDegrees: number; // 45, 90, 135, 180, 225, 270, 315, 360
  levelType: 'CARDINAL' | 'DIAGONAL';
  price: number;
  formattedPrice: string;
  role: 'SUPPORT' | 'RESISTANCE' | 'TARGET';
  distance: number;
  distancePercent: number;
  isNearCurrent: boolean;
}

export interface GannSquareOf9Result {
  fixedReferencePrice: number; // Daily Open
  referenceLabel: string; // "Daily Open (Fixed Reference)"
  scaleFactor: number;
  cardinalLevels: GannSquareOf9Level[];
  diagonalLevels: GannSquareOf9Level[];
  nearestSupport: GannSquareOf9Level;
  nearestResistance: GannSquareOf9Level;
  targetZone: GannSquareOf9Level;
  alignmentWithCurrentPrice: boolean;
  alignmentNote: string;
}

export interface GannBoxLevel {
  ratio: number; // 0.25, 0.382, 0.5, 0.618, 0.75, 1.0
  ratioLabel: string; // e.g. "0.618 Golden Pocket"
  price: number;
  formattedPrice: string;
  isRetracementZone: boolean;
  distance: number;
}

export interface GannBoxTimeWindow {
  ratio: number;
  ratioLabel: string;
  projectedTimeFormatted: string;
  windowStatus: 'UPCOMING' | 'ACTIVE_NOW' | 'PASSED';
  reactionType: 'HIGH_PROBABILITY_PIVOT' | 'CONTINUATION' | 'REVERSAL_EXHAUSTION';
}

export interface GannBoxResult {
  swingHigh: number;
  swingLow: number;
  swingRange: number;
  timeAnchorTf: '1H' | '15M';
  priceLevels: GannBoxLevel[];
  timeWindows: GannBoxTimeWindow[];
  currentInReactionWindow: boolean;
  nearestPriceRatio: GannBoxLevel;
  activeTimeWindowText: string;
}

export interface GannConfluenceResult {
  fanAligned: boolean;
  squareAligned: boolean;
  boxAligned: boolean;
  alignedToolsCount: number; // Minimum 2 of 3 required
  isConfluenceMet: boolean;
  alignedTools: string[];
  summaryText: string;
}

export interface TimeframeBias {
  timeframe: '4H' | '1H' | '15M' | '30M';
  role: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trendStrength: number;
  keyFactor: string;
  bosChoch: string;
  orderBlockZone: string;
  fvgZone: string;
  momentumState: string;
  isAlignedWithDirection: boolean;
}

export interface ConfluenceChecklistItem {
  key: string;
  label: string;
  description: string;
  isAligned: boolean;
  detail: string;
}

export interface ConfluenceChecklist {
  items: ConfluenceChecklistItem[];
  alignedCount: number; // x / 10
  passedQualityGate: boolean; // >= 8 and confidence >= 75
}

export interface HistoricalPatternMatch {
  similarityScore: number; // 0-100
  matchedSetupType: string;
  sessionArchetype: string;
  volatilityMatch: string;
  historicalWinRate: number;
  sampleSize: number;
  summary: string;
}

export interface DynamicTradeLevels {
  entryZone: {
    min: number;
    max: number;
    optimal: number;
    formatted: string;
  };
  stopLoss: number;
  stopLossFormatted: string;
  stopLossRationale: string;
  tp1: number;
  tp1Formatted: string;
  tp1Rationale: string;
  tp2: number;
  tp2Formatted: string;
  tp2Rationale: string;
  riskRewardRatio: number;
  riskRewardFormatted: string;
  atr14: number;
  atrFormatted: string;
  spreadToleranceOk: boolean;
  minRrMet: boolean;
}

export interface TradeManagementGuidance {
  breakevenRule: string;
  tp1PartialAction: string;
  tp2TrailAction: string;
  structureBreakExitWarning: string;
}

export interface GannIntradayOpportunity {
  id: string;
  assetId: string;
  assetSymbol: string;
  assetName: string;
  currentPrice: number;
  currentPriceFormatted: string;
  dailyOpen: number;
  direction: 'BUY' | 'SELL' | 'WAIT';
  directionBadge: 'LONG' | 'SHORT' | 'WAIT';
  entryZone: string;
  stopLoss: string;
  tp1: string;
  tp2: string;
  timeframe: string; // '15M (Execution) / 1H (Trend) / 4H (Bias)'
  gannConfluence: string;
  confirmationsAligned: string; // '8/10'
  confirmationsCount: number;
  confidence: number;
  historicalSimilarity: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Rich Sub-Engines
  checklist: ConfluenceChecklist;
  multiTf: {
    fourHour: TimeframeBias;
    oneHour: TimeframeBias;
    fifteenMin: TimeframeBias;
    thirtyMinRefinement?: TimeframeBias;
    allThreeAgree: boolean;
  };
  fan: GannFanResult;
  squareOf9: GannSquareOf9Result;
  box: GannBoxResult;
  confluence: GannConfluenceResult;
  dynamicLevels: DynamicTradeLevels;
  management: TradeManagementGuidance;
  historicalMatch: HistoricalPatternMatch;

  // Gann Time Cycle Engine (Confirmation Layer Only)
  timeCycles: GannTimeCycleAnalysis;

  // Lunar Cycle Intelligence (Additional Confluence Only)
  lunarIntelligence: LunarCycleIntelligence;

  sessionInfo: {
    activeSession: string;
    isPreferredSession: boolean;
    asianRange: {
      high: number;
      low: number;
      mid: number;
      formattedRange: string;
    };
    asianSweepEvent: string | null;
    sessionTimingOk: boolean;
  };
  newsRisk: {
    hasHighImpactNewsNearby: boolean;
    minutesToEvent: number | null;
    eventName: string | null;
    newsRiskClear: boolean;
    statusText: string;
  };
  qualityGatePassed: boolean;
  rejectionReasons: string[];
  generatedTimestamp: number;
  formattedOutput: string; // exact verbatim layout for 17. OUTPUT FORMAT
}

// ════════════════════════════════════════════════════════════════
// GANN TIME CYCLE & LUNAR TIMING CONFIRMATION TYPES
// ════════════════════════════════════════════════════════════════

export type GannCycleType = '72-bar' | '90-bar' | '144-bar' | '180-bar' | '360-bar';

export interface GannTimeCycleDetail {
  cycleName: GannCycleType;
  cycleLengthBars: number; // 72, 90, 144, 180, 360
  barsElapsed: number;
  barsRemaining: number;
  completionPercent: number; // 0 - 100%
  isWindowActive: boolean; // within tolerance window (e.g. +/- 4 bars)
  timingWindow: string; // e.g. "Bars 141–147 / Next 2–4 Intraday Candles" (Never exact dates)
  potentialReactionPeriod: string; // e.g. "Current Session Turnover / Next 3–5 M15 bars"
  reactionZoneLevel: string; // e.g. "2,638.50 – 2,641.00 (Square of 9 180° / Box 0.618 Pocket)"
  momentumShiftDetected: boolean;
  momentumShiftBias: 'BULLISH_EXPANSION' | 'BEARISH_EXHAUSTION' | 'EQUILIBRIUM_REVERSAL' | 'CONSOLIDATION';
  momentumShiftDetail: string;
}

export interface GannTimeCycleAnalysis {
  majorSwingAnchor: {
    type: 'SWING_HIGH' | 'SWING_LOW';
    price: number;
    formattedPrice: string;
    barsAgo: number;
    timeframe: '15M' | '1H';
    anchorDescription: string;
  };
  cycles: GannTimeCycleDetail[];
  primaryCycle: GannTimeCycleDetail;
  timingWindow: string; // "Current 144-bar Cycle Window (Next 2–4 intraday bars)" - NO exact dates
  potentialReactionPeriod: string; // "Next 3–6 intraday bars / Current session transition"
  timeBasedMomentumShift: {
    detected: boolean;
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    description: string;
  };
  cycleConfluenceScore: number; // 0-100
  isConfirmationGranted: boolean; // Confirmation layer only
  confirmationRole: 'CONFIRMATION_ONLY';
  summaryText: string;
}

export type LunarPhase = 
  | 'NEW_MOON' 
  | 'WAXING_CRESCENT' 
  | 'FIRST_QUARTER' 
  | 'WAXING_GIBBOUS' 
  | 'FULL_MOON' 
  | 'WANING_GIBBOUS' 
  | 'LAST_QUARTER' 
  | 'WANING_CRESCENT';

export interface LunarCycleIntelligence {
  currentPhase: LunarPhase;
  phaseDisplayName: string;
  phaseSymbol: string; // 🌑, 🌓, 🌕, etc.
  illuminationPercent: number; // 0 - 100%
  daysSinceLastPhase: number;
  daysToNextKeyPhase: number;
  nextKeyPhase: 'FULL_MOON' | 'NEW_MOON';
  
  // Intelligence Analysis
  historicalVolatilityBehavior: string;
  marketExpansionPeriod: string;
  possibleReversalTiming: string; // Intraday/session cycle perspective (No predictive calendar claims)

  // Alignment Rules:
  // Must align with: Market Structure, Liquidity, Gann Levels, Momentum
  alignmentChecks: {
    marketStructureAligned: boolean;
    liquidityAligned: boolean;
    gannLevelsAligned: boolean;
    momentumAligned: boolean;
  };
  conflictsWithMarketStructure: boolean;
  
  // Rule: If timing conflicts with market structure: Ignore lunar signal.
  isIgnoredDueToStructureConflict: boolean;
  confluenceGranted: boolean;
  statusBadge: 'CONFIRMED' | 'IGNORED' | 'NEUTRAL';
  summaryRationale: string;
}

