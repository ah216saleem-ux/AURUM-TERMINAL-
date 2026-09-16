import { MarketItem, Candle, AiTradeSignal, Timeframe, SignalHistoryItem, SignalHistoryStats, TradeSetupStrength } from '../types';

export const INITIAL_MARKETS: MarketItem[] = [
  {
    id: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    category: 'commodities',
    price: 4302.50,
    change: -30.30,
    changePercent: -0.70,
    high24h: 4413.10,
    low24h: 4273.30,
    volume24h: '$34.2B',
    isOpen: true,
    marketStatusText: 'LIVE • COMEX / LBMA',
    exchange: 'COMEX / LBMA',
    decimals: 2,
    sparkline: [4330.1, 4345.4, 4329.8, 4350.2, 4338.9, 4325.5, 4315.0, 4308.4, 4302.5]
  },
  {
    id: 'xag-usd',
    symbol: 'XAG/USD',
    name: 'Silver',
    category: 'commodities',
    price: 63.42,
    change: -0.44,
    changePercent: -0.68,
    high24h: 64.80,
    low24h: 62.10,
    volume24h: '$12.4B',
    isOpen: true,
    marketStatusText: 'LIVE • COMEX',
    exchange: 'COMEX',
    decimals: 2,
    sparkline: [63.75, 63.90, 64.10, 64.05, 63.85, 63.60, 63.50, 63.45, 63.42]
  },
  {
    id: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'NASDAQ 100',
    category: 'indices',
    price: 28945.06,
    change: 7.20,
    changePercent: 0.03,
    high24h: 29120.00,
    low24h: 28810.00,
    volume24h: '$72.1B',
    isOpen: true,
    marketStatusText: 'LIVE • CME GLOBEX',
    exchange: 'NASDAQ / CME',
    decimals: 2,
    sparkline: [28850, 28880, 28920, 28910, 28960, 28930, 28955, 28940, 28945.06]
  },
  {
    id: 'sp-500',
    symbol: 'S&P 500',
    name: 'S&P 500',
    category: 'indices',
    price: 7551.81,
    change: -34.00,
    changePercent: -0.45,
    high24h: 7585.00,
    low24h: 7520.00,
    volume24h: '$48.5B',
    isOpen: true,
    marketStatusText: 'LIVE • CME',
    exchange: 'S&P / CME',
    decimals: 2,
    sparkline: [7575, 7580, 7565, 7570, 7560, 7555, 7558, 7550, 7551.81]
  },
  {
    id: 'crude-oil',
    symbol: 'WTI Crude Oil',
    name: 'WTI Crude Oil',
    category: 'commodities',
    price: 102.02,
    change: -3.80,
    changePercent: -3.60,
    high24h: 105.80,
    low24h: 101.20,
    volume24h: '$28.9B',
    isOpen: true,
    marketStatusText: 'LIVE • NYMEX',
    exchange: 'NYMEX',
    decimals: 2,
    sparkline: [105.5, 105.1, 104.2, 103.8, 103.1, 102.6, 102.3, 102.1, 102.02]
  },
  {
    id: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'EUR/USD',
    category: 'forex',
    price: 1.1467,
    change: -0.0075,
    changePercent: -0.65,
    high24h: 1.1520,
    low24h: 1.1440,
    volume24h: '$118.5B',
    isOpen: true,
    marketStatusText: 'LIVE • SPOT FX',
    exchange: 'INTERBANK FX',
    decimals: 4,
    sparkline: [1.1510, 1.1505, 1.1492, 1.1485, 1.1480, 1.1475, 1.1470, 1.1467]
  },
  {
    id: 'gbp-usd',
    symbol: 'GBP/USD',
    name: 'GBP/USD',
    category: 'forex',
    price: 1.3382,
    change: -0.0090,
    changePercent: -0.67,
    high24h: 1.3440,
    low24h: 1.3350,
    volume24h: '$84.2B',
    isOpen: true,
    marketStatusText: 'LIVE • SPOT FX',
    exchange: 'INTERBANK FX',
    decimals: 4,
    sparkline: [1.3430, 1.3425, 1.3410, 1.3400, 1.3395, 1.3388, 1.3385, 1.3382]
  },
  {
    id: 'usd-jpy',
    symbol: 'USD/JPY',
    name: 'USD/JPY',
    category: 'forex',
    price: 156.19,
    change: 1.10,
    changePercent: 0.71,
    high24h: 156.80,
    low24h: 155.40,
    volume24h: '$96.0B',
    isOpen: true,
    marketStatusText: 'LIVE • SPOT FX',
    exchange: 'INTERBANK FX',
    decimals: 2,
    sparkline: [155.30, 155.55, 155.70, 155.90, 156.00, 156.10, 156.15, 156.19]
  },
  {
    id: 'aud-usd',
    symbol: 'AUD/USD',
    name: 'AUD/USD',
    category: 'forex',
    price: 0.7087,
    change: -0.0047,
    changePercent: -0.66,
    high24h: 0.7130,
    low24h: 0.7060,
    volume24h: '$42.1B',
    isOpen: true,
    marketStatusText: 'LIVE • SPOT FX',
    exchange: 'INTERBANK FX',
    decimals: 4,
    sparkline: [0.7125, 0.7118, 0.7110, 0.7102, 0.7095, 0.7090, 0.7088, 0.7087]
  },
  {
    id: 'usd-cad',
    symbol: 'USD/CAD',
    name: 'USD/CAD',
    category: 'forex',
    price: 1.3987,
    change: 0.0073,
    changePercent: 0.52,
    high24h: 1.4020,
    low24h: 1.3940,
    volume24h: '$38.4B',
    isOpen: true,
    marketStatusText: 'LIVE • SPOT FX',
    exchange: 'INTERBANK FX',
    decimals: 4,
    sparkline: [1.3935, 1.3945, 1.3958, 1.3965, 1.3972, 1.3980, 1.3985, 1.3987]
  },
  {
    id: 'btc-usd',
    symbol: 'BTC/USD',
    name: 'BTC/USD',
    category: 'crypto',
    price: 75960.00,
    change: 301.20,
    changePercent: 0.40,
    high24h: 76560.76,
    low24h: 75064.82,
    volume24h: '$1.14B',
    isOpen: true,
    marketStatusText: 'LIVE • 24/7 SPOT',
    exchange: 'BINANCE SPOT',
    decimals: 2,
    sparkline: [75200, 75450, 75600, 75520, 75800, 75750, 75910, 75880, 75960]
  }
];

