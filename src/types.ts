export type MarketCategory = 'commodities' | 'indices' | 'forex' | 'crypto';

export type Timeframe = '1M' | '5M' | '15M' | '30M' | '1H' | '4H' | '1D' | '1W';

export type TradingStyleMode = 'SCALPING' | 'INTRADAY' | 'SWING';

export interface TradingStyleConfig {
  mode: TradingStyleMode;
  name: string;
  badge: string;
  timeframes: Timeframe[];
  primaryTimeframe: Timeframe;
  focus: string[];
  description: string;
  strategyWeights: {
    smc: number;
    trend: number;
    breakout: number;
    liquidity: number;
    momentum: number;
    structure: number;
  };
  riskParams: {
    slDistanceMultiplier: number;
    tp1Multiplier: number;
    tp2Multiplier: number;
    avgHoldTime: string;
    recommendedRR: string;
  };
}

export type SignalType = 'BUY' | 'SELL' | 'WAIT';

export type DirectionType = 'LONG' | 'SHORT' | 'WAIT';

export type SetupQuality = 'A+' | 'A' | 'B+' | 'B';

export type SmcStructureType = 'Bullish BOS' | 'Bearish BOS' | 'Bullish CHOCH' | 'Bearish CHOCH' | 'Range Consolidation';

export type SmartMoneyPhase = 'Institutional Accumulation' | 'Order Block Mitigation' | 'Liquidity Sweep & Reversal' | 'Distribution Phase' | 'Re-accumulation';

export type EntryTimingType = 'Optimal Entry Zone' | 'Wait for Retest (Pullback)' | 'Breakout Confirmation' | 'High Risk / Extended';

export interface MarketItem {
  id: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  isOpen: boolean;
  marketStatusText: string;
  exchange: string;
  decimals: number;
  sparkline: number[];
  lastTickDirection?: 'up' | 'down';
  lastTickTimestamp?: number;
}

export interface Candle {
  time: number;
  timeLabel: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SmartMoneyConcepts {
  structure: SmcStructureType;
  orderBlock: {
    type: 'Bullish OB+' | 'Bearish OB-';
    low: number;
    high: number;
    timeframe: string;
    label: string;
    isMitigated: boolean;
  };
  liquidityZone: {
    type: 'Buy-Side Liquidity (BSL)' | 'Sell-Side Liquidity (SSL)' | 'Equal Highs/Lows (EQH/EQL)';
    price: number;
    label: string;
  };
  bos: {
    level: number;
    type: 'Bullish BOS' | 'Bearish BOS';
    status: 'Confirmed' | 'Pending';
  };
  choch: {
    level: number;
    type: 'Bullish CHOCH' | 'Bearish CHOCH';
    status: 'Confirmed' | 'Pending';
  };
  bullishOrderBlock: {
    low: number;
    high: number;
    timeframe: string;
    label: string;
    isMitigated: boolean;
  };
  bearishOrderBlock: {
    low: number;
    high: number;
    timeframe: string;
    label: string;
    isMitigated: boolean;
  };
  buySideLiquidity: {
    price: number;
    label: string;
  };
  sellSideLiquidity: {
    price: number;
    label: string;
  };
  liquiditySweep: {
    occurred: boolean;
    level: number;
    type: 'Buy-Side Sweep' | 'Sell-Side Sweep' | 'None';
    description: string;
  };
  fairValueGap?: {
    low: number;
    high: number;
    type: 'Bullish FVG' | 'Bearish FVG';
    timeframe: string;
  };
  bosLevel?: number;
  chochLevel?: number;
}

export interface TimeframeSignalCardItem {
  timeframe: '5M' | '15M' | '30M' | '1H' | '4H' | '1D' | '1W';
  direction: 'LONG' | 'SHORT' | 'WAIT';
  confidence: number; // 0-100%
  entryStatus: string; // e.g. "Optimal Entry", "Retest In Progress", "Breakout Ready"
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  trend: string;
  keyLevel: string;
}

export interface MultiTimeframeConfluence {
  timeframes: TimeframeSignalCardItem[];
  agreementCount: number; // out of 7
  totalTimeframes: number;
  verdict: string;
  alignment: 'High Confluence' | 'Moderate Confluence' | 'Mixed / Conflict';
}

export interface TechnicalIndicators {
  ema20: number;
  ema50: number;
  ema200: number;
  emaAlignment: 'Full Bullish Stack' | 'Bullish Bias' | 'Neutral / Mixed' | 'Full Bearish Stack';
  rsi: number;
  rsiCondition: 'Oversold (<30)' | 'Bullish Momentum (50-70)' | 'Neutral (40-60)' | 'Bearish Momentum (30-50)' | 'Overbought (>70)';
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    status: 'Bullish Cross' | 'Bearish Cross' | 'Bullish Divergence' | 'Bearish Divergence';
  };
  atr: number;
}

