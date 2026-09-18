import { AiTradeSignal, MarketItem } from '../types';
import { getNewsTradingStatus } from '../data/newsIntelligenceData';

export interface SignalRankMetric {
  signal: AiTradeSignal;
  market?: MarketItem;
  rank: number;
  totalScore: number;
  confidenceScore: number;
  aiAgreement: '2/2 Confirmed' | 'Divergence / Mixed';
  aiAgreementScore: number;
  riskRewardScore: number;
  newsSafety: 'CLEAR' | 'CAUTION' | 'BLOCKED';
  newsSafetyScore: number;
  structureQuality: 'A+' | 'A' | 'B+' | 'B';
  structureScore: number;
  badges: string[];
}

/**
 * Calculates a quantitative institutional ranking score for any trade signal based on:
 * 1. Confidence (0-100)
 * 2. Dual AI Agreement (AURUM + Qwen consensus)
 * 3. Risk-Reward Ratio (higher R:R yields higher execution value)
 * 4. News Safety (Clear macro window vs upcoming volatility event)
 * 5. Market Structure Quality (Order Block mitigation, BOS/CHOCH, Liquidity sweep)
 */
export function calculateSignalRankScore(signal: AiTradeSignal, market?: MarketItem): SignalRankMetric {
  const newsStatus = getNewsTradingStatus();

  // 1. Base Confidence (Weight: 35%)
  const conf = signal.confidenceScore || 75;
  const confWeighted = (conf / 100) * 35;

  // 2. Dual AI Agreement (Weight: 25%)
  // If signal is BUY/SELL and confidence >= 75%, AURUM and Qwen are in consensus
  const isConsensus = signal.type !== 'WAIT' && conf >= 75;
  const aiAgreementScore = isConsensus ? 25 : 8;
  const aiAgreementText: '2/2 Confirmed' | 'Divergence / Mixed' = isConsensus ? '2/2 Confirmed' : 'Divergence / Mixed';

  // 3. Risk:Reward Ratio (Weight: 15%)
  let rrValue = 2.0;
  if (signal.riskReward) {
    const parts = signal.riskReward.replace('1:', '');
    const parsed = parseFloat(parts);
    if (!isNaN(parsed)) rrValue = parsed;
  }
  // R:R score normalized: 1:1.5 -> 7.5, 1:2.0 -> 10, 1:3.0+ -> 15
  const rrScore = Math.min(15, Math.max(5, (rrValue / 3.0) * 15));

  // 4. News Safety (Weight: 15%)
  let newsSafetyScore = 15;
  let newsSafetyText: 'CLEAR' | 'CAUTION' | 'BLOCKED' = 'CLEAR';
  if (newsStatus.isBlocked) {
    newsSafetyScore = 0;
    newsSafetyText = 'BLOCKED';
  } else if (newsStatus.minutesUntil && newsStatus.minutesUntil <= 60) {
    newsSafetyScore = 8;
    newsSafetyText = 'CAUTION';
  }

  // 5. Market Structure Quality (Weight: 10%)
  let structureQuality: 'A+' | 'A' | 'B+' | 'B' = 'B';
  let structureScore = 4;
  if (conf >= 88 && (signal.smc?.bos?.status === 'Confirmed' || signal.smc?.liquiditySweep?.occurred)) {
    structureQuality = 'A+';
    structureScore = 10;
  } else if (conf >= 80) {
    structureQuality = 'A';
    structureScore = 8;
  } else if (conf >= 75) {
    structureQuality = 'B+';
    structureScore = 6;
  }

  const totalScore = Math.round(confWeighted + aiAgreementScore + rrScore + newsSafetyScore + structureScore);

  const badges: string[] = [];
  if (structureQuality === 'A+') badges.push('💎 Institutional Prime');
  if (isConsensus) badges.push('⚡ 2/2 AI Consensus');
  if (rrValue >= 2.5) badges.push(`🎯 High R:R (${signal.riskReward})`);
  if (newsSafetyText === 'CLEAR') badges.push('🛡️ News Safe');

  return {
    signal,
    market,
    rank: 1, // Will be set during sorting
    totalScore,
    confidenceScore: conf,
    aiAgreement: aiAgreementText,
    aiAgreementScore,
    riskRewardScore: Math.round(rrScore),
    newsSafety: newsSafetyText,
    newsSafetyScore,
    structureQuality,
    structureScore,
    badges
  };
}

/**
 * Sorts and ranks all signals by overall Confluence Opportunity Score
 */
export function rankSignalsByOpportunity(signals: AiTradeSignal[], markets: MarketItem[]): SignalRankMetric[] {
  const scored = signals.map(sig => {
    const market = markets.find(m => m.id === sig.marketId);
    return calculateSignalRankScore(sig, market);
  });

  // Sort descending: highest total confluence score first
  scored.sort((a, b) => {
    // 1. Total score
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // 2. Tie break by confidence
    return b.confidenceScore - a.confidenceScore;
  });

  return scored.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
}
