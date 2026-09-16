import { DailyMarketBriefData } from '../types';

export const DAILY_MARKET_BRIEF: DailyMarketBriefData = {
  date: 'Today • London & New York Active Session',
  marketTrend: {
    sentiment: 'BULLISH',
    headline: 'Risk-On Expansion in Tech & Precious Metals • DXY Retesting Key Bearish Supply',
    summary: 'Institutional liquidity flows favor Gold (XAU/USD) and NASDAQ 100 as the US Dollar Index (DXY) fails to break above 104.20 resistance. Global order flow indicates sustained high-volume accumulation in risk assets with healthy pullbacks to key Fair Value Gaps.',
    dxyImpact: 'DXY Bearish Consolidation (-0.32%) — Providing strong tailwinds for Gold and EUR/USD.',
    riskScore: 28 // Low-Medium Market Risk
  },
  bestOpportunities: [
    {
      assetId: 'xau-usd',
      symbol: 'XAU/USD',
      direction: 'BUY',
      confidence: 92,
      tradingMode: 'INTRADAY',
      keyLevels: 'Entry $2,642.00 | SL $2,624.00 | TP $2,685.00',
      thesis: 'Clean liquidity sweep of Asian session low followed by H1 Bullish Order Block mitigation. Ideal 1:2.4 R:R setup with macro safe-haven momentum.',
      grade: 'A+'
    },
    {
      assetId: 'nasdaq-100',
      symbol: 'NASDAQ 100',
      direction: 'BUY',
      confidence: 86,
      tradingMode: 'SCALPING',
      keyLevels: 'Entry 19,850 | SL 19,760 | TP 20,040',
      thesis: 'AI semiconductor sub-sector breadth expansion. Reclaiming 20-EMA on M5 with high delta volume absorption above pre-market balance.',
      grade: 'A'
    },
    {
      assetId: 'eur-usd',
      symbol: 'EUR/USD',
      direction: 'BUY',
      confidence: 84,
      tradingMode: 'INTRADAY',
      keyLevels: 'Entry 1.0875 | SL 1.0835 | TP 1.0945',
      thesis: 'London Killzone sweep of yesterday\'s swing low with bullish divergence against USD index basket.',
      grade: 'A'
    },
    {
      assetId: 'btc-usd',
      symbol: 'BTC/USD',
      direction: 'BUY',
      confidence: 89,
      tradingMode: 'SWING',
      keyLevels: 'Entry $64,200 | SL $62,400 | TP $68,500',
      thesis: '4H range breakout with spot ETF inflows re-accelerating. Institutional liquidity resting above $68,000.',
      grade: 'A+'
    }
  ],
  riskAreas: [
    {
      warning: 'US Macro High-Impact News Window',
      affectedAssets: ['XAU/USD', 'NASDAQ 100', 'EUR/USD', 'GBP/USD'],
      severity: 'HIGH',
      action: 'AURUM Risk Engine enforces strict 15-minute trading freeze before and after 13:30 UTC US data releases.'
    },
    {
      warning: 'Crude Oil Inventory Supply Rejection',
      affectedAssets: ['Crude Oil WTI'],
      severity: 'MEDIUM',
      action: 'Avoid long breakout orders near $72.50. Wait for clear 4H demand confirmation.'
    },
    {
      warning: 'Asian Session Liquidity Traps',
      affectedAssets: ['USD/JPY', 'AUD/USD'],
      severity: 'MEDIUM',
      action: 'Monitor for false breakout sweeps of Tokyo highs before committing to trend continuation.'
    }
  ],
  majorNewsImpact: [
    {
      event: 'US Core Inflation (CPI) & PPI Outlook',
      impact: 'HIGH',
      time: '13:30 UTC',
      takeaway: 'Disinflation trajectory supports rate cut expectations, pushing institutional liquidity into Bullion & Equities.'
    },
    {
      event: 'ECB Monetary Policy Statement',
      impact: 'MEDIUM',
      time: '12:15 UTC',
      takeaway: 'Neutral policy stance limits downside volatility for EUR/USD pairs; stable for scalping.'
    },
    {
      event: 'EIA Crude Oil Stockpiles Change',
      impact: 'MEDIUM',
      time: '15:30 UTC',
      takeaway: 'Higher than expected builds keeping upper bounds capped around $72.80.'
    }
  ],
  preferredTradingMode: {
    mode: 'INTRADAY',
    reason: 'High liquidity and clean session range expansions during London & NY overlap offer optimal 1:2+ R:R setups with low overnight exposure.',
    recommendedSession: 'London Fix & NY Open (07:30 – 16:30 UTC)',
    riskBudget: '1.0% – 1.5% max account risk per trade'
  }
};
