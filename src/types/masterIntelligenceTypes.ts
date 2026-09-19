import { Timeframe } from '../types';

export type EngineType = 'SCALPING' | 'INTRADAY_GANN' | 'SWING';

export type MarketRegimeKey = 
  | 'STRONG_TREND'
  | 'WEAK_TREND'
  | 'RANGE_MARKET'
  | 'HIGH_VOLATILITY'
  | 'LOW_VOLATILITY'
  | 'LIQUIDITY_EXPANSION'
  | 'RISK_OFF_ENVIRONMENT';

export type RecommendedTradingMode = 'SCALPING' | 'INTRADAY' | 'SWING' | 'WAIT';

export type RiskEnvironmentLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface EnginePerformanceMetric {
  engine: EngineType;
  displayName: string;
  badge: string;
  totalSetups: number;
  approvedSignals: number;
  winRate: number;
  avgR: number;
  profitFactor: number;
  maxDrawdown: number;
  ranking: number;
  recommendationScore: number;
  bestConditions: string[];
  failurePatterns: string[];
  executionTimeframe: string;
  sampleTradesCount: number;
}

export interface AdaptiveRegimeState {
  regime: MarketRegimeKey;
  label: string;
  description: string;
  dominantAsset: string;
  volatilityState: 'EXPANDING' | 'NORMAL' | 'COMPRESSED';
  atrRelativePercentile: number; // e.g. 120% of typical ATR
  liquidityState: 'HIGH' | 'MODERATE' | 'POOR';
  structureIntegrity: 'CLEAN' | 'CHOPPY' | 'TRANSITIONAL';
  riskSentiment: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL';
  recommendedMode: RecommendedTradingMode;
  rationale: string;
}

export interface UnifiedTradeQualityScore {
  totalScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'REJECT';
  isHighQuality: boolean; // >= 82
  marketStructure: number; // 0-100
  liquidity: number; // 0-100
  momentum: number; // 0-100
  gannAlignment: number; // 0-100
  timeCycle: number; // 0-100
  aiAgreement: number; // 0-100
  newsRisk: number; // 0-100
  riskReward: number; // 0-100
  componentDetails: {
    marketStructureDetail: string;
    liquidityDetail: string;
    momentumDetail: string;
    gannDetail: string;
    timeCycleDetail: string;
    aiAgreementDetail: string;
    newsRiskDetail: string;
    riskRewardDetail: string;
  };
}

export interface AssetMasterIntelligence {
  assetId: string;
  symbol: string;
  name: string;
  category: string;
  currentPrice: number;
  change24h: number;
  atr14: number;
  decimals: number;
  regime: MarketRegimeKey;
  regimeLabel: string;
  bestEngine: EngineType;
  bestEngineName: string;
  bestSession: string;
  bestStrategy: string;
  historicalSuccessRate: number;
  currentDirection: 'BUY' | 'SELL' | 'WAIT';
  qualityScore: UnifiedTradeQualityScore;
  recommendedMode: RecommendedTradingMode;
  reason: string;
}

export interface SessionIntelligence {
  sessionKey: 'LONDON' | 'NEW_YORK' | 'OVERLAP' | 'ASIAN';
  displayName: string;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
  timeWindowUtc: string;
  probabilityRating: 'HIGHEST' | 'MODERATE' | 'WEAK' | 'AVOID_ZONE';
  historicalWinRate: number;
  avgPnlR: number;
  volatilityRank: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  bestAssets: string[];
  bestStrategies: string[];
  avoidReason?: string;
  notes: string;
}

export interface AiTradeMemoryRecord {
  id: string;
  setupType: string;
  marketCondition: MarketRegimeKey;
  engineUsed: EngineType;
  result: 'WIN' | 'LOSS' | 'SCRATCH';
  pnlR: number;
  session: string;
  asset: string;
  mistakePattern?: string;
  winningFactor?: string;
  timestamp: string;
}

export interface MemoryPatternCluster {
  id: string;
  type: 'WINNING_PATTERN' | 'FAILURE_PATTERN';
  name: string;
  description: string;
  conditions: string[];
  strategies: string[];
  sessions: string[];
  observedFrequency: number;
  impactOnWinRate: number; // e.g. +14% or -22%
  actionableGuidance: string;
}

export interface RiskIntelligenceStatus {
  currentDrawdownPercent: number;
  consecutiveLosses: number;
  volatilityRiskIndex: number; // 0-100
  openExposureR: number;
  activeTradesCount: number;
  maxRecommendedTrades: number;
  environmentLevel: RiskEnvironmentLevel;
  exposureStatus: 'SAFE' | 'ELEVATED' | 'OVEREXPOSED';
  riskAdvice: string;
  riskChecks: {
    name: string;
    status: 'PASS' | 'WARNING' | 'ALERT';
    detail: string;
  }[];
}

export interface MasterDecisionFlowStep {
  stepNumber: number;
  name: string;
  status: 'PASSED' | 'EVALUATED' | 'WARNING' | 'BLOCKED';
  input: string;
  output: string;
  detail: string;
}

export interface MasterDecisionOutput {
  marketCondition: string;
  recommendedMode: RecommendedTradingMode;
  topOpportunity: {
    asset: string;
    symbol: string;
    direction: 'BUY' | 'SELL' | 'WAIT';
    entryQualityScore: number;
    confidence: number;
    riskLevel: RiskEnvironmentLevel;
    bestEngine: EngineType;
    bestEngineName: string;
    entryPrice: number;
    stopLoss: number;
    tp1: number;
    tp2: number;
    riskReward: string;
    reason: string;
    isWait: boolean;
  };
  decisionFlow: MasterDecisionFlowStep[];
  timestamp: string;
  statusFormattedText: string;
}
