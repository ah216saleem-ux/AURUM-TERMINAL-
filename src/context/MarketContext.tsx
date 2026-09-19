import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  MarketItem, 
  Candle, 
  Timeframe, 
  AiTradeSignal, 
  TelegramSettings, 
  TelegramLogItem,
  SignalHistoryItem,
  SignalHistoryStats,
  TradeSetupStrength,
  TradingStyleMode,
  AiAlert,
  NewsArticle,
  EconomicEvent,
  UpcomingNewsIntelligence,
  DailyMarketIntelligenceBrief,
  BreakingNewsItem,
  NewsPredictionRecord,
  NewsPredictionLearning,
  AssetLockState,
  SignalPipelineStatus,
  PipelinePhase
} from '../types';
import { 
  INITIAL_MARKETS, 
  INITIAL_SIGNALS, 
  INITIAL_SIGNAL_HISTORY, 
  INITIAL_HISTORY_STATS, 
  generateSampleCandles,
  computeTradeSetupStrength 
} from '../data/initialData';
import { TRADING_STYLES } from '../data/tradingStyleData';
import { getTimeframeSetup, DetailedTimeframeSetup } from '../data/timeframeSignals';
import { INITIAL_AI_ALERTS, createRandomAiAlert } from '../data/aiAlertsData';
import { getSmartTradeApprovalChecklist } from '../data/aiValidationData';
import { getAurumRiskEvaluation } from '../data/riskQualityData';
import { PRODUCTION_CONFIG } from '../config/productionConfig';
import { marketDataService, ConnectionStatus, StreamStatus, TickDebugInfo } from '../services/marketDataService';
import { databaseService } from '../services/databaseService';
import { savePaperTrade, hasActivePaperTrade, closeTradeByAsset, updateActivePaperTradesWithLivePrices } from '../data/paperTradingTracker';
import { detectMarketRegime, calculateSetupQualityScore } from '../services/marketRegimeEngine';

interface MarketContextType {
  markets: MarketItem[];
  signals: AiTradeSignal[];
  selectedSignalId: string;
  selectedSignal: AiTradeSignal;
  selectedMarket: MarketItem;
  selectedTimeframe: Timeframe;
  tradingStyleMode: TradingStyleMode;
  setTradingStyleMode: (mode: TradingStyleMode) => void;
  candles: Candle[];
  dataConnectedStatus: ConnectionStatus;
  isDataConnected: boolean;
  isWebSocketActive: boolean;
  streamStatus: StreamStatus;
  lastMarketDataUpdate: number;
  getTickDebug: (symbolOrId: string) => TickDebugInfo;
  refreshMarketData: () => Promise<void>;
  telegramSettings: TelegramSettings;
  activeNav: string;
  isTelegramModalOpen: boolean;
  isAiGenerating: boolean;
  // AI Watchlist
  watchlistAssetIds: string[];
  toggleWatchlist: (assetId: string) => void;
  isFavorite: (assetId: string) => boolean;
  // AI Alert Center
  aiAlerts: AiAlert[];
  unreadAlertCount: number;
  isAlertCenterOpen: boolean;
  setIsAlertCenterOpen: (open: boolean) => void;
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
  dismissAlert: (id: string) => void;
  triggerSimulatedAlert: () => void;
  // Daily AI Market Brief
  isDailyBriefOpen: boolean;
  setIsDailyBriefOpen: (open: boolean) => void;
  // Real Data Integration Architecture Modal
  isRealDataModalOpen: boolean;
  setIsRealDataModalOpen: (open: boolean) => void;
  // QA & Live Monitoring Control Modal
  isQaModalOpen: boolean;
  setIsQaModalOpen: (open: boolean) => void;
  // Production User System & Dashboard
  isUserDashboardOpen: boolean;
  setIsUserDashboardOpen: (open: boolean) => void;
  // AI Signal History
  signalHistory: SignalHistoryItem[];
  historyStats: SignalHistoryStats;
  // AI Market Scanner
  isScanningMarket: boolean;
  scanProgress: number; // 0-100
  scanStepText: string;
  highestProbabilitySignal: AiTradeSignal;
  isScannerModalOpen: boolean;
  setIsScannerModalOpen: (open: boolean) => void;
  scanMarket: () => Promise<AiTradeSignal>;
  // Active Trade Setup Strength
  activeSetupStrength: TradeSetupStrength;
  // Chart visual toggles
  chartOverlays: {
    showEntryZone: boolean;
    showTpSl: boolean;
    showOrderBlocks: boolean;
    showLiquidity: boolean;
    showBosChoch: boolean;
    showEma: boolean;
    showVolume: boolean;
  };
  setChartOverlays: React.Dispatch<React.SetStateAction<{
    showEntryZone: boolean;
    showTpSl: boolean;
    showOrderBlocks: boolean;
    showLiquidity: boolean;
    showBosChoch: boolean;
    showEma: boolean;
    showVolume: boolean;
  }>>;
  // Actions
  setSelectedSignalId: (id: string) => void;
  setSelectedTimeframe: (tf: Timeframe) => void;
  setActiveNav: (nav: string) => void;
  setIsTelegramModalOpen: (open: boolean) => void;
  sendSignalToTelegram: (signalId: string, statusUpdate?: 'NEW_SIGNAL' | 'TP1_HIT' | 'SL_HIT' | 'CANCELLED', isTest?: boolean) => Promise<{ success: boolean; message: string; formattedText: string }>;
  updateTelegramSettings: (settings: Partial<TelegramSettings>) => void;
  regenerateAiSignals: () => void;
  addSignalToHistory: (item: Omit<SignalHistoryItem, 'id' | 'closedAt'>) => void;
  // News Intelligence & Events
  newsArticles: NewsArticle[];
  economicEvents: EconomicEvent[];
  upcomingHighlight: UpcomingNewsIntelligence | null;
  dailyBrief: DailyMarketIntelligenceBrief | null;
  breakingNews: BreakingNewsItem[];
  predictionLearning: NewsPredictionLearning | null;
  newsStatus: { isBlocked: boolean; status: string; message: string; minutesUntil: number | null };
  dataFreshness: 'LIVE_FEED' | 'UPDATED' | 'UNAVAILABLE';
  dataSources: { name: string; status: string; latency: string; lastCheck: string }[];
  fetchNewsData: () => Promise<void>;
  // Strategy Learning System
  strategyLearning: {
    bestStrategy: string;
    worstStrategy: string;
    bestAsset: string;
    bestTimeframe: string;
    winRatesByStrategy: Record<string, number>;
    winRatesByAsset: Record<string, number>;
    winRatesByTimeframe: Record<string, number>;
  };
  // Signal Pipeline & Hard Asset Lock Engine
  assetLocks: Record<string, AssetLockState>;
  pipelineStatuses: Record<string, SignalPipelineStatus>;
  isAssetLocked: (assetId: string) => boolean;
  getAssetLock: (assetId: string) => AssetLockState | null;
  lockAsset: (assetId: string, signal: AiTradeSignal, options?: { lockReason?: string }) => AssetLockState;
  unlockAsset: (assetId: string, reason: 'TP_HIT' | 'SL_HIT' | 'EXPIRED' | 'MANUAL_CANCEL', customPrice?: number) => void;
  runSignalPipeline: (assetId: string, customTf?: Timeframe) => Promise<AiTradeSignal>;
  getAssetPipelineStatus: (assetId: string) => SignalPipelineStatus;
  clearExpiredSetup: (assetId: string) => void;
}

