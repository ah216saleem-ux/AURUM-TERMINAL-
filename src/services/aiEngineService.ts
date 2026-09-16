import { 
  AiEngineInput, 
  AiEngineOutput, 
  MarketItem, 
  Candle, 
  TechnicalIndicatorsInput, 
  SmartMoneyConcepts, 
  NewsSentimentInput, 
  TradingStyleMode, 
  Timeframe,
  SetupQuality
} from '../types';

class AiEngineService {
  /**
   * AI Engine Connection Layer Pipeline
   * Receives:
   *  - Live market data
   *  - OHLCV candles
   *  - Technical indicators
   *  - SMC analysis
   *  - News sentiment
   * Returns:
   *  - BUY / SELL / WAIT
   *  - Entry price
   *  - Stop Loss
   *  - Take Profit targets
   *  - Confidence Score
   */
  public evaluateSignal(input: AiEngineInput): AiEngineOutput {
    const startTime = performance.now();
    const { market, candles, technicalIndicators, smcAnalysis, newsSentiment, tradingStyleMode, timeframe } = input;

    // 1. Calculate SMC & Technical Confluence Score
    const rsiBullish = technicalIndicators.rsi > 40 && technicalIndicators.rsi < 65;
    const rsiBearish = technicalIndicators.rsi < 60 && technicalIndicators.rsi > 35;
    const emaBullish = technicalIndicators.ema20 > technicalIndicators.ema50;
    const macdBullish = technicalIndicators.macdHist > 0;
    const smcBullish = smcAnalysis.structure.includes('Bullish');
    const newsBullish = newsSentiment.nlpScore > 50;

    let bullishConfluences = 0;
    let bearishConfluences = 0;
    const confluenceFactors: string[] = [];

    if (rsiBullish) {
      bullishConfluences += 1;
      confluenceFactors.push(`RSI momentum bullish (${technicalIndicators.rsi.toFixed(1)})`);
    } else if (rsiBearish) {
      bearishConfluences += 1;
      confluenceFactors.push(`RSI momentum bearish (${technicalIndicators.rsi.toFixed(1)})`);
    }

    if (emaBullish) {
      bullishConfluences += 1;
      confluenceFactors.push('EMA 20/50 golden alignment');
    } else {
      bearishConfluences += 1;
      confluenceFactors.push('EMA 20/50 death cross alignment');
    }

    if (smcBullish) {
      bullishConfluences += 2;
      confluenceFactors.push(`SMC ${smcAnalysis.structure} detected`);
    } else {
      bearishConfluences += 2;
      confluenceFactors.push(`SMC ${smcAnalysis.structure} detected`);
    }

    if (smcAnalysis.orderBlock) {
      confluenceFactors.push(`Order block mitigation zone at ${smcAnalysis.orderBlock.low.toFixed(market.decimals || 2)}`);
    }

    if (newsBullish) {
      bullishConfluences += 1;
      confluenceFactors.push(`Institutional NLP sentiment score +${newsSentiment.nlpScore}`);
    } else {
      bearishConfluences += 1;
      confluenceFactors.push(`Institutional NLP sentiment score ${newsSentiment.nlpScore}`);
    }

    // 2. Decision Logic: BUY / SELL / WAIT
    let decision: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
    if (bullishConfluences >= 3 && bullishConfluences > bearishConfluences) {
      decision = 'BUY';
    } else if (bearishConfluences >= 3 && bearishConfluences > bullishConfluences) {
      decision = 'SELL';
    } else {
      decision = 'WAIT';
    }

    // 3. Price & Risk Parameter Calculation
    const currentPrice = market.price;
    const atrApprox = currentPrice * (tradingStyleMode === 'SCALPING' ? 0.003 : tradingStyleMode === 'INTRADAY' ? 0.008 : 0.018);

    let entry = currentPrice;
    let stopLoss = currentPrice;
    let tp1 = currentPrice;
    let tp2 = currentPrice;
    let tp3 = currentPrice;

    if (decision === 'BUY') {
      entry = currentPrice;
      stopLoss = smcAnalysis.orderBlock ? Math.min(smcAnalysis.orderBlock.low, currentPrice - atrApprox) : currentPrice - atrApprox;
      const riskDistance = entry - stopLoss;
      tp1 = entry + riskDistance * 1.8;
      tp2 = entry + riskDistance * 3.2;
      tp3 = entry + riskDistance * 5.0;
    } else if (decision === 'SELL') {
      entry = currentPrice;
      stopLoss = smcAnalysis.orderBlock ? Math.max(smcAnalysis.orderBlock.high, currentPrice + atrApprox) : currentPrice + atrApprox;
      const riskDistance = stopLoss - entry;
      tp1 = entry - riskDistance * 1.8;
      tp2 = entry - riskDistance * 3.2;
      tp3 = entry - riskDistance * 5.0;
    }

    // 4. Calculate Confidence Score
    const rawScore = 70 + (Math.max(bullishConfluences, bearishConfluences) * 5) + Math.min(10, Math.floor(newsSentiment.nlpScore / 10));
    const confidenceScore = decision === 'WAIT' ? 62 : Math.min(98, rawScore);

    let setupQuality: SetupQuality = 'B';
    if (confidenceScore >= 90) setupQuality = 'A+';
    else if (confidenceScore >= 83) setupQuality = 'A';
    else if (confidenceScore >= 75) setupQuality = 'B+';

    const endTime = performance.now();
    const executionLatencyMs = Math.max(2, Math.round(endTime - startTime));

    return {
      decision,
      entry: Number(entry.toFixed(market.decimals || 2)),
      stopLoss: Number(stopLoss.toFixed(market.decimals || 2)),
      takeProfit: {
        tp1: Number(tp1.toFixed(market.decimals || 2)),
        tp2: Number(tp2.toFixed(market.decimals || 2)),
        tp3: Number(tp3.toFixed(market.decimals || 2))
      },
      confidenceScore,
      riskRewardRatio: '1:3.2',
      confluenceFactors,
      rationale: decision === 'BUY'
        ? `High-confluence Bullish ${smcAnalysis.structure} with unmitigated order block tap & positive macro NLP sentiment.`
        : decision === 'SELL'
        ? `High-confluence Bearish ${smcAnalysis.structure} with liquidity sweep above key session highs & bearish volume delta.`
        : `Consolidation phase detected. Awaiting liquidity sweep or clean structural Break of Structure (BOS).`,
      setupQuality,
      timestamp: new Date().toISOString(),
      executionLatencyMs
    };
  }

