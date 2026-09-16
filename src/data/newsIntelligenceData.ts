import { 
  EconomicEvent, 
  HistoricalEventAnalysis, 
  AiNewsPrediction, 
  CompositeAiScore,
  SignalType
} from '../types';

// DATA SOURCES: Forex Factory Economic Calendar, Investing.com Economic Calendar, Trading Economics API
export const fontSources = [
  { name: 'Forex Factory', status: 'SYNCHRONIZED', latency: '12ms' },
  { name: 'Investing.com', status: 'SYNCHRONIZED', latency: '18ms' },
  { name: 'Trading Economics API', status: 'ACTIVE', latency: '9ms' }
];

// 1. ECONOMIC CALENDAR DATA
export const UPCOMING_ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: 'evt-cpi-01',
    eventName: 'US CPI Inflation Rate (YoY)',
    category: 'CPI',
    currency: 'USD',
    impact: 'HIGH',
    dateTime: 'Today, 13:30 UTC',
    formattedTime: '13:30 UTC (In 32m)',
    source: 'Forex Factory',
    forecast: '2.6%',
    previous: '2.9%',
    actual: null,
    isUpcoming: true,
    minutesUntil: 32,
    tradingBlocked: true
  },
  {
    id: 'evt-nfp-02',
    eventName: 'US Non-Farm Payrolls (NFP)',
    category: 'NFP',
    currency: 'USD',
    impact: 'HIGH',
    dateTime: 'Tomorrow, 12:30 UTC',
    formattedTime: 'Tomorrow 12:30 UTC',
    source: 'Trading Economics',
    forecast: '165K',
    previous: '142K',
    actual: null,
    isUpcoming: true,
    minutesUntil: 1620,
    tradingBlocked: false
  },
  {
    id: 'evt-fomc-03',
    eventName: 'FOMC Federal Funds Rate Decision',
    category: 'FOMC',
    currency: 'USD',
    impact: 'HIGH',
    dateTime: 'Sep 18, 18:00 UTC',
    formattedTime: 'Sep 18, 18:00 UTC',
    source: 'Investing.com',
    forecast: '4.75%',
    previous: '5.00%',
    actual: null,
    isUpcoming: true,
    minutesUntil: 3450,
    tradingBlocked: false
  },
  {
    id: 'evt-ppi-04',
    eventName: 'US Producer Price Index (MoM)',
    category: 'PPI',
    currency: 'USD',
    impact: 'MEDIUM',
    dateTime: 'Sep 19, 12:30 UTC',
    formattedTime: 'Sep 19, 12:30 UTC',
    source: 'Forex Factory',
    forecast: '0.2%',
    previous: '0.1%',
    actual: null,
    isUpcoming: true,
    minutesUntil: 4900,
    tradingBlocked: false
  },
  {
    id: 'evt-retail-05',
    eventName: 'US Retail Sales (MoM)',
    category: 'RETAIL',
    currency: 'USD',
    impact: 'MEDIUM',
    dateTime: 'Sep 20, 12:30 UTC',
    formattedTime: 'Sep 20, 12:30 UTC',
    source: 'Trading Economics',
    forecast: '0.3%',
    previous: '0.4%',
    actual: null,
    isUpcoming: true,
    minutesUntil: 6300,
    tradingBlocked: false
  },
  // RECENT COMPLETED EVENTS
  {
    id: 'evt-gdp-06',
    eventName: 'US GDP Growth Rate (QoQ Final)',
    category: 'GDP',
    currency: 'USD',
    impact: 'HIGH',
    dateTime: 'Sep 12, 12:30 UTC',
    formattedTime: 'Sep 12, 12:30 UTC',
    source: 'Investing.com',
    forecast: '3.0%',
    previous: '2.8%',
    actual: '3.0%',
    isUpcoming: false,
    minutesUntil: -5700,
    tradingBlocked: false
  },
  {
    id: 'evt-rate-07',
    eventName: 'ECB Interest Rate Decision',
    category: 'RATES',
    currency: 'EUR',
    impact: 'HIGH',
    dateTime: 'Sep 10, 12:15 UTC',
    formattedTime: 'Sep 10, 12:15 UTC',
    source: 'Forex Factory',
    forecast: '3.50%',
    previous: '3.75%',
    actual: '3.50%',
    isUpcoming: false,
    minutesUntil: -8600,
    tradingBlocked: false
  }
];

