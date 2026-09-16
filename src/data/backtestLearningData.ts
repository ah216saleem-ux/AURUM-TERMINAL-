import { 
  StrategyPerformanceItem, 
  AssetBacktestSummary, 
  AiLearningStatusData 
} from '../types';

// 1. STRATEGY PERFORMANCE ANALYSIS (5 CORE STRATEGIES)
export const STRATEGY_PERFORMANCE_DATA: StrategyPerformanceItem[] = [
  {
    id: 'strat-smc',
    strategyName: 'Smart Money Concepts (SMC)',
    shortCode: 'SMC',
    winRate: 85.4,
    avgRiskReward: '1:3.15',
    successfulConditions: [
      'Order Block Mitigation in Discount/Premium Zone',
      'Asia High/Low Liquidity Sweep + CHOCH Confirmation',
      'High Volume London/NY Session Open Reversal'
    ],
    failedConditions: [
      'Low Volume Late NY Session Range Compression',
      'High-Impact Red Folder News Gap Volatility'
    ],
    confidenceWeight: 94.8,
    totalSignalsTested: 1420,
    grade: 'A+'
  },
  {
    id: 'strat-trend',
    strategyName: 'Trend Following (EMA Stack)',
    shortCode: 'TREND',
    winRate: 81.2,
    avgRiskReward: '1:2.65',
    successfulConditions: [
      'Full Bullish/Bearish Alignment (EMA 20 > 50 > 200)',
      'Clean 20-EMA Dynamic Pullback with Volume Spike',
      'H4 Trend Continuation following H1 Consolidation Breakout'
    ],
    failedConditions: [
      'Chop & Rangey Sideways Markets (RSI trapped 45-55)',
      'Sudden V-Shape News Reversals against EMA Stack'
    ],
    confidenceWeight: 89.2,
    totalSignalsTested: 1180,
    grade: 'A'
  },
  {
    id: 'strat-breakout',
    strategyName: 'Breakout Retest Strategy',
    shortCode: 'BREAKOUT',
    winRate: 78.6,
    avgRiskReward: '1:2.40',
    successfulConditions: [
      'Multi-Touch Key Support/Resistance Level Breakout',
      'Post-Breakout Shallow Retest with Decreasing Volume',
      'High Momentum Expansion Candle (Marubozu)'
    ],
    failedConditions: [
      'Fakeouts at Key Round Levels without Institutional Volume',
      'Pre-Market Low Volatility False Breakouts'
    ],
    confidenceWeight: 84.5,
    totalSignalsTested: 940,
    grade: 'A'
  },
  {
    id: 'strat-liquidity',
    strategyName: 'Liquidity Reversal Strategy',
    shortCode: 'LIQUIDITY',
    winRate: 83.1,
    avgRiskReward: '1:2.90',
    successfulConditions: [
      'Buy-Side / Sell-Side Liquidity Sweep (BSL/SSL)',
      'Equal Highs/Lows (EQH/EQL) Sweep followed by Instant FVG Reclaim',
      'Aggressive Institutional Wick Absorption'
    ],
    failedConditions: [
      'Sustained Trend Continuation through Liquidity Pools',
      'Low Volatility Sessions without Counter-Orders'
    ],
    confidenceWeight: 91.4,
    totalSignalsTested: 1050,
    grade: 'A+'
  },
  {
    id: 'strat-momentum',
    strategyName: 'Momentum Confirmation (RSI/MACD)',
    shortCode: 'MOMENTUM',
    winRate: 76.8,
    avgRiskReward: '1:2.20',
    successfulConditions: [
      'RSI Divergence at Key Structure Boundaries',
      'MACD Histogram Expansion with Zero Line Crossover',
      'Volume Surge > 1.5x 20-Period Average'
    ],
    failedConditions: [
      'Extended Overbought/Oversold Conditions in Parabolic Trends',
      'Divergences during Strong Macro Driven Trends'
    ],
    confidenceWeight: 82.0,
    totalSignalsTested: 860,
    grade: 'B+'
  }
];

