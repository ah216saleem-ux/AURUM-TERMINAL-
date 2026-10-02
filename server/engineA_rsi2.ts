import { ClosedCandle } from './phaseXEngine.js';

export interface EngineARsi2RiskConfig {
  minStopLoss: number;        // Default $10
  maxStopLoss: number;        // Default $14 (if SL > $14, skip trade)
  atrMultiplierSL: number;    // Default 1.3 x ATR(M15)
  tp1Target: number;          // Default $6
  tp2Target: number;          // Default $10
  moveSlToBreakevenOnTp1: boolean; // Default true
}

export const DEFAULT_ENGINE_A_RISK_CONFIG: EngineARsi2RiskConfig = {
  minStopLoss: 10.0,
  maxStopLoss: 14.0,
  atrMultiplierSL: 1.3,
  tp1Target: 6.0,
  tp2Target: 10.0,
  moveSlToBreakevenOnTp1: true
};

export interface EngineARsi2Telemetry {
  engineName: 'A-RSI2';
  h1Close: number;
  ema200_1H: number;
  rsi2_1H: number;
  calculatedSLDistance: number;
  slExceedsLimit: boolean;
  setupQualified: boolean;
  direction: 'BUY' | 'SELL' | 'WAIT';
  triggerDescription: string;
  entryPrice?: number;
  stopLossPrice?: number;
  tp1Price?: number;
  tp2Price?: number;
}

/**
 * Exponential Moving Average for candle close prices
 */
export function calculateSeriesEMA(candles: ClosedCandle[], period: number): number {
  if (candles.length === 0) return 0;
  if (candles.length < period) {
    const sum = candles.reduce((acc, c) => acc + c.close, 0);
    return +(sum / candles.length).toFixed(2);
  }

  const k = 2 / (period + 1);
  let ema = candles.slice(0, period).reduce((acc, c) => acc + c.close, 0) / period;

  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close * k) + (ema * (1 - k));
  }

  return +ema.toFixed(2);
}

/**
 * Relative Strength Index (RSI) calculation over specified period on closed candles
 */