export const INITIAL_SIGNALS: AiTradeSignal[] = [
  // 1. GOLD (XAU/USD) - BUY / LONG
  {
    id: 'sig-gold-01',
    marketId: 'xau-usd',
    symbol: 'Gold XAU/USD',
    name: 'Gold Spot',
    type: 'BUY',
    direction: 'LONG',
    entryZone: {
      min: 2638.00,
      max: 2644.00,
      optimal: 2642.00
    },
    entryPrice: 2642.00,
    stopLoss: 2624.00,
    takeProfit: 2685.00,
    takeProfit2: 2710.00,
    riskReward: '1:3.4',
    timeframe: '1H',
    confidenceScore: 92,
    marketReason: 'Bullish liquidity sweep below $2,630 followed by H1 Order Block mitigation, FVG reclaim, and multi-timeframe alignment across intraday and daily bias.',
    keyFactors: [
      'H1 Bullish Order Block (OB+) tested & held at $2,636-$2,642',
      'Sell-side liquidity swept below Asian session low ($2,630)',
      'Break of Structure (BOS) confirmed at $2,648',
      'DXY weakness fueling institutional Gold safe-haven accumulation'
    ],
    trend: 'Strong Bullish',
    supportLevels: [2636.00, 2624.00, 2608.00],
    resistanceLevels: [2655.00, 2685.00, 2710.00],
    smc: {
      structure: 'Bullish BOS',
      orderBlock: {
        type: 'Bullish OB+',
        low: 2636.00,
        high: 2642.00,
        timeframe: '1H',
        label: 'H1 Bullish Order Block ($2,636 - $2,642)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Buy-Side Liquidity (BSL)',
        price: 2670.00,
        label: 'BSL Pool @ $2,670.00 (Unmitigated Highs)'
      },
      bos: {
        level: 2648.50,
        type: 'Bullish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: 2632.00,
        type: 'Bullish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 2636.00,
        high: 2642.00,
        timeframe: '1H',
        label: 'H1 Bullish OB+ ($2,636 - $2,642)',
        isMitigated: true
      },
      bearishOrderBlock: {
        low: 2688.00,
        high: 2695.00,
        timeframe: '4H',
        label: '4H Supply Zone ($2,688 - $2,695)',
        isMitigated: false
      },
      buySideLiquidity: {
        price: 2670.00,
        label: 'BSL Pool @ $2,670.00 (Equal Highs)'
      },
      sellSideLiquidity: {
        price: 2628.00,
        label: 'SSL Swept @ $2,628.10 (Session Low)'
      },
      liquiditySweep: {
        occurred: true,
        level: 2628.10,
        type: 'Sell-Side Sweep',
        description: 'Asian low swept with aggressive V-shape buyer absorption'
      },
      fairValueGap: {
        low: 2639.50,
        high: 2644.00,
        type: 'Bullish FVG',
        timeframe: '15M'
      },
      bosLevel: 2648.50,
      chochLevel: 2632.00
    },
    radar: {
      trendStrength: 89,
      buyersPressurePercent: 78,
      sellersPressurePercent: 22,
      smartMoneyActivity: 'Order Block Mitigation',
      marketMomentum: 'Strong Bullish Expansion',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'A+'
    },
    multiTimeframe: {
      agreementCount: 6,
      totalTimeframes: 7,
      verdict: '6/7 Bullish Confluence (Institutional Grade)',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'LONG', confidence: 88, entryStatus: 'Optimal Entry Zone', bias: 'Bullish', trend: 'Micro Impulsive Waves', keyLevel: '$2,641.50' },
        { timeframe: '15M', direction: 'LONG', confidence: 91, entryStatus: 'FVG Reclaim Confirmed', bias: 'Bullish', trend: 'Bullish Expansion', keyLevel: '$2,639.00' },
        { timeframe: '30M', direction: 'LONG', confidence: 90, entryStatus: 'OB Retest Complete', bias: 'Bullish', trend: 'Higher Low Formation', keyLevel: '$2,636.00' },
        { timeframe: '1H', direction: 'LONG', confidence: 94, entryStatus: 'Prime Mitigation Pocket', bias: 'Bullish', trend: 'Bullish BOS Structure', keyLevel: '$2,642.00' },
        { timeframe: '4H', direction: 'LONG', confidence: 92, entryStatus: 'Trend Continuation', bias: 'Bullish', trend: 'Strong Uptrend Channel', keyLevel: '$2,624.00' },
        { timeframe: '1D', direction: 'LONG', confidence: 95, entryStatus: 'Macro S&R Breakout', bias: 'Bullish', trend: 'Macro All-Time High Run', keyLevel: '$2,600.00' },
        { timeframe: '1W', direction: 'LONG', confidence: 96, entryStatus: 'Supercycle Expansion', bias: 'Bullish', trend: 'Parabolic Bull Market', keyLevel: '$2,550.00' }
      ]
    },
    technicals: {
      ema20: 2638.40,
      ema50: 2631.10,
      ema200: 2612.80,
      emaAlignment: 'Full Bullish Stack',
      rsi: 61.4,
      rsiCondition: 'Bullish Momentum (50-70)',
      macd: {
        macdLine: 4.85,
        signalLine: 3.20,
        histogram: 1.65,
        status: 'Bullish Cross'
      },
      atr: 16.40
    },
    bullishBearishReasoning: {
      bullishFactors: [
        'H1 and H4 bullish order block confluence actively defending higher low',
        'Clean liquidity sweep of Asian session lows clearing weak retail hands',
        'Strong MACD positive divergence on 15M and 1H timeframes'
      ],
      bearishRisks: [
        'Overhead 4H resistance block near $2,660-$2,670',
        'Upcoming US Core PPI inflation volatility'
      ],
      invalidationTrigger: 'Candle body close below H1 invalidation level $2,624.00',
      aiVerdict: 'Prime A+ institutional long setup with asymmetric 1:3.4 reward-to-risk ratio.'
    },
    status: 'ACTIVE',
    generatedAt: '10 mins ago'
  },

  // 2. SILVER (XAG/USD) - BUY / LONG
  {
    id: 'sig-silver-01',
    marketId: 'xag-usd',
    symbol: 'Silver XAG/USD',
    name: 'Silver Spot',
    type: 'BUY',
    direction: 'LONG',
    entryZone: {
      min: 31.15,
      max: 31.45,
      optimal: 31.30
    },
    entryPrice: 31.30,
    stopLoss: 30.65,
    takeProfit: 32.80,
    takeProfit2: 33.60,
    riskReward: '1:3.2',
    timeframe: '1H',
    confidenceScore: 89,
    marketReason: 'Clean double bottom with high-volume rejection from $30.80 support. Bullish order block mitigation aligns with Gold momentum.',
    keyFactors: [
      'H1 Bullish Order Block retested at $31.05-$31.25',
      'Industrial demand surge & solar sector futures accumulation',
      'Break of Structure (BOS) past $31.60 imminent'
    ],
    trend: 'Bullish',
    supportLevels: [31.10, 30.65, 29.80],
    resistanceLevels: [31.85, 32.80, 33.60],
    smc: {
      structure: 'Bullish CHOCH',
      orderBlock: {
        type: 'Bullish OB+',
        low: 31.05,
        high: 31.25,
        timeframe: '1H',
        label: 'H1 Bullish Order Block ($31.05 - $31.25)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Buy-Side Liquidity (BSL)',
        price: 32.50,
        label: 'BSL @ $32.50 (Swing High Liquidity)'
      },
      bos: {
        level: 31.60,
        type: 'Bullish BOS',
        status: 'Pending'
      },
      choch: {
        level: 31.15,
        type: 'Bullish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 31.05,
        high: 31.25,
        timeframe: '1H',
        label: 'H1 Bullish OB+ ($31.05 - $31.25)',
        isMitigated: true
      },
      bearishOrderBlock: {
        low: 32.80,
        high: 33.10,
        timeframe: '4H',
        label: '4H Supply Zone ($32.80 - $33.10)',
        isMitigated: false
      },
      buySideLiquidity: {
        price: 32.50,
        label: 'BSL @ $32.50 (Swing High Liquidity)'
      },
      sellSideLiquidity: {
        price: 30.70,
        label: 'SSL Swept @ $30.70'
      },
      liquiditySweep: {
        occurred: true,
        level: 30.70,
        type: 'Sell-Side Sweep',
        description: 'Sub-31.00 stop run reclaimed rapidly within 30m candle'
      },
      fairValueGap: {
        low: 31.20,
        high: 31.35,
        type: 'Bullish FVG',
        timeframe: '15M'
      },
      bosLevel: 31.60,
      chochLevel: 31.15
    },
    radar: {
      trendStrength: 82,
      buyersPressurePercent: 71,
      sellersPressurePercent: 29,
      smartMoneyActivity: 'Institutional Accumulation',
      marketMomentum: 'Bullish Momentum',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'A'
    },
    multiTimeframe: {
      agreementCount: 6,
      totalTimeframes: 7,
      verdict: '6/7 Bullish Alignment',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'LONG', confidence: 85, entryStatus: 'Optimal Entry Zone', bias: 'Bullish', trend: 'Ascending Channel', keyLevel: '$31.35' },
        { timeframe: '15M', direction: 'LONG', confidence: 88, entryStatus: 'Retest In Progress', bias: 'Bullish', trend: 'Higher Lows Stack', keyLevel: '$31.20' },
        { timeframe: '30M', direction: 'LONG', confidence: 89, entryStatus: 'OB Mitigation Pocket', bias: 'Bullish', trend: 'Volume Expansion', keyLevel: '$31.15' },
        { timeframe: '1H', direction: 'LONG', confidence: 91, entryStatus: 'Prime Entry Zone', bias: 'Bullish', trend: 'CHOCH Reversal', keyLevel: '$31.30' },
        { timeframe: '4H', direction: 'LONG', confidence: 87, entryStatus: 'Breakout Ready', bias: 'Bullish', trend: 'Uptrend Structure', keyLevel: '$30.65' },
        { timeframe: '1D', direction: 'LONG', confidence: 92, entryStatus: 'Multi-Month Breakout', bias: 'Bullish', trend: 'Bull Flag Break', keyLevel: '$29.80' },
        { timeframe: '1W', direction: 'LONG', confidence: 94, entryStatus: 'Macro Continuation', bias: 'Bullish', trend: 'Multi-Year Accumulation', keyLevel: '$28.50' }
      ]
    },
    technicals: {
      ema20: 31.22,
      ema50: 30.95,
      ema200: 29.85,
      emaAlignment: 'Full Bullish Stack',
      rsi: 58.6,
      rsiCondition: 'Bullish Momentum (50-70)',
      macd: {
        macdLine: 0.14,
        signalLine: 0.08,
        histogram: 0.06,
        status: 'Bullish Cross'
      },
      atr: 0.42
    },
    bullishBearishReasoning: {
      bullishFactors: [
        'Gold ratio compression pushing silver outperformance',
        'Unfilled BSL pools sitting at $32.50-$32.80'
      ],
      bearishRisks: ['Rejection at $31.85 prior range high'],
      invalidationTrigger: 'Break below $30.65 invalidates structural CHOCH',
      aiVerdict: 'High-upside commodities play targeting $32.80 TP1.'
    },
    status: 'ACTIVE',
    generatedAt: '18 mins ago'
  },

  // 3. CRUDE OIL (WTI) - SELL / SHORT
  {
    id: 'sig-oil-01',
    marketId: 'crude-oil',
    symbol: 'Oil WTI',
    name: 'Crude Oil',
    type: 'SELL',
    direction: 'SHORT',
    entryZone: {
      min: 71.30,
      max: 71.90,
      optimal: 71.60
    },
    entryPrice: 71.60,
    stopLoss: 72.85,
    takeProfit: 68.50,
    takeProfit2: 66.80,
    riskReward: '1:2.8',
    timeframe: '4H',
    confidenceScore: 84,
    marketReason: 'Bearish breaker block rejection at $72.20 with institutional supply injection and weak global demand metrics.',
    keyFactors: [
      '4H Bearish Order Block (OB-) defending $72.00-$72.50',
      'Buy-side liquidity swept above $72.30 prior to sharp selloff',
      'Bearish BOS confirmed on 1H chart below $71.10'
    ],
    trend: 'Bearish',
    supportLevels: [70.30, 68.50, 66.80],
    resistanceLevels: [72.20, 72.85, 73.50],
    smc: {
      structure: 'Bearish BOS',
      orderBlock: {
        type: 'Bearish OB-',
        low: 72.00,
        high: 72.50,
        timeframe: '4H',
        label: '4H Bearish Order Block ($72.00 - $72.50)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Sell-Side Liquidity (SSL)',
        price: 68.20,
        label: 'SSL Pool @ $68.20 (Major Lows)'
      },
      bos: {
        level: 71.10,
        type: 'Bearish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: 72.30,
        type: 'Bearish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 67.80,
        high: 68.40,
        timeframe: '1D',
        label: 'Daily Demand Block ($67.80 - $68.40)',
        isMitigated: false
      },
      bearishOrderBlock: {
        low: 72.00,
        high: 72.50,
        timeframe: '4H',
        label: '4H Bearish OB- ($72.00 - $72.50)',
        isMitigated: true
      },
      buySideLiquidity: {
        price: 72.80,
        label: 'BSL Swept @ $72.40'
      },
      sellSideLiquidity: {
        price: 68.20,
        label: 'SSL Target @ $68.20'
      },
      liquiditySweep: {
        occurred: true,
        level: 72.40,
        type: 'Buy-Side Sweep',
        description: 'Session high swept triggering institutional short block limit orders'
      },
      fairValueGap: {
        low: 71.40,
        high: 71.85,
        type: 'Bearish FVG',
        timeframe: '1H'
      },
      bosLevel: 71.10,
      chochLevel: 72.30
    },
    radar: {
      trendStrength: 76,
      buyersPressurePercent: 28,
      sellersPressurePercent: 72,
      smartMoneyActivity: 'Distribution Phase',
      marketMomentum: 'Bearish Acceleration',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'A'
    },
    multiTimeframe: {
      agreementCount: 6,
      totalTimeframes: 7,
      verdict: '6/7 Bearish Distribution Alignment',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'SHORT', confidence: 82, entryStatus: 'Optimal Entry Zone', bias: 'Bearish', trend: 'Descending Lower Highs', keyLevel: '$71.40' },
        { timeframe: '15M', direction: 'SHORT', confidence: 86, entryStatus: 'FVG Retest Complete', bias: 'Bearish', trend: 'Bearish Order Flow', keyLevel: '$71.60' },
        { timeframe: '30M', direction: 'SHORT', confidence: 84, entryStatus: 'Supply Mitigation', bias: 'Bearish', trend: 'Bearish Continuation', keyLevel: '$71.80' },
        { timeframe: '1H', direction: 'SHORT', confidence: 87, entryStatus: 'BOS Breakdown', bias: 'Bearish', trend: 'H1 Bearish Trend', keyLevel: '$71.60' },
        { timeframe: '4H', direction: 'SHORT', confidence: 89, entryStatus: 'Bearish OB Rejection', bias: 'Bearish', trend: '4H Bearish Wave', keyLevel: '$72.85' },
        { timeframe: '1D', direction: 'SHORT', confidence: 85, entryStatus: 'Macro Distribution', bias: 'Bearish', trend: 'Head & Shoulders Neckline', keyLevel: '$74.00' },
        { timeframe: '1W', direction: 'SHORT', confidence: 80, entryStatus: 'Supply Dominance', bias: 'Bearish', trend: 'Multi-Quarter Downtrend', keyLevel: '$78.00' }
      ]
    },
    technicals: {
      ema20: 71.65,
      ema50: 72.30,
      ema200: 74.10,
      emaAlignment: 'Full Bearish Stack',
      rsi: 41.2,
      rsiCondition: 'Bearish Momentum (30-50)',
      macd: {
        macdLine: -0.45,
        signalLine: -0.22,
        histogram: -0.23,
        status: 'Bearish Cross'
      },
      atr: 1.15
    },
    bullishBearishReasoning: {
      bullishFactors: ['Potential OPEC+ surprise output restraint headline'],
      bearishRisks: [
        'Persistent US inventories build',
        'H4 Bearish Order block rejection with strong volume'
      ],
      invalidationTrigger: 'Bullish H4 close above $72.85 stop loss level',
      aiVerdict: 'Disciplined short setup targeting sell-side liquidity at $68.50.'
    },
    status: 'ACTIVE',
    generatedAt: '25 mins ago'
  },

  // 4. NASDAQ 100 - BUY / LONG
  {
    id: 'sig-nasdaq-01',
    marketId: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'NDX / US100',
    type: 'BUY',
    direction: 'LONG',
    entryZone: {
      min: 19780.00,
      max: 19850.00,
      optimal: 19820.00
    },
    entryPrice: 19820.00,
    stopLoss: 19680.00,
    takeProfit: 20250.00,
    takeProfit2: 20500.00,
    riskReward: '1:3.1',
    timeframe: '1H',
    confidenceScore: 86,
    marketReason: 'Bullish FVG reclaim at 19,750 followed by tech mega-cap buy programs and 50-EMA dynamic bounce.',
    keyFactors: [
      '1H Bullish Order Block at 19,740-19,790 holding strongly',
      'AI & Semiconductor sector earnings upward revisions',
      'Unbroken series of higher highs and higher lows'
    ],
    trend: 'Strong Bullish',
    supportLevels: [19760.00, 19680.00, 19520.00],
    resistanceLevels: [19950.00, 20250.00, 20500.00],
    smc: {
      structure: 'Bullish BOS',
      orderBlock: {
        type: 'Bullish OB+',
        low: 19740.00,
        high: 19790.00,
        timeframe: '1H',
        label: 'H1 Bullish Order Block (19,740 - 19,790)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Buy-Side Liquidity (BSL)',
        price: 20120.00,
        label: 'BSL Pool @ 20,120.00 (All-Time High Traps)'
      },
      bos: {
        level: 19880.00,
        type: 'Bullish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: 19710.00,
        type: 'Bullish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 19740.00,
        high: 19790.00,
        timeframe: '1H',
        label: 'H1 Bullish OB+ (19,740 - 19,790)',
        isMitigated: true
      },
      bearishOrderBlock: {
        low: 20280.00,
        high: 20350.00,
        timeframe: '4H',
        label: '4H Supply Zone (20,280 - 20,350)',
        isMitigated: false
      },
      buySideLiquidity: {
        price: 20120.00,
        label: 'BSL Pool @ 20,120.00'
      },
      sellSideLiquidity: {
        price: 19685.00,
        label: 'SSL Swept @ 19,685.00'
      },
      liquiditySweep: {
        occurred: true,
        level: 19685.00,
        type: 'Sell-Side Sweep',
        description: 'Premarket liquidity run reclaimed with institutional market-on-close delta'
      },
      fairValueGap: {
        low: 19800.00,
        high: 19835.00,
        type: 'Bullish FVG',
        timeframe: '15M'
      },
      bosLevel: 19880.00,
      chochLevel: 19710.00
    },
    radar: {
      trendStrength: 87,
      buyersPressurePercent: 76,
      sellersPressurePercent: 24,
      smartMoneyActivity: 'Institutional Accumulation',
      marketMomentum: 'Strong Bullish Expansion',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'A+'
    },
    multiTimeframe: {
      agreementCount: 6,
      totalTimeframes: 7,
      verdict: '6/7 Bullish Equity Inflow',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'LONG', confidence: 84, entryStatus: 'Optimal Entry Zone', bias: 'Bullish', trend: 'Intraday Bull Momentum', keyLevel: '19,830.00' },
        { timeframe: '15M', direction: 'LONG', confidence: 87, entryStatus: 'FVG Fill & Bounce', bias: 'Bullish', trend: 'Bullish Staircase', keyLevel: '19,810.00' },
        { timeframe: '30M', direction: 'LONG', confidence: 89, entryStatus: 'Higher Low Confirmed', bias: 'Bullish', trend: 'Expansion Phase', keyLevel: '19,780.00' },
        { timeframe: '1H', direction: 'LONG', confidence: 91, entryStatus: 'Prime Entry Zone', bias: 'Bullish', trend: 'Bullish BOS Structure', keyLevel: '19,820.00' },
        { timeframe: '4H', direction: 'LONG', confidence: 93, entryStatus: 'Bull Flag Continuation', bias: 'Bullish', trend: 'Higher Timeframe Bull Channel', keyLevel: '19,680.00' },
        { timeframe: '1D', direction: 'LONG', confidence: 95, entryStatus: 'All-Time High Expansion', bias: 'Bullish', trend: 'Macro Tech Bull Run', keyLevel: '19,400.00' },
        { timeframe: '1W', direction: 'LONG', confidence: 97, entryStatus: 'Supercycle Tech Expansion', bias: 'Bullish', trend: 'Secular Tech Bull Trend', keyLevel: '18,800.00' }
      ]
    },
    technicals: {
      ema20: 19790.00,
      ema50: 19680.00,
      ema200: 19120.00,
      emaAlignment: 'Full Bullish Stack',
      rsi: 64.2,
      rsiCondition: 'Bullish Momentum (50-70)',
      macd: {
        macdLine: 48.2,
        signalLine: 31.0,
        histogram: 17.2,
        status: 'Bullish Cross'
      },
      atr: 128.50
    },
    bullishBearishReasoning: {
      bullishFactors: [
        'Semiconductor leadership pushing index to new swing highs',
        'Strong breadth across top 10 weighted components'
      ],
      bearishRisks: ['Bond yield volatility spikes'],
      invalidationTrigger: 'Hourly close below 19,680 stop loss level',
      aiVerdict: 'High conviction tech long setup targeting 20,250 target.'
    },
    status: 'ACTIVE',
    generatedAt: '32 mins ago'
  },

  // 5. S&P 500 - WAIT / RANGE
  {
    id: 'sig-sp-01',
    marketId: 'sp-500',
    symbol: 'S&P 500',
    name: 'SPX / US500',
    type: 'WAIT',
    direction: 'WAIT',
    entryZone: {
      min: 5690.00,
      max: 5698.00,
      optimal: 5695.00
    },
    entryPrice: 5695.00,
    stopLoss: 5650.00,
    takeProfit: 5780.00,
    takeProfit2: 5820.00,
    riskReward: '1:2.4',
    timeframe: '4H',
    confidenceScore: 74,
    marketReason: 'Range compression between 5,665 support and 5,700 psychological barrier. Awaiting clean breakout confirmation above 5,700.',
    keyFactors: [
      'Price trapped between 5,665 liquidity pool and 5,700 supply cap',
      'Neutral volume delta ahead of Federal Reserve interest rate release',
      'Equal highs (EQH) forming near 5,702'
    ],
    trend: 'Range Consolidation',
    supportLevels: [5664.00, 5640.00, 5600.00],
    resistanceLevels: [5702.00, 5740.00, 5780.00],
    smc: {
      structure: 'Range Consolidation',
      orderBlock: {
        type: 'Bullish OB+',
        low: 5650.00,
        high: 5665.00,
        timeframe: '4H',
        label: '4H Range Demand ($5,650 - $5,665)',
        isMitigated: false
      },
      liquidityZone: {
        type: 'Equal Highs/Lows (EQH/EQL)',
        price: 5702.00,
        label: 'Equal Highs (EQH) @ 5,702.00'
      },
      bos: {
        level: 5702.00,
        type: 'Bullish BOS',
        status: 'Pending'
      },
      choch: {
        level: 5664.00,
        type: 'Bearish CHOCH',
        status: 'Pending'
      },
      bullishOrderBlock: {
        low: 5650.00,
        high: 5665.00,
        timeframe: '4H',
        label: '4H Range Demand ($5,650 - $5,665)',
        isMitigated: false
      },
      bearishOrderBlock: {
        low: 5702.00,
        high: 5715.00,
        timeframe: '4H',
        label: '4H Resistance Cap ($5,702 - $5,715)',
        isMitigated: false
      },
      buySideLiquidity: {
        price: 5702.00,
        label: 'EQH Liquidity @ 5,702.00'
      },
      sellSideLiquidity: {
        price: 5664.00,
        label: 'Range Low Liquidity @ 5,664.00'
      },
      liquiditySweep: {
        occurred: false,
        level: 0,
        type: 'None',
        description: 'No major sweep yet; market consolidating in equilibrium zone'
      },
      fairValueGap: {
        low: 5675.00,
        high: 5684.00,
        type: 'Bullish FVG',
        timeframe: '1H'
      },
      bosLevel: 5702.00,
      chochLevel: 5664.00
    },
    radar: {
      trendStrength: 58,
      buyersPressurePercent: 53,
      sellersPressurePercent: 47,
      smartMoneyActivity: 'Re-accumulation',
      marketMomentum: 'Range Compression',
      entryTiming: 'Wait for Retest (Pullback)',
      setupQualityScore: 'B+'
    },
    multiTimeframe: {
      agreementCount: 4,
      totalTimeframes: 7,
      verdict: '4/7 Mixed / Compression Bias',
      alignment: 'Mixed / Conflict',
      timeframes: [
        { timeframe: '5M', direction: 'WAIT', confidence: 65, entryStatus: 'Consolidation Range', bias: 'Neutral', trend: 'Choppy Range', keyLevel: '5,688.00' },
        { timeframe: '15M', direction: 'WAIT', confidence: 68, entryStatus: 'Range Equilibrium', bias: 'Neutral', trend: 'Sideways Squeeze', keyLevel: '5,682.00' },
        { timeframe: '30M', direction: 'WAIT', confidence: 71, entryStatus: 'Wait for Breakout', bias: 'Neutral', trend: 'Bollinger Pinch', keyLevel: '5,675.00' },
        { timeframe: '1H', direction: 'WAIT', confidence: 74, entryStatus: 'Awaiting 5,700 Test', bias: 'Neutral', trend: 'Equilibrium Box', keyLevel: '5,695.00' },
        { timeframe: '4H', direction: 'LONG', confidence: 79, entryStatus: 'Macro Trend Support', bias: 'Bullish', trend: 'Ascending Base', keyLevel: '5,650.00' },
        { timeframe: '1D', direction: 'LONG', confidence: 84, entryStatus: 'Macro Uptrend', bias: 'Bullish', trend: 'Daily Bull Channel', keyLevel: '5,600.00' },
        { timeframe: '1W', direction: 'LONG', confidence: 90, entryStatus: 'Long-term Bullish', bias: 'Bullish', trend: 'Secular Bull Market', keyLevel: '5,450.00' }
      ]
    },
    technicals: {
      ema20: 5682.00,
      ema50: 5668.00,
      ema200: 5520.00,
      emaAlignment: 'Bullish Bias',
      rsi: 52.4,
      rsiCondition: 'Neutral (40-60)',
      macd: {
        macdLine: 3.1,
        signalLine: 2.8,
        histogram: 0.3,
        status: 'Bullish Cross'
      },
      atr: 28.40
    },
    bullishBearishReasoning: {
      bullishFactors: ['Underlying mega-cap resilience and strong dividend reinvestment'],
      bearishRisks: ['Overhead supply resistance cap at 5,700'],
      invalidationTrigger: 'Wait for confirmed 1H close above 5,702 or below 5,664',
      aiVerdict: 'WAIT for range expansion confirmation before taking new entries.'
    },
    status: 'WAITING_TRIGGER',
    generatedAt: '45 mins ago'
  },

  // 6. EUR/USD - BUY / LONG
  {
    id: 'sig-eurusd-01',
    marketId: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    type: 'BUY',
    direction: 'LONG',
    entryZone: {
      min: 1.0835,
      max: 1.0850,
      optimal: 1.0845
    },
    entryPrice: 1.0845,
    stopLoss: 1.0815,
    takeProfit: 1.0920,
    takeProfit2: 1.0965,
    riskReward: '1:2.5',
    timeframe: '1H',
    confidenceScore: 89,
    marketReason: 'H1 Bullish BOS confirmed with clean 15M Fair Value Gap mitigation above 1.0830 institutional demand block.',
    keyFactors: [
      '1H Bullish Order Block at 1.0825 - 1.0840 held with buyer absorption',
      'Asian low swept at 1.0810 with instant V-shaped bounce',
      'DXY resistance rejection driving EUR/USD upside expansion'
    ],
    trend: 'Bullish',
    supportLevels: [1.0830, 1.0815, 1.0780],
    resistanceLevels: [1.0875, 1.0920, 1.0965],
    smc: {
      structure: 'Bullish BOS',
      orderBlock: {
        type: 'Bullish OB+',
        low: 1.0825,
        high: 1.0840,
        timeframe: '1H',
        label: 'H1 Bullish OB+ (1.0825 - 1.0840)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Buy-Side Liquidity (BSL)',
        price: 1.0915,
        label: 'BSL Pool @ 1.0915 (Equal Highs)'
      },
      bos: {
        level: 1.0860,
        type: 'Bullish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: 1.0820,
        type: 'Bullish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 1.0825,
        high: 1.0840,
        timeframe: '1H',
        label: 'H1 Bullish OB+ (1.0825 - 1.0840)',
        isMitigated: true
      },
      bearishOrderBlock: {
        low: 1.0930,
        high: 1.0950,
        timeframe: '4H',
        label: '4H Supply Zone (1.0930 - 1.0950)',
        isMitigated: false
      },
      buySideLiquidity: {
        price: 1.0915,
        label: 'BSL Pool @ 1.0915'
      },
      sellSideLiquidity: {
        price: 1.0810,
        label: 'SSL Swept @ 1.0810'
      },
      liquiditySweep: {
        occurred: true,
        level: 1.0810,
        type: 'Sell-Side Sweep',
        description: 'Asian low swept and immediately reclaimed into London session'
      },
      fairValueGap: {
        low: 1.0840,
        high: 1.0852,
        type: 'Bullish FVG',
        timeframe: '15M'
      },
      bosLevel: 1.0860,
      chochLevel: 1.0820
    },
    radar: {
      trendStrength: 84,
      buyersPressurePercent: 74,
      sellersPressurePercent: 26,
      smartMoneyActivity: 'Institutional Accumulation',
      marketMomentum: 'Bullish Momentum',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'A+'
    },
    multiTimeframe: {
      agreementCount: 6,
      totalTimeframes: 7,
      verdict: '6/7 Bullish Alignment',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'LONG', confidence: 85, entryStatus: 'Optimal Entry Zone', bias: 'Bullish', trend: 'Micro Bull Waves', keyLevel: '1.0842' },
        { timeframe: '15M', direction: 'LONG', confidence: 88, entryStatus: 'FVG Reclaim', bias: 'Bullish', trend: 'Higher Lows', keyLevel: '1.0838' },
        { timeframe: '30M', direction: 'LONG', confidence: 87, entryStatus: 'OB Mitigated', bias: 'Bullish', trend: 'Order Flow Bullish', keyLevel: '1.0835' },
        { timeframe: '1H', direction: 'LONG', confidence: 91, entryStatus: 'Prime Entry Zone', bias: 'Bullish', trend: 'Bullish BOS', keyLevel: '1.0845' },
        { timeframe: '4H', direction: 'LONG', confidence: 89, entryStatus: 'Trend Channel Support', bias: 'Bullish', trend: '4H Bull Trend', keyLevel: '1.0815' },
        { timeframe: '1D', direction: 'LONG', confidence: 86, entryStatus: 'Daily Support Bounce', bias: 'Bullish', trend: 'Daily Up Channel', keyLevel: '1.0780' },
        { timeframe: '1W', direction: 'LONG', confidence: 88, entryStatus: 'Macro S&R Breakout', bias: 'Bullish', trend: 'Macro Bull Wave', keyLevel: '1.0650' }
      ]
    },
    technicals: {
      ema20: 1.0840,
      ema50: 1.0822,
      ema200: 1.0760,
      emaAlignment: 'Full Bullish Stack',
      rsi: 62.4,
      rsiCondition: 'Bullish Momentum (50-70)',
      macd: {
        macdLine: 0.0012,
        signalLine: 0.0006,
        histogram: 0.0006,
        status: 'Bullish Cross'
      },
      atr: 0.0048
    },
    bullishBearishReasoning: {
      bullishFactors: [
        'ECB policy rate stability and DXY softening below 103.50',
        'Clean institutional order block retest at 1.0830'
      ],
      bearishRisks: ['Eurozone manufacturing contraction headlines'],
      invalidationTrigger: 'Hourly candle close below 1.0815',
      aiVerdict: 'Top-tier A+ institutional long setup with optimal 1:2.5 risk reward.'
    },
    status: 'ACTIVE',
    generatedAt: '12 mins ago'
  },

  // 7. GBP/USD - BUY / LONG
  {
    id: 'sig-gbpusd-01',
    marketId: 'gbp-usd',
    symbol: 'GBP/USD',
    name: 'British Pound / USD',
    type: 'BUY',
    direction: 'LONG',
    entryZone: {
      min: 1.3105,
      max: 1.3130,
      optimal: 1.3120
    },
    entryPrice: 1.3120,
    stopLoss: 1.3080,
    takeProfit: 1.3210,
    takeProfit2: 1.3275,
    riskReward: '1:2.2',
    timeframe: '15M',
    confidenceScore: 84,
    marketReason: 'London session low swept at 1.3075 with rapid V-shape recovery and M15 Fair Value Gap expansion.',
    keyFactors: [
      'Asian low swept and aggressively bought during London session',
      'M15 Bullish Order Block at 1.3100-1.3115 active',
      'BoE hawkish guidance underpinning Sterling demand'
    ],
    trend: 'Bullish',
    supportLevels: [1.3105, 1.3080, 1.3020],
    resistanceLevels: [1.3160, 1.3210, 1.3275],
    smc: {
      structure: 'Bullish BOS',
      orderBlock: {
        type: 'Bullish OB+',
        low: 1.3100,
        high: 1.3115,
        timeframe: '15M',
        label: 'M15 Bullish OB+ (1.3100 - 1.3115)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Buy-Side Liquidity (BSL)',
        price: 1.3200,
        label: 'BSL Pool @ 1.3200 (Weekly Highs)'
      },
      bos: {
        level: 1.3140,
        type: 'Bullish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: 1.3090,
        type: 'Bullish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 1.3100,
        high: 1.3115,
        timeframe: '15M',
        label: 'M15 Bullish OB+ (1.3100 - 1.3115)',
        isMitigated: true
      },
      bearishOrderBlock: {
        low: 1.3220,
        high: 1.3250,
        timeframe: '4H',
        label: '4H Supply Zone (1.3220 - 1.3250)',
        isMitigated: false
      },
      buySideLiquidity: {
        price: 1.3200,
        label: 'BSL Pool @ 1.3200'
      },
      sellSideLiquidity: {
        price: 1.3075,
        label: 'SSL Swept @ 1.3075'
      },
      liquiditySweep: {
        occurred: true,
        level: 1.3075,
        type: 'Sell-Side Sweep',
        description: 'Asian low swept with immediate London buyer takeover'
      },
      fairValueGap: {
        low: 1.3110,
        high: 1.3125,
        type: 'Bullish FVG',
        timeframe: '5M'
      },
      bosLevel: 1.3140,
      chochLevel: 1.3090
    },
    radar: {
      trendStrength: 79,
      buyersPressurePercent: 68,
      sellersPressurePercent: 32,
      smartMoneyActivity: 'Liquidity Sweep & Reversal',
      marketMomentum: 'Bullish Momentum',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'A'
    },
    multiTimeframe: {
      agreementCount: 5,
      totalTimeframes: 7,
      verdict: '5/7 Bullish Confluence',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'LONG', confidence: 84, entryStatus: 'Optimal Entry Zone', bias: 'Bullish', trend: 'Scalp Expansion', keyLevel: '1.3118' },
        { timeframe: '15M', direction: 'LONG', confidence: 86, entryStatus: 'Prime Entry Zone', bias: 'Bullish', trend: 'Ascending Staircase', keyLevel: '1.3110' },
        { timeframe: '30M', direction: 'LONG', confidence: 83, entryStatus: 'OB Mitigated', bias: 'Bullish', trend: 'Bullish Shift', keyLevel: '1.3100' },
        { timeframe: '1H', direction: 'LONG', confidence: 85, entryStatus: 'Pullback Entry', bias: 'Bullish', trend: 'Intraday Uptrend', keyLevel: '1.3080' },
        { timeframe: '4H', direction: 'LONG', confidence: 88, entryStatus: 'Trend Continuation', bias: 'Bullish', trend: 'Higher Timeframe Channel', keyLevel: '1.3020' },
        { timeframe: '1D', direction: 'LONG', confidence: 84, entryStatus: 'Daily Support Bounce', bias: 'Bullish', trend: 'Bullish Trend', keyLevel: '1.2950' },
        { timeframe: '1W', direction: 'LONG', confidence: 80, entryStatus: 'Macro Base', bias: 'Bullish', trend: 'Multi-Month Base', keyLevel: '1.2800' }
      ]
    },
    technicals: {
      ema20: 1.3112,
      ema50: 1.3090,
      ema200: 1.3025,
      emaAlignment: 'Full Bullish Stack',
      rsi: 59.8,
      rsiCondition: 'Bullish Momentum (50-70)',
      macd: {
        macdLine: 0.0018,
        signalLine: 0.0010,
        histogram: 0.0008,
        status: 'Bullish Cross'
      },
      atr: 0.0068
    },
    bullishBearishReasoning: {
      bullishFactors: ['Cable momentum post-London sweep with UK PMI beating consensus'],
      bearishRisks: ['Overhead resistance at 1.3160'],
      invalidationTrigger: 'Break below 1.3080 invalidates scalp setup',
      aiVerdict: 'High-speed London session breakout scalp with clear 1:2.2 R:R.'
    },
    status: 'ACTIVE',
    generatedAt: '15 mins ago'
  },

  // 8. USD/JPY - SELL / SHORT
  {
    id: 'sig-usdjpy-01',
    marketId: 'usd-jpy',
    symbol: 'USD/JPY',
    name: 'US Dollar / Yen',
    type: 'SELL',
    direction: 'SHORT',
    entryZone: {
      min: 154.40,
      max: 154.80,
      optimal: 154.60
    },
    entryPrice: 154.60,
    stopLoss: 155.80,
    takeProfit: 151.20,
    takeProfit2: 149.50,
    riskReward: '1:2.8',
    timeframe: '4H',
    confidenceScore: 85,
    marketReason: 'Macro 4H Bearish Order Block rejection at 155.20 with MoF jawboning pressure and US 10Y yield softening.',
    keyFactors: [
      '4H Bearish Order Block rejected firmly at 155.10-155.40',
      'Bank of Japan rate hike expectations and intervention risk',
      'Bearish CHOCH confirmed on 1H chart below 154.80'
    ],
    trend: 'Bearish',
    supportLevels: [154.10, 151.20, 149.50],
    resistanceLevels: [155.20, 155.80, 156.50],
    smc: {
      structure: 'Bearish BOS',
      orderBlock: {
        type: 'Bearish OB-',
        low: 155.10,
        high: 155.40,
        timeframe: '4H',
        label: '4H Bearish OB- (155.10 - 155.40)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Sell-Side Liquidity (SSL)',
        price: 151.00,
        label: 'SSL Pool @ 151.00 (Major Swing Lows)'
      },
      bos: {
        level: 154.20,
        type: 'Bearish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: 154.80,
        type: 'Bearish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 149.00,
        high: 150.00,
        timeframe: '1D',
        label: 'Daily Demand Block (149.00 - 150.00)',
        isMitigated: false
      },
      bearishOrderBlock: {
        low: 155.10,
        high: 155.40,
        timeframe: '4H',
        label: '4H Bearish OB- (155.10 - 155.40)',
        isMitigated: true
      },
      buySideLiquidity: {
        price: 155.50,
        label: 'BSL Swept @ 155.40'
      },
      sellSideLiquidity: {
        price: 151.20,
        label: 'SSL Target @ 151.20'
      },
      liquiditySweep: {
        occurred: true,
        level: 155.40,
        type: 'Buy-Side Sweep',
        description: 'Sweep of 155.40 local high followed by rapid institutional selling'
      },
      fairValueGap: {
        low: 154.40,
        high: 154.90,
        type: 'Bearish FVG',
        timeframe: '1H'
      },
      bosLevel: 154.20,
      chochLevel: 154.80
    },
    radar: {
      trendStrength: 81,
      buyersPressurePercent: 30,
      sellersPressurePercent: 70,
      smartMoneyActivity: 'Distribution Phase',
      marketMomentum: 'Bearish Acceleration',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'A'
    },
    multiTimeframe: {
      agreementCount: 6,
      totalTimeframes: 7,
      verdict: '6/7 Bearish Alignment',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'SHORT', confidence: 82, entryStatus: 'Optimal Entry Zone', bias: 'Bearish', trend: 'Descending Channel', keyLevel: '154.65' },
        { timeframe: '15M', direction: 'SHORT', confidence: 85, entryStatus: 'FVG Retest', bias: 'Bearish', trend: 'Lower Highs', keyLevel: '154.75' },
        { timeframe: '30M', direction: 'SHORT', confidence: 84, entryStatus: 'Supply Mitigation', bias: 'Bearish', trend: 'Bearish Flow', keyLevel: '154.85' },
        { timeframe: '1H', direction: 'SHORT', confidence: 88, entryStatus: 'Prime Entry Zone', bias: 'Bearish', trend: 'Bearish BOS', keyLevel: '154.60' },
        { timeframe: '4H', direction: 'SHORT', confidence: 91, entryStatus: '4H OB Rejection', bias: 'Bearish', trend: '4H Reversal', keyLevel: '155.80' },
        { timeframe: '1D', direction: 'SHORT', confidence: 87, entryStatus: 'Daily Supply Rejection', bias: 'Bearish', trend: 'Macro Top Formation', keyLevel: '156.50' },
        { timeframe: '1W', direction: 'SHORT', confidence: 82, entryStatus: 'Macro Mean Reversion', bias: 'Bearish', trend: 'Exhaustion Wick', keyLevel: '158.00' }
      ]
    },
    technicals: {
      ema20: 154.70,
      ema50: 155.10,
      ema200: 156.40,
      emaAlignment: 'Full Bearish Stack',
      rsi: 39.4,
      rsiCondition: 'Bearish Momentum (30-50)',
      macd: {
        macdLine: -0.65,
        signalLine: -0.28,
        histogram: -0.37,
        status: 'Bearish Cross'
      },
      atr: 1.18
    },
    bullishBearishReasoning: {
      bullishFactors: ['Treasury yield bounce attempts'],
      bearishRisks: ['MoF physical currency market intervention risk and BoJ rate hikes'],
      invalidationTrigger: '4H candle close above 155.80',
      aiVerdict: 'High probability swing short targeting major 151.20 demand.'
    },
    status: 'ACTIVE',
    generatedAt: '20 mins ago'
  },

  // 9. BITCOIN (BTC/USD) - BUY / LONG
  {
    id: 'sig-btcusd-01',
    marketId: 'btc-usd',
    symbol: 'BTC/USD',
    name: 'Bitcoin / USD',
    type: 'BUY',
    direction: 'LONG',
    entryZone: {
      min: 63500.00,
      max: 64100.00,
      optimal: 63850.00
    },
    entryPrice: 63850.00,
    stopLoss: 61900.00,
    takeProfit: 68500.00,
    takeProfit2: 72000.00,
    riskReward: '1:2.4',
    timeframe: '4H',
    confidenceScore: 85,
    marketReason: 'Spot ETF continuous net accumulation holding 4H discount order block with massive short liquidation cascade pool at $68K.',
    keyFactors: [
      '4H Bullish Order Block at $62,500 - $63,800 holding on institutional spot delta',
      'Liquidation sweep of $62,100 long stops with immediate V-shape recovery',
      'Exchange reserves dropping to multi-year lows'
    ],
    trend: 'Strong Bullish',
    supportLevels: [63200.00, 61900.00, 59500.00],
    resistanceLevels: [65000.00, 68500.00, 72000.00],
    smc: {
      structure: 'Bullish BOS',
      orderBlock: {
        type: 'Bullish OB+',
        low: 62500.00,
        high: 63800.00,
        timeframe: '4H',
        label: '4H Bullish OB+ ($62,500 - $63,800)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Buy-Side Liquidity (BSL)',
        price: 68500.00,
        label: 'BSL Liquidation Pool @ $68,500.00'
      },
      bos: {
        level: 64500.00,
        type: 'Bullish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: 62800.00,
        type: 'Bullish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 62500.00,
        high: 63800.00,
        timeframe: '4H',
        label: '4H Bullish OB+ ($62,500 - $63,800)',
        isMitigated: true
      },
      bearishOrderBlock: {
        low: 69000.00,
        high: 70500.00,
        timeframe: '1D',
        label: 'Daily Supply Zone ($69,000 - $70,500)',
        isMitigated: false
      },
      buySideLiquidity: {
        price: 68500.00,
        label: 'BSL Pool @ $68,500.00'
      },
      sellSideLiquidity: {
        price: 62100.00,
        label: 'SSL Swept @ $62,100.00'
      },
      liquiditySweep: {
        occurred: true,
        level: 62100.00,
        type: 'Sell-Side Sweep',
        description: 'Weekend liquidation cascade swept $62.1K and snapped back above $63.5K'
      },
      fairValueGap: {
        low: 63400.00,
        high: 64200.00,
        type: 'Bullish FVG',
        timeframe: '1H'
      },
      bosLevel: 64500.00,
      chochLevel: 62800.00
    },
    radar: {
      trendStrength: 86,
      buyersPressurePercent: 75,
      sellersPressurePercent: 25,
      smartMoneyActivity: 'Institutional Accumulation',
      marketMomentum: 'Strong Bullish Expansion',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'A'
    },
    multiTimeframe: {
      agreementCount: 6,
      totalTimeframes: 7,
      verdict: '6/7 Bullish Crypto Confluence',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'LONG', confidence: 82, entryStatus: 'Optimal Entry Zone', bias: 'Bullish', trend: 'Micro Impulse', keyLevel: '$63,700' },
        { timeframe: '15M', direction: 'LONG', confidence: 86, entryStatus: 'FVG Reclaim', bias: 'Bullish', trend: 'Staircase Up', keyLevel: '$63,600' },
        { timeframe: '30M', direction: 'LONG', confidence: 85, entryStatus: 'OB Mitigated', bias: 'Bullish', trend: 'Higher Lows', keyLevel: '$63,400' },
        { timeframe: '1H', direction: 'LONG', confidence: 88, entryStatus: 'Prime Entry Zone', bias: 'Bullish', trend: 'Bullish Breakout', keyLevel: '$63,850' },
        { timeframe: '4H', direction: 'LONG', confidence: 92, entryStatus: '4H Trend Channel', bias: 'Bullish', trend: 'Macro Channel Support', keyLevel: '$61,900' },
        { timeframe: '1D', direction: 'LONG', confidence: 94, entryStatus: 'Daily Supercycle', bias: 'Bullish', trend: 'Post-Halving Bull Market', keyLevel: '$58,000' },
        { timeframe: '1W', direction: 'LONG', confidence: 96, entryStatus: 'Macro Accumulation', bias: 'Bullish', trend: 'Secular Bull Trend', keyLevel: '$52,000' }
      ]
    },
    technicals: {
      ema20: 63650.00,
      ema50: 62800.00,
      ema200: 59400.00,
      emaAlignment: 'Full Bullish Stack',
      rsi: 63.8,
      rsiCondition: 'Bullish Momentum (50-70)',
      macd: {
        macdLine: 480.0,
        signalLine: 290.0,
        histogram: 190.0,
        status: 'Bullish Cross'
      },
      atr: 1850.00
    },
    bullishBearishReasoning: {
      bullishFactors: [
        'Institutional Spot ETF net inflows accelerating',
        'Massive short liquidation overhang targeting $68,500'
      ],
      bearishRisks: ['Macro risk-off correlation spikes'],
      invalidationTrigger: '4H close below $61,900',
      aiVerdict: 'High-conviction swing long setup targeting $68,500 liquidation zone.'
    },
    status: 'ACTIVE',
    generatedAt: '16 mins ago'
  },

  // 10. AUD/USD - BUY / LONG
  {
    id: 'sig-audusd-01',
    marketId: 'aud-usd',
    symbol: 'AUD/USD',
    name: 'Aussie / USD',
    type: 'BUY',
    direction: 'LONG',
    entryZone: {
      min: 0.6705,
      max: 0.6730,
      optimal: 0.6720
    },
    entryPrice: 0.6720,
    stopLoss: 0.6685,
    takeProfit: 0.6795,
    takeProfit2: 0.6840,
    riskReward: '1:2.1',
    timeframe: '1H',
    confidenceScore: 81,
    marketReason: 'Commodity support bounce at 0.6690 with Chinese stimulus pricing and H1 EMA 50 dynamic hold.',
    keyFactors: [
      'RBA hawkish rate pause supporting Aussie yield advantage',
      'H1 Bullish Order Block tested at 0.6700-0.6715',
      'China economic stimulus package fueling commodity currencies'
    ],
    trend: 'Bullish',
    supportLevels: [0.6705, 0.6685, 0.6640],
    resistanceLevels: [0.6750, 0.6795, 0.6840],
    smc: {
      structure: 'Bullish BOS',
      orderBlock: {
        type: 'Bullish OB+',
        low: 0.6700,
        high: 0.6715,
        timeframe: '1H',
        label: 'H1 Bullish OB+ (0.6700 - 0.6715)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Buy-Side Liquidity (BSL)',
        price: 0.6790,
        label: 'BSL Pool @ 0.6790'
      },
      bos: {
        level: 0.6735,
        type: 'Bullish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: 0.6695,
        type: 'Bullish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 0.6700,
        high: 0.6715,
        timeframe: '1H',
        label: 'H1 Bullish OB+ (0.6700 - 0.6715)',
        isMitigated: true
      },
      bearishOrderBlock: {
        low: 0.6800,
        high: 0.6820,
        timeframe: '4H',
        label: '4H Supply Zone (0.6800 - 0.6820)',
        isMitigated: false
      },
      buySideLiquidity: {
        price: 0.6790,
        label: 'BSL Pool @ 0.6790'
      },
      sellSideLiquidity: {
        price: 0.6690,
        label: 'SSL Swept @ 0.6690'
      },
      liquiditySweep: {
        occurred: true,
        level: 0.6690,
        type: 'Sell-Side Sweep',
        description: 'Asian session dip swept 0.6690 before snapping higher'
      },
      fairValueGap: {
        low: 0.6710,
        high: 0.6722,
        type: 'Bullish FVG',
        timeframe: '15M'
      },
      bosLevel: 0.6735,
      chochLevel: 0.6695
    },
    radar: {
      trendStrength: 75,
      buyersPressurePercent: 65,
      sellersPressurePercent: 35,
      smartMoneyActivity: 'Institutional Accumulation',
      marketMomentum: 'Bullish Momentum',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'B+'
    },
    multiTimeframe: {
      agreementCount: 5,
      totalTimeframes: 7,
      verdict: '5/7 Bullish Alignment',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'LONG', confidence: 78, entryStatus: 'Optimal Entry Zone', bias: 'Bullish', trend: 'Micro Up', keyLevel: '0.6718' },
        { timeframe: '15M', direction: 'LONG', confidence: 82, entryStatus: 'FVG Hold', bias: 'Bullish', trend: 'Higher Lows', keyLevel: '0.6712' },
        { timeframe: '30M', direction: 'LONG', confidence: 80, entryStatus: 'OB Mitigated', bias: 'Bullish', trend: 'Ascending Channel', keyLevel: '0.6705' },
        { timeframe: '1H', direction: 'LONG', confidence: 84, entryStatus: 'Prime Entry Zone', bias: 'Bullish', trend: 'Bullish BOS', keyLevel: '0.6720' },
        { timeframe: '4H', direction: 'LONG', confidence: 83, entryStatus: 'Support Bounce', bias: 'Bullish', trend: '4H Trend Support', keyLevel: '0.6685' },
        { timeframe: '1D', direction: 'LONG', confidence: 81, entryStatus: 'Daily Base', bias: 'Bullish', trend: 'Base Breakout', keyLevel: '0.6640' },
        { timeframe: '1W', direction: 'LONG', confidence: 78, entryStatus: 'Macro Cycle', bias: 'Bullish', trend: 'Commodity Uptrend', keyLevel: '0.6550' }
      ]
    },
    technicals: {
      ema20: 0.6715,
      ema50: 0.6700,
      ema200: 0.6655,
      emaAlignment: 'Full Bullish Stack',
      rsi: 57.2,
      rsiCondition: 'Bullish Momentum (50-70)',
      macd: {
        macdLine: 0.0008,
        signalLine: 0.0004,
        histogram: 0.0004,
        status: 'Bullish Cross'
      },
      atr: 0.0042
    },
    bullishBearishReasoning: {
      bullishFactors: ['Iron ore rally and China PBOC liquidity injections'],
      bearishRisks: ['US Dollar resilience on strong US retail sales'],
      invalidationTrigger: 'Hourly close below 0.6685',
      aiVerdict: 'Solid B+ intraday long trade targeting 0.6795 resistance.'
    },
    status: 'ACTIVE',
    generatedAt: '28 mins ago'
  },

  // 11. USD/CAD - SELL / SHORT
  {
    id: 'sig-usdcad-01',
    marketId: 'usd-cad',
    symbol: 'USD/CAD',
    name: 'US Dollar / CAD',
    type: 'SELL',
    direction: 'SHORT',
    entryZone: {
      min: 1.3565,
      max: 1.3590,
      optimal: 1.3580
    },
    entryPrice: 1.3580,
    stopLoss: 1.3630,
    takeProfit: 1.3480,
    takeProfit2: 1.3420,
    riskReward: '1:2.0',
    timeframe: '1H',
    confidenceScore: 79,
    marketReason: 'Resistance rejection at 1.3620 aligned with Canadian employment stability and oil price rebound.',
    keyFactors: [
      '1H Bearish Order Block at 1.3600-1.3625 rejecting buyers',
      'Crude oil recovery strengthening Canadian Dollar fundamentals',
      'Bearish BOS confirmed below 1.3585'
    ],
    trend: 'Bearish',
    supportLevels: [1.3550, 1.3480, 1.3420],
    resistanceLevels: [1.3600, 1.3630, 1.3670],
    smc: {
      structure: 'Bearish BOS',
      orderBlock: {
        type: 'Bearish OB-',
        low: 1.3600,
        high: 1.3625,
        timeframe: '1H',
        label: 'H1 Bearish OB- (1.3600 - 1.3625)',
        isMitigated: true
      },
      liquidityZone: {
        type: 'Sell-Side Liquidity (SSL)',
        price: 1.3480,
        label: 'SSL Pool @ 1.3480'
      },
      bos: {
        level: 1.3570,
        type: 'Bearish BOS',
        status: 'Confirmed'
      },
      choch: {
        level: 1.3610,
        type: 'Bearish CHOCH',
        status: 'Confirmed'
      },
      bullishOrderBlock: {
        low: 1.3400,
        high: 1.3430,
        timeframe: '1D',
        label: 'Daily Demand Block (1.3400 - 1.3430)',
        isMitigated: false
      },
      bearishOrderBlock: {
        low: 1.3600,
        high: 1.3625,
        timeframe: '1H',
        label: 'H1 Bearish OB- (1.3600 - 1.3625)',
        isMitigated: true
      },
      buySideLiquidity: {
        price: 1.3625,
        label: 'BSL Swept @ 1.3625'
      },
      sellSideLiquidity: {
        price: 1.3480,
        label: 'SSL Target @ 1.3480'
      },
      liquiditySweep: {
        occurred: true,
        level: 1.3625,
        type: 'Buy-Side Sweep',
        description: 'Session high swept with immediate bearish absorption'
      },
      fairValueGap: {
        low: 1.3575,
        high: 1.3595,
        type: 'Bearish FVG',
        timeframe: '15M'
      },
      bosLevel: 1.3570,
      chochLevel: 1.3610
    },
    radar: {
      trendStrength: 73,
      buyersPressurePercent: 32,
      sellersPressurePercent: 68,
      smartMoneyActivity: 'Distribution Phase',
      marketMomentum: 'Bearish Acceleration',
      entryTiming: 'Optimal Entry Zone',
      setupQualityScore: 'B+'
    },
    multiTimeframe: {
      agreementCount: 5,
      totalTimeframes: 7,
      verdict: '5/7 Bearish Alignment',
      alignment: 'High Confluence',
      timeframes: [
        { timeframe: '5M', direction: 'SHORT', confidence: 77, entryStatus: 'Optimal Entry Zone', bias: 'Bearish', trend: 'Descending Wave', keyLevel: '1.3582' },
        { timeframe: '15M', direction: 'SHORT', confidence: 80, entryStatus: 'FVG Retest', bias: 'Bearish', trend: 'Lower Highs', keyLevel: '1.3590' },
        { timeframe: '30M', direction: 'SHORT', confidence: 78, entryStatus: 'OB Rejection', bias: 'Bearish', trend: 'Bearish Flow', keyLevel: '1.3598' },
        { timeframe: '1H', direction: 'SHORT', confidence: 81, entryStatus: 'Prime Entry Zone', bias: 'Bearish', trend: 'Bearish BOS', keyLevel: '1.3580' },
        { timeframe: '4H', direction: 'SHORT', confidence: 82, entryStatus: 'Supply Defense', bias: 'Bearish', trend: '4H Range Breakdown', keyLevel: '1.3630' },
        { timeframe: '1D', direction: 'SHORT', confidence: 79, entryStatus: 'Daily Resistance', bias: 'Bearish', trend: 'Daily Downturn', keyLevel: '1.3670' },
        { timeframe: '1W', direction: 'SHORT', confidence: 76, entryStatus: 'Macro Range High', bias: 'Bearish', trend: 'Macro Channel Top', keyLevel: '1.3750' }
      ]
    },
    technicals: {
      ema20: 1.3586,
      ema50: 1.3602,
      ema200: 1.3645,
      emaAlignment: 'Full Bearish Stack',
      rsi: 42.1,
      rsiCondition: 'Bearish Momentum (30-50)',
      macd: {
        macdLine: -0.0011,
        signalLine: -0.0005,
        histogram: -0.0006,
        status: 'Bearish Cross'
      },
      atr: 0.0052
    },
    bullishBearishReasoning: {
      bullishFactors: ['Potential US economic outperformance vs Canada'],
      bearishRisks: ['Oil strength and BoC rate stability'],
      invalidationTrigger: 'Hourly close above 1.3630',
      aiVerdict: 'Disciplined B+ short setup with 1:2.0 reward-to-risk ratio.'
    },
    status: 'ACTIVE',
    generatedAt: '35 mins ago'
  }
];

