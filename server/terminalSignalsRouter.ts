import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { fetchYahooCandles, fetchAllMarketData, ASSET_CONFIGS } from './marketDataRouter';

export interface TerminalActiveTrade {
  tradeId: string;
  assetId: string;
  symbol: string;
  assetName: string;
  direction: 'BUY' | 'SELL';
  timeframe: '15M' | '30M' | '1H';
  entryPrice: number;
  entryZone: string;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  confidence: number;
  status: 'ACTIVE';
  createdAtET: string;
  createdAtTimestamp: number;
  marketDataProvider: string;
  currentLivePrice: number;
  currentPnlPoints: number;
  currentPnlPercent: number;
  rationale: string;
}

export interface TerminalCompletedTrade {
  tradeId: string;
  assetId: string;
  symbol: string;
  assetName: string;
  direction: 'BUY' | 'SELL';
  timeframe: '15M' | '30M' | '1H';
  entryPrice: number;
  exitPrice: number;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  result: 'TP HIT' | 'SL HIT' | 'MANUAL_CLOSE';
  pnlPoints: number;
  pnlPercent: number;
  confidence: number;
  startedAtET: string;
  closedAtET: string;
  closedAtTimestamp: number;
  marketDataProvider: string;
  outcomeReason: string;
}

export interface TerminalAnalysisResult {
  assetId: string;
  symbol: string;
  assetName: string;
  timeframe: '15M' | '30M' | '1H';
  decision: 'BUY' | 'SELL' | 'WAIT';
  entryPrice: number;
  entryZone: string;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  riskRewardRatio: string;
  confidence: number;
  confluenceFactors: string[];
  rationale: string;
  isLocked: boolean;
  activeTrade?: TerminalActiveTrade | null;
  marketStatus: 'LIVE' | 'MARKET_CLOSED' | 'DATA_UNAVAILABLE';
  lastVerifiedPrice: number;
}

const STATE_FILE_PATH = path.join(process.cwd(), '.aurum_terminal_signals_state.json');

class ServerTerminalSignalsEngine {
  private activeTrades: Record<string, TerminalActiveTrade> = {}; // assetId -> TerminalActiveTrade
  private completedTrades: TerminalCompletedTrade[] = [];

  constructor() {
    this.loadStateFromFile();
  }