export interface AiMarketRadar {
  trendStrength: number; // 0-100
  buyersPressurePercent: number; // e.g. 74
  sellersPressurePercent: number; // e.g. 26
  smartMoneyActivity: SmartMoneyPhase;
  marketMomentum: 'Strong Bullish Expansion' | 'Bullish Momentum' | 'Range Compression' | 'Bearish Acceleration';
  entryTiming: EntryTimingType;
  setupQualityScore: SetupQuality;
}

export interface TradeSetupStrength {
  overallScore: number; // 0-100%
  grade: SetupQuality;
  verdict: string;
  trendStrength: {
    score: number; // 0-100
    label: string;
  };
  smcStructure: {
    score: number; // 0-100
    label: string;
  };
  orderBlockValidity: {
    score: number; // 0-100
    label: string;
  };
  liquidityConfirmation: {
    score: number; // 0-100
    label: string;
  };
  momentum: {
    score: number; // 0-100
    label: string;
  };
}

export interface SignalHistoryItem {
  id: string;
  marketId: string;
  symbol: string;
  name: string;
  type: SignalType;
  direction: DirectionType;
  timeframe: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  result: 'TP HIT' | 'SL HIT';
  pnlR: string; // e.g. "+3.4R", "+2.8R", "-1.0R"
  pnlPercent: number; // e.g. +1.62% or -0.68%
  closedAt: string;
  duration: string;
  reason: string;
  setupScore: number;
  decimals: number;
}

export interface SignalHistoryStats {
  winRate: number;
  totalTrades: number;
  wonTrades: number;
  lostTrades: number;
  totalPnlR: string;
  profitFactor: number;
  avgRiskReward: string;
  netPips: number;
}

export interface AiTradeSignal {
  id: string;
  marketId: string;
  symbol: string;
  name: string;
  type: SignalType;
  direction: DirectionType;
  entryZone: {
    min: number;
    max: number;
    optimal: number;
  };
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  takeProfit2: number;
  riskReward: string;
  timeframe: string;
  confidenceScore: number;
  marketReason: string;
  keyFactors: string[];
  trend: 'Strong Bullish' | 'Bullish' | 'Range Consolidation' | 'Bearish' | 'Strong Bearish';
  supportLevels: number[];
  resistanceLevels: number[];
  smc: SmartMoneyConcepts;
  radar: AiMarketRadar;
  setupStrength?: TradeSetupStrength;
  multiTimeframe: MultiTimeframeConfluence;
  technicals: TechnicalIndicators;
  bullishBearishReasoning: {
    bullishFactors: string[];
    bearishRisks: string[];
    invalidationTrigger: string;
    aiVerdict: string;
  };
  status: 'ACTIVE' | 'EXECUTED' | 'TARGET_REACHED' | 'WAITING_TRIGGER';
  generatedAt: string;
}

export interface TelegramLogItem {
  id: string;
  timestamp: string;
  signalSymbol: string;
  signalType: SignalType;
  messagePreview: string;
  status: 'DELIVERED' | 'QUEUED' | 'FAILED';
}

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  channelTag: string;
  autoBroadcast: boolean;
  minConfidence: number;
  isConnected: boolean;
  enabled: boolean;
  sentCountToday: number;
  sentKeys: string[];
  history: TelegramLogItem[];
}

export type EventCategory = 'CPI' | 'NFP' | 'FOMC' | 'RATES' | 'GDP' | 'PPI' | 'RETAIL';
export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type MarketReactionType = 'Bullish' | 'Bearish' | 'Neutral';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface EconomicEvent {
  id: string;
  eventName: string;
  category: EventCategory;
  currency: string;
  impact: ImpactLevel;
  dateTime: string;
  formattedTime: string;
  source: 'Forex Factory' | 'Investing.com' | 'Trading Economics';
  forecast: string;
  previous: string;
  actual: string | null;
  isUpcoming: boolean;
  minutesUntil: number;
  tradingBlocked: boolean;
}

