import { AiAlert, TradingStyleMode } from '../types';

export const INITIAL_AI_ALERTS: AiAlert[] = [
  {
    id: 'alert-1',
    assetId: 'xau-usd',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    signal: 'BUY',
    tradingMode: 'INTRADAY',
    confidence: 92,
    entry: 2642.00,
    stopLoss: 2624.00,
    takeProfit: 2685.00,
    takeProfit2: 2710.00,
    aiReason: 'Asian session liquidity swept below $2,635 followed by a clean H1 Bullish Order Block mitigation and M15 CHOCH confirmation.',
    timestamp: '2m ago',
    read: false,
    urgency: 'HIGH',
    setupGrade: 'A+'
  },
  {
    id: 'alert-2',
    assetId: 'nasdaq-100',
    symbol: 'NASDAQ 100',
    name: 'US Tech Index',
    signal: 'BUY',
    tradingMode: 'SCALPING',
    confidence: 86,
    entry: 19850.00,
    stopLoss: 19760.00,
    takeProfit: 20040.00,
    takeProfit2: 20150.00,
    aiReason: 'Pre-market Fair Value Gap (FVG) filled at 19,840 with strong institutional delta volume and 20-EMA slope expansion on M5.',
    timestamp: '8m ago',
    read: false,
    urgency: 'HIGH',
    setupGrade: 'A'
  },
  {
    id: 'alert-3',
    assetId: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    signal: 'BUY',
    tradingMode: 'INTRADAY',
    confidence: 84,
    entry: 1.0875,
    stopLoss: 1.0835,
    takeProfit: 1.0945,
    takeProfit2: 1.0980,
    aiReason: 'London Killzone sweep of yesterday\'s low at 1.0850 followed by strong bullish displacement above H1 supply.',
    timestamp: '22m ago',
    read: true,
    urgency: 'MEDIUM',
    setupGrade: 'A'
  },
  {
    id: 'alert-4',
    assetId: 'btc-usd',
    symbol: 'BTC/USD',
    name: 'Bitcoin Spot',
    signal: 'BUY',
    tradingMode: 'SWING',
    confidence: 89,
    entry: 64200.00,
    stopLoss: 62400.00,
    takeProfit: 68500.00,
    takeProfit2: 71000.00,
    aiReason: '4H Liquidity pool reclaimed above $63,800 with institutional spot accumulation and funding rate reset.',
    timestamp: '45m ago',
    read: true,
    urgency: 'HIGH',
    setupGrade: 'A+'
  },
  {
    id: 'alert-5',
    assetId: 'xag-usd',
    symbol: 'XAG/USD',
    name: 'Silver Spot',
    signal: 'BUY',
    tradingMode: 'SCALPING',
    confidence: 83,
    entry: 31.30,
    stopLoss: 30.70,
    takeProfit: 32.50,
    takeProfit2: 33.10,
    aiReason: 'Relative strength divergence with Gold; clean M5 internal structure break above $31.25.',
    timestamp: '1h ago',
    read: true,
    urgency: 'MEDIUM',
    setupGrade: 'B+'
  }
];

export function createRandomAiAlert(tradingMode: TradingStyleMode = 'INTRADAY'): AiAlert {
  const candidates: Array<{
    assetId: string;
    symbol: string;
    name: string;
    signal: 'BUY' | 'SELL';
    entry: number;
    sl: number;
    tp: number;
    reason: string;
    confidence: number;
  }> = [
    {
      assetId: 'xau-usd',
      symbol: 'XAU/USD',
      name: 'Gold Spot',
      signal: 'BUY',
      entry: 2644.50,
      sl: 2628.00,
      tp: 2688.00,
      reason: 'H1 Order Block mitigation + London Fix liquidity grab completion.',
      confidence: 93
    },
    {
      assetId: 'nasdaq-100',
      symbol: 'NASDAQ 100',
      name: 'US Tech Index',
      signal: 'SELL',
      entry: 19920.00,
      sl: 20010.00,
      tp: 19740.00,
      reason: 'Rejection at 4H Premium supply block with bearish order flow divergence.',
      confidence: 87
    },
    {
      assetId: 'gbp-usd',
      symbol: 'GBP/USD',
      name: 'British Pound / USD',
      signal: 'BUY',
      entry: 1.3020,
      sl: 1.2965,
      tp: 1.3125,
      reason: 'London Killzone sweep of Asian Lows followed by M15 Bullish BOS.',
      confidence: 85
    },
    {
      assetId: 'usd-jpy',
      symbol: 'USD/JPY',
      name: 'US Dollar / Yen',
      signal: 'SELL',
      entry: 154.20,
      sl: 154.85,
      tp: 152.90,
      reason: 'Double top liquidity sweep with Bank of Japan intervention zone proximity.',
      confidence: 86
    },
    {
      assetId: 'sp-500',
      symbol: 'S&P 500',
      name: 'US Broad Index',
      signal: 'BUY',
      entry: 5740.00,
      sl: 5710.00,
      tp: 5810.00,
      reason: 'Equilibrium discount tap inside weekly bullish channel.',
      confidence: 88
    },
    {
      assetId: 'crude-oil',
      symbol: 'Crude Oil',
      name: 'WTI Light Sweet',
      signal: 'SELL',
      entry: 71.80,
      sl: 72.75,
      tp: 69.80,
      reason: 'EIA inventory overhang and multiple upper wick rejections on H4.',
      confidence: 81
    }
  ];

  const picked = candidates[Math.floor(Math.random() * candidates.length)];

  return {
    id: `alert-${Date.now()}`,
    assetId: picked.assetId,
    symbol: picked.symbol,
    name: picked.name,
    signal: picked.signal,
    tradingMode,
    confidence: picked.confidence,
    entry: picked.entry,
    stopLoss: picked.sl,
    takeProfit: picked.tp,
    takeProfit2: +(picked.tp * (picked.signal === 'BUY' ? 1.015 : 0.985)).toFixed(2),
    aiReason: picked.reason,
    timestamp: 'Just now',
    read: false,
    urgency: picked.confidence >= 88 ? 'HIGH' : 'MEDIUM',
    setupGrade: picked.confidence >= 90 ? 'A+' : picked.confidence >= 85 ? 'A' : 'B+'
  };
}
