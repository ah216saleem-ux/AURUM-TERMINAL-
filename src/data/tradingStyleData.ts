import { Timeframe, TradingStyleMode, TradingStyleConfig } from '../types';

export const TRADING_STYLES: Record<TradingStyleMode, TradingStyleConfig> = {
  SCALPING: {
    mode: 'SCALPING',
    name: 'Scalping Mode',
    badge: '1M • 5M • 15M Execution',
    timeframes: ['1M', '5M', '15M'],
    primaryTimeframe: '5M',
    focus: [
      'Liquidity sweep',
      'Momentum',
      'Fast market structure changes',
      'Tight risk management'
    ],
    description: 'High-frequency micro setup analysis focused on quick 1M/5M liquidity sweeps, momentum bursts, and rapid order block mitigation with tight stop losses.',
    strategyWeights: {
      smc: 20,
      trend: 10,
      breakout: 15,
      liquidity: 35,
      momentum: 30,
      structure: 15
    },
    riskParams: {
      slDistanceMultiplier: 0.35,
      tp1Multiplier: 0.45,
      tp2Multiplier: 0.65,
      avgHoldTime: '5m - 45m',
      recommendedRR: '1:2.1'
    }
  },
  INTRADAY: {
    mode: 'INTRADAY',
    name: 'Intraday Mode',
    badge: '15M • 30M • 1H • 4H Execution',
    timeframes: ['15M', '30M', '1H', '4H'],
    primaryTimeframe: '1H',
    focus: [
      'Trend direction',
      'SMC confirmation',
      'Breakout Retest',
      'Intraday liquidity'
    ],
    description: 'Standard session trading framework tracking London & NY liquidity, H1 Order Blocks, trend continuation, and key intraday retests.',
    strategyWeights: {
      smc: 30,
      trend: 25,
      breakout: 20,
      liquidity: 20,
      momentum: 15,
      structure: 25
    },
    riskParams: {
      slDistanceMultiplier: 1.0,
      tp1Multiplier: 1.0,
      tp2Multiplier: 1.0,
      avgHoldTime: '2h - 12h',
      recommendedRR: '1:3.25'
    }
  },
  SWING: {
    mode: 'SWING',
    name: 'Swing Mode',
    badge: '4H • 1D • 1W Execution',
    timeframes: ['4H', '1D', '1W'],
    primaryTimeframe: '4H',
    focus: [
      'Higher timeframe structure',
      'Major Order Blocks',
      'Market trend',
      'Long-term liquidity zones'
    ],
    description: 'Macro positioning strategy targeting high-probability reversals and trends off 4H/Daily Order Blocks, weekly structure, and major institutional liquidity pools.',
    strategyWeights: {
      smc: 35,
      trend: 30,
      breakout: 15,
      liquidity: 15,
      momentum: 10,
      structure: 35
    },
    riskParams: {
      slDistanceMultiplier: 2.2,
      tp1Multiplier: 2.6,
      tp2Multiplier: 3.5,
      avgHoldTime: '1 - 7 Days',
      recommendedRR: '1:4.8'
    }
  }
};

export interface StyleAdjustedParameters {
  mode: TradingStyleMode;
  entryStyle: string;
  recommendedTimeframe: Timeframe;
  strategyWeights: {
    smc: number;
    trend: number;
    breakout: number;
    liquidity: number;
    momentum: number;
    structure: number;
  };
  stopLossDistancePips: string;
  takeProfitTarget1Pips: string;
  takeProfitTarget2Pips: string;
  adjustedRiskReward: string;
  adjustedConfidence: number;
  focusHighlights: string[];
  executionSpeedText: string;
}