export interface HistoricalEventAnalysis {
  id: string;
  eventName: string;
  eventDate: string;
  year: number;
  category: EventCategory;
  beforeNews: {
    marketTrend: string;
    pricePosition: string;
    volatility: string;
  };
  afterNews: {
    xauusdReaction: string;
    nasdaqReaction: string;
    sp500Reaction: string;
    oilReaction: string;
  };
  overallReaction: MarketReactionType;
  keyTakeaway: string;
}

export interface AssetImpactDetail {
  assetId: string;
  symbol: string;
  name: string;
  expectedDirection: MarketReactionType;
  priceTarget: string;
  rationale: string;
}

export interface AiNewsPrediction {
  id: string;
  eventId: string;
  eventName: string;
  expectedImpact: MarketReactionType;
  riskLevel: RiskLevel;
  summary: string;
  affectedAssets: {
    gold: AssetImpactDetail;
    nasdaq: AssetImpactDetail;
    sp500: AssetImpactDetail;
    oil: AssetImpactDetail;
  };
}

export interface CompositeAiScore {
  technicalScore: number; // 0-100
  smcScore: number; // 0-100
  momentumScore: number; // 0-100
  newsImpactScore: number; // 0-100
  finalScore: number; // 0-100
  finalDecision: 'BUY' | 'SELL' | 'WAIT';
  isNewsBlocked: boolean;
  blockReason?: string;
}

export interface StrategyPerformanceItem {
  id: string;
  strategyName: string;
  shortCode: string;
  winRate: number;
  avgRiskReward: string;
  successfulConditions: string[];
  failedConditions: string[];
  confidenceWeight: number;
  totalSignalsTested: number;
  grade: 'A+' | 'A' | 'B+';
}

export interface AssetBacktestSummary {
  assetId: string;
  symbol: string;
  name: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  bestTimeframe: string;
  totalRMultiple: string;
  maxDrawdown: string;
  testedPeriod: string;
  equityCurvePoints: number[];
}

export interface AiLearningStatusData {
  statusText: string;
  learningTasks: {
    improvingModels: string;
    updatingStrategyWeights: string;
    learningFromOutcomes: string;
  };
  lastEpochTimestamp: string;
  totalDatasetSize: string;
  topConfidenceStrategy: string;
}

export type TradeSetupGrade = 'A+ Setup' | 'A Setup' | 'B Setup' | 'Avoid Trade';

export interface QualityFilterCheck {
  strategyAlignment: { passed: boolean; label: string; detail: string };
  multiTimeframeConfirmation: { passed: boolean; label: string; detail: string };
  newsRisk: { passed: boolean; label: string; detail: string };
  volatilityCondition: { passed: boolean; label: string; detail: string };
  liquidityCondition: { passed: boolean; label: string; detail: string };
  riskRewardRatio: { passed: boolean; label: string; detail: string };
}

export interface RiskManagementPanelData {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  entryConfidence: string;
  stopLossQuality: string;
  takeProfitProbability: string;
  riskReward: string;
  recommendedPositionSize: string;
}

export interface NoTradeZoneStatus {
  isNoTradeZone: boolean;
  title: string;
  reasons: string[];
}

export interface AssetStrategyWeight {
  smc: number;
  trend: number;
  liquidity: number;
  momentum: number;
  rationale: string;
}

export interface AurumFinalVerdict {
  decision: 'BUY' | 'SELL' | 'WAIT';
  confidence: number;
  setupGrade: TradeSetupGrade;
  scores: {
    technicalScore: number;
    smcScore: number;
    momentumScore: number;
    newsScore: number;
    riskScore: number;
    totalComposite: number;
  };
  verdictReason: string;
  qualityFilter: QualityFilterCheck;
  riskPanel: RiskManagementPanelData;
  noTradeZone: NoTradeZoneStatus;
}

export interface AssetAiProfile {
  assetId: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  volatilityBehavior: {
    level: 'HIGH' | 'MEDIUM' | 'LOW' | 'EXTREME';
    adrText: string;
    description: string;
    speedOfExpansion: 'Rapid / Impulsive' | 'Steady Trend' | 'Range Mean-Reverting' | 'Breakout Prone';
  };
  bestTradingSessions: {
    primary: string;
    secondary: string;
    recommendedHoursUtc: string;
    sessionNote: string;
  };
  strategyWeightAdjustment: {
    scalping: AssetStrategyWeight;
    intraday: AssetStrategyWeight;
    swing: AssetStrategyWeight;
  };
  newsSensitivity: {
    level: 'ULTRA' | 'HIGH' | 'MEDIUM' | 'LOW';
    keyCatalysts: string[];
    riskReaction: string;
    blackoutMinutesBefore: number;
    blackoutMinutesAfter: number;
  };
  preferredTimeframe: {
    scalping: Timeframe;
    intraday: Timeframe;
    swing: Timeframe;
    primaryConfluence: string;
  };
  institutionBehavior: string;
  defaultMode: TradingStyleMode;
}