// 2. HISTORICAL BACKTESTING BY ASSET (5 ASSETS)
export const ASSET_BACKTEST_DATA: AssetBacktestSummary[] = [
  {
    assetId: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Spot Gold',
    totalTrades: 540,
    winningTrades: 448,
    losingTrades: 92,
    winRate: 82.96,
    profitFactor: 2.84,
    bestTimeframe: '1H & 4H Confluence',
    totalRMultiple: '+984.6R',
    maxDrawdown: '-3.8%',
    testedPeriod: '2024 - 2026 Historical Dataset',
    equityCurvePoints: [100, 108, 115, 112, 124, 138, 145, 159, 172, 168, 185, 198, 215]
  },
  {
    assetId: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'US Tech Index',
    totalTrades: 490,
    winningTrades: 397,
    losingTrades: 93,
    winRate: 81.02,
    profitFactor: 2.68,
    bestTimeframe: '15M & 1H Scalp/Intraday',
    totalRMultiple: '+842.2R',
    maxDrawdown: '-4.2%',
    testedPeriod: '2024 - 2026 Historical Dataset',
    equityCurvePoints: [100, 106, 112, 118, 114, 128, 136, 148, 162, 158, 175, 188, 204]
  },
  {
    assetId: 'sp-500',
    symbol: 'S&P 500',
    name: 'US Broad Index',
    totalTrades: 420,
    winningTrades: 338,
    losingTrades: 82,
    winRate: 80.48,
    profitFactor: 2.52,
    bestTimeframe: '1H & 1D Swing',
    totalRMultiple: '+694.0R',
    maxDrawdown: '-3.2%',
    testedPeriod: '2024 - 2026 Historical Dataset',
    equityCurvePoints: [100, 104, 110, 116, 122, 128, 134, 142, 150, 156, 165, 174, 182]
  },
  {
    assetId: 'crude-oil',
    symbol: 'Oil WTI',
    name: 'Crude Oil',
    totalTrades: 380,
    winningTrades: 298,
    losingTrades: 82,
    winRate: 78.42,
    profitFactor: 2.38,
    bestTimeframe: '30M & 1H Intraday',
    totalRMultiple: '+586.4R',
    maxDrawdown: '-5.1%',
    testedPeriod: '2024 - 2026 Historical Dataset',
    equityCurvePoints: [100, 103, 107, 114, 109, 120, 128, 135, 144, 140, 152, 161, 170]
  },
  {
    assetId: 'xag-usd',
    symbol: 'Silver',
    name: 'XAG/USD Spot',
    totalTrades: 360,
    winningTrades: 288,
    losingTrades: 72,
    winRate: 80.00,
    profitFactor: 2.45,
    bestTimeframe: '1H & 4H Structure',
    totalRMultiple: '+612.0R',
    maxDrawdown: '-4.0%',
    testedPeriod: '2024 - 2026 Historical Dataset',
    equityCurvePoints: [100, 105, 111, 117, 113, 125, 132, 140, 149, 155, 164, 172, 180]
  }
];

// 3. AI LEARNING PANEL STATUS DATA
export const AI_LEARNING_STATUS: AiLearningStatusData = {
  statusText: 'ACTIVE LEARNING EPOCH #842',
  learningTasks: {
    improvingModels: 'Continuous fine-tuning on multi-timeframe liquidity sweeps and order block mitigation patterns.',
    updatingStrategyWeights: 'Dynamic adjustment prioritizing SMC (94.8% weight) and Liquidity Reversals (91.4% weight).',
    learningFromOutcomes: 'Reinforcement learning engine analyzing 5,450 historical & real-time trade logs across 2024-2026.'
  },
  lastEpochTimestamp: 'Just now (Continuous System Synchronization)',
  totalDatasetSize: '5,450 Executed Trade Samples',
  topConfidenceStrategy: 'Smart Money Concepts (SMC) • 94.8% Confidence Weight'
};