// 2. HISTORICAL EVENT ANALYSIS DATABASE (2-3 YEARS: 2024 - 2026)
export const HISTORICAL_EVENTS_DATABASE: HistoricalEventAnalysis[] = [
  {
    id: 'hist-01',
    eventName: 'US CPI Inflation Surprise Drop (2.5% vs 2.8% Est)',
    eventDate: 'Aug 14, 2025',
    year: 2025,
    category: 'CPI',
    beforeNews: {
      marketTrend: 'Bullish Consolidation near 50-EMA',
      pricePosition: 'Discount Demand Order Block at $2,420',
      volatility: 'Low Compressed ATR (12.4 Pips)'
    },
    afterNews: {
      xauusdReaction: '+$44.80 Rally (+1.82% Expansion Spike)',
      nasdaqReaction: '+$380 Pts (+1.95% Tech Sector Surge)',
      sp500Reaction: '+$68 Pts (+1.24% Broad Rally)',
      oilReaction: '-$0.92 Retreatment (-1.25% Drop)'
    },
    overallReaction: 'Bullish',
    keyTakeaway: 'Soft CPI cooler than expected fueled heavy rate cut bets, sending Gold and Tech indices flying into liquidity pools.'
  },
  {
    id: 'hist-02',
    eventName: 'US NFP Jobs Report Miss (114K vs 175K Est)',
    eventDate: 'Jul 05, 2025',
    year: 2025,
    category: 'NFP',
    beforeNews: {
      marketTrend: 'Range Bound Sideways Drift',
      pricePosition: 'At Equilibrium 50% FVG Boundary',
      volatility: 'Pre-news Volatility Squeeze'
    },
    afterNews: {
      xauusdReaction: '+$36.40 Surge (Bullish Liquidity Sweep)',
      nasdaqReaction: '+$290 Pts (+1.52% Rally)',
      sp500Reaction: '+$45 Pts (+0.88% Gain)',
      oilReaction: '-$1.40 Breakdown (-1.88% Slump)'
    },
    overallReaction: 'Bullish',
    keyTakeaway: 'Weaker labor report triggered USD selloff, propelling Gold past BSL target and lifting tech equities.'
  },
  {
    id: 'hist-03',
    eventName: 'FOMC Rate Hike Hold & Hawkish Pause',
    eventDate: 'May 01, 2025',
    year: 2025,
    category: 'FOMC',
    beforeNews: {
      marketTrend: 'Overextended Bullish Rally',
      pricePosition: 'Premium Supply Order Block',
      volatility: 'High Pre-FOMC Positioning'
    },
    afterNews: {
      xauusdReaction: '-$32.10 Dump (-1.35% Bearish Rejection)',
      nasdaqReaction: '-310 Pts (-1.65% Tech Pullback)',
      sp500Reaction: '-52 Pts (-1.02% Selloff)',
      oilReaction: '+$0.40 Neutral Drift'
    },
    overallReaction: 'Bearish',
    keyTakeaway: 'Powell emphasized "higher for longer" inflation worries, triggering sharp liquidations across Gold and Stocks.'
  },
  {
    id: 'hist-04',
    eventName: 'Fed Emergency Rate Cut (50 bps)',
    eventDate: 'Sep 18, 2024',
    year: 2024,
    category: 'RATES',
    beforeNews: {
      marketTrend: 'Ascending Channel near All-Time Highs',
      pricePosition: 'At Key Resistance & Equal Highs (EQH)',
      volatility: 'High Speculative Volume'
    },
    afterNews: {
      xauusdReaction: '+$52.00 Spike to ATH ($2,580)',
      nasdaqReaction: '+$420 Pts (+2.15% Monster Rally)',
      sp500Reaction: '+$75 Pts (+1.45% Historic High)',
      oilReaction: '+$1.80 Demand Jump'
    },
    overallReaction: 'Bullish',
    keyTakeaway: 'Jumbo 50bps rate reduction ignited massive global risk-on momentum, driving Gold and S&P 500 to new record highs.'
  },
  {
    id: 'hist-05',
    eventName: 'US Hot PPI Inflation Print (0.6% vs 0.3% Est)',
    eventDate: 'Mar 14, 2024',
    year: 2024,
    category: 'PPI',
    beforeNews: {
      marketTrend: 'Micro Uptrend on H1',
      pricePosition: 'Retesting 20-EMA Dynamic Support',
      volatility: 'Moderate'
    },
    afterNews: {
      xauusdReaction: '-$24.50 Drop (SSL Liquidity Sweep)',
      nasdaqReaction: '-220 Pts (-1.20% Selloff)',
      sp500Reaction: '-38 Pts (-0.75% Dip)',
      oilReaction: '+$1.15 Energy Demand Gain'
    },
    overallReaction: 'Bearish',
    keyTakeaway: 'Hot producer prices crushed rate cut expectations, spiking US 10-Year yields and dragging Gold down.'
  },
  {
    id: 'hist-06',
    eventName: 'US Retail Sales Surge (+1.0% vs +0.3% Est)',
    eventDate: 'Aug 15, 2024',
    year: 2024,
    category: 'RETAIL',
    beforeNews: {
      marketTrend: 'Recession Fear Selloff Pullback',
      pricePosition: 'Discount Order Block',
      volatility: 'Elevated'
    },
    afterNews: {
      xauusdReaction: '+$18.20 Short Squeeze',
      nasdaqReaction: '+$390 Pts (+2.20% V-Shape Recovery)',
      sp500Reaction: '+$64 Pts (+1.30% Surge)',
      oilReaction: '+$1.60 Crude Rally'
    },
    overallReaction: 'Bullish',
    keyTakeaway: 'Resilient US consumer spending dispelled soft-landing concerns, driving a massive relief rally in equities.'
  }
];