export const computeTradeSetupStrength = (signal: AiTradeSignal): TradeSetupStrength => {
  // 1. Trend Strength (0-100)
  let trendScore = 75;
  let trendLabel = 'Positive Trend Bias';
  if (signal.technicals.emaAlignment === 'Full Bullish Stack' || signal.technicals.emaAlignment === 'Full Bearish Stack') {
    trendScore = signal.direction === 'WAIT' ? 62 : 95;
    trendLabel = signal.direction === 'LONG' ? 'Full Bullish Stack (EMA 20 > 50 > 200)' : 'Full Bearish Stack (EMA 20 < 50 < 200)';
  } else if (signal.technicals.emaAlignment === 'Bullish Bias') {
    trendScore = 80;
    trendLabel = 'Bullish Trend Structure';
  } else {
    trendScore = 60;
    trendLabel = 'Range Compression / Choppy Base';
  }

  // 2. Smart Money Concepts (0-100)
  let smcScore = 70;
  let smcLabel = 'Structural Equilibrium';
  if (signal.smc.bos.status === 'Confirmed' && signal.smc.choch.status === 'Confirmed') {
    smcScore = 96;
    smcLabel = `Confirmed ${signal.smc.structure} & CHOCH`;
  } else if (signal.smc.bos.status === 'Confirmed') {
    smcScore = 91;
    smcLabel = `Confirmed ${signal.smc.bos.type} Pivot`;
  } else if (signal.smc.choch.status === 'Confirmed') {
    smcScore = 87;
    smcLabel = `Structural ${signal.smc.choch.type} Reversal`;
  } else {
    smcScore = 64;
    smcLabel = 'Pending Structural Confirmation';
  }

  // 3. Order Block Validity (0-100)
  let obScore = 75;
  let obLabel = 'Standard Supply/Demand Zone';
  if (signal.smc.orderBlock.isMitigated) {
    obScore = 94;
    obLabel = `${signal.smc.orderBlock.type} Active Mitigation`;
  } else {
    obScore = 83;
    obLabel = `Unmitigated ${signal.smc.orderBlock.timeframe} Order Block`;
  }

  // 4. Liquidity Confirmation (0-100)
  let liqScore = 65;
  let liqLabel = 'Internal Liquidity Intact';
  if (signal.smc.liquiditySweep.occurred) {
    liqScore = 93;
    liqLabel = `${signal.smc.liquiditySweep.type} Executed (Stop Run Absorbed)`;
  } else if (signal.smc.liquidityZone) {
    liqScore = 78;
    liqLabel = `Targeting ${signal.smc.liquidityZone.label}`;
  }

  // 5. Momentum (0-100)
  let momScore = 70;
  let momLabel = 'Neutral Momentum';
  const rsi = signal.technicals.rsi;
  const isBullish = signal.direction === 'LONG';
  if (isBullish && rsi >= 50 && rsi <= 68 && signal.technicals.macd.status.includes('Bullish')) {
    momScore = 92;
    momLabel = `Bullish Momentum (RSI ${rsi.toFixed(1)} + MACD Expansion)`;
  } else if (!isBullish && signal.direction === 'SHORT' && rsi <= 48 && signal.technicals.macd.status.includes('Bearish')) {
    momScore = 90;
    momLabel = `Bearish Momentum (RSI ${rsi.toFixed(1)} + MACD Breakdown)`;
  } else if (signal.direction === 'WAIT') {
    momScore = 58;
    momLabel = `Range Compression (RSI ${rsi.toFixed(1)})`;
  } else {
    momScore = 80;
    momLabel = `Active Momentum Divergence (${signal.technicals.macd.status})`;
  }

  // Weighted composite setup score (0-100%)
  const overallScore = Math.min(100, Math.max(0, Math.round(
    trendScore * 0.25 +
    smcScore * 0.25 +
    obScore * 0.20 +
    liqScore * 0.15 +
    momScore * 0.15
  )));

  let grade: 'A+' | 'A' | 'B+' | 'B' = 'B';
  let verdict = 'Moderate Confluence Setup';
  if (overallScore >= 90) {
    grade = 'A+';
    verdict = 'Institutional A+ Setup — Optimal Confluence & Asymmetric R:R';
  } else if (overallScore >= 82) {
    grade = 'A';
    verdict = 'High-Probability Setup — Clean SMC Structural Alignment';
  } else if (overallScore >= 74) {
    grade = 'B+';
    verdict = 'Standard Quality Setup — Watch for OB Pullback';
  } else {
    grade = 'B';
    verdict = 'Range Compression — Awaiting Breakout Confirmation';
  }

  return {
    overallScore,
    grade,
    verdict,
    trendStrength: { score: trendScore, label: trendLabel },
    smcStructure: { score: smcScore, label: smcLabel },
    orderBlockValidity: { score: obScore, label: obLabel },
    liquidityConfirmation: { score: liqScore, label: liqLabel },
    momentum: { score: momScore, label: momLabel }
  };
};