export interface MarketRankingItem {
  rank: number;
  assetId: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  signal: SignalType;
  confidence: number;
  setupGrade: SetupQuality;
  bestTradingMode: TradingStyleMode;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: string;
  aiVerdictSummary: string;
  volatilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'EXTREME';
  bestSession: string;
  keyCatalyst: string;
  badge: string;
}

// 1. AI Alert Center Types
export interface AiAlert {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  signal: SignalType;
  tradingMode: TradingStyleMode;
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  takeProfit2?: number;
  aiReason: string;
  timestamp: string;
  read: boolean;
  urgency: 'HIGH' | 'MEDIUM';
  setupGrade: SetupQuality;
}

// 2. Signal Lifecycle Timeline Types
export type SignalLifecycleStageId = 
  | 'SETUP_DETECTED' 
  | 'CONFIRMATION_WAITING' 
  | 'ENTRY_READY' 
  | 'TRADE_ACTIVE' 
  | 'TP_HIT' 
  | 'SL_HIT';

export interface SignalLifecycleStage {
  id: SignalLifecycleStageId;
  label: string;
  time: string;
  status: 'completed' | 'active' | 'pending';
  priceAtStage: number;
  description: string;
  keyCriterion: string;
}

export interface SignalLifecycleData {
  assetId: string;
  symbol: string;
  currentStage: SignalLifecycleStageId;
  currentStageIndex: number;
  progressPercent: number;
  statusText: string;
  pnlPips: number;
  pnlPercent: number;
  stages: SignalLifecycleStage[];
  summaryNote: string;
}

// 3. Daily AI Market Brief Types
export interface DailyBriefOpportunity {
  assetId: string;
  symbol: string;
  direction: SignalType;
  confidence: number;
  tradingMode: TradingStyleMode;
  keyLevels: string;
  thesis: string;
  grade: SetupQuality;
}

export interface DailyBriefRiskArea {
  warning: string;
  affectedAssets: string[];
  severity: 'HIGH' | 'MEDIUM';
  action: string;
}

export interface DailyBriefNewsImpact {
  event: string;
  impact: 'HIGH' | 'MEDIUM';
  time: string;
  takeaway: string;
}

export interface DailyMarketBriefData {
  date: string;
  marketTrend: {
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    headline: string;
    summary: string;
    dxyImpact: string;
    riskScore: number;
  };
  bestOpportunities: DailyBriefOpportunity[];
  riskAreas: DailyBriefRiskArea[];
  majorNewsImpact: DailyBriefNewsImpact[];
  preferredTradingMode: {
    mode: TradingStyleMode;
    reason: string;
    recommendedSession: string;
    riskBudget: string;
  };
}

// 4. AI Confidence Breakdown Types
export interface AiConfidenceBreakdownData {
  smcConfirmationPercent: number;
  trendAlignmentPercent: number;
  liquidityConfirmationPercent: number;
  momentumPercent: number;
  newsSafetyPercent: number;
  finalConfidenceScore: number;
}

// 5. Smart Trade Approval Checklist Types
export interface TradeChecklistItem {
  key: string;
  label: string;
  passed: boolean;
  value: string;
  detail: string;
}

export interface SmartTradeApprovalResult {
  assetId: string;
  symbol: string;
  status: 'TRADE APPROVED' | 'NO TRADE';
  isApproved: boolean;
  approvalScore: number;
  items: TradeChecklistItem[];
  timestamp: string;
  rationale: string;
}

// 6. AI Backtest Performance Report Types
export interface AiBacktestPerformanceReportData {
  bestTradingMode: TradingStyleMode;
  bestTradingModeWinRate: number;
  bestAssetId: string;
  bestAssetSymbol: string;
  bestAssetName: string;
  bestAssetPerformanceNote: string;
  bestStrategyName: string;
  bestStrategyWinRate: number;
  overallWinRate: number;
  averageRiskReward: string;
  maxDrawdown: string;
  totalTestedTrades: number;
  testedPeriod: string;
}