// 3. AI NEWS IMPACT PREDICTION FOR UPCOMING EVENT
export const CURRENT_AI_NEWS_PREDICTION: AiNewsPrediction = {
  id: 'pred-cpi-current',
  eventId: 'evt-cpi-01',
  eventName: 'US CPI Inflation Rate (YoY)',
  expectedImpact: 'Bullish',
  riskLevel: 'HIGH',
  summary: 'AI expects CPI inflation to drop to 2.6% YoY. A cooler print will confirm Fed rate easing, providing massive tailwinds for Gold & Tech Equities.',
  affectedAssets: {
    gold: {
      assetId: 'xau-usd',
      symbol: 'XAU/USD',
      name: 'Spot Gold',
      expectedDirection: 'Bullish',
      priceTarget: '$2,675.00',
      rationale: 'Cooling inflation depresses real Treasury yields, propelling Gold toward 4H Buy-Side Liquidity (BSL) target.'
    },
    nasdaq: {
      assetId: 'nasdaq-100',
      symbol: 'NASDAQ 100',
      name: 'US Tech Index',
      expectedDirection: 'Bullish',
      priceTarget: '20,450.00',
      rationale: 'Rate cut probabilities soar, lowering capital costs for tech growth giants and expanding valuation multiples.'
    },
    sp500: {
      assetId: 'sp-500',
      symbol: 'S&P 500',
      name: 'US Broad Index',
      expectedDirection: 'Bullish',
      priceTarget: '5,780.00',
      rationale: 'Broad-based risk-on expansion expected as monetary easing fears subside across financial sectors.'
    },
    oil: {
      assetId: 'crude-oil',
      symbol: 'Oil WTI',
      name: 'Crude Oil',
      expectedDirection: 'Neutral',
      priceTarget: '$71.80',
      rationale: 'Slight demand sentiment boost offset by potential economic slowdown indicators in secondary data.'
    }
  }
};

// 4. NEWS TRADING FILTER STATUS & COMPOSITE AI TRADE SCORE ALGORITHM
export const getNewsTradingStatus = () => {
  const nextHighImpact = UPCOMING_ECONOMIC_EVENTS.find(e => e.impact === 'HIGH' && e.isUpcoming);
  
  if (nextHighImpact && nextHighImpact.minutesUntil <= 60 && nextHighImpact.minutesUntil >= -15) {
    return {
      status: 'BLOCKED BEFORE NEWS' as const,
      isBlocked: true,
      eventName: nextHighImpact.eventName,
      minutesUntil: nextHighImpact.minutesUntil,
      message: `TRADING BLOCKED: High-Impact ${nextHighImpact.eventName} in ${nextHighImpact.minutesUntil} minutes. Institutional volatility expected.`
    };
  }

  return {
    status: 'TRADING ALLOWED' as const,
    isBlocked: false,
    eventName: null,
    minutesUntil: null,
    message: 'TRADING ALLOWED: No high-impact economic news within 60-minute window.'
  };
};

// 5. COMPOSITE AI TRADE SCORE FUNCTION
export const getCompositeAiScore = (marketId: string, timeframe: string = '1H'): CompositeAiScore => {
  const newsFilter = getNewsTradingStatus();

  // Baseline ratings per asset
  let technicalScore = 88;
  let smcScore = 92;
  let momentumScore = 86;
  let newsImpactScore = newsFilter.isBlocked ? 45 : 90;

  if (marketId === 'xau-usd') {
    technicalScore = 91;
    smcScore = 95;
    momentumScore = 89;
  } else if (marketId === 'nasdaq-100') {
    technicalScore = 87;
    smcScore = 91;
    momentumScore = 92;
  } else if (marketId === 'sp-500') {
    technicalScore = 85;
    smcScore = 89;
    momentumScore = 84;
  } else if (marketId === 'crude-oil') {
    technicalScore = 82;
    smcScore = 86;
    momentumScore = 80;
  } else if (marketId === 'xag-usd') {
    technicalScore = 86;
    smcScore = 88;
    momentumScore = 85;
  }

  // Calculate weighted overall score
  const finalScore = Math.round(
    technicalScore * 0.30 +
    smcScore * 0.35 +
    momentumScore * 0.20 +
    newsImpactScore * 0.15
  );

  let finalDecision: SignalType = 'BUY';
  if (newsFilter.isBlocked) {
    finalDecision = 'WAIT';
  } else if (finalScore < 75) {
    finalDecision = 'WAIT';
  } else if (marketId === 'crude-oil') {
    finalDecision = 'SELL';
  } else {
    finalDecision = 'BUY';
  }

  return {
    technicalScore,
    smcScore,
    momentumScore,
    newsImpactScore,
    finalScore,
    finalDecision,
    isNewsBlocked: newsFilter.isBlocked,
    blockReason: newsFilter.isBlocked ? newsFilter.message : undefined
  };
};