  private loadStateFromFile() {
    try {
      if (fs.existsSync(STATE_FILE_PATH)) {
        const raw = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data.activeTrades) this.activeTrades = data.activeTrades;
        if (data.completedTrades) this.completedTrades = data.completedTrades;
      }
    } catch (err) {
      console.warn('[TerminalSignalsEngine] Error loading state file:', err);
    }
  }

  private saveStateToFile() {
    try {
      const data = {
        activeTrades: this.activeTrades,
        completedTrades: this.completedTrades,
        lastSaved: new Date().toISOString()
      };
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[TerminalSignalsEngine] Error saving state file:', err);
    }
  }

  private getTimeET(): string {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' ET';
  }

  /**
   * Check market open status for asset
   */
  public isAssetMarketOpen(assetId: string): { isOpen: boolean; reason?: string } {
    if (assetId === 'btc-usd' || assetId.includes('crypto')) {
      return { isOpen: true }; // Crypto is 24/7
    }

    const now = new Date();
    const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
    const etDate = new Date(etString);
    const day = etDate.getDay(); // 0 = Sun, 6 = Sat
    const hours = etDate.getHours();

    // Weekend check: Friday 5 PM ET to Sunday 5 PM ET
    if (day === 6) {
      return { isOpen: false, reason: 'MARKET CLOSED — WEEKEND' };
    }
    if (day === 5 && hours >= 17) {
      return { isOpen: false, reason: 'MARKET CLOSED — WEEKEND' };
    }
    if (day === 0 && hours < 17) {
      return { isOpen: false, reason: 'MARKET CLOSED — WEEKEND' };
    }

    return { isOpen: true };
  }

  /**
   * Calculate ATR from closed candles
   */
  private calculateATR(candles: any[], period: number = 14): number {
    if (candles.length < 2) return 0;
    const trValues: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trValues.push(tr);
    }

    const recentTRs = trValues.slice(-period);
    if (recentTRs.length === 0) return 0;
    const sum = recentTRs.reduce((acc, v) => acc + v, 0);
    return sum / recentTRs.length;
  }

  /**
   * Run Analysis for Non-SPY Asset
   */
  public async analyzeAsset(assetId: string, timeframe: '15M' | '30M' | '1H'): Promise<TerminalAnalysisResult> {
    // 0. EXCLUDE SPY completely
    if (assetId === 'spy' || assetId === 'spy-options') {
      throw new Error('SPY is excluded from Terminal Signals Engine');
    }

    const assetConfig = ASSET_CONFIGS.find(c => c.id === assetId) || {
      id: assetId,
      symbol: assetId.toUpperCase(),
      name: assetId.toUpperCase(),
      category: 'forex',
      decimals: 2
    };

    // 1. Atomic Check: Is asset already locked in an active trade?
    if (this.activeTrades[assetId]) {
      const active = this.activeTrades[assetId];
      return {
        assetId,
        symbol: active.symbol,
        assetName: active.assetName,
        timeframe: active.timeframe,
        decision: active.direction,
        entryPrice: active.entryPrice,
        entryZone: active.entryZone,
        stopLossPrice: active.stopLossPrice,
        target1Price: active.target1Price,
        target2Price: active.target2Price,
        riskRewardRatio: '1:2.0',
        confidence: active.confidence,
        confluenceFactors: ['ACTIVE TRADE LOCK 🔒 IN PROGRESS'],
        rationale: active.rationale,
        isLocked: true,
        activeTrade: active,
        marketStatus: 'LIVE',
        lastVerifiedPrice: active.currentLivePrice
      };
    }

    // 2. Fetch Live Price & Check Market Status
    const marketCheck = this.isAssetMarketOpen(assetId);
    const allMarketData = await fetchAllMarketData();
    const liveAssetData = allMarketData?.data?.[assetId];

    if (!liveAssetData || liveAssetData.price == null) {
      return {
        assetId,
        symbol: assetConfig.symbol,
        assetName: assetConfig.name,
        timeframe,
        decision: 'WAIT',
        entryPrice: 0,
        entryZone: 'N/A',
        stopLossPrice: 0,
        target1Price: 0,
        target2Price: 0,
        riskRewardRatio: '1:2.0',
        confidence: 0,
        confluenceFactors: ['LIVE DATA UNAVAILABLE'],
        rationale: 'Live market data feed unavailable. Signal generation halted.',
        isLocked: false,
        activeTrade: null,
        marketStatus: 'DATA_UNAVAILABLE',
        lastVerifiedPrice: 0
      };
    }

    const currentLivePrice = liveAssetData.price;

    if (!marketCheck.isOpen) {
      return {
        assetId,
        symbol: assetConfig.symbol,
        assetName: assetConfig.name,
        timeframe,
        decision: 'WAIT',
        entryPrice: currentLivePrice,
        entryZone: `$${currentLivePrice.toFixed(assetConfig.decimals)}`,
        stopLossPrice: 0,
        target1Price: 0,
        target2Price: 0,
        riskRewardRatio: '1:2.0',
        confidence: 0,
        confluenceFactors: [marketCheck.reason || 'MARKET CLOSED'],
        rationale: 'Market is currently closed. Cannot generate live signals on stale/closed market pricing.',
        isLocked: false,
        activeTrade: null,
        marketStatus: 'MARKET_CLOSED',
        lastVerifiedPrice: currentLivePrice
      };
    }

    // 3. Fetch CLOSED Candles for the selected timeframe
    let yahooInterval = '15m';
    let range = '5d';
    if (timeframe === '30M') {
      yahooInterval = '30m';
      range = '5d';
    } else if (timeframe === '1H') {
      yahooInterval = '60m';
      range = '15d';
    }

    let yahooSymbol = assetConfig.symbol;
    if (assetId === 'xau-usd') yahooSymbol = 'GC=F';
    else if (assetId === 'xag-usd') yahooSymbol = 'SI=F';
    else if (assetId === 'crude-oil') yahooSymbol = 'CL=F';
    else if (assetId === 'nasdaq-100') yahooSymbol = '^NDX';
    else if (assetId === 'sp-500') yahooSymbol = '^GSPC';
    else if (assetId === 'eur-usd') yahooSymbol = 'EURUSD=X';
    else if (assetId === 'gbp-usd') yahooSymbol = 'GBPUSD=X';
    else if (assetId === 'usd-jpy') yahooSymbol = 'JPY=X';
    else if (assetId === 'aud-usd') yahooSymbol = 'AUDUSD=X';
    else if (assetId === 'usd-cad') yahooSymbol = 'CAD=X';
    else if (assetId === 'btc-usd') yahooSymbol = 'BTC-USD';

    const rawCandles = await fetchYahooCandles(yahooSymbol, yahooInterval, range);

    // Use only CLOSED candles (drop the last forming candle if active)
    const closedCandles = rawCandles.length > 1 ? rawCandles.slice(0, -1) : rawCandles;

    if (closedCandles.length < 10) {
      return {
        assetId,
        symbol: assetConfig.symbol,
        assetName: assetConfig.name,
        timeframe,
        decision: 'WAIT',
        entryPrice: currentLivePrice,
        entryZone: `$${currentLivePrice.toFixed(assetConfig.decimals)}`,
        stopLossPrice: 0,
        target1Price: 0,
        target2Price: 0,
        riskRewardRatio: '1:2.0',
        confidence: 65,
        confluenceFactors: ['INSUFFICIENT CANDLE HISTORY'],
        rationale: `Insufficient closed candle history on ${timeframe} timeframe for high-confluence analysis.`,
        isLocked: false,
        activeTrade: null,
        marketStatus: 'LIVE',
        lastVerifiedPrice: currentLivePrice
      };
    }

    // 4. Calculate Indicators on CLOSED Candles
    const atr = this.calculateATR(closedCandles, 14);
    const lastClosed = closedCandles[closedCandles.length - 1];
    const prevClosed = closedCandles[closedCandles.length - 2];

    // EMAs on closed candles
    const closes = closedCandles.map(c => c.close);
    const calcEMA = (data: number[], p: number) => {
      if (data.length < p) return data[data.length - 1];
      const k = 2 / (p + 1);
      let ema = data[0];
      for (let i = 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
      }
      return ema;
    };

    const ema20 = calcEMA(closes, 20);
    const ema50 = calcEMA(closes, 50);
    const ema200 = calcEMA(closes, 200);

    // Recent Swing High / Low from last 10 closed candles
    const recentCandles = closedCandles.slice(-10);
    const swingHigh = Math.max(...recentCandles.map(c => c.high));
    const swingLow = Math.min(...recentCandles.map(c => c.low));

    // Confluence Scoring Engine (SMC + EMA + Momentum + Price Structure)
    let bullishConfluences = 0;
    let bearishConfluences = 0;
    const confluences: string[] = [];

    // EMA Alignment
    if (ema20 > ema50) {
      bullishConfluences += 1;
      confluences.push(`EMA 20/50 Golden Stack on ${timeframe}`);
    } else if (ema20 < ema50) {
      bearishConfluences += 1;
      confluences.push(`EMA 20/50 Death Cross on ${timeframe}`);
    }

    // Candle Structure (Bullish/Bearish Engulfing / Rejection)
    if (lastClosed.close > lastClosed.open && lastClosed.close > prevClosed.high) {
      bullishConfluences += 2;
      confluences.push(`Closed Candle Bullish Structural BOS on ${timeframe}`);
    } else if (lastClosed.close < lastClosed.open && lastClosed.close < prevClosed.low) {
      bearishConfluences += 2;
      confluences.push(`Closed Candle Bearish Structural BOS on ${timeframe}`);
    }

    // Liquidity Sweep check
    if (lastClosed.low < swingLow && lastClosed.close > swingLow) {
      bullishConfluences += 2;
      confluences.push(`Sell-side Liquidity Sweep below ${swingLow.toFixed(assetConfig.decimals)} & Reclaim`);
    }
    if (lastClosed.high > swingHigh && lastClosed.close < swingHigh) {
      bearishConfluences += 2;
      confluences.push(`Buy-side Liquidity Sweep above ${swingHigh.toFixed(assetConfig.decimals)} & Rejection`);
    }

    // Trend bias against EMA 200
    if (currentLivePrice > ema200) {
      bullishConfluences += 1;
      confluences.push(`Price above EMA 200 macro trend line`);
    } else {
      bearishConfluences += 1;
      confluences.push(`Price below EMA 200 macro trend line`);
    }

    // Decision Determination
    let decision: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
    if (bullishConfluences >= 4 && bullishConfluences > bearishConfluences) {
      decision = 'BUY';
    } else if (bearishConfluences >= 4 && bearishConfluences > bullishConfluences) {
      decision = 'SELL';
    } else {
      decision = 'WAIT';
    }

    // If decision is WAIT -> Return WAIT without creating trade lock
    if (decision === 'WAIT') {
      return {
        assetId,
        symbol: assetConfig.symbol,
        assetName: assetConfig.name,
        timeframe,
        decision: 'WAIT',
        entryPrice: currentLivePrice,
        entryZone: `$${currentLivePrice.toFixed(assetConfig.decimals)}`,
        stopLossPrice: 0,
        target1Price: 0,
        target2Price: 0,
        riskRewardRatio: '1:2.0',
        confidence: 68,
        confluenceFactors: confluences.length > 0 ? confluences : ['Awaiting structural confirmation'],
        rationale: 'Confluence threshold not met. Capital preservation mode active. Awaiting clear closed-candle breakout/sweep.',
        isLocked: false,
        activeTrade: null,
        marketStatus: 'LIVE',
        lastVerifiedPrice: currentLivePrice
      };
    }

    // 5. MATHEMATICAL DYNAMIC STOP LOSS & RISK REWARD CALCULATION
    const entry = currentLivePrice;
    let atrMultiplier = 1.3;
    if (timeframe === '30M') atrMultiplier = 1.6;
    if (timeframe === '1H') atrMultiplier = 2.0;

    const volatilityDistance = (atr > 0 ? atr : entry * 0.005) * atrMultiplier;
    const safetyBuffer = volatilityDistance * 0.15;

    let stopLoss = entry;
    let target1 = entry;
    let target2 = entry;

    if (decision === 'BUY') {
      const structuralInvalidation = swingLow - safetyBuffer;
      const volatilityInvalidation = entry - volatilityDistance - safetyBuffer;
      // Technically valid stop loss below structural invalidation level
      stopLoss = Math.min(structuralInvalidation, volatilityInvalidation);

      const risk = Math.abs(entry - stopLoss);
      if (risk <= 0 || (risk / entry) < 0.0005) {
        // Risk unrealistically tiny -> Return WAIT
        return {
          assetId,
          symbol: assetConfig.symbol,
          assetName: assetConfig.name,
          timeframe,
          decision: 'WAIT',
          entryPrice: entry,
          entryZone: `$${entry.toFixed(assetConfig.decimals)}`,
          stopLossPrice: 0,
          target1Price: 0,
          target2Price: 0,
          riskRewardRatio: '1:2.0',
          confidence: 65,
          confluenceFactors: ['INVALID STOP DISTANCE'],
          rationale: 'Calculated stop loss distance is too narrow for live volatility. Returning WAIT.',
          isLocked: false,
          activeTrade: null,
          marketStatus: 'LIVE',
          lastVerifiedPrice: currentLivePrice
        };
      }

      target1 = entry + risk * 2.0; // Minimum 1:2 R:R
      target2 = entry + risk * 3.2; // 1:3.2 R:R
    } else {
      // SELL
      const structuralInvalidation = swingHigh + safetyBuffer;
      const volatilityInvalidation = entry + volatilityDistance + safetyBuffer;
      stopLoss = Math.max(structuralInvalidation, volatilityInvalidation);

      const risk = Math.abs(stopLoss - entry);
      if (risk <= 0 || (risk / entry) < 0.0005) {
        return {
          assetId,
          symbol: assetConfig.symbol,
          assetName: assetConfig.name,
          timeframe,
          decision: 'WAIT',
          entryPrice: entry,
          entryZone: `$${entry.toFixed(assetConfig.decimals)}`,
          stopLossPrice: 0,
          target1Price: 0,
          target2Price: 0,
          riskRewardRatio: '1:2.0',
          confidence: 65,
          confluenceFactors: ['INVALID STOP DISTANCE'],
          rationale: 'Calculated stop loss distance is too narrow for live volatility. Returning WAIT.',
          isLocked: false,
          activeTrade: null,
          marketStatus: 'LIVE',
          lastVerifiedPrice: currentLivePrice
        };
      }

      target1 = entry - risk * 2.0; // Minimum 1:2 R:R
      target2 = entry - risk * 3.2; // 1:3.2 R:R
    }

    // Format Entry Zone string
    const zoneSpread = Math.abs(entry - stopLoss) * 0.15;
    const minZone = Math.min(entry - zoneSpread, entry + zoneSpread);
    const maxZone = Math.max(entry - zoneSpread, entry + zoneSpread);
    const dec = assetConfig.decimals;
    const entryZone = `$${minZone.toFixed(dec)} – $${maxZone.toFixed(dec)}`;

    const confidence = Math.min(96, Math.max(82, 80 + (decision === 'BUY' ? bullishConfluences : bearishConfluences) * 3));

    // 6. CREATE APPROVED TRADE LOCK (ATOMIC SERVER LOCK)
    const newTrade: TerminalActiveTrade = {
      tradeId: `trade_${assetId}_${Date.now()}`,
      assetId,
      symbol: assetConfig.symbol,
      assetName: assetConfig.name,
      direction: decision,
      timeframe,
      entryPrice: +entry.toFixed(dec),
      entryZone,
      stopLossPrice: +stopLoss.toFixed(dec),
      target1Price: +target1.toFixed(dec),
      target2Price: +target2.toFixed(dec),
      confidence,
      status: 'ACTIVE',
      createdAtET: this.getTimeET(),
      createdAtTimestamp: Date.now(),
      marketDataProvider: liveAssetData.provider || 'BIQUOTE/FINNHUB',
      currentLivePrice: +entry.toFixed(dec),
      currentPnlPoints: 0,
      currentPnlPercent: 0,
      rationale: `${decision} ${timeframe} setup confirmed on closed candle structure with ${confluences.slice(0, 3).join(', ')}.`
    };

    // Store in activeTrades server map
    this.activeTrades[assetId] = newTrade;
    this.saveStateToFile();

    console.log(`[TerminalSignalsEngine] 🔒 ASSET TRADE LOCKED: ${assetConfig.symbol} (${decision} ${timeframe}) @ $${entry.toFixed(dec)}`);

    return {
      assetId,
      symbol: assetConfig.symbol,
      assetName: assetConfig.name,
      timeframe,
      decision,
      entryPrice: +entry.toFixed(dec),
      entryZone,
      stopLossPrice: +stopLoss.toFixed(dec),
      target1Price: +target1.toFixed(dec),
      target2Price: +target2.toFixed(dec),
      riskRewardRatio: '1:2.0',
      confidence,
      confluenceFactors: confluences,
      rationale: newTrade.rationale,
      isLocked: true,
      activeTrade: newTrade,
      marketStatus: 'LIVE',
      lastVerifiedPrice: currentLivePrice
    };
  }

  /**
   * Monitor Active Trades against live market price
   */
  public async tickMonitoring(): Promise<void> {
    const activeAssetIds = Object.keys(this.activeTrades);
    if (activeAssetIds.length === 0) return;

    const allData = await fetchAllMarketData();
    if (!allData?.data) return;

    for (const assetId of activeAssetIds) {
      const trade = this.activeTrades[assetId];
      if (!trade || trade.status !== 'ACTIVE') continue;

      const liveData = allData.data[assetId];
      if (!liveData || liveData.price == null) continue;

      const livePrice = liveData.price;
      const dec = liveData.decimals || 2;
      trade.currentLivePrice = +livePrice.toFixed(dec);

      // PnL calculation
      if (trade.direction === 'BUY') {
        trade.currentPnlPoints = +(livePrice - trade.entryPrice).toFixed(dec);
        trade.currentPnlPercent = +(((livePrice - trade.entryPrice) / trade.entryPrice) * 100).toFixed(2);
      } else {
        trade.currentPnlPoints = +(trade.entryPrice - livePrice).toFixed(dec);
        trade.currentPnlPercent = +(((trade.entryPrice - livePrice) / trade.entryPrice) * 100).toFixed(2);
      }

      // Check TP / SL hit against live market price
      let isCompleted = false;
      let outcomeResult: 'TP HIT' | 'SL HIT' = 'TP HIT';
      let exitPrice = livePrice;
      let reason = '';

      if (trade.direction === 'BUY') {
        if (livePrice >= trade.target1Price) {
          isCompleted = true;
          outcomeResult = 'TP HIT';
          exitPrice = trade.target1Price;
          reason = `Target TP1 ($${trade.target1Price}) reached at live price $${livePrice.toFixed(dec)}`;
        } else if (livePrice <= trade.stopLossPrice) {
          isCompleted = true;
          outcomeResult = 'SL HIT';
          exitPrice = trade.stopLossPrice;
          reason = `Stop Loss ($${trade.stopLossPrice}) breached at live price $${livePrice.toFixed(dec)}`;
        }
      } else if (trade.direction === 'SELL') {
        if (livePrice <= trade.target1Price) {
          isCompleted = true;
          outcomeResult = 'TP HIT';
          exitPrice = trade.target1Price;
          reason = `Target TP1 ($${trade.target1Price}) reached at live price $${livePrice.toFixed(dec)}`;
        } else if (livePrice >= trade.stopLossPrice) {
          isCompleted = true;
          outcomeResult = 'SL HIT';
          exitPrice = trade.stopLossPrice;
          reason = `Stop Loss ($${trade.stopLossPrice}) breached at live price $${livePrice.toFixed(dec)}`;
        }
      }

      if (isCompleted) {
        const completed: TerminalCompletedTrade = {
          tradeId: trade.tradeId,
          assetId: trade.assetId,
          symbol: trade.symbol,
          assetName: trade.assetName,
          direction: trade.direction,
          timeframe: trade.timeframe,
          entryPrice: trade.entryPrice,
          exitPrice: +exitPrice.toFixed(dec),
          stopLossPrice: trade.stopLossPrice,
          target1Price: trade.target1Price,
          target2Price: trade.target2Price,
          result: outcomeResult,
          pnlPoints: trade.currentPnlPoints,
          pnlPercent: trade.currentPnlPercent,
          confidence: trade.confidence,
          startedAtET: trade.createdAtET,
          closedAtET: this.getTimeET(),
          closedAtTimestamp: Date.now(),
          marketDataProvider: trade.marketDataProvider,
          outcomeReason: reason
        };

        this.completedTrades.unshift(completed);
        delete this.activeTrades[assetId];
        this.saveStateToFile();

        console.log(`[TerminalSignalsEngine] 🔓 UNLOCKED ASSET ${trade.symbol}: ${outcomeResult} @ $${exitPrice.toFixed(dec)}`);
      }
    }
  }

  /**
   * Manually close trade and unlock asset
   */
  public closeTradeManually(assetId: string): TerminalCompletedTrade | null {
    const trade = this.activeTrades[assetId];
    if (!trade) return null;

    const exitPrice = trade.currentLivePrice || trade.entryPrice;
    const completed: TerminalCompletedTrade = {
      tradeId: trade.tradeId,
      assetId: trade.assetId,
      symbol: trade.symbol,
      assetName: trade.assetName,
      direction: trade.direction,
      timeframe: trade.timeframe,
      entryPrice: trade.entryPrice,
      exitPrice,
      stopLossPrice: trade.stopLossPrice,
      target1Price: trade.target1Price,
      target2Price: trade.target2Price,
      result: 'MANUAL_CLOSE',
      pnlPoints: trade.currentPnlPoints,
      pnlPercent: trade.currentPnlPercent,
      confidence: trade.confidence,
      startedAtET: trade.createdAtET,
      closedAtET: this.getTimeET(),
      closedAtTimestamp: Date.now(),
      marketDataProvider: trade.marketDataProvider,
      outcomeReason: 'Manually closed by user'
    };

    this.completedTrades.unshift(completed);
    delete this.activeTrades[assetId];
    this.saveStateToFile();

    console.log(`[TerminalSignalsEngine] 🔓 UNLOCKED ASSET ${trade.symbol} (MANUAL CLOSE)`);
    return completed;
  }

  public getState() {
    return {
      activeTrades: this.activeTrades,
      completedTrades: this.completedTrades,
      totalActiveCount: Object.keys(this.activeTrades).length,
      totalCompletedCount: this.completedTrades.length
    };
  }
}