export function calculateRSI(candles: ClosedCandle[], period: number = 2): number {
  if (candles.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return +(100 - (100 / (1 + rs))).toFixed(2);
}

/**
 * Engine A: RSI(2) + EMA200 Mean Reversion (H1)
 *
 * Rules:
 * 1. Uses ONLY CLOSED 1H candles (no repainting / live candle triggers).
 * 2. BUY: H1 Close > EMA200(1H) AND RSI(2) < 10
 * 3. SELL: H1 Close < EMA200(1H) AND RSI(2) > 90
 * 4. Risk:
 *    - SL = max($10, 1.3 x ATR(M15))
 *    - Skip trade (WAIT) if SL > $14
 *    - TP1 = $6 (moves SL to breakeven when hit)
 *    - TP2 = $10
 */
export function detectEngineARsi2Setup(params: {
  closed1H: ClosedCandle[];
  atr15M: number;
  currentPrice: number;
  config?: Partial<EngineARsi2RiskConfig>;
  m15Count?: number;
}): EngineARsi2Telemetry {
  const { closed1H, atr15M, currentPrice, config: customConfig, m15Count } = params;
  const config: EngineARsi2RiskConfig = { ...DEFAULT_ENGINE_A_RISK_CONFIG, ...customConfig };

  if (!closed1H || closed1H.length < 200) {
    return {
      engineName: 'A-RSI2',
      h1Close: currentPrice,
      ema200_1H: 0,
      rsi2_1H: 50,
      calculatedSLDistance: config.minStopLoss,
      slExceedsLimit: false,
      setupQualified: false,
      direction: 'WAIT',
      triggerDescription: `warming up (BiQuote ticks only) — H1 Count: ${closed1H ? closed1H.length : 0}/200`
    };
  }

  if (m15Count != null && m15Count < 20) {
    return {
      engineName: 'A-RSI2',
      h1Close: currentPrice,
      ema200_1H: 0,
      rsi2_1H: 50,
      calculatedSLDistance: config.minStopLoss,
      slExceedsLimit: false,
      setupQualified: false,
      direction: 'WAIT',
      triggerDescription: `warming up (BiQuote ticks only) — M15 Count: ${m15Count}/20`
    };
  }

  // Always evaluate on the LAST CLOSED H1 CANDLE (never active unclosed candle)
  const lastClosedH1 = closed1H[closed1H.length - 1];
  const h1Close = lastClosedH1.close;

  const ema200_1H = calculateSeriesEMA(closed1H, 200);
  const rsi2_1H = calculateRSI(closed1H, 2);

  // Risk Rules Calculation
  const calculatedSLDistance = +Math.max(config.minStopLoss, config.atrMultiplierSL * atr15M).toFixed(2);
  const slExceedsLimit = calculatedSLDistance > config.maxStopLoss;

  let direction: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  let setupQualified = false;
  let triggerDescription = 'A-RSI2 conditions not met.';

  // Check conditions
  const isBuyCondition = h1Close > ema200_1H && rsi2_1H < 10;
  const isSellCondition = h1Close < ema200_1H && rsi2_1H > 90;

  if (slExceedsLimit && (isBuyCondition || isSellCondition)) {
    direction = 'WAIT';
    setupQualified = false;
    triggerDescription = `A-RSI2: Risk SL ($${calculatedSLDistance.toFixed(2)}) exceeds max allowed limit ($${config.maxStopLoss.toFixed(2)}). Setup skipped.`;
  } else if (isBuyCondition) {
    direction = 'BUY';
    setupQualified = true;
    triggerDescription = `A-RSI2 BUY: H1 Close ($${h1Close.toFixed(2)}) > EMA200 ($${ema200_1H.toFixed(2)}) & RSI(2) (${rsi2_1H}) < 10 | SL: $${calculatedSLDistance.toFixed(2)}, TP1: $${config.tp1Target}, TP2: $${config.tp2Target}`;
  } else if (isSellCondition) {
    direction = 'SELL';
    setupQualified = true;
    triggerDescription = `A-RSI2 SELL: H1 Close ($${h1Close.toFixed(2)}) < EMA200 ($${ema200_1H.toFixed(2)}) & RSI(2) (${rsi2_1H}) > 90 | SL: $${calculatedSLDistance.toFixed(2)}, TP1: $${config.tp1Target}, TP2: $${config.tp2Target}`;
  } else {
    triggerDescription = `A-RSI2 Scanning: H1 Close $${h1Close.toFixed(2)} vs EMA200 $${ema200_1H.toFixed(2)} | RSI(2) = ${rsi2_1H} (BUY: <10, SELL: >90)`;
  }

  const entryPrice = currentPrice || h1Close;
  const stopLossPrice = direction === 'BUY'
    ? +(entryPrice - calculatedSLDistance).toFixed(2)
    : direction === 'SELL'
      ? +(entryPrice + calculatedSLDistance).toFixed(2)
      : undefined;

  const tp1Price = direction === 'BUY'
    ? +(entryPrice + config.tp1Target).toFixed(2)
    : direction === 'SELL'
      ? +(entryPrice - config.tp1Target).toFixed(2)
      : undefined;

  const tp2Price = direction === 'BUY'
    ? +(entryPrice + config.tp2Target).toFixed(2)
    : direction === 'SELL'
      ? +(entryPrice - config.tp2Target).toFixed(2)
      : undefined;

  return {
    engineName: 'A-RSI2',
    h1Close,
    ema200_1H,
    rsi2_1H,
    calculatedSLDistance,
    slExceedsLimit,
    setupQualified,
    direction,
    triggerDescription,
    entryPrice,
    stopLossPrice,
    tp1Price,
    tp2Price
  };
}