  /**
   * Helper to build mock input parameters for testing the engine
   */
  public generateSampleInput(market: MarketItem, tradingStyleMode: TradingStyleMode = 'INTRADAY', timeframe: Timeframe = '1H'): AiEngineInput {
    const mockCandles: Candle[] = market.sparkline.map((val, idx) => ({
      time: Date.now() - (market.sparkline.length - idx) * 3600000,
      timeLabel: `${idx + 1}h ago`,
      open: val * 0.999,
      high: val * 1.002,
      low: val * 0.998,
      close: val,
      volume: 1200 + Math.floor(Math.random() * 500)
    }));

    return {
      market,
      candles: mockCandles,
      technicalIndicators: {
        rsi: 58.4,
        ema20: market.price * 1.001,
        ema50: market.price * 0.998,
        ema200: market.price * 0.990,
        macdHist: 0.0014,
        volumeDelta: +420
      },
      smcAnalysis: {
        structure: 'Bullish BOS',
        orderBlock: {
          type: 'Bullish OB+',
          low: market.price * 0.994,
          high: market.price * 0.997,
          timeframe: '1H',
          label: 'H1 Institutional Order Block',
          isMitigated: false
        },
        liquidityZone: {
          type: 'Buy-Side Liquidity (BSL)',
          price: market.price * 1.008,
          label: 'NY High BSL Sweep'
        },
        bos: { level: market.price * 1.002, type: 'Bullish BOS', status: 'Confirmed' },
        choch: { level: market.price * 0.996, type: 'Bullish CHOCH', status: 'Confirmed' },
        bullishOrderBlock: { low: market.price * 0.994, high: market.price * 0.997, timeframe: '1H', label: 'Bullish OB+', isMitigated: false },
        bearishOrderBlock: { low: market.price * 1.005, high: market.price * 1.008, timeframe: '1H', label: 'Bearish OB-', isMitigated: false },
        buySideLiquidity: { price: market.price * 1.008, label: 'NY Session BSL Sweep' },
        sellSideLiquidity: { price: market.price * 0.992, label: 'Asia Session SSL Pool' },
        liquiditySweep: { occurred: true, level: market.price * 0.993, type: 'Sell-Side Sweep', description: 'Institutional Liquidity Grab completed' }
      },
      newsSentiment: {
        nlpScore: 78,
        hawkDoveRatio: 1.45,
        latestHeadline: 'Central Bank signals liquidity injection and steady interest rate outlook.',
        impactLevel: 'HIGH'
      },
      tradingStyleMode,
      timeframe
    };
  }
}

export const aiEngineService = new AiEngineService();