export const terminalSignalsEngine = new ServerTerminalSignalsEngine();

// Start 3-second background tick monitoring for live price updates against TP/SL levels
setInterval(() => {
  terminalSignalsEngine.tickMonitoring().catch(err => {
    console.error('[TerminalSignalsEngine] Monitoring error:', err);
  });
}, 3000);

export async function handleTerminalSignalsRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/terminal-signals')) {
    return false;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  try {
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;

    if (pathname === '/api/terminal-signals/state') {
      res.statusCode = 200;
      res.end(JSON.stringify(terminalSignalsEngine.getState()));
      return true;
    }

    if (pathname === '/api/terminal-signals/analyze' && req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      await new Promise(r => req.on('end', r));

      const body = bodyStr ? JSON.parse(bodyStr) : {};
      const { assetId, timeframe } = body;

      if (!assetId || !timeframe) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing assetId or timeframe parameter' }));
        return true;
      }

      if (assetId === 'spy' || assetId === 'spy-options') {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'SPY is excluded from Terminal Signals Engine' }));
        return true;
      }

      const result = await terminalSignalsEngine.analyzeAsset(assetId, timeframe as any);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return true;
    }

    if (pathname === '/api/terminal-signals/close' && req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      await new Promise(r => req.on('end', r));

      const body = bodyStr ? JSON.parse(bodyStr) : {};
      const { assetId } = body;

      if (!assetId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing assetId parameter' }));
        return true;
      }

      const closed = terminalSignalsEngine.closeTradeManually(assetId);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: !!closed, completedTrade: closed }));
      return true;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Terminal Signals endpoint not found' }));
    return true;
  } catch (err: any) {
    console.error('[TerminalSignalsRouter] Error processing request:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
    return true;
  }
}