// Initial historical closed signals
export const INITIAL_SIGNAL_HISTORY: SignalHistoryItem[] = [
  {
    id: 'hist-01',
    marketId: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    type: 'BUY',
    direction: 'LONG',
    timeframe: '1H',
    entryPrice: 2618.50,
    exitPrice: 2642.00,
    stopLoss: 2604.00,
    takeProfit: 2642.00,
    result: 'TP HIT',
    pnlR: '+3.8R',
    pnlPercent: 0.90,
    closedAt: 'Today, 14:15 UTC',
    duration: '3h 45m',
    reason: 'H1 Bullish Order Block mitigation + Asian SSL sweep absorption',
    setupScore: 94,
    decimals: 2
  },
  {
    id: 'hist-02',
    marketId: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'NDX / US100',
    type: 'BUY',
    direction: 'LONG',
    timeframe: '1H',
    entryPrice: 19680.00,
    exitPrice: 19840.00,
    stopLoss: 19590.00,
    takeProfit: 19840.00,
    result: 'TP HIT',
    pnlR: '+3.1R',
    pnlPercent: 0.81,
    closedAt: 'Today, 11:30 UTC',
    duration: '2h 10m',
    reason: 'Premarket FVG fill + Bullish BOS breakout confirmation',
    setupScore: 91,
    decimals: 2
  },
  {
    id: 'hist-03',
    marketId: 'xag-usd',
    symbol: 'XAG/USD',
    name: 'Silver Spot',
    type: 'BUY',
    direction: 'LONG',
    timeframe: '1H',
    entryPrice: 30.75,
    exitPrice: 31.42,
    stopLoss: 30.25,
    takeProfit: 31.42,
    result: 'TP HIT',
    pnlR: '+3.2R',
    pnlPercent: 2.18,
    closedAt: 'Yesterday, 19:40 UTC',
    duration: '5h 20m',
    reason: 'Double bottom rejection at $30.70 + CHOCH trend shift',
    setupScore: 89,
    decimals: 2
  },
  {
    id: 'hist-04',
    marketId: 'crude-oil',
    symbol: 'Oil WTI',
    name: 'Crude Oil',
    type: 'SELL',
    direction: 'SHORT',
    timeframe: '4H',
    entryPrice: 73.20,
    exitPrice: 70.80,
    stopLoss: 74.15,
    takeProfit: 70.80,
    result: 'TP HIT',
    pnlR: '+2.9R',
    pnlPercent: 3.28,
    closedAt: 'Yesterday, 15:10 UTC',
    duration: '8h 15m',
    reason: '4H Bearish breaker block rejection + BSL buy-side sweep at $73.50',
    setupScore: 87,
    decimals: 2
  },
  {
    id: 'hist-05',
    marketId: 'sp-500',
    symbol: 'S&P 500',
    name: 'SPX / US500',
    type: 'BUY',
    direction: 'LONG',
    timeframe: '1H',
    entryPrice: 5675.00,
    exitPrice: 5658.00,
    stopLoss: 5658.00,
    takeProfit: 5725.00,
    result: 'SL HIT',
    pnlR: '-1.0R',
    pnlPercent: -0.30,
    closedAt: '2 days ago',
    duration: '1h 30m',
    reason: 'Intraday CPI headline volatility triggered stop invalidation level',
    setupScore: 76,
    decimals: 2
  },
  {
    id: 'hist-06',
    marketId: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    type: 'SELL',
    direction: 'SHORT',
    timeframe: '15M',
    entryPrice: 2655.00,
    exitPrice: 2632.00,
    stopLoss: 2662.00,
    takeProfit: 2632.00,
    result: 'TP HIT',
    pnlR: '+3.6R',
    pnlPercent: 0.87,
    closedAt: '2 days ago',
    duration: '4h 05m',
    reason: 'Clean BSL sweep of equal highs + Bearish FVG distribution',
    setupScore: 93,
    decimals: 2
  },
  {
    id: 'hist-07',
    marketId: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'NDX / US100',
    type: 'SELL',
    direction: 'SHORT',
    timeframe: '4H',
    entryPrice: 19920.00,
    exitPrice: 19700.00,
    stopLoss: 20010.00,
    takeProfit: 19700.00,
    result: 'TP HIT',
    pnlR: '+2.8R',
    pnlPercent: 1.10,
    closedAt: '3 days ago',
    duration: '12h 40m',
    reason: 'Overhead 4H supply block rejection with bearish divergence',
    setupScore: 86,
    decimals: 2
  },
  {
    id: 'hist-08',
    marketId: 'crude-oil',
    symbol: 'Oil WTI',
    name: 'Crude Oil',
    type: 'BUY',
    direction: 'LONG',
    timeframe: '1H',
    entryPrice: 69.40,
    exitPrice: 68.75,
    stopLoss: 68.75,
    takeProfit: 71.80,
    result: 'SL HIT',
    pnlR: '-1.0R',
    pnlPercent: -0.94,
    closedAt: '4 days ago',
    duration: '2h 15m',
    reason: 'Inventory build spike pushed price below structural demand base',
    setupScore: 74,
    decimals: 2
  },
  {
    id: 'hist-09',
    marketId: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    type: 'BUY',
    direction: 'LONG',
    timeframe: '4H',
    entryPrice: 2582.00,
    exitPrice: 2620.00,
    stopLoss: 2568.00,
    takeProfit: 2620.00,
    result: 'TP HIT',
    pnlR: '+4.2R',
    pnlPercent: 1.47,
    closedAt: '5 days ago',
    duration: '18h 30m',
    reason: 'Macro daily demand block test with strong Fed pivot pricing',
    setupScore: 97,
    decimals: 2
  },
  {
    id: 'hist-10',
    marketId: 'xag-usd',
    symbol: 'XAG/USD',
    name: 'Silver Spot',
    type: 'BUY',
    direction: 'LONG',
    timeframe: '4H',
    entryPrice: 29.80,
    exitPrice: 30.90,
    stopLoss: 29.35,
    takeProfit: 30.90,
    result: 'TP HIT',
    pnlR: '+3.4R',
    pnlPercent: 3.69,
    closedAt: '6 days ago',
    duration: '1d 4h',
    reason: 'Multi-week ascending channel breakout retest completed',
    setupScore: 92,
    decimals: 2
  }
];