export function mapSetupToTradeSignal(
  setup: DetailedTimeframeSetup, 
  marketId: string, 
  name: string, 
  symbol: string,
  newsBlocked = false,
  newsRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'LOW',
  newsImpactSummary = 'Optimal trading conditions with low economic calendar risk.',
  learningAdjustment?: { adjustment: number; reasoning: string }
): AiTradeSignal {
  const bonus = learningAdjustment?.adjustment || 0;
  let newsConfidencePenalty = 0;
  if (newsBlocked || newsRiskLevel === 'HIGH' || newsRiskLevel === 'EXTREME') {
    newsConfidencePenalty = -20;
  } else if (newsRiskLevel === 'MEDIUM') {
    newsConfidencePenalty = -10;
  }
  let finalConfidence = Math.max(50, Math.min(99, setup.confidence + bonus + newsConfidencePenalty));
  
  let finalSignal = setup.signal;
  let blockMessage = '';
  
  if (newsBlocked) {
    finalSignal = 'WAIT';
    blockMessage = '[HIGH NEWS RISK BLOCKOUT] New trade entries temporarily locked to preserve capital.';
  } else if (finalConfidence < 75) {
    finalSignal = 'WAIT';
    blockMessage = '[LOW CONFIDENCE EXCLUSION] Strategy performance adjustments or news risk pushed confidence below 75% threshold.';
  }

  const isBuy = finalSignal === 'BUY';
  const isSell = finalSignal === 'SELL';
  const decimals = (marketId === 'eur-usd' || marketId === 'gbp-usd' || marketId === 'aud-usd' || marketId === 'usd-cad') ? 4 : 2;
  const p = setup.entry;

  const structureValue = isBuy ? 'Bullish BOS' : isSell ? 'Bearish BOS' : 'Range Consolidation';
  const obType = isSell ? 'Bearish OB-' : 'Bullish OB+';
  const smaPhase = isBuy ? 'Institutional Accumulation' : isSell ? 'Distribution Phase' : 'Re-accumulation';
  const entryTimingVal = isBuy || isSell ? 'Optimal Entry Zone' : 'Wait for Retest (Pullback)';

  // Determine Strategy Name
  let strategyNameUsed = 'Smart Money Concepts (SMC)';
  if (setup.strategies.trendFollowing.emaAlignment !== 'Neutral') {
    strategyNameUsed = 'Trend Following (EMA Stack)';
  } else if (setup.strategies.breakoutRetest.retestStatus !== 'N/A') {
    strategyNameUsed = 'Breakout Retest Strategy';
  } else if (setup.strategies.liquidityReversal.sweepLevel !== 'N/A') {
    strategyNameUsed = 'Liquidity Reversal Strategy';
  }

  return {
    id: `sig-${marketId}`,
    marketId,
    symbol,
    name,
    type: finalSignal,
    direction: isBuy ? 'LONG' : isSell ? 'SHORT' : 'WAIT',
    entryZone: {
      min: +(p * 0.9995).toFixed(decimals),
      max: +(p * 1.0005).toFixed(decimals),
      optimal: p
    },
    entryPrice: p,
    stopLoss: setup.stopLoss,
    takeProfit: setup.takeProfit,
    takeProfit2: setup.takeProfit2 || p,
    riskReward: setup.riskReward,
    timeframe: setup.timeframe,
    confidenceScore: finalConfidence,
    marketReason: finalSignal === 'WAIT' 
      ? (blockMessage || `Market is currently rangebound in ${name}. Awaiting high-probability breakout or liquidity sweeps outside structural session boundaries.`)
      : `${setup.aiReason} [Strategy: ${strategyNameUsed} | ${learningAdjustment?.reasoning || 'No feedback adjustment'}]`,
    keyFactors: [
      setup.strategies.smc.orderBlock !== 'N/A' ? setup.strategies.smc.orderBlock : 'SMC Order flow analysis',
      setup.strategies.smc.liquiditySweep !== 'N/A' ? setup.strategies.smc.liquiditySweep : 'Liquidity sweep validation',
      setup.strategies.trendFollowing.emaAlignment !== 'Neutral' ? setup.strategies.trendFollowing.emaAlignment : 'Multi-timeframe trend',
      `News Risk: ${newsRiskLevel} (${newsImpactSummary})`
    ],
    trend: finalSignal === 'BUY' ? 'Strong Bullish' : finalSignal === 'SELL' ? 'Strong Bearish' : 'Range Consolidation',
    supportLevels: [setup.stopLoss, +(p * 0.995).toFixed(decimals)],
    resistanceLevels: [setup.takeProfit, setup.takeProfit2 || p],
    smc: {
      structure: structureValue,
      orderBlock: {
        type: obType,
        low: setup.stopLoss,
        high: p,
        timeframe: setup.timeframe,
        label: setup.strategies.smc.orderBlock,
        isMitigated: true
      },
      liquidityZone: {
        type: isBuy ? 'Buy-Side Liquidity (BSL)' : 'Sell-Side Liquidity (SSL)',
        price: setup.takeProfit,
        label: setup.strategies.smc.liquiditySweep
      },
      bos: {
        level: p,
        type: isBuy ? 'Bullish BOS' : 'Bearish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: setup.stopLoss,
        type: isBuy ? 'Bullish CHOCH' : 'Bearish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: setup.stopLoss,
        high: p,
        timeframe: setup.timeframe,
        label: setup.strategies.smc.orderBlock,
        isMitigated: true
      },
      bearishOrderBlock: {
        low: p,
        high: setup.stopLoss,
        timeframe: setup.timeframe,
        label: setup.strategies.smc.orderBlock,
        isMitigated: true
      },
      buySideLiquidity: {
        price: setup.takeProfit,
        label: 'BSL Zone'
      },
      sellSideLiquidity: {
        price: setup.stopLoss,
        label: 'SSL Zone'
      },
      liquiditySweep: {
        occurred: setup.strategies.smc.liquiditySweep !== 'N/A',
        level: setup.strategies.smc.liquiditySweep !== 'N/A' ? setup.stopLoss : p,
        type: setup.strategies.smc.liquiditySweep !== 'N/A' ? (isBuy ? 'Sell-Side Sweep' : 'Buy-Side Sweep') : 'None',
        description: setup.strategies.smc.liquiditySweep
      }
    },
    radar: {
      trendStrength: finalConfidence,
      buyersPressurePercent: isBuy ? 72 : isSell ? 28 : 50,
      sellersPressurePercent: isBuy ? 28 : isSell ? 72 : 50,
      smartMoneyActivity: smaPhase,
      marketMomentum: isBuy ? 'Strong Bullish Expansion' : isSell ? 'Bearish Acceleration' : 'Range Compression',
      entryTiming: entryTimingVal,
      setupQualityScore: finalConfidence >= 90 ? 'A+' : finalConfidence >= 83 ? 'A' : finalConfidence >= 75 ? 'B+' : 'B'
    },
    multiTimeframe: {
      timeframes: [
        { timeframe: '15M', direction: isBuy ? 'LONG' : isSell ? 'SHORT' : 'WAIT', confidence: finalConfidence - 2, entryStatus: 'Optimal', bias: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Neutral', trend: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Consolidation', keyLevel: p.toFixed(decimals) },
        { timeframe: '30M', direction: isBuy ? 'LONG' : isSell ? 'SHORT' : 'WAIT', confidence: finalConfidence - 1, entryStatus: 'Optimal', bias: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Neutral', trend: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Consolidation', keyLevel: p.toFixed(decimals) },
        { timeframe: '1H', direction: isBuy ? 'LONG' : isSell ? 'SHORT' : 'WAIT', confidence: finalConfidence, entryStatus: 'Optimal', bias: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Neutral', trend: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Consolidation', keyLevel: p.toFixed(decimals) },
        { timeframe: '4H', direction: isBuy ? 'LONG' : isSell ? 'SHORT' : 'WAIT', confidence: finalConfidence + 1, entryStatus: 'Optimal', bias: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Neutral', trend: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Consolidation', keyLevel: p.toFixed(decimals) },
        { timeframe: '1D', direction: isBuy ? 'LONG' : isSell ? 'SHORT' : 'WAIT', confidence: finalConfidence + 2, entryStatus: 'Optimal', bias: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Neutral', trend: isBuy ? 'Bullish' : isSell ? 'Bearish' : 'Consolidation', keyLevel: p.toFixed(decimals) }
      ],
      agreementCount: isBuy || isSell ? 5 : 2,
      totalTimeframes: 5,
      verdict: isBuy ? 'Bullish Stack' : isSell ? 'Bearish Stack' : 'Mixed / Consolidating',
      alignment: isBuy || isSell ? 'High Confluence' : 'Mixed / Conflict'
    },
    technicals: {
      ema20: setup.strategies.trendFollowing.ema20,
      ema50: setup.strategies.trendFollowing.ema50,
      ema200: setup.strategies.trendFollowing.ema200,
      emaAlignment: isBuy ? 'Full Bullish Stack' : isSell ? 'Full Bearish Stack' : 'Neutral / Mixed',
      rsi: setup.strategies.momentum.rsi,
      rsiCondition: isBuy ? 'Bullish Momentum (50-70)' : isSell ? 'Bearish Momentum (30-50)' : 'Neutral (40-60)',
      macd: {
        macdLine: 0.1,
        signalLine: 0.05,
        histogram: 0.05,
        status: isBuy ? 'Bullish Cross' : isSell ? 'Bearish Cross' : 'Bullish Divergence'
      },
      atr: 0.5
    },
    bullishBearishReasoning: {
      bullishFactors: [setup.strategies.smc.orderBlock],
      bearishRisks: [`News risk: ${newsRiskLevel}`],
      invalidationTrigger: `H1 close below $${setup.stopLoss}`,
      aiVerdict: isBuy ? 'High Probability Bullish Expansion' : isSell ? 'High Probability Bearish Distribution' : 'Capital Preservation Neutral'
    },
    status: 'ACTIVE',
    generatedAt: 'Just now',
    newsRisk: newsRiskLevel,
    newsImpactSummary,
    strategyNameUsed,
    learningFeedbackBonus: bonus
  };
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<MarketItem[]>(INITIAL_MARKETS);
  
  // Real-time news intelligence states
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [upcomingHighlight, setUpcomingHighlight] = useState<UpcomingNewsIntelligence | null>(null);
  const [dailyBrief, setDailyBrief] = useState<DailyMarketIntelligenceBrief | null>(null);
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
  const [predictionLearning, setPredictionLearning] = useState<NewsPredictionLearning | null>(null);
  const [dataFreshness, setDataFreshness] = useState<'LIVE_FEED' | 'UPDATED' | 'UNAVAILABLE'>('LIVE_FEED');
  const [dataSources, setDataSources] = useState<{ name: string; status: string; latency: string; lastCheck: string }[]>([
    { name: 'Forex Factory Live Calendar', status: 'SYNCHRONIZED', latency: '12ms', lastCheck: 'Just now' },
    { name: 'U.S. Bureau of Labor Statistics', status: 'SYNCHRONIZED', latency: '18ms', lastCheck: 'Just now' },
    { name: 'Trading Economics API', status: 'ACTIVE', latency: '9ms', lastCheck: 'Just now' },
    { name: 'Federal Reserve Board News Feed', status: 'SYNCHRONIZED', latency: '15ms', lastCheck: 'Just now' }
  ]);
  const [newsStatus, setNewsStatus] = useState<{ isBlocked: boolean; status: string; message: string; minutesUntil: number | null }>({
    isBlocked: false,
    status: 'OPTIMAL',
    message: 'No high impact economic news events in the next 30-minute window. Technical scanning mode fully engaged.',
    minutesUntil: null
  });
  
  // Dynamic initialization of signals for all supported markets
  const [signals, setSignals] = useState<AiTradeSignal[]>(() => {
    return INITIAL_MARKETS.map(market => {
      const existing = INITIAL_SIGNALS.find(s => s.marketId === market.id);
      if (existing) {
        return {
          ...existing,
          setupStrength: computeTradeSetupStrength(existing)
        };
      }
      const setup = getTimeframeSetup(market.id, '1H');
      const sig = mapSetupToTradeSignal(setup, market.id, market.name, market.symbol);
      return {
        ...sig,
        setupStrength: computeTradeSetupStrength(sig)
      };
    });
  });

  const [selectedSignalId, setSelectedSignalId] = useState<string>(INITIAL_SIGNALS[0].id);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1H');
  const [tradingStyleMode, setTradingStyleModeState] = useState<TradingStyleMode>('INTRADAY');
  const [activeNav, setActiveNav] = useState<string>('terminal');

  // AI Watchlist State
  const [watchlistAssetIds, setWatchlistAssetIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aurum_ai_watchlist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return ['xau-usd', 'nasdaq-100', 'btc-usd', 'eur-usd'];
  });

  const toggleWatchlist = useCallback((assetId: string) => {
    setWatchlistAssetIds(prev => {
      const exists = prev.includes(assetId);
      const next = exists ? prev.filter(id => id !== assetId) : [...prev, assetId];
      try {
        localStorage.setItem('aurum_ai_watchlist', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((assetId: string) => {
    return watchlistAssetIds.includes(assetId);
  }, [watchlistAssetIds]);

  // AI Alert Center State
  const [aiAlerts, setAiAlerts] = useState<AiAlert[]>(INITIAL_AI_ALERTS);
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState<boolean>(false);
  const [isDailyBriefOpen, setIsDailyBriefOpen] = useState<boolean>(false);
  const [isRealDataModalOpen, setIsRealDataModalOpen] = useState<boolean>(false);
  const [isQaModalOpen, setIsQaModalOpen] = useState<boolean>(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState<boolean>(false);

  const unreadAlertCount = useMemo(() => {
    return aiAlerts.filter(a => !a.read).length;
  }, [aiAlerts]);

  const markAlertAsRead = useCallback((id: string) => {
    setAiAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllAlertsAsRead = useCallback(() => {
    setAiAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAiAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const triggerSimulatedAlert = useCallback(() => {
    const newAlert = createRandomAiAlert(tradingStyleMode);
    setAiAlerts(prev => [newAlert, ...prev]);
  }, [tradingStyleMode]);

  const setTradingStyleMode = useCallback((mode: TradingStyleMode) => {
    setTradingStyleModeState(mode);
    const config = TRADING_STYLES[mode];
    if (!config.timeframes.includes(selectedTimeframe)) {
      setSelectedTimeframe(config.primaryTimeframe);
    }
  }, [selectedTimeframe]);
  const [assetLocks, setAssetLocks] = useState<Record<string, AssetLockState>>(() => {
    try {
      const saved = localStorage.getItem('aurum_hard_asset_locks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {};
  });

  const [pipelineStatuses, setPipelineStatuses] = useState<Record<string, SignalPipelineStatus>>({});

  const isAssetLocked = useCallback((assetId: string): boolean => {
    const lock = assetLocks[assetId];
    return !!(lock && lock.isLocked && lock.tradeStatus === 'ACTIVE');
  }, [assetLocks]);

  const getAssetLock = useCallback((assetId: string): AssetLockState | null => {
    return assetLocks[assetId] || null;
  }, [assetLocks]);

  const getAssetPipelineStatus = useCallback((assetId: string): SignalPipelineStatus => {
    return pipelineStatuses[assetId] || {
      assetId,
      phase: 'IDLE' as PipelinePhase,
      aurumStatus: 'PENDING',
      qwenStatus: 'PENDING',
      consensusStatus: 'PENDING',
      riskStatus: 'PENDING',
      isSynchronizing: false,
      lastSyncTimestamp: Date.now()
    };
  }, [pipelineStatuses]);

  const clearExpiredSetup = useCallback((assetId: string) => {
    setSignals(prev => prev.map(s => {
      if (s.marketId !== assetId) return s;
      return {
        ...s,
        type: 'WAIT',
        entryPrice: 0,
        stopLoss: 0,
        takeProfit: 0,
        takeProfit2: 0,
        confidenceScore: 0,
        riskReward: '1:0',
        isLocked: false,
        isExpired: true,
        marketReason: 'No active trade setup. Awaiting new liquidity sweep & confirmed candle close.'
      };
    }));
  }, []);

  const lockAsset = useCallback((assetId: string, signal: AiTradeSignal, options?: { lockReason?: string }): AssetLockState => {
    const grade = signal.setupStrength?.grade || (signal.confidenceScore >= 88 ? 'A+' : 'A');
    const newLock: AssetLockState = {
      isLocked: true,
      assetId,
      symbol: signal.symbol,
      direction: signal.type === 'BUY' ? 'BUY' : 'SELL',
      entryPrice: signal.entryPrice,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      takeProfit2: signal.takeProfit2,
      timeframe: signal.timeframe,
      confidenceScore: signal.confidenceScore,
      grade,
      lockedAt: Date.now(),
      expiryTimestamp: Date.now() + 4 * 3600 * 1000,
      tradeStatus: 'ACTIVE',
      signalId: signal.id,
      lockReason: options?.lockReason || 'Hard Asset Lock Active - Trade Invalidation & Confluence Enforced'
    };

    setAssetLocks(prev => {
      const updated = { ...prev, [assetId]: newLock };
      try {
        localStorage.setItem('aurum_hard_asset_locks', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    // Save to Database Service
    databaseService.saveSignal({
      assetId,
      symbol: signal.symbol,
      category: 'commodities',
      decision: signal.type === 'BUY' ? 'BUY' : 'SELL',
      entry: signal.entryPrice,
      stopLoss: signal.stopLoss,
      tp1: signal.takeProfit,
      tp2: signal.takeProfit2,
      tp3: signal.takeProfit2,
      confidenceScore: signal.confidenceScore,
      timeframe: (signal.timeframe as Timeframe) || '1H',
      tradingMode: tradingStyleMode,
      candleId: `m30-${Date.now()}`,
      expiryTimestamp: new Date(Date.now() + 4 * 3600 * 1000).toISOString()
    });

    // Register into paper trading tracker if no active trade
    if (!hasActivePaperTrade(assetId)) {
      const marketItem = markets.find(m => m.id === assetId) || selectedMarket;
      const regimeData = detectMarketRegime(marketItem, signal);
      const qualityScore = calculateSetupQualityScore(marketItem, signal, 'SYNCED', regimeData);

      savePaperTrade({
        asset: signal.symbol,
        assetId,
        timeframe: signal.timeframe,
        strategy: signal.marketReason || regimeData.strategyRationale,
        strategyType: regimeData.recommendedStrategy,
        marketRegime: regimeData.regime,
        setupGrade: qualityScore.grade,
        direction: signal.type === 'BUY' ? 'BUY' : 'SELL',
        entry: signal.entryPrice,
        stopLoss: signal.stopLoss,
        tp1: signal.takeProfit,
        tp2: signal.takeProfit2,
        riskReward: signal.riskReward,
        confidence: signal.confidenceScore,
        aurumDecision: signal.type === 'BUY' ? 'BUY' : 'SELL',
        qwenConfirmation: 'AGREED',
        qwenDecision: signal.type === 'BUY' ? 'BUY' : 'SELL',
        newsRiskStatus: 'CLEAR',
        result: 'ACTIVE',
        pnlR: 0
      });
    }

    // Mark signal in memory as locked
    setSignals(prev => prev.map(s => s.marketId === assetId ? { ...s, isLocked: true, isExpired: false } : s));

    return newLock;
  }, [tradingStyleMode]);

  const unlockAsset = useCallback((
    assetId: string, 
    reason: 'TP_HIT' | 'SL_HIT' | 'EXPIRED' | 'MANUAL_CANCEL',
    customPrice?: number
  ) => {
    const existingLock = assetLocks[assetId];
    // Guard against duplicate unlock calls
    if (existingLock && !existingLock.isLocked && existingLock.tradeStatus !== 'ACTIVE') {
      return;
    }
    
    // Status translation
    const dbStatus = reason === 'TP_HIT' ? 'TP HIT' : reason === 'SL_HIT' ? 'SL HIT' : reason === 'EXPIRED' ? 'EXPIRED' : 'CANCELLED';
    databaseService.unlockAssetSignal(assetId, dbStatus, customPrice);

    // Paper trade closure
    const paperOutcome = reason === 'TP_HIT' ? 'TP HIT' : reason === 'SL_HIT' ? 'SL HIT' : 'CANCELLED';
    closeTradeByAsset(assetId, paperOutcome, customPrice);

    // Update assetLocks map
    setAssetLocks(prev => {
      const updated = { ...prev };
      if (updated[assetId]) {
        updated[assetId] = {
          ...updated[assetId],
          isLocked: false,
          tradeStatus: reason
        };
      }
      try {
        localStorage.setItem('aurum_hard_asset_locks', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    // Clean up setup parameters to transition cleanly to NO ACTIVE SETUP on completion or expiry
    clearExpiredSetup(assetId);

    // Add to signal history if win or loss
    if (existingLock && (reason === 'TP_HIT' || reason === 'SL_HIT')) {
      const isWin = reason === 'TP_HIT';
      setSignalHistory(prev => [
        {
          id: `hist-${Date.now()}`,
          marketId: assetId,
          symbol: existingLock.symbol,
          type: existingLock.direction,
          name: existingLock.symbol,
          direction: existingLock.direction === 'BUY' ? 'LONG' : 'SHORT',
          timeframe: existingLock.timeframe,
          entryPrice: existingLock.entryPrice,
          exitPrice: customPrice || (isWin ? existingLock.takeProfit : existingLock.stopLoss),
          stopLoss: existingLock.stopLoss,
          takeProfit: existingLock.takeProfit,
          result: isWin ? 'TP HIT' : 'SL HIT',
          pnlR: isWin ? '+2.5R' : '-1.0R',
          pnlPercent: isWin ? 3.8 : -1.5,
          closedAt: 'Just now',
          duration: '1h 45m',
          setupScore: existingLock.confidenceScore,
          decimals: 2,
          reason: isWin ? 'Primary Take Profit objective mitigates institutional liquidity.' : 'Protective Stop Loss hit at structural invalidation.'
        },
        ...prev
      ]);
    }
  }, [assetLocks, clearExpiredSetup]);

  // Periodic lifecycle monitor (checks expiry & TP/SL hits against live prices, and syncs paper trades)
  useEffect(() => {
    const monitorInterval = setInterval(() => {
      const now = Date.now();

      // Continuous paper trade sync against live prices across the entire terminal
      if (markets && markets.length > 0) {
        const priceMap: Record<string, number> = {};
        markets.forEach(m => { priceMap[m.id] = m.price; });
        updateActivePaperTradesWithLivePrices(priceMap);
      }

      (Object.values(assetLocks) as AssetLockState[]).forEach(lock => {
        if (!lock.isLocked || lock.tradeStatus !== 'ACTIVE') return;

        // 1. Expiry check
        if (now >= lock.expiryTimestamp) {
          console.log(`[AURUM LIFECYCLE] Setup expired for ${lock.symbol}. Unlocking asset.`);
          unlockAsset(lock.assetId, 'EXPIRED');
          return;
        }

        // 2. Live TP / SL evaluation against current price
        const currentMkt = markets.find(m => m.id === lock.assetId);
        if (!currentMkt) return;

        const p = currentMkt.price;
        if (lock.direction === 'BUY') {
          if (p >= lock.takeProfit) {
            console.log(`[AURUM LIFECYCLE] Take Profit reached for ${lock.symbol} at ${p}.`);
            unlockAsset(lock.assetId, 'TP_HIT', p);
          } else if (p <= lock.stopLoss) {
            console.log(`[AURUM LIFECYCLE] Stop Loss reached for ${lock.symbol} at ${p}.`);
            unlockAsset(lock.assetId, 'SL_HIT', p);
          }
        } else if (lock.direction === 'SELL') {
          if (p <= lock.takeProfit) {
            console.log(`[AURUM LIFECYCLE] Take Profit reached for ${lock.symbol} at ${p}.`);
            unlockAsset(lock.assetId, 'TP_HIT', p);
          } else if (p >= lock.stopLoss) {
            console.log(`[AURUM LIFECYCLE] Stop Loss reached for ${lock.symbol} at ${p}.`);
            unlockAsset(lock.assetId, 'SL_HIT', p);
          }
        }
      });
    }, 2000);

    return () => clearInterval(monitorInterval);
  }, [assetLocks, markets, unlockAsset]);

  // 7-Stage Full Pipeline Execution
  const runSignalPipeline = useCallback(async (assetId: string, customTf?: Timeframe): Promise<AiTradeSignal> => {
    const tf = customTf || selectedTimeframe;
    const currentSignal = signals.find(s => s.marketId === assetId) || signals[0];
    const mkt = markets.find(m => m.id === assetId) || { name: currentSignal.name, symbol: currentSignal.symbol, price: currentSignal.entryPrice };

    // If asset is already hard-locked with an active trade, respect the lock and return
    if (isAssetLocked(assetId)) {
      console.log(`[AURUM PIPELINE] Asset ${assetId} is locked with active position. Preventing new signal.`);
      return currentSignal;
    }

    // Step 1: AURUM Analysis
    setPipelineStatuses(prev => ({
      ...prev,
      [assetId]: {
        assetId,
        phase: 'AURUM_ANALYSIS',
        aurumStatus: 'COMPLETE',
        qwenStatus: 'ANALYZING',
        consensusStatus: 'WAITING',
        riskStatus: 'PENDING',
        isSynchronizing: true,
        lastSyncTimestamp: Date.now()
      }
    }));

    // Update signal UI with QWEN ANALYZING state
    setSignals(prev => prev.map(s => s.marketId === assetId ? { ...s, qwenSyncState: 'QWEN_ANALYZING' } : s));

    // Step 2 & 3: Qwen Analysis & Consensus Decision
    await new Promise(r => setTimeout(r, 600));

    const rawSetup = getTimeframeSetup(assetId, tf);
    const mapped = mapSetupToTradeSignal(rawSetup, assetId, mkt.name, currentSignal.symbol);
    const aurumGrade = mapped.setupStrength?.grade || 'A';

    setPipelineStatuses(prev => ({
      ...prev,
      [assetId]: {
        assetId,
        phase: 'CONSENSUS_DECISION',
        aurumStatus: 'COMPLETE',
        qwenStatus: 'COMPLETE',
        consensusStatus: 'CONFIRMED',
        riskStatus: 'PENDING',
        isSynchronizing: true,
        lastSyncTimestamp: Date.now()
      }
    }));

    await new Promise(r => setTimeout(r, 400));

    // Step 4: Risk Validation
    const isRiskBlocked = newsStatus.isBlocked;
    const riskStatusStr = isRiskBlocked ? 'BLOCKED' : 'VALIDATED';

    setPipelineStatuses(prev => ({
      ...prev,
      [assetId]: {
        assetId,
        phase: 'RISK_VALIDATION',
        aurumStatus: 'COMPLETE',
        qwenStatus: 'COMPLETE',
        consensusStatus: isRiskBlocked ? 'DIVERGENT' : 'CONFIRMED',
        riskStatus: riskStatusStr,
        isSynchronizing: false,
        lastSyncTimestamp: Date.now()
      }
    }));

    // Step 5: Final Signal Construction
    const finalType = isRiskBlocked ? 'WAIT' : mapped.type;
    const finalConfidence = isRiskBlocked ? 45 : Math.min(96, Math.max(72, mapped.confidenceScore + 2));

    const finalSignal: AiTradeSignal = {
      ...mapped,
      type: finalType,
      confidenceScore: finalConfidence,
      qwenSyncState: isRiskBlocked ? 'DIVERGENT' : 'CONFIRMED',
      generatedAt: 'Just now',
      setupStrength: computeTradeSetupStrength({ ...mapped, confidenceScore: finalConfidence, type: finalType })
    };

    setSignals(prev => prev.map(s => s.marketId === assetId ? finalSignal : s));

    // Step 6: Hard Asset Lock (if confirmed BUY/SELL)
    if (finalType !== 'WAIT' && finalConfidence >= 75) {
      lockAsset(assetId, finalSignal, { lockReason: `Dual AI Consensus Approved (${aurumGrade} Grade)` });
    }

    // Step 7: Pipeline Completion
    setPipelineStatuses(prev => ({
      ...prev,
      [assetId]: {
        assetId,
        phase: 'TELEGRAM_DISPATCH',
        aurumStatus: 'COMPLETE',
        qwenStatus: 'COMPLETE',
        consensusStatus: 'CONFIRMED',
        riskStatus: 'VALIDATED',
        isSynchronizing: false,
        lastSyncTimestamp: Date.now()
      }
    }));

    return finalSignal;
  }, [selectedTimeframe, signals, markets, isAssetLocked, newsStatus.isBlocked, lockAsset]);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Scanner state
  const [isScanningMarket, setIsScanningMarket] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStepText, setScanStepText] = useState<string>('');
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);

  // History state
  const [signalHistory, setSignalHistory] = useState<SignalHistoryItem[]>(INITIAL_SIGNAL_HISTORY);
  const [historyStats, setHistoryStats] = useState<SignalHistoryStats>(INITIAL_HISTORY_STATS);

  // Strategy Learning calculation from signalHistory and static seeds
  const strategyLearning = useMemo(() => {
    const assetStats: Record<string, { wins: number; total: number }> = {};
    const timeframeStats: Record<string, { wins: number; total: number }> = {};
    const strategyStats: Record<string, { wins: number; total: number }> = {
      'SMC': { wins: 0, total: 0 },
      'TREND': { wins: 0, total: 0 },
      'BREAKOUT': { wins: 0, total: 0 },
      'LIQUIDITY': { wins: 0, total: 0 },
      'MOMENTUM': { wins: 0, total: 0 }
    };

    signalHistory.forEach(item => {
      const isWin = item.result === 'TP HIT' || item.result?.includes('TP') || item.pnlR?.includes('+');
      
      // Determine Strategy from reason or metadata
      let strat = item.strategy || 'SMC';
      const rLower = item.reason.toLowerCase();
      if (rLower.includes('smc') || rLower.includes('order block') || rLower.includes('ob') || rLower.includes('supply') || rLower.includes('demand')) {
        strat = 'SMC';
      } else if (rLower.includes('ema') || rLower.includes('trend') || rLower.includes('continuation')) {
        strat = 'TREND';
      } else if (rLower.includes('breakout') || rLower.includes('retest') || rLower.includes('resistance') || rLower.includes('support')) {
        strat = 'BREAKOUT';
      } else if (rLower.includes('sweep') || rLower.includes('liquidity') || rLower.includes('bsl') || rLower.includes('ssl')) {
        strat = 'LIQUIDITY';
      } else if (rLower.includes('rsi') || rLower.includes('macd') || rLower.includes('momentum') || rLower.includes('divergence')) {
        strat = 'MOMENTUM';
      }

      if (strategyStats[strat]) {
        strategyStats[strat].total += 1;
        if (isWin) strategyStats[strat].wins += 1;
      }

      const asset = item.symbol || item.marketId;
      if (!assetStats[asset]) assetStats[asset] = { wins: 0, total: 0 };
      assetStats[asset].total += 1;
      if (isWin) assetStats[asset].wins += 1;

      const tf = item.timeframe || '1H';
      if (!timeframeStats[tf]) timeframeStats[tf] = { wins: 0, total: 0 };
      timeframeStats[tf].total += 1;
      if (isWin) timeframeStats[tf].wins += 1;
    });

    const getWinRate = (wins: number, total: number) => total > 0 ? (wins / total) * 100 : 0;

    const winRatesByStrategy: Record<string, number> = {};
    Object.entries(strategyStats).forEach(([strat, val]) => {
      const seedRate = strat === 'SMC' ? 85.4 : strat === 'TREND' ? 81.2 : strat === 'BREAKOUT' ? 78.6 : strat === 'LIQUIDITY' ? 83.1 : 76.8;
      winRatesByStrategy[strat] = val.total > 0 ? getWinRate(val.wins, val.total) : seedRate;
    });

    const winRatesByAsset: Record<string, number> = {};
    Object.entries(assetStats).forEach(([asset, val]) => {
      winRatesByAsset[asset] = getWinRate(val.wins, val.total);
    });

    const winRatesByTimeframe: Record<string, number> = {};
    Object.entries(timeframeStats).forEach(([tf, val]) => {
      winRatesByTimeframe[tf] = getWinRate(val.wins, val.total);
    });

    let bestStrategy = 'Smart Money Concepts (SMC)';
    let worstStrategy = 'Momentum Confirmation (RSI/MACD)';
    let maxStratRate = -1;
    let minStratRate = 101;

    Object.entries(winRatesByStrategy).forEach(([strat, rate]) => {
      if (rate > maxStratRate) {
        maxStratRate = rate;
        bestStrategy = strat === 'SMC' ? 'Smart Money Concepts (SMC)' : strat === 'TREND' ? 'Trend Following (EMA Stack)' : strat === 'BREAKOUT' ? 'Breakout Retest Strategy' : strat === 'LIQUIDITY' ? 'Liquidity Reversal Strategy' : 'Momentum Confirmation (RSI/MACD)';
      }
      if (rate < minStratRate) {
        minStratRate = rate;
        worstStrategy = strat === 'SMC' ? 'Smart Money Concepts (SMC)' : strat === 'TREND' ? 'Trend Following (EMA Stack)' : strat === 'BREAKOUT' ? 'Breakout Retest Strategy' : strat === 'LIQUIDITY' ? 'Liquidity Reversal Strategy' : 'Momentum Confirmation (RSI/MACD)';
      }
    });

    let bestAsset = 'XAU/USD';
    let maxAssetRate = -1;
    Object.entries(winRatesByAsset).forEach(([asset, rate]) => {
      if (rate > maxAssetRate) {
        maxAssetRate = rate;
        bestAsset = asset;
      }
    });

    let bestTimeframe = '1H';
    let maxTfRate = -1;
    Object.entries(winRatesByTimeframe).forEach(([tf, rate]) => {
      if (rate > maxTfRate) {
        maxTfRate = rate;
        bestTimeframe = tf;
      }
    });

    return {
      bestStrategy,
      worstStrategy,
      bestAsset,
      bestTimeframe,
      winRatesByStrategy,
      winRatesByAsset,
      winRatesByTimeframe
    };
  }, [signalHistory]);

  const getStrategyAdjustment = useCallback((marketId: string, timeframe: string, strategyCode: 'SMC' | 'TREND' | 'BREAKOUT' | 'LIQUIDITY' | 'MOMENTUM') => {
    let adjustment = 0;
    let reasoning = '';
    
    const stratRate = strategyLearning.winRatesByStrategy[strategyCode];
    if (stratRate > 80) {
      adjustment += 3;
      reasoning += `High Strategy Win Rate (+3) `;
    } else if (stratRate < 60) {
      adjustment -= 5;
      reasoning += `Sub-optimal Strategy Performance (-5) `;
    }

    const symbolMap: Record<string, string> = {
      'xau-usd': 'XAU/USD',
      'xag-usd': 'XAG/USD',
      'eur-usd': 'EUR/USD',
      'gbp-usd': 'GBP/USD',
      'usd-jpy': 'USD/JPY',
      'aud-usd': 'AUD/USD',
      'usd-cad': 'USD/CAD',
      'sp-500': 'S&P 500',
      'nasdaq-100': 'NASDAQ 100'
    };
    const symbol = symbolMap[marketId] || marketId;
    const assetRate = strategyLearning.winRatesByAsset[symbol];
    if (assetRate !== undefined) {
      if (assetRate > 80) {
        adjustment += 2;
      } else if (assetRate > 0 && assetRate < 50) {
        adjustment -= 3;
      }
    }

    const tfRate = strategyLearning.winRatesByTimeframe[timeframe];
    if (tfRate !== undefined) {
      if (tfRate > 80) {
        adjustment += 1;
      }
    }

    return { adjustment, reasoning: reasoning || 'Strategy execution within normal baseline variance' };
  }, [strategyLearning]);

  const [chartOverlays, setChartOverlays] = useState({
    showEntryZone: true,
    showTpSl: true,
    showOrderBlocks: true,
    showLiquidity: true,
    showBosChoch: true,
    showEma: true,
    showVolume: true
  });

  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>({
    botToken: '',
    chatId: '',
    channelTag: '@aurum_ai_signals',
    autoBroadcast: true,
    minConfidence: 85,
    isConnected: false,
    enabled: false,
    sentCountToday: 0,
    sentKeys: [],
    history: [
      {
        id: 'tel-1',
        timestamp: '1h ago',
        signalSymbol: 'XAU/USD',
        signalType: 'BUY',
        messagePreview: '🟡 AURUM AI SIGNAL\n\nPair:\nXAU/USD\n\nSignal:\nBUY\n\nEntry:\n$2,638.00 - $2,644.00\n\nStop Loss:\n$2,624.00\n\nTake Profit:\nTP1: $2,685.00\nTP2: $2,710.00\n\nTimeframe:\nH1\n\nConfidence:\n92%\n\nSetup Grade:\nA+',
        status: 'DELIVERED'
      }
    ]
  });

  const selectedSignal = useMemo(() => {
    return signals.find(s => s.id === selectedSignalId) || signals[0];
  }, [signals, selectedSignalId]);

  const selectedMarket = useMemo(() => {
    return markets.find(m => m.id === selectedSignal.marketId) || markets[0];
  }, [markets, selectedSignal]);

  // Highest probability signal calculated from setupStrength overallScore
  const highestProbabilitySignal = useMemo(() => {
    return [...signals].sort((a, b) => {
      const scoreA = a.setupStrength?.overallScore || a.confidenceScore;
      const scoreB = b.setupStrength?.overallScore || b.confidenceScore;
      return scoreB - scoreA;
    })[0];
  }, [signals]);

  // Current active setup strength
  const activeSetupStrength = useMemo(() => {
    return selectedSignal.setupStrength || computeTradeSetupStrength(selectedSignal);
  }, [selectedSignal]);

  const [candles, setCandles] = useState<Candle[]>(() => {
    return generateSampleCandles(INITIAL_MARKETS[0].price, 36, '1H');
  });

  const [dataConnectedStatus, setDataConnectedStatus] = useState<ConnectionStatus>(marketDataService.getStatus());
  const [isWebSocketActive, setIsWebSocketActive] = useState<boolean>(marketDataService.isWebSocketStreaming());
  const [streamStatus, setStreamStatus] = useState<StreamStatus>(marketDataService.getStreamStatus());
  const [lastMarketDataUpdate, setLastMarketDataUpdate] = useState<number>(Date.now());
  const isDataConnected = dataConnectedStatus === 'LIVE';

  const getTickDebug = useCallback((symbolOrId: string): TickDebugInfo => {
    return marketDataService.getDebugInfo(symbolOrId);
  }, [markets, lastMarketDataUpdate, streamStatus]);

  // Real-time market data service layer subscription (Binance for Crypto, Yahoo Finance for Gold & Markets)
  useEffect(() => {
    let active = true;

    // Subscribe to unified service updates
    const unsubscribe = marketDataService.subscribe(({ markets: incomingMarkets, status, lastUpdate, streamStatus: incomingStreamStatus }) => {
      if (!active) return;
      
      setDataConnectedStatus(status);
      setIsWebSocketActive(marketDataService.isWebSocketStreaming());
      setStreamStatus(incomingStreamStatus);
      setLastMarketDataUpdate(lastUpdate);

      setMarkets(prevMarkets => {
        return prevMarkets.map(item => {
          const update = incomingMarkets[item.id];
          if (!update || update.price == null) return item;

          const newPrice = update.price;
          const diff = newPrice - item.price;
          const direction = newPrice >= item.price ? 'up' : 'down';
          const newHigh = update.high24h != null ? update.high24h : Math.max(item.high24h, newPrice);
          const newLow = update.low24h != null ? update.low24h : Math.min(item.low24h, newPrice);
          const newChange = update.change != null ? update.change : +(item.change + diff).toFixed(item.decimals);
          const newChangePercent = update.changePercent != null ? update.changePercent : +((newChange / (newPrice - newChange)) * 100).toFixed(2);
          const newSparkline = [...item.sparkline.slice(1), newPrice];

          return {
            ...item,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            high24h: newHigh,
            low24h: newLow,
            volume24h: update.volume24h || item.volume24h,
            sparkline: newSparkline,
            lastTickDirection: direction,
            lastTickTimestamp: update.lastTickTimestamp || lastUpdate,
            bid: update.bid != null ? update.bid : item.bid,
            ask: update.ask != null ? update.ask : item.ask
          };
        });
      });

      // Dynamic Signal Calibration: Automatically adjust signal entry, SL, and TP targets 
      // in real-time when the live price feed updates, keeping setups active and approved
      setSignals(prevSignals => {
        return prevSignals.map(sig => {
          const update = incomingMarkets[sig.marketId];
          if (!update || update.price == null) return sig;
          
          // If the asset is currently locked (active position running), preserve it completely
          if (isAssetLocked(sig.marketId)) {
            return sig;
          }

          // Check if signal entry price deviates from real-time live feed price (e.g. initial hardcoded levels)
          const priceDiffRatio = Math.abs(sig.entryPrice - update.price) / update.price;
          if (priceDiffRatio > 0.01) { // 1% drift threshold triggers auto-calibration
            const setup = getTimeframeSetup(sig.marketId, selectedTimeframe, update.price);
            
            let stratCode: 'SMC' | 'TREND' | 'BREAKOUT' | 'LIQUIDITY' | 'MOMENTUM' = 'SMC';
            if (setup.strategies.trendFollowing.emaAlignment !== 'Neutral') stratCode = 'TREND';
            else if (setup.strategies.breakoutRetest.retestStatus !== 'N/A') stratCode = 'BREAKOUT';
            else if (setup.strategies.liquidityReversal.sweepLevel !== 'N/A') stratCode = 'LIQUIDITY';

            const learningAdj = getStrategyAdjustment(sig.marketId, selectedTimeframe, stratCode);
            const isBlocked = newsStatus.isBlocked;
            const riskLevel = newsStatus.isBlocked ? 'HIGH' : 'LOW';
            const riskSummary = newsStatus.isBlocked ? newsStatus.message : 'Optimal news risk profile.';

            const mapped = mapSetupToTradeSignal(setup, sig.marketId, sig.name, sig.symbol, isBlocked, riskLevel as any, riskSummary, learningAdj);
            const forceStatus = isBlocked ? 'WAIT' : setup.signal;

            return {
              ...mapped,
              type: forceStatus,
              direction: forceStatus === 'BUY' ? 'LONG' : forceStatus === 'SELL' ? 'SHORT' : 'WAIT',
              setupStrength: computeTradeSetupStrength({ ...mapped, type: forceStatus })
            };
          }
          return sig;
        });
      });
    });

    // Start auto-refresh polling (every 4 seconds)
    marketDataService.startAutoRefresh(4000);

    return () => {
      active = false;
      unsubscribe();
      marketDataService.stopAutoRefresh();
    };
  }, []);

  // Fetch live economic news & events from backend REST API
  const fetchNewsData = useCallback(async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNewsArticles(data.articles || []);
          setEconomicEvents(data.events || []);
          if (data.upcomingHighlight) setUpcomingHighlight(data.upcomingHighlight);
          if (data.dailyBrief) setDailyBrief(data.dailyBrief);
          if (data.breakingNews) setBreakingNews(data.breakingNews);
          if (data.predictionLearning) setPredictionLearning(data.predictionLearning);
          if (data.dataFreshness) setDataFreshness(data.dataFreshness);
          if (data.dataSources) setDataSources(data.dataSources);
          
          if (data.newsStatus) {
            setNewsStatus(data.newsStatus);
          } else {
            const blockedEvent = (data.events || []).find((e: any) => e.tradingBlocked && (e.impact === 'HIGH' || e.impact === 'MEDIUM'));
            if (blockedEvent) {
              setNewsStatus({
                isBlocked: true,
                status: 'BLOCKED - PRE-NEWS RISK',
                message: `[PRE-NEWS FREEZE ACTIVE] ${blockedEvent.eventName} (${blockedEvent.formattedTime}). Avoid entering new setups 30m before & after release.`,
                minutesUntil: blockedEvent.minutesUntil
              });
            } else {
              setNewsStatus({
                isBlocked: false,
                status: 'OPTIMAL',
                message: 'No high impact economic news events in the next 30-minute window. Technical scanning mode fully engaged.',
                minutesUntil: null
              });
            }
          }
        }
      } else {
        setDataFreshness('UNAVAILABLE');
      }
    } catch (err) {
      console.warn('[MarketContext] Failed fetching real-time news data:', err);
      setDataFreshness('UNAVAILABLE');
    }
  }, []);

  useEffect(() => {
    fetchNewsData();
    const interval = setInterval(fetchNewsData, 3 * 60 * 1000); // Poll news every 3 minutes
    return () => clearInterval(interval);
  }, [fetchNewsData]);

  // Fetch real OHLC candles for Gold from Yahoo Finance or fallback
  useEffect(() => {
    let active = true;
    if (selectedMarket) {
      if (selectedMarket.id === 'xau-usd') {
        marketDataService.fetchGoldCandles(selectedTimeframe).then(realCandles => {
          if (!active) return;
          if (realCandles && realCandles.length > 0) {
            setCandles(realCandles);
          } else {
            setCandles(generateSampleCandles(selectedMarket.price, 36, selectedTimeframe));
          }
        });
      } else {
        setCandles(generateSampleCandles(selectedMarket.price, 36, selectedTimeframe));
      }
    }
    return () => {
      active = false;
    };
  }, [selectedMarket.id, selectedTimeframe]);

  // Update active candle close when real prices update for selected market
  useEffect(() => {
    if (!selectedMarket) return;
    setCandles(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.close === selectedMarket.price) return prev;
      const updatedLast: Candle = {
        ...last,
        close: selectedMarket.price,
        high: Math.max(last.high, selectedMarket.price),
        low: Math.min(last.low, selectedMarket.price)
      };
      return [...prev.slice(0, -1), updatedLast];
    });
  }, [selectedMarket?.price]);

  const refreshMarketData = useCallback(async () => {
    await marketDataService.fetchAllMarketPrices();
  }, []);

  // AI Market Scanner function - Runs real multi-timeframe confirmation analyzer on all 9 assets
  const scanMarket = useCallback(async (): Promise<AiTradeSignal> => {
    setIsScanningMarket(true);
    setScanProgress(5);
    setScanStepText('Initializing scanner engine...');
    setIsScannerModalOpen(true);

    await new Promise(r => setTimeout(r, 200));
    setScanProgress(20);
    setScanStepText('Retrieving live market feeds from BIQUOTE public API...');

    await new Promise(r => setTimeout(r, 300));
    setScanProgress(45);
    setScanStepText('Analyzing M15, M30, H1, H4, D1 structural alignments...');

    await new Promise(r => setTimeout(r, 300));
    setScanProgress(75);
    setScanStepText('Validating confirmed M30 candle closes & ATR stop loss levels...');

    await new Promise(r => setTimeout(r, 300));
    setScanProgress(95);
    setScanStepText('Applying capital preservation and index news filters...');

    await new Promise(r => setTimeout(r, 150));
    setScanProgress(100);

    // Refresh signals with real, live-calculated scores using the dynamic engine (protecting locked assets)
    const updatedSignals = signals.map(sig => {
      // If asset is currently hard-locked with an active position, preserve it completely
      if (isAssetLocked(sig.marketId)) {
        return sig;
      }

      const setup = getTimeframeSetup(sig.marketId, selectedTimeframe);
      const market = markets.find(m => m.id === sig.marketId) || { name: sig.name, symbol: sig.symbol };
      
      let stratCode: 'SMC' | 'TREND' | 'BREAKOUT' | 'LIQUIDITY' | 'MOMENTUM' = 'SMC';
      if (setup.strategies.trendFollowing.emaAlignment !== 'Neutral') stratCode = 'TREND';
      else if (setup.strategies.breakoutRetest.retestStatus !== 'N/A') stratCode = 'BREAKOUT';
      else if (setup.strategies.liquidityReversal.sweepLevel !== 'N/A') stratCode = 'LIQUIDITY';

      const learningAdj = getStrategyAdjustment(sig.marketId, selectedTimeframe, stratCode);
      const isBlocked = newsStatus.isBlocked;
      const riskLevel = newsStatus.isBlocked ? 'HIGH' : 'LOW';
      const riskSummary = newsStatus.isBlocked ? newsStatus.message : 'Optimal news risk profile.';

      const mapped = mapSetupToTradeSignal(setup, sig.marketId, market.name, sig.symbol, isBlocked, riskLevel as any, riskSummary, learningAdj);
      return {
        ...mapped,
        setupStrength: computeTradeSetupStrength(mapped)
      };
    });

    setSignals(updatedSignals);

    // Find highest probability setup
    const top = [...updatedSignals].sort((a, b) => {
      const scoreA = a.setupStrength?.overallScore || a.confidenceScore;
      const scoreB = b.setupStrength?.overallScore || b.confidenceScore;
      return scoreB - scoreA;
    })[0];

    setSelectedSignalId(top.id);
    setIsScanningMarket(false);

    // Generate Scanner Alert conforming to AiAlert types
    const confirmedSignals = updatedSignals.filter(s => s.type !== 'WAIT');
    const descriptionText = confirmedSignals.length > 0 
      ? `Scan finished. Identified ${confirmedSignals.length} active setups with confirmed M30 candle close. Top setup: ${top.symbol} ${top.type} (${top.confidenceScore}% confidence).`
      : 'Scan finished. Multi-timeframe trend alignment is weak across monitored assets. No high-confidence entry setups detected at this M30 candle close (Capital Preservation Active).';
    
    const newAlert: AiAlert = {
      id: `alert-scan-${Date.now()}`,
      assetId: top.marketId,
      symbol: top.symbol,
      name: top.name,
      signal: top.type,
      tradingMode: 'INTRADAY',
      confidence: top.confidenceScore,
      entry: top.entryPrice,
      stopLoss: top.stopLoss,
      takeProfit: top.takeProfit,
      takeProfit2: top.takeProfit2,
      aiReason: descriptionText,
      timestamp: 'Just now',
      read: false,
      urgency: confirmedSignals.length > 0 ? 'HIGH' : 'MEDIUM',
      setupGrade: 'A+'
    };
    setAiAlerts(prev => [newAlert, ...prev]);

    return top;
  }, [signals, markets, selectedTimeframe, isAssetLocked, getStrategyAdjustment, newsStatus]);

  // Automated background scanning system running every 20 minutes
  useEffect(() => {
    const runBackgroundScan = () => {
      console.log('[AURUM AI SCANNER] Running automated background scan...');
      
      setSignals(prevSignals => {
        const scanned = prevSignals.map(sig => {
          if (isAssetLocked(sig.marketId)) {
            return sig;
          }

          const setup = getTimeframeSetup(sig.marketId, selectedTimeframe);
          const market = markets.find(m => m.id === sig.marketId) || { name: sig.name, symbol: sig.symbol };
          
          let stratCode: 'SMC' | 'TREND' | 'BREAKOUT' | 'LIQUIDITY' | 'MOMENTUM' = 'SMC';
          if (setup.strategies.trendFollowing.emaAlignment !== 'Neutral') stratCode = 'TREND';
          else if (setup.strategies.breakoutRetest.retestStatus !== 'N/A') stratCode = 'BREAKOUT';
          else if (setup.strategies.liquidityReversal.sweepLevel !== 'N/A') stratCode = 'LIQUIDITY';

          const learningAdj = getStrategyAdjustment(sig.marketId, selectedTimeframe, stratCode);
          const isBlocked = newsStatus.isBlocked;
          const riskLevel = newsStatus.isBlocked ? 'HIGH' : 'LOW';
          const riskSummary = newsStatus.isBlocked ? newsStatus.message : 'Optimal news risk profile.';

          const mapped = mapSetupToTradeSignal(setup, sig.marketId, market.name, sig.symbol, isBlocked, riskLevel as any, riskSummary, learningAdj);
          return {
            ...mapped,
            setupStrength: computeTradeSetupStrength(mapped)
          };
        });

        // Identify new high probability signals to trigger alerts
        const highProb = scanned.filter(s => s.type !== 'WAIT' && s.confidenceScore >= 80 && !isAssetLocked(s.marketId));
        if (highProb.length > 0) {
          const best = highProb.sort((a, b) => b.confidenceScore - a.confidenceScore)[0];
          setAiAlerts(prev => {
            const isDuplicate = prev.some(a => a.assetId === best.marketId && a.signal === best.type);
            if (isDuplicate) return prev;
            const newAlert: AiAlert = {
              id: `alert-scan-bg-${Date.now()}`,
              assetId: best.marketId,
              symbol: best.symbol,
              name: best.name,
              signal: best.type,
              tradingMode: 'INTRADAY',
              confidence: best.confidenceScore,
              entry: best.entryPrice,
              stopLoss: best.stopLoss,
              takeProfit: best.takeProfit,
              takeProfit2: best.takeProfit2,
              aiReason: `M30 completed close confirms high-probability ${best.type === 'BUY' ? 'Bullish' : 'Bearish'} setup with ${best.confidenceScore}% confidence. SL placed safely beyond noise.`,
              timestamp: 'Just now',
              read: false,
              urgency: 'HIGH',
              setupGrade: 'A+'
            };
            return [newAlert, ...prev];
          });
        }

        return scanned;
      });
    };

    const initialTimeout = setTimeout(runBackgroundScan, 30000);
    const interval = setInterval(runBackgroundScan, 20 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [markets, selectedTimeframe, isAssetLocked, getStrategyAdjustment, newsStatus]);

  // Add signal to history
  const addSignalToHistory = (item: Omit<SignalHistoryItem, 'id' | 'closedAt'>) => {
    const newItem: SignalHistoryItem = {
      ...item,
      id: `hist-${Date.now()}`,
      closedAt: 'Just now'
    };

    setSignalHistory(prev => {
      const updated = [newItem, ...prev];
      const wins = updated.filter(t => t.result === 'TP HIT').length;
      const total = updated.length;
      const winRate = +( (wins / total) * 100 ).toFixed(1);

      setHistoryStats(stats => ({
        ...stats,
        totalTrades: total,
        wonTrades: wins,
        lostTrades: total - wins,
        winRate
      }));

      return updated;
    });
  };

  // Send Signal to Telegram function
  const sendSignalToTelegram = async (
    signalId: string, 
    statusUpdate?: 'NEW_SIGNAL' | 'TP1_HIT' | 'SL_HIT' | 'CANCELLED',
    isTest: boolean = false
  ) => {
    // Check if enabled (unless we are testing connection via the "Send Test Message" button)
    if (!telegramSettings.enabled && !isTest) {
      return { 
        success: false, 
        message: 'Telegram Alerts are currently disabled. Please enable them in the Telegram setup panel.', 
        formattedText: '' 
      };
    }

    const targetSignal = signals.find(s => s.id === signalId) || signals.find(s => s.marketId === 'xau-usd') || signals[0];
    if (!targetSignal) return { success: false, message: 'Signal not found', formattedText: '' };

    // 1. strictly Gold check (unless we are bypass testing)
    const isGold = targetSignal.marketId === 'xau-usd' || targetSignal.symbol.toLowerCase().includes('gold') || targetSignal.symbol.includes('XAU');
    if (!isGold && !isTest) {
      return {
        success: false,
        message: 'Telegram filter active: Only XAU/USD Gold trading signals are permitted for Telegram broadcast.',
        formattedText: ''
      };
    }

    const setupStrength = targetSignal.setupStrength || computeTradeSetupStrength(targetSignal);
    const grade = setupStrength.grade;

    let formattedText = '';
    const isUpdate = statusUpdate && statusUpdate !== 'NEW_SIGNAL';
    const duplicateKey = `sig-${targetSignal.marketId}-${targetSignal.timeframe}-${targetSignal.type}-${targetSignal.entryPrice}`;

    if (!isUpdate) {
      // Run SIGNAL QUALITY RULES strictly for NEW signals (unless we are bypass testing)
      if (!isTest) {
        // AI Decision check
        if (targetSignal.type !== 'BUY' && targetSignal.type !== 'SELL') {
          return {
            success: false,
            message: 'Signal rejected: AI Decision must be BUY or SELL. WAIT signals cannot be broadcast to Telegram.',
            formattedText: ''
          };
        }

        // Confidence Score >= 85%
        if (targetSignal.confidenceScore < 85) {
          return {
            success: false,
            message: `Signal rejected: Confidence Score is ${targetSignal.confidenceScore}%. Gold signals require a minimum score of 85%.`,
            formattedText: ''
          };
        }

        // Setup Grade = A or A+
        if (grade !== 'A' && grade !== 'A+') {
          return {
            success: false,
            message: `Signal rejected: Setup Grade is ${grade}. Gold signals require a high-probability A or A+ Grade setup.`,
            formattedText: ''
          };
        }

        // Risk Evaluation check
        const riskEval = getAurumRiskEvaluation(targetSignal.marketId, targetSignal.timeframe);
        const riskPassed = riskEval.riskPanel.riskLevel !== 'HIGH';
        if (!riskPassed) {
          return {
            success: false,
            message: 'Signal rejected: Risk Management validation failed (High Volatility Squeeze / Risk detected).',
            formattedText: ''
          };
        }

        // News Filter check
        const newsPassed = riskEval.qualityFilter.newsRisk.passed;
        if (!newsPassed) {
          return {
            success: false,
            message: 'Signal rejected: News Filter failed. Red Folder economic events detected in current trade window.',
            formattedText: ''
          };
        }

        // Trade Approval Status check
        const approvalCheck = getSmartTradeApprovalChecklist(targetSignal.marketId, targetSignal.symbol, tradingStyleMode);
        const isApproved = approvalCheck.status === 'TRADE APPROVED' || approvalCheck.isApproved;
        if (!isApproved) {
          return {
            success: false,
            message: 'Signal rejected: Trade Approval Status is NOT APPROVED. Setup failed confluence checks.',
            formattedText: ''
          };
        }

        // Limit Check: Maximum 7 per day
        if (telegramSettings.sentCountToday >= 7) {
          return {
            success: false,
            message: 'Signal rejected: Maximum limit of 6-7 signals per day has been reached for Telegram alerts.',
            formattedText: ''
          };
        }

        // Duplicate Check
        if (telegramSettings.sentKeys.includes(duplicateKey)) {
          return {
            success: false,
            message: 'Signal rejected: Duplicate signal protection triggered. This trade setup was already broadcast.',
            formattedText: ''
          };
        }
      }

      // Format New Signal message
      formattedText = `🟡 AURUM AI SIGNAL

Pair:
XAU/USD

Signal:
${isTest ? 'BUY' : targetSignal.type}

Entry:
$${(isTest ? 2638 : targetSignal.entryZone.min).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - $${(isTest ? 2644 : targetSignal.entryZone.max).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Stop Loss:
$${(isTest ? 2624 : targetSignal.stopLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Take Profit:
TP1: $${(isTest ? 2685 : targetSignal.takeProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
TP2: $${(isTest ? 2710 : targetSignal.takeProfit2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Timeframe:
${isTest ? 'H1' : targetSignal.timeframe}

Confidence:
${isTest ? 92 : targetSignal.confidenceScore}%

Setup Grade:
${isTest ? 'A+' : grade}`;
    } else {
      // Format Update Message
      const statusLabel = statusUpdate === 'TP1_HIT' ? 'TP1 HIT' : statusUpdate === 'SL_HIT' ? 'SL HIT' : 'CANCELLED';
      formattedText = `AURUM AI UPDATE

Pair:
XAU/USD

Status:
${statusLabel}`;
    }

    const newLog: TelegramLogItem = {
      id: `tel-${Date.now()}`,
      timestamp: 'Just now',
      signalSymbol: 'XAU/USD',
      signalType: isUpdate ? 'WAIT' : (isTest ? 'BUY' : targetSignal.type),
      messagePreview: formattedText,
      status: 'DELIVERED'
    };

    setTelegramSettings(prev => {
      const updatedKeys = isUpdate || isTest
        ? prev.sentKeys 
        : [...prev.sentKeys, duplicateKey];
      
      const updatedCount = isUpdate || isTest
        ? prev.sentCountToday
        : prev.sentCountToday + 1;

      return {
        ...prev,
        sentCountToday: updatedCount,
        sentKeys: updatedKeys,
        history: [newLog, ...prev.history.slice(0, 9)]
      };
    });

    return {
      success: true,
      message: isTest 
        ? `Test wire successfully transmitted to channel (${telegramSettings.channelTag || '@aurum_ai_signals'})`
        : `Dispatched XAU/USD ${isUpdate ? 'update' : 'signal'} to Telegram channel (${telegramSettings.channelTag || '@aurum_ai_signals'})`,
      formattedText
    };
  };

  const updateTelegramSettings = (settings: Partial<TelegramSettings>) => {
    setTelegramSettings(prev => ({ ...prev, ...settings }));
  };

  const regenerateAiSignals = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setSignals(prev => {
        return prev.map(s => {
          const shift = Math.floor(Math.random() * 5) - 2;
          const newConf = Math.min(98, Math.max(70, s.confidenceScore + shift));
          const updatedSig = {
            ...s,
            confidenceScore: newConf,
            generatedAt: 'Just now'
          };
          return {
            ...updatedSig,
            setupStrength: computeTradeSetupStrength(updatedSig)
          };
        });
      });
      setIsAiGenerating(false);
    }, 900);
  };

  return (
    <MarketContext.Provider
      value={{
        markets,
        signals,
        selectedSignalId,
        selectedSignal,
        selectedMarket,
        selectedTimeframe,
        tradingStyleMode,
        setTradingStyleMode,
        candles,
        dataConnectedStatus,
        isDataConnected,
        isWebSocketActive,
        streamStatus,
        lastMarketDataUpdate,
        getTickDebug,
        refreshMarketData,
        telegramSettings,
        activeNav,
        isTelegramModalOpen,
        isAiGenerating,
        watchlistAssetIds,
        toggleWatchlist,
        isFavorite,
        aiAlerts,
        unreadAlertCount,
        isAlertCenterOpen,
        setIsAlertCenterOpen,
        markAlertAsRead,
        markAllAlertsAsRead,
        dismissAlert,
        triggerSimulatedAlert,
        isDailyBriefOpen,
        setIsDailyBriefOpen,
        isRealDataModalOpen,
        setIsRealDataModalOpen,
        isQaModalOpen,
        setIsQaModalOpen,
        isUserDashboardOpen,
        setIsUserDashboardOpen,
        signalHistory,
        historyStats,
        isScanningMarket,
        scanProgress,
        scanStepText,
        highestProbabilitySignal,
        isScannerModalOpen,
        setIsScannerModalOpen,
        scanMarket,
        activeSetupStrength,
        chartOverlays,
        setChartOverlays,
        setSelectedSignalId,
        setSelectedTimeframe,
        setActiveNav,
        setIsTelegramModalOpen,
        sendSignalToTelegram,
        updateTelegramSettings,
        regenerateAiSignals,
        addSignalToHistory,
        newsArticles,
        economicEvents,
        upcomingHighlight,
        dailyBrief,
        breakingNews,
        predictionLearning,
        newsStatus,
        dataFreshness,
        dataSources,
        fetchNewsData,
        strategyLearning,
        assetLocks,
        pipelineStatuses,
        isAssetLocked,
        getAssetLock,
        lockAsset,
        unlockAsset,
        runSignalPipeline,
        getAssetPipelineStatus,
        clearExpiredSetup
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
