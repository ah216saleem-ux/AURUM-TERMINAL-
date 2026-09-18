import { MarketItem, Timeframe, SignalType } from '../types';

export interface MarketSessionInfo {
  activeSession: 'London' | 'New York' | 'Asia' | 'London/NY Overlap' | 'Sydney' | 'Inter-Session';
  allActiveSessions: string[];
  sessionNote: string;
}

/**
 * Returns current global trading session based on UTC time.
 */
export function getCurrentMarketSession(): MarketSessionInfo {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const timeDec = utcHour + utcMinute / 60;

  const sessions: string[] = [];

  // London: 08:00 - 16:00 UTC
  const isLondon = timeDec >= 8 && timeDec < 16;
  // New York: 13:00 - 21:00 UTC
  const isNY = timeDec >= 13 && timeDec < 21;
  // Asia/Tokyo: 00:00 - 09:00 UTC
  const isAsia = timeDec >= 0 && timeDec < 9;
  // Sydney: 21:00 - 06:00 UTC
  const isSydney = timeDec >= 21 || timeDec < 6;

  if (isLondon) sessions.push('London');
  if (isNY) sessions.push('New York');
  if (isAsia) sessions.push('Asia (Tokyo)');
  if (isSydney) sessions.push('Sydney');

  let activeSession: MarketSessionInfo['activeSession'] = 'Inter-Session';

  if (isLondon && isNY) {
    activeSession = 'London/NY Overlap';
  } else if (isLondon) {
    activeSession = 'London';
  } else if (isNY) {
    activeSession = 'New York';
  } else if (isAsia) {
    activeSession = 'Asia';
  } else if (isSydney) {
    activeSession = 'Sydney';
  }

  const sessionNote = activeSession === 'London/NY Overlap'
    ? 'Peak Institutional Volatility & Liquidity Window'
    : activeSession === 'London'
    ? 'High Volume & Order Flow Expansion'
    : activeSession === 'New York'
    ? 'High Momentum & Macro Direction Shifts'
    : activeSession === 'Asia'
    ? 'Range-Bound & Structural Liquidity Buildup'
    : 'Moderate Liquidity Window';

  return {
    activeSession,
    allActiveSessions: sessions.length > 0 ? sessions : ['Inter-Session'],
    sessionNote
  };
}

/**
 * Computes volatility level based on asset type and 24h change %.
 */
export function getAssetVolatility(market: MarketItem): { level: 'Low' | 'Medium' | 'High'; score: number; atrPips: string } {
  const absChange = Math.abs(market.changePercent);
  
  if (market.id.includes('btc') || market.id.includes('eth') || market.id.includes('nasdaq')) {
    if (absChange >= 2.0) return { level: 'High', score: 92, atrPips: '185.0 pts' };
    if (absChange >= 0.8) return { level: 'Medium', score: 74, atrPips: '110.0 pts' };
    return { level: 'Low', score: 55, atrPips: '65.0 pts' };
  }

  if (market.id.includes('xau') || market.id.includes('gold')) {
    if (absChange >= 1.2) return { level: 'High', score: 88, atrPips: '24.50 pts' };
    if (absChange >= 0.5) return { level: 'Medium', score: 70, atrPips: '14.20 pts' };
    return { level: 'Low', score: 48, atrPips: '8.50 pts' };
  }

  // Forex & standard commodities
  if (absChange >= 0.75) return { level: 'High', score: 85, atrPips: '78.0 pips' };
  if (absChange >= 0.30) return { level: 'Medium', score: 65, atrPips: '42.0 pips' };
  return { level: 'Low', score: 42, atrPips: '22.0 pips' };
}

/**
 * Computes live R-multiple profit/loss.
 */
export function calculateLiveRMultiple(
  signalDirection: 'BUY' | 'SELL',
  entryPrice: number,
  stopLoss: number,
  currentPrice: number
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  if (risk <= 0) return 0;

  const diff = signalDirection === 'BUY' 
    ? currentPrice - entryPrice 
    : entryPrice - currentPrice;

  return Number((diff / risk).toFixed(2));
}

/**
 * Dual AI Consensus Helper
 */
export interface DualAiConsensus {
  aurumDirection: SignalType;
  qwenDirection: SignalType;
  isAgreed: boolean;
  isStrongConflict: boolean;
  consensusLabel: '2/2 Confirmed' | 'Divergent / High Risk' | 'Neutral Wait';
  finalDecision: SignalType;
  consensusConfidence: number;
  grade: 'A+' | 'A' | 'B';
  status: 'ACTIVE' | 'WAIT' | 'EXPIRED' | 'BLOCKED';
}

export function evaluateDualAiConsensus(
  aurumSignal: SignalType,
  aurumConfidence: number,
  qwenSignal: SignalType,
  qwenConfidence: number,
  isNewsBlocked: boolean,
  isLivePriceValid: boolean,
  riskRewardRatio: number
): DualAiConsensus {
  // Check if blocked by news
  if (isNewsBlocked) {
    return {
      aurumDirection: aurumSignal,
      qwenDirection: qwenSignal,
      isAgreed: false,
      isStrongConflict: false,
      consensusLabel: 'Neutral Wait',
      finalDecision: 'WAIT',
      consensusConfidence: Math.min(aurumConfidence, 60),
      grade: 'B',
      status: 'BLOCKED'
    };
  }

  const isAgreed = aurumSignal === qwenSignal && (aurumSignal === 'BUY' || aurumSignal === 'SELL');
  const isStrongConflict = (aurumSignal === 'BUY' && qwenSignal === 'SELL') || (aurumSignal === 'SELL' && qwenSignal === 'BUY');

  let consensusConfidence = aurumConfidence;
  let finalDecision: SignalType = aurumSignal;
  let consensusLabel: DualAiConsensus['consensusLabel'] = '2/2 Confirmed';

  if (isAgreed) {
    consensusConfidence = Math.min(98, Math.max(82, aurumConfidence + 4));
    consensusLabel = '2/2 Confirmed';
    finalDecision = aurumSignal;
  } else if (isStrongConflict) {
    consensusConfidence = Math.max(50, Math.round(aurumConfidence * 0.70));
    consensusLabel = 'Divergent / High Risk';
    finalDecision = 'WAIT';
  } else if (qwenSignal === 'WAIT' || aurumSignal === 'WAIT') {
    consensusConfidence = Math.max(60, Math.round(aurumConfidence * 0.82));
    consensusLabel = 'Neutral Wait';
    finalDecision = 'WAIT';
  }

  // Quality protection gate: Confidence >= 75%, R:R >= 2.0, Live Price Valid
  const passesQualityGate = 
    consensusConfidence >= 75 && 
    riskRewardRatio >= 2.0 && 
    isLivePriceValid && 
    isAgreed;

  if (!passesQualityGate && finalDecision !== 'WAIT') {
    finalDecision = 'WAIT';
  }

  const grade = consensusConfidence >= 88 ? 'A+' : consensusConfidence >= 75 ? 'A' : 'B';
  const status = isNewsBlocked 
    ? 'BLOCKED' 
    : finalDecision === 'WAIT' 
    ? 'WAIT' 
    : 'ACTIVE';

  return {
    aurumDirection: aurumSignal,
    qwenDirection: qwenSignal,
    isAgreed,
    isStrongConflict,
    consensusLabel,
    finalDecision,
    consensusConfidence,
    grade,
    status
  };
}
