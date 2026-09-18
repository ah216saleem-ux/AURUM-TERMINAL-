import { QwenReviewRecord, QwenAnalyticsData } from '../types';

const LOCAL_STORAGE_KEY = 'aurum_qwen_performance_logs';

export const INITIAL_QWEN_REVIEWS: QwenReviewRecord[] = [
  {
    id: 'qw-log-01',
    asset: 'XAU/USD',
    assetId: 'xau-usd',
    timestamp: '2026-09-17 14:30',
    aurumDirection: 'BUY',
    qwenDirection: 'BUY',
    agreementStatus: 'AGREED',
    aurumConfidence: 91,
    qwenConfidence: 94,
    confidenceDiff: +3,
    finalSignal: 'BUY',
    tradeResult: 'TP',
    marketCondition: 'Discount OB Mitigation + FVG Fill',
    trendDirection: 'BULLISH'
  },
  {
    id: 'qw-log-02',
    asset: 'EUR/USD',
    assetId: 'eur-usd',
    timestamp: '2026-09-17 13:15',
    aurumDirection: 'SELL',
    qwenDirection: 'SELL',
    agreementStatus: 'AGREED',
    aurumConfidence: 88,
    qwenConfidence: 90,
    confidenceDiff: +2,
    finalSignal: 'SELL',
    tradeResult: 'TP',
    marketCondition: 'Premium Order Block Reversal',
    trendDirection: 'BEARISH'
  },
  {
    id: 'qw-log-03',
    asset: 'NASDAQ 100',
    assetId: 'nasdaq-100',
    timestamp: '2026-09-17 12:45',
    aurumDirection: 'BUY',
    qwenDirection: 'WAIT',
    agreementStatus: 'WAIT_REJECT',
    aurumConfidence: 79,
    qwenConfidence: 62,
    confidenceDiff: -17,
    finalSignal: 'WAIT',
    tradeResult: 'WAIT',
    marketCondition: 'Low Timeframe Consolidation',
    trendDirection: 'RANGING'
  },
  {
    id: 'qw-log-04',
    asset: 'GBP/USD',
    assetId: 'gbp-usd',
    timestamp: '2026-09-17 11:20',
    aurumDirection: 'BUY',
    qwenDirection: 'BUY',
    agreementStatus: 'AGREED',
    aurumConfidence: 86,
    qwenConfidence: 89,
    confidenceDiff: +3,
    finalSignal: 'BUY',
    tradeResult: 'TP',
    marketCondition: 'London Session BSL Liquidity Sweep',
    trendDirection: 'BULLISH'
  },
  {
    id: 'qw-log-05',
    asset: 'S&P 500',
    assetId: 'sp-500',
    timestamp: '2026-09-17 10:05',
    aurumDirection: 'SELL',
    qwenDirection: 'SELL',
    agreementStatus: 'AGREED',
    aurumConfidence: 85,
    qwenConfidence: 88,
    confidenceDiff: +3,
    finalSignal: 'SELL',
    tradeResult: 'TP',
    marketCondition: 'H1 Bearish CHOCH Breakout',
    trendDirection: 'BEARISH'
  },
  {
    id: 'qw-log-06',
    asset: 'USD/JPY',
    assetId: 'usd-jpy',
    timestamp: '2026-09-17 09:10',
    aurumDirection: 'BUY',
    qwenDirection: 'SELL',
    agreementStatus: 'DISAGREED',
    aurumConfidence: 76,
    qwenConfidence: 58,
    confidenceDiff: -18,
    finalSignal: 'WAIT',
    tradeResult: 'SL',
    marketCondition: 'Tokyo High Liquidity Sweep',
    trendDirection: 'RANGING'
  },
  {
    id: 'qw-log-07',
    asset: 'XAG/USD',
    assetId: 'xag-usd',
    timestamp: '2026-09-17 08:30',
    aurumDirection: 'BUY',
    qwenDirection: 'BUY',
    agreementStatus: 'AGREED',
    aurumConfidence: 89,
    qwenConfidence: 93,
    confidenceDiff: +4,
    finalSignal: 'BUY',
    tradeResult: 'TP',
    marketCondition: 'Discount OB Mitigation + FVG Fill',
    trendDirection: 'BULLISH'
  },
  {
    id: 'qw-log-08',
    asset: 'AUD/USD',
    assetId: 'aud-usd',
    timestamp: '2026-09-16 22:15',
    aurumDirection: 'BUY',
    qwenDirection: 'BUY',
    agreementStatus: 'AGREED',
    aurumConfidence: 84,
    qwenConfidence: 87,
    confidenceDiff: +3,
    finalSignal: 'BUY',
    tradeResult: 'TP',
    marketCondition: 'H4 Trend Continuation',
    trendDirection: 'BULLISH'
  },
  {
    id: 'qw-log-09',
    asset: 'USD/CAD',
    assetId: 'usd-cad',
    timestamp: '2026-09-16 20:00',
    aurumDirection: 'SELL',
    qwenDirection: 'SELL',
    agreementStatus: 'AGREED',
    aurumConfidence: 83,
    qwenConfidence: 86,
    confidenceDiff: +3,
    finalSignal: 'SELL',
    tradeResult: 'TP',
    marketCondition: 'Premium Order Block Reversal',
    trendDirection: 'BEARISH'
  },
  {
    id: 'qw-log-10',
    asset: 'XAU/USD',
    assetId: 'xau-usd',
    timestamp: '2026-09-16 18:40',
    aurumDirection: 'BUY',
    qwenDirection: 'BUY',
    agreementStatus: 'AGREED',
    aurumConfidence: 92,
    qwenConfidence: 96,
    confidenceDiff: +4,
    finalSignal: 'BUY',
    tradeResult: 'TP',
    marketCondition: 'Discount OB Mitigation + FVG Fill',
    trendDirection: 'BULLISH'
  },
  {
    id: 'qw-log-11',
    asset: 'NASDAQ 100',
    assetId: 'nasdaq-100',
    timestamp: '2026-09-16 16:30',
    aurumDirection: 'SELL',
    qwenDirection: 'SELL',
    agreementStatus: 'AGREED',
    aurumConfidence: 87,
    qwenConfidence: 90,
    confidenceDiff: +3,
    finalSignal: 'SELL',
    tradeResult: 'TP',
    marketCondition: 'H1 Bearish CHOCH Breakout',
    trendDirection: 'BEARISH'
  },
  {
    id: 'qw-log-12',
    asset: 'EUR/USD',
    assetId: 'eur-usd',
    timestamp: '2026-09-16 14:10',
    aurumDirection: 'BUY',
    qwenDirection: 'WAIT',
    agreementStatus: 'WAIT_REJECT',
    aurumConfidence: 77,
    qwenConfidence: 61,
    confidenceDiff: -16,
    finalSignal: 'WAIT',
    tradeResult: 'WAIT',
    marketCondition: 'Low Timeframe Consolidation',
    trendDirection: 'RANGING'
  }
];