export const getStyleAdjustedParameters = (
  marketId: string,
  baseEntry: number,
  baseSl: number,
  baseTp: number,
  baseTp2: number | undefined,
  baseConfidence: number,
  mode: TradingStyleMode
): StyleAdjustedParameters => {
  const config = TRADING_STYLES[mode];
  const isBuy = baseTp > baseEntry;
  const rawSlDist = Math.abs(baseEntry - baseSl);

  // Calculate adjusted distances based on trading style
  const slDist = rawSlDist * config.riskParams.slDistanceMultiplier;
  
  let calcTp1Dist: number;
  let calcTp2Dist: number;

  if (mode === 'SCALPING') {
    calcTp1Dist = slDist * 2.1;
    calcTp2Dist = slDist * 3.1;
  } else if (mode === 'INTRADAY') {
    calcTp1Dist = Math.abs(baseTp - baseEntry);
    calcTp2Dist = baseTp2 ? Math.abs(baseTp2 - baseEntry) : calcTp1Dist * 1.5;
  } else {
    // SWING
    calcTp1Dist = slDist * 4.2;
    calcTp2Dist = slDist * 5.8;
  }

  const adjSl = isBuy ? baseEntry - slDist : baseEntry + slDist;
  const adjTp1 = isBuy ? baseEntry + calcTp1Dist : baseEntry - calcTp1Dist;
  const adjTp2 = isBuy ? baseEntry + calcTp2Dist : baseEntry - calcTp2Dist;

  // Calculate R:R
  const rrValue = (calcTp1Dist / (slDist || 1)).toFixed(2);

  // Confidence calculation weighting adjustment
  let confidenceShift = 0;
  if (mode === 'SCALPING') {
    // Scalps gain confidence on high momentum or liquidity sweep
    confidenceShift = marketId === 'nasdaq-100' || marketId === 'xau-usd' ? 2 : -1;
  } else if (mode === 'INTRADAY') {
    confidenceShift = 0;
  } else {
    // SWING mode gets higher confidence on Gold & Silver HTF structure
    confidenceShift = marketId === 'xau-usd' || marketId === 'xag-usd' || marketId === 'sp-500' ? 3 : 1;
  }

  const adjustedConfidence = Math.min(99, Math.max(65, baseConfidence + confidenceShift));

  // Custom entry style descriptions per asset & style
  let entryStyle = '';
  let executionSpeedText = '';

  if (mode === 'SCALPING') {
    executionSpeedText = 'Fast Execution (1m - 5m Hold)';
    if (marketId === 'xau-usd') {
      entryStyle = 'M5 Micro FVG Fill & 1M Sell-Side Liquidity Sweep Reclaim';
    } else if (marketId === 'nasdaq-100') {
      entryStyle = '1M Opening Bell Impulse Sweep + M5 Momentum Divergence';
    } else if (marketId === 'sp-500') {
      entryStyle = 'M5 Quick Rebound off Session VWAP & Micro Liquidity Pool';
    } else if (marketId === 'crude-oil') {
      entryStyle = 'M5 Order Block Wick Absorption & Fast Breakout Retest';
    } else if (marketId === 'xag-usd') {
      entryStyle = 'M5 Liquidity Sweep Confirmation matching Gold Micro Momentum';
    } else {
      entryStyle = 'M5 Micro Structure Break & Fast Momentum Sweep Reclaim';
    }
  } else if (mode === 'INTRADAY') {
    executionSpeedText = 'Session Hold (2h - 12h)';
    if (marketId === 'xau-usd') {
      entryStyle = 'H1 Order Block Mitigation & 15M FVG Retest Alignment';
    } else if (marketId === 'nasdaq-100') {
      entryStyle = 'H1 Fair Value Gap Reclaim + Bullish EMA Stack Continuation';
    } else if (marketId === 'sp-500') {
      entryStyle = 'H1 Structure Retest off 50-EMA Support Zone';
    } else if (marketId === 'crude-oil') {
      entryStyle = 'H1 Supply OB Rejection + M30 Internal BOS Confirmation';
    } else if (marketId === 'xag-usd') {
      entryStyle = 'H1 Demand OB Retest synchronized with Precious Metals Momentum';
    } else {
      entryStyle = 'H1 Key Session Retest + London/NY Liquidity Confirmation';
    }
  } else {
    // SWING
    executionSpeedText = 'Multi-Day Hold (1 - 7 Days)';
    if (marketId === 'xau-usd') {
      entryStyle = '4H/Daily Structural Demand OB Reclaim + Macro Trend Continuation';
    } else if (marketId === 'nasdaq-100') {
      entryStyle = 'Daily Major Liquidity Pool Sweep + 4H Bullish CHOCH Shift';
    } else if (marketId === 'sp-500') {
      entryStyle = '4H Major Swing Low Liquidity Sweep + Daily Trend Extension';
    } else if (marketId === 'crude-oil') {
      entryStyle = 'Daily Supply Zone Rejection + Weekly Macro Trend Alignment';
    } else if (marketId === 'xag-usd') {
      entryStyle = '4H Demand Zone Hold + Weekly Bullish Trend Retest';
    } else {
      entryStyle = '4H Major Structural Level Reclaim + Daily Trend Confluence';
    }
  }

  // Unit text formatting (pips, points, dollars)
  const formatDistance = (val: number) => {
    if (marketId === 'nasdaq-100' || marketId === 'sp-500') {
      return `${val.toFixed(1)} pts`;
    }
    if (marketId === 'xau-usd' || marketId === 'crude-oil') {
      return `$${val.toFixed(2)}`;
    }
    if (marketId === 'xag-usd') {
      return `$${val.toFixed(3)}`;
    }
    return `${(val * 10000).toFixed(1)} pips`;
  };

  return {
    mode,
    entryStyle,
    recommendedTimeframe: config.primaryTimeframe,
    strategyWeights: config.strategyWeights,
    stopLossDistancePips: formatDistance(slDist),
    takeProfitTarget1Pips: formatDistance(calcTp1Dist),
    takeProfitTarget2Pips: formatDistance(calcTp2Dist),
    adjustedRiskReward: `1:${rrValue}`,
    adjustedConfidence,
    focusHighlights: config.focus,
    executionSpeedText
  };
};
