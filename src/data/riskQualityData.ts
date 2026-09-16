import { AurumFinalVerdict, TradeSetupGrade } from '../types';
import { getNewsTradingStatus } from './newsIntelligenceData';

export const getAurumRiskEvaluation = (
  marketId: string, 
  timeframe: string = '1H'
): AurumFinalVerdict => {
  const newsStatus = getNewsTradingStatus();
  const isNewsBlocked = newsStatus.isBlocked;

  // Custom evaluation based on marketId
  if (marketId === 'xau-usd') {
    const isNoTrade = isNewsBlocked;

    const scores = {
      technicalScore: 92,
      smcScore: 96,
      momentumScore: 89,
      newsScore: isNewsBlocked ? 40 : 92,
      riskScore: 94,
      totalComposite: isNewsBlocked ? 62 : 93
    };

    const setupGrade: TradeSetupGrade = isNewsBlocked 
      ? 'Avoid Trade' 
      : 'A+ Setup';

    return {
      decision: isNewsBlocked ? 'WAIT' : 'BUY',
      confidence: isNewsBlocked ? 62 : 93,
      setupGrade,
      scores,
      verdictReason: isNewsBlocked 
        ? 'High impact CPI news release imminent. Volatility gap risk active. Trading paused per risk rules.'
        : 'Gold (XAU/USD) validated with pristine H1 Demand Order Block mitigation, 15M Buy-Side Liquidity sweep, and 1:3.25 R:R clearance.',
      qualityFilter: {
        strategyAlignment: {
          passed: true,
          label: 'Strategy Alignment',
          detail: 'SMC Order Block + Trend EMA Stack in full alignment.'
        },
        multiTimeframeConfirmation: {
          passed: true,
          label: 'Multi-Timeframe Confluence',
          detail: 'H4 Trend, H1 Structure, and 15M Entry Zone aligned.'
        },
        newsRisk: {
          passed: !isNewsBlocked,
          label: 'News Risk Evaluation',
          detail: isNewsBlocked ? 'HIGH RISK: Red folder news in window' : 'CLEAR: No high-impact events within 60 mins'
        },
        volatilityCondition: {
          passed: true,
          label: 'Volatility & Spread',
          detail: 'Optimal ATR expansion with tight institutional spreads.'
        },
        liquidityCondition: {
          passed: true,
          label: 'Liquidity Pool Sweep',
          detail: 'Equal Lows (EQL) swept with aggressive wick absorption.'
        },
        riskRewardRatio: {
          passed: true,
          label: 'Risk-to-Reward Ratio',
          detail: '1:3.25 R:R clears minimum 1:2.0 institutional threshold.'
        }
      },
      riskPanel: {
        riskLevel: isNewsBlocked ? 'HIGH' : 'LOW',
        entryConfidence: isNewsBlocked ? '45% (Uncertain)' : '93% (High Probability)',
        stopLossQuality: 'Optimal (Protected below H1 Demand OB & Swing Low)',
        takeProfitProbability: '88% Target 1 / 72% Target 2',
        riskReward: '1:3.25',
        recommendedPositionSize: isNewsBlocked ? '0.0% (No Position)' : '1.5% Equity'
      },
      noTradeZone: {
        isNoTradeZone: isNoTrade,
        title: isNoTrade ? 'NO TRADE - LOW QUALITY SETUP' : 'TRADE APPROVED - HIGH QUALITY SETUP',
        reasons: isNoTrade 
          ? [
              'High impact economic news release within 60 minutes.',
              'Potential spread widening and slippage risk.',
              'Institutional volatility squeeze active.'
            ]
          : [
              'Confluence score exceeds 90% threshold.',
              'Risk to reward ratio clears 1:3.0 requirements.',
              'No imminent news barriers detected.'
            ]
      }
    };
  }

  if (marketId === 'nasdaq-100') {
    const isNoTrade = isNewsBlocked;
    const scores = {
      technicalScore: 89,
      smcScore: 93,
      momentumScore: 94,
      newsScore: isNewsBlocked ? 45 : 88,
      riskScore: 91,
      totalComposite: isNewsBlocked ? 65 : 91
    };

    return {
      decision: isNewsBlocked ? 'WAIT' : 'BUY',
      confidence: isNewsBlocked ? 65 : 91,
      setupGrade: isNewsBlocked ? 'Avoid Trade' : 'A+ Setup',
      scores,
      verdictReason: isNewsBlocked
        ? 'Tech market volatility expected around macroeconomic events. Waiting for news release clearance.'
        : 'NASDAQ 100 expanding out of H1 Fair Value Gap (FVG) with strong tech momentum and high volume breakout.',
      qualityFilter: {
        strategyAlignment: {
          passed: true,
          label: 'Strategy Alignment',
          detail: 'H1 FVG Reclaim + Bullish MACD Divergence.'
        },
        multiTimeframeConfirmation: {
          passed: true,
          label: 'Multi-Timeframe Confluence',
          detail: 'H4 Trend Bullish, M30 Entry Zone Triggered.'
        },
        newsRisk: {
          passed: !isNewsBlocked,
          label: 'News Risk Evaluation',
          detail: isNewsBlocked ? 'HIGH RISK: Imminent Event' : 'CLEAR: Safe Trading Window'
        },
        volatilityCondition: {
          passed: true,
          label: 'Volatility & Spread',
          detail: 'Healthy tech session ATR expansion.'
        },
        liquidityCondition: {
          passed: true,
          label: 'Liquidity Pool Sweep',
          detail: 'Asia High Liquidity Sweep completed.'
        },
        riskRewardRatio: {
          passed: true,
          label: 'Risk-to-Reward Ratio',
          detail: '1:2.85 R:R clears threshold.'
        }
      },
      riskPanel: {
        riskLevel: isNewsBlocked ? 'HIGH' : 'LOW',
        entryConfidence: isNewsBlocked ? '50%' : '91%',
        stopLossQuality: 'Strong (Below FVG lower boundary)',
        takeProfitProbability: '85% Target 1',
        riskReward: '1:2.85',
        recommendedPositionSize: isNewsBlocked ? '0.0%' : '1.25% Equity'
      },
      noTradeZone: {
        isNoTradeZone: isNoTrade,
        title: isNoTrade ? 'NO TRADE - LOW QUALITY SETUP' : 'TRADE APPROVED - HIGH QUALITY SETUP',
        reasons: isNoTrade
          ? ['High volatility news window', 'Choppy price action']
          : ['All 6 quality filters validated', 'Favorable risk-reward ratio']
      }
    };
  }

  if (marketId === 'sp-500') {
    return {
      decision: 'BUY',
      confidence: 88,
      setupGrade: 'A Setup',
      scores: {
        technicalScore: 87,
        smcScore: 90,
        momentumScore: 86,
        newsScore: 88,
        riskScore: 89,
        totalComposite: 88
      },
      verdictReason: 'S&P 500 retesting key structural support with rising dynamic 50-EMA and institutional order flow support.',
      qualityFilter: {
        strategyAlignment: { passed: true, label: 'Strategy Alignment', detail: 'Structure + Trend Continuation' },
        multiTimeframeConfirmation: { passed: true, label: 'Multi-Timeframe Confluence', detail: 'H4 Bullish, H1 Retest' },
        newsRisk: { passed: true, label: 'News Risk Evaluation', detail: 'CLEAR: Normal Volatility' },
        volatilityCondition: { passed: true, label: 'Volatility & Spread', detail: 'Controlled ATR' },
        liquidityCondition: { passed: true, label: 'Liquidity Pool Sweep', detail: 'Equal Lows Swept' },
        riskRewardRatio: { passed: true, label: 'Risk-to-Reward Ratio', detail: '1:2.60 R:R' }
      },
      riskPanel: {
        riskLevel: 'LOW',
        entryConfidence: '88%',
        stopLossQuality: 'High (Protected by 50-EMA)',
        takeProfitProbability: '84%',
        riskReward: '1:2.60',
        recommendedPositionSize: '1.0% Equity'
      },
      noTradeZone: {
        isNoTradeZone: false,
        title: 'TRADE APPROVED - HIGH QUALITY SETUP',
        reasons: ['Strong index market structure', 'Clean risk management metrics']
      }
    };
  }

  if (marketId === 'crude-oil') {
    return {
      decision: 'SELL',
      confidence: 84,
      setupGrade: 'A Setup',
      scores: {
        technicalScore: 84,
        smcScore: 86,
        momentumScore: 85,
        newsScore: 80,
        riskScore: 83,
        totalComposite: 84
      },
      verdictReason: 'Crude Oil rejected from H4 Supply Order Block with bearish MACD crossover and breaking local H1 higher low.',
      qualityFilter: {
        strategyAlignment: { passed: true, label: 'Strategy Alignment', detail: 'Supply OB Rejection + Bearish BOS' },
        multiTimeframeConfirmation: { passed: true, label: 'Multi-Timeframe Confluence', detail: 'H4 Bearish, M15 Entry' },
        newsRisk: { passed: true, label: 'News Risk Evaluation', detail: 'CLEAR: No EIA inventory news' },
        volatilityCondition: { passed: true, label: 'Volatility & Spread', detail: 'Standard Commodity ATR' },
        liquidityCondition: { passed: true, label: 'Liquidity Pool Sweep', detail: 'Buy-Side Liquidity Taken' },
        riskRewardRatio: { passed: true, label: 'Risk-to-Reward Ratio', detail: '1:2.75 R:R' }
      },
      riskPanel: {
        riskLevel: 'MEDIUM',
        entryConfidence: '84%',
        stopLossQuality: 'Solid (Above Supply OB)',
        takeProfitProbability: '80%',
        riskReward: '1:2.75',
        recommendedPositionSize: '1.0% Equity'
      },
      noTradeZone: {
        isNoTradeZone: false,
        title: 'TRADE APPROVED - HIGH QUALITY SETUP',
        reasons: ['Bearish market structure confirmed', 'Valid supply zone rejection']
      }
    };
  }

  // Silver (XAG/USD) or default
  return {
    decision: 'BUY',
    confidence: 86,
    setupGrade: 'A Setup',
    scores: {
      technicalScore: 86,
      smcScore: 88,
      momentumScore: 85,
      newsScore: 86,
      riskScore: 87,
      totalComposite: 86
    },
    verdictReason: 'Silver holding key Demand Zone in synchronization with Gold bullish momentum.',
    qualityFilter: {
      strategyAlignment: { passed: true, label: 'Strategy Alignment', detail: 'Demand Zone + Gold Correlation' },
      multiTimeframeConfirmation: { passed: true, label: 'Multi-Timeframe Confluence', detail: 'H1 & M15 Aligned' },
      newsRisk: { passed: true, label: 'News Risk Evaluation', detail: 'CLEAR' },
      volatilityCondition: { passed: true, label: 'Volatility & Spread', detail: 'Normal' },
      liquidityCondition: { passed: true, label: 'Liquidity Pool Sweep', detail: 'Swept SSL' },
      riskRewardRatio: { passed: true, label: 'Risk-to-Reward Ratio', detail: '1:2.90 R:R' }
    },
    riskPanel: {
      riskLevel: 'LOW',
      entryConfidence: '86%',
      stopLossQuality: 'Optimal',
      takeProfitProbability: '82%',
      riskReward: '1:2.90',
      recommendedPositionSize: '1.0% Equity'
    },
    noTradeZone: {
      isNoTradeZone: false,
      title: 'TRADE APPROVED - HIGH QUALITY SETUP',
      reasons: ['Metal correlation bullish', 'Clean risk parameters']
    }
  };
};
