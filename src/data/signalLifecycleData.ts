import { SignalLifecycleData, SignalLifecycleStage, SignalLifecycleStageId, TradingStyleMode, Timeframe } from '../types';

export function getSignalLifecycleData(
  assetId: string,
  symbol: string,
  entry: number,
  sl: number,
  tp: number,
  mode: TradingStyleMode = 'INTRADAY',
  timeframe: Timeframe = '1H'
): SignalLifecycleData {
  // Determine lifecycle progression based on asset dynamics
  let currentStage: SignalLifecycleStageId = 'TRADE_ACTIVE';
  let currentStageIndex = 3;
  let progressPercent = 78;
  let statusText = 'Trade is Active • Running in Profit';
  let pnlPips = +34;
  let pnlPercent = +1.8;

  if (assetId === 'xau-usd') {
    currentStage = 'TRADE_ACTIVE';
    currentStageIndex = 3;
    progressPercent = 82;
    statusText = 'Trade Active • Target 1 Reached (+180 pips), SL at Breakeven';
    pnlPips = +180;
    pnlPercent = +3.4;
  } else if (assetId === 'nasdaq-100') {
    currentStage = 'ENTRY_READY';
    currentStageIndex = 2;
    progressPercent = 60;
    statusText = 'Entry Ready • Price inside Optimal Zone ($19,845 - $19,855)';
    pnlPips = 0;
    pnlPercent = 0;
  } else if (assetId === 'eur-usd') {
    currentStage = 'CONFIRMATION_WAITING';
    currentStageIndex = 1;
    progressPercent = 38;
    statusText = 'Confirmation Waiting • Awaiting M15 bullish candle close';
    pnlPips = 0;
    pnlPercent = 0;
  } else if (assetId === 'sp-500') {
    currentStage = 'TP_HIT';
    currentStageIndex = 4;
    progressPercent = 100;
    statusText = 'TP Hit • Target 1 Fulfilled at $5,810 (+1.2% Gain)';
    pnlPips = +70;
    pnlPercent = +2.6;
  } else if (assetId === 'btc-usd') {
    currentStage = 'TRADE_ACTIVE';
    currentStageIndex = 3;
    progressPercent = 75;
    statusText = 'Trade Active • Retesting breakout high at $64,800';
    pnlPips = +600;
    pnlPercent = +4.1;
  } else if (assetId === 'crude-oil') {
    currentStage = 'SETUP_DETECTED';
    currentStageIndex = 0;
    progressPercent = 15;
    statusText = 'Setup Detected • Bearish Order Block formed on 4H';
    pnlPips = 0;
    pnlPercent = 0;
  }

  const stages: SignalLifecycleStage[] = [
    {
      id: 'SETUP_DETECTED',
      label: 'Setup Detected',
      time: '07:15 UTC',
      status: currentStageIndex >= 0 ? 'completed' : 'pending',
      priceAtStage: +(entry * 0.994).toFixed(2),
      description: 'Liquidity pool swept below key session low. Institutional Fair Value Gap (FVG) identified.',
      keyCriterion: 'Clean structural displacement on 15M/1H timeframe.'
    },
    {
      id: 'CONFIRMATION_WAITING',
      label: 'Confirmation Waiting',
      time: '07:42 UTC',
      status: currentStageIndex > 1 ? 'completed' : currentStageIndex === 1 ? 'active' : 'pending',
      priceAtStage: +(entry * 0.998).toFixed(2),
      description: 'Waiting for institutional order flow confirmation and internal Change of Character (CHOCH).',
      keyCriterion: 'M15 candle closes firmly above previous swing high with volume expansion.'
    },
    {
      id: 'ENTRY_READY',
      label: 'Entry Ready',
      time: '08:05 UTC',
      status: currentStageIndex > 2 ? 'completed' : currentStageIndex === 2 ? 'active' : 'pending',
      priceAtStage: entry,
      description: `Optimal Entry Zone reached ($${entry.toLocaleString()}). Execution parameters locked.`,
      keyCriterion: 'Price taps 61.8%–78.6% Fibonacci OTE zone within Order Block.'
    },
    {
      id: 'TRADE_ACTIVE',
      label: 'Trade Active',
      time: '08:14 UTC',
      status: currentStageIndex > 3 ? 'completed' : currentStageIndex === 3 ? 'active' : 'pending',
      priceAtStage: +(entry * 1.004).toFixed(2),
      description: `Order filled. Protective SL fixed at $${sl.toLocaleString()}. Trailing stops armed.`,
      keyCriterion: 'Position is live in market; risk-to-reward ratio 1:2.8 maintained.'
    },
    {
      id: 'TP_HIT',
      label: 'TP Hit / SL Hit',
      time: currentStageIndex === 4 ? '09:30 UTC' : 'Pending',
      status: currentStageIndex === 4 ? 'completed' : 'pending',
      priceAtStage: tp,
      description: currentStageIndex === 4 
        ? `Take Profit reached at $${tp.toLocaleString()}! Max reward locked.`
        : `Target Objective set at $${tp.toLocaleString()} (TP2: $${(tp * 1.01).toFixed(2)}).`,
      keyCriterion: 'Liquidity target mitigation and risk extraction.'
    }
  ];

  return {
    assetId,
    symbol,
    currentStage,
    currentStageIndex,
    progressPercent,
    statusText,
    pnlPips,
    pnlPercent,
    stages,
    summaryNote: `AURUM AI is managing this setup according to ${mode} mode rules on ${timeframe}. Risk is automatically capped at invalidation level $${sl.toLocaleString()}.`
  };
}