export const INITIAL_HISTORY_STATS: SignalHistoryStats = {
  winRate: 80.0,
  totalTrades: 10,
  wonTrades: 8,
  lostTrades: 2,
  totalPnlR: '+25.0R',
  profitFactor: 4.85,
  avgRiskReward: '1:3.3',
  netPips: 2940
};

export const generateSampleCandles = (basePrice: number, count = 35, timeframe: Timeframe = '1H'): Candle[] => {
  const candles: Candle[] = [];
  let currentPrice = basePrice * 0.985;
  const now = Date.now();

  const stepMinutes: Record<Timeframe, number> = {
    '1M': 1,
    '5M': 5,
    '15M': 15,
    '30M': 30,
    '1H': 60,
    '4H': 240,
    '1D': 1440,
    '1W': 10080
  };

  const minutesPerCandle = stepMinutes[timeframe] || 60;

  for (let i = count; i >= 0; i--) {
    const timestamp = now - i * minutesPerCandle * 60 * 1000;
    const dateObj = new Date(timestamp);
    const timeLabel = timeframe === '1D' || timeframe === '1W'
      ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
      : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const volatility = basePrice * 0.0035;
    const randomShift = (Math.random() - 0.47) * volatility;
    const open = currentPrice;
    const close = open + randomShift;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.7);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.7);
    const volume = Math.floor(Math.random() * 8500 + 1500);

    candles.push({
      time: timestamp,
      timeLabel,
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close;
  }

  return candles;
};
