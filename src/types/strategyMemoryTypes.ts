export type MarketRegimeType = 
  | 'TRENDING'
  | 'RANGING'
  | 'NEWS_DRIVEN'
  | 'HIGH_VOLATILITY'
  | 'LOW_LIQUIDITY';

export type VolatilityStateType = 'HIGH' | 'EXTREME' | 'NORMAL' | 'COMPRESSED';

export type TradingSessionType = 
  | 'LONDON_OPEN'
  | 'NY_OPEN'
  | 'ASIA_PACIFIC'
  | 'NY_LONDON_OVERLAP'
  | 'NY_CLOSE';

export type StrategyApproachMethod =
  | 'LIQUIDITY_CONFIRMATION'
  | 'WAIT_CONFIRMATION'
  | 'SMC_CONTINUATION'
  | 'MEAN_REVERSION'
  | 'BREAKOUT_CONTINUATION'
  | 'TREND_PULLBACK'
  | 'MOMENTUM_CHASE';

export interface StrategyMemoryRecord {
  id: string;
  timestamp: string;
  asset: string;
  marketRegime: MarketRegimeType;
  newsEnvironment: string;
  volatilityState: VolatilityStateType;
  session: TradingSessionType;
  smcCondition: string;
  macroCondition: string;
  approachUsed: StrategyApproachMethod;
  prediction: string;
  targetPrice?: number;
  invalidationPrice?: number;
  outcome: 'SUCCESS' | 'FAILURE' | 'BE_OR_PARTIAL';
  outcomePnlR: number;
  outcomeNotes: string;
  actualAccuracyContribution: number;
}

export interface MethodPerformanceRanking {
  rank: number;
  method: StrategyApproachMethod;
  methodName: string;
  accuracy: number;
  sampleSize: number;
  wins: number;
  losses: number;
  breakevens: number;
  avgRiskReward: number;
  profitFactor: number;
  verdict: 'HIGHLY_RECOMMENDED' | 'VIABLE_WITH_CAUTION' | 'NOT_RECOMMENDED' | 'AVOID';
  reasoning: string;
}

export interface MarketConditionPlaybook {
  marketRegime: MarketRegimeType;
  title: string;
  recommendedBehaviour: string;
  avoid: string;
  focus: string;
  invalidationRules: string[];
  optimalSessions: string[];
  executionSpeed: 'PATIENT_WAIT' | 'DISCIPLINED_RETEST' | 'MOMENTUM_CONFIRMATION' | 'FAST_SCALP';
  riskToleranceMultiplier: number;
}

export interface RegimeLearningModel {
  regime: MarketRegimeType;
  displayName: string;
  description: string;
  totalCases: number;
  overallWinRate: number;
  primaryCharacteristics: string[];
  methodRankings: MethodPerformanceRanking[];
  playbook: MarketConditionPlaybook;
}

export interface AdaptiveWeightAdjustment {
  baselineWeights: {
    smc: number;
    macro: number;
    news: number;
    liquidity: number;
  };
  adaptedWeights: {
    smc: number;
    macro: number;
    news: number;
    liquidity: number;
  };
  sampleCount: number;
  statisticallySignificant: boolean;
  significanceThreshold: number;
  pValue: number;
  adaptationRationale: string;
  activeEnvironmentContext: string;
}

export interface LearningReliability {
  sampleCasesCount: number;
  confidenceScore: number;
  reliabilityTier: 'INSTITUTIONAL_HIGH' | 'ROBUST' | 'PRELIMINARY' | 'EXPERIMENTAL';
  sampleDepthRating: number;
  regimeStabilityScore: number;
  methodConsistencyScore: number;
  crossValidationScore: number;
  insights: string[];
}

export interface QuickCommandSummary {
  command: 'CMD: STRATEGY MEMORY';
  currentEnvironment: string;
  bestHistoricalApproach: {
    name: string;
    method: StrategyApproachMethod;
    accuracy: number;
    sampleSize: number;
    avgRR: string;
    verdict: string;
  };
  worstPerformingApproach: {
    name: string;
    method: StrategyApproachMethod;
    accuracy: number;
    sampleSize: number;
    avgRR: string;
    verdict: string;
  };
  successRate: number;
  learningNotes: string[];
}

export interface StrategyMemoryFullState {
  currentEnvironment: {
    regime: MarketRegimeType;
    regimeLabel: string;
    volatilityState: VolatilityStateType;
    newsEnvironment: string;
    session: TradingSessionType;
    smcCondition: string;
    macroCondition: string;
    activeAsset: string;
    goldPrice: number;
    dxyIndex: number;
  };
  quickCommandSummary: QuickCommandSummary;
  regimes: Record<MarketRegimeType, RegimeLearningModel>;
  weights: AdaptiveWeightAdjustment;
  reliability: LearningReliability;
  playbooks: Record<MarketRegimeType, MarketConditionPlaybook>;
  memoryDatabase: StrategyMemoryRecord[];
}