// 7. Real Data Integration Architecture Types
export type RealDataChannelType = 'PRICE_FEED' | 'CANDLE_DATA' | 'ECONOMIC_CALENDAR' | 'NEWS_FEED' | 'WEBSOCKET_STREAM';

export interface RealDataChannelStatus {
  channel: RealDataChannelType;
  name: string;
  endpoint: string;
  protocol: 'WSS' | 'HTTPS' | 'REST' | 'GRPC';
  status: 'CONNECTED' | 'SYNCHRONIZED' | 'STANDBY' | 'PAUSED';
  latencyMs: number;
  lastHeartbeat: string;
  itemsProcessedPerSec: number;
  description: string;
}

export interface RealDataIntegrationConfig {
  wsEndpoint: string;
  restEndpoint: string;
  economicCalendarUrl: string;
  newsStreamUrl: string;
  autoReconnect: boolean;
  reconnectIntervalMs: number;
  dataProvider: 'AURUM_INSTITUTIONAL_CORE' | 'METATRADER_BRIDGE' | 'BINANCE_WS' | 'OANDA_REST';
}

// ==========================================
// PRODUCTION ARCHITECTURE TYPES
// ==========================================

// 1. AI Engine Connection Layer Types
export interface TechnicalIndicatorsInput {
  rsi: number;
  ema20: number;
  ema50: number;
  ema200: number;
  macdHist: number;
  volumeDelta: number;
}

export interface NewsSentimentInput {
  nlpScore: number;
  hawkDoveRatio: number;
  latestHeadline: string;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AiEngineInput {
  market: MarketItem;
  candles: Candle[];
  technicalIndicators: TechnicalIndicatorsInput;
  smcAnalysis: SmartMoneyConcepts;
  newsSentiment: NewsSentimentInput;
  tradingStyleMode: TradingStyleMode;
  timeframe: Timeframe;
}

export interface AiEngineOutput {
  decision: 'BUY' | 'SELL' | 'WAIT';
  entry: number;
  stopLoss: number;
  takeProfit: {
    tp1: number;
    tp2: number;
    tp3: number;
  };
  confidenceScore: number;
  riskRewardRatio: string;
  confluenceFactors: string[];
  rationale: string;
  setupQuality: SetupQuality;
  timestamp: string;
  executionLatencyMs: number;
}

// 2. Database Storage Layer Types
export interface AiSignalRecord {
  id: string;
  assetId: string;
  symbol: string;
  category: MarketCategory;
  decision: 'BUY' | 'SELL' | 'WAIT';
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  confidenceScore: number;
  timeframe: Timeframe;
  tradingMode: TradingStyleMode;
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  result?: 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'EXPIRED';
  netR?: number;
  timestamp: string;
}

export interface SignalResultRecord {
  id: string;
  signalId: string;
  assetId: string;
  symbol: string;
  result: 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'EXPIRED';
  entryPrice: number;
  exitPrice: number;
  pnlR: number;
  pnlPercent: number;
  closeTimestamp: string;
}

export interface StrategyPerformanceRecord {
  strategyId: string;
  strategyName: string;
  totalSignals: number;
  wins: number;
  losses: number;
  winRatePercent: number;
  averageRR: string;
  profitFactor: number;
  maxDrawdownPercent: number;
  netRPnl: number;
}

export interface UserWatchlistRecord {
  userId: string;
  favoriteAssetIds: string[];
  lastUpdated: string;
}

export interface DatabaseExportSchema {
  version: string;
  exportedAt: string;
  signals: AiSignalRecord[];
  results: SignalResultRecord[];
  strategyStats: StrategyPerformanceRecord[];
  watchlists: UserWatchlistRecord[];
}

// 3. User System & Auth Types
export type UserAccountTier = 'FREE' | 'VIP_ELITE' | 'INSTITUTIONAL_PRO';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  accountTier: UserAccountTier;
  createdAt: string;
  apiKey: string;
  webhookSecret: string;
}

export interface UserAlertSettings {
  telegramEnabled: boolean;
  telegramChatId: string;
  minConfidenceThreshold: number;
  soundAlerts: boolean;
  desktopNotifications: boolean;
  maxRiskPerTradePercent: number;
  autoExecuteTrades: boolean;
  preferredTradingModes: TradingStyleMode[];
}

export interface AuthSession {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}