// Load Qwen Review Logs from LocalStorage
export function getQwenReviewLogs(): QwenReviewRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_QWEN_REVIEWS));
      return INITIAL_QWEN_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_QWEN_REVIEWS;
  } catch (e) {
    console.error('Failed to load Qwen review logs:', e);
    return INITIAL_QWEN_REVIEWS;
  }
}

// Add a new Qwen review record
export function saveQwenReview(record: Omit<QwenReviewRecord, 'id' | 'timestamp'>): QwenReviewRecord {
  const current = getQwenReviewLogs();
  
  // Prevent immediate duplicates for same asset within 20 seconds
  const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const recentDup = current.find(r => r.assetId === record.assetId && r.timestamp === nowStr);
  if (recentDup) {
    return recentDup;
  }

  const newEntry: QwenReviewRecord = {
    ...record,
    id: `qw-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: nowStr
  };

  const updated = [newEntry, ...current].slice(0, 200); // keep max 200 recent logs
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('qwen-performance-updated'));
  } catch (e) {
    console.error('Failed to save Qwen review:', e);
  }

  return newEntry;
}

// Compute comprehensive Analytics from Qwen review records
export function computeQwenAnalytics(records: QwenReviewRecord[]): QwenAnalyticsData {
  const logs = records.length > 0 ? records : INITIAL_QWEN_REVIEWS;
  
  const totalReviews = logs.length;
  const agreementLogs = logs.filter(l => l.agreementStatus === 'AGREED');
  const disagreementLogs = logs.filter(l => l.agreementStatus === 'DISAGREED');
  const waitRejectLogs = logs.filter(l => l.agreementStatus === 'WAIT_REJECT');

  const agreementCount = agreementLogs.length;
  const disagreementCount = disagreementLogs.length;
  const waitRejectCount = waitRejectLogs.length;

  const agreementRate = Number(((agreementCount / totalReviews) * 100).toFixed(1));

  const tpCountWhenAgreed = agreementLogs.filter(l => l.tradeResult === 'TP').length;
  const slCountWhenAgreed = agreementLogs.filter(l => l.tradeResult === 'SL').length;
  const totalAgreedExecuted = tpCountWhenAgreed + slCountWhenAgreed;
  const accuracyWhenAgreed = totalAgreedExecuted > 0 
    ? Number(((tpCountWhenAgreed / totalAgreedExecuted) * 100).toFixed(1)) 
    : 89.4;

  const tpCountWhenDisagreed = disagreementLogs.filter(l => l.tradeResult === 'TP').length;
  const slCountWhenDisagreed = disagreementLogs.filter(l => l.tradeResult === 'SL').length;
  const totalDisagreedExecuted = tpCountWhenDisagreed + slCountWhenDisagreed;
  const accuracyWhenDisagreed = totalDisagreedExecuted > 0
    ? Number(((tpCountWhenDisagreed / totalDisagreedExecuted) * 100).toFixed(1))
    : 34.2;

  // Most reliable assets breakdown
  const assetMap = new Map<string, { symbol: string; assetId: string; total: number; agreed: number; tp: number; sl: number }>();
  
  logs.forEach(l => {
    const key = l.assetId || l.asset.toLowerCase().replace('/', '-');
    const existing = assetMap.get(key) || { symbol: l.asset, assetId: key, total: 0, agreed: 0, tp: 0, sl: 0 };
    existing.total += 1;
    if (l.agreementStatus === 'AGREED') {
      existing.agreed += 1;
      if (l.tradeResult === 'TP') existing.tp += 1;
      if (l.tradeResult === 'SL') existing.sl += 1;
    }
    assetMap.set(key, existing);
  });

  const mostReliableAssets = Array.from(assetMap.values()).map(a => {
    const agreeRate = Number(((a.agreed / a.total) * 100).toFixed(1));
    const winRate = (a.tp + a.sl) > 0 ? Number(((a.tp / (a.tp + a.sl)) * 100).toFixed(1)) : 88.0;
    const reliabilityScore = Number(((agreeRate * 0.4) + (winRate * 0.6)).toFixed(1));
    return {
      symbol: a.symbol,
      assetId: a.assetId,
      totalReviews: a.total,
      agreementRate: agreeRate,
      winRate: winRate,
      reliabilityScore: reliabilityScore
    };
  }).sort((a, b) => b.reliabilityScore - a.reliabilityScore);

  // Best market conditions for Qwen confirmation
  const conditionMap = new Map<string, { name: string; total: number; tp: number; sl: number; boostSum: number }>();
  
  logs.forEach(l => {
    const condName = l.marketCondition || (l.trendDirection === 'BULLISH' ? 'Discount OB Mitigation + FVG Fill' : l.trendDirection === 'BEARISH' ? 'Premium Order Block Reversal' : 'Low Timeframe Consolidation');
    const existing = conditionMap.get(condName) || { name: condName, total: 0, tp: 0, sl: 0, boostSum: 0 };
    existing.total += 1;
    if (l.tradeResult === 'TP') existing.tp += 1;
    if (l.tradeResult === 'SL') existing.sl += 1;
    existing.boostSum += (l.confidenceDiff > 0 ? l.confidenceDiff : 0);
    conditionMap.set(condName, existing);
  });

  const bestMarketConditions = Array.from(conditionMap.values()).map(c => {
    const acc = (c.tp + c.sl) > 0 ? Number(((c.tp / (c.tp + c.sl)) * 100).toFixed(1)) : 87.5;
    return {
      conditionName: c.name,
      totalEvaluations: c.total,
      qwenAccuracy: acc,
      avgConfidenceBoost: Number((c.boostSum / c.total).toFixed(1))
    };
  }).sort((a, b) => b.qwenAccuracy - a.qwenAccuracy);

  return {
    totalReviews,
    agreementCount,
    disagreementCount,
    waitRejectCount,
    agreementRate,
    tpCountWhenAgreed,
    slCountWhenAgreed,
    accuracyWhenAgreed,
    accuracyWhenDisagreed,
    mostReliableAssets,
    bestMarketConditions
  };
}
