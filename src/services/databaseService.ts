import { 
  AiSignalRecord, 
  SignalResultRecord, 
  StrategyPerformanceRecord, 
  UserWatchlistRecord, 
  DatabaseExportSchema,
  MarketCategory,
  Timeframe,
  TradingStyleMode
} from '../types';

const DB_KEYS = {
  SIGNALS: 'aurum_db_signals_v1',
  RESULTS: 'aurum_db_results_v1',
  STRATEGIES: 'aurum_db_strategies_v1',
  WATCHLISTS: 'aurum_db_watchlists_v1'
};

// Seed records for initial instantiation
const INITIAL_SIGNALS: AiSignalRecord[] = [
  {
    id: 'sig-xau-01',
    assetId: 'xau-usd',
    symbol: 'XAU/USD',
    category: 'commodities',
    decision: 'BUY',
    entry: 2684.50,
    stopLoss: 2672.00,
    tp1: 2702.00,
    tp2: 2724.00,
    tp3: 2750.00,
    confidenceScore: 92,
    timeframe: '1H',
    tradingMode: 'INTRADAY',
    status: 'ACTIVE',
    candleId: 'm30-candle-seed-01',
    expiryTimestamp: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    timestamp: new Date().toISOString()
  },
  {
    id: 'sig-eur-02',
    assetId: 'eur-usd',
    symbol: 'EUR/USD',
    category: 'forex',
    decision: 'SELL',
    entry: 1.0845,
    stopLoss: 1.0880,
    tp1: 1.0790,
    tp2: 1.0740,
    tp3: 1.0680,
    confidenceScore: 88,
    timeframe: '15M',
    tradingMode: 'SCALPING',
    status: 'ACTIVE',
    candleId: 'm30-candle-seed-02',
    expiryTimestamp: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'sig-btc-03',
    assetId: 'btc-usd',
    symbol: 'BTC/USD',
    category: 'crypto',
    decision: 'BUY',
    entry: 64200,
    stopLoss: 62800,
    tp1: 66500,
    tp2: 68900,
    tp3: 72000,
    confidenceScore: 94,
    timeframe: '4H',
    tradingMode: 'SWING',
    status: 'ACTIVE',
    candleId: 'm30-candle-seed-03',
    expiryTimestamp: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

const INITIAL_RESULTS: SignalResultRecord[] = [
  {
    id: 'res-01',
    signalId: 'sig-xau-prev-01',
    assetId: 'xau-usd',
    symbol: 'XAU/USD',
    result: 'TP2_HIT',
    entryPrice: 2650.00,
    exitPrice: 2698.00,
    pnlR: 3.2,
    pnlPercent: 1.81,
    closeTimestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'res-02',
    signalId: 'sig-nas-prev-02',
    assetId: 'nasdaq-100',
    symbol: 'NAS100',
    result: 'TP3_HIT',
    entryPrice: 19800,
    exitPrice: 20250,
    pnlR: 4.8,
    pnlPercent: 2.27,
    closeTimestamp: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'res-03',
    signalId: 'sig-gbp-prev-03',
    assetId: 'gbp-usd',
    symbol: 'GBP/USD',
    result: 'TP1_HIT',
    entryPrice: 1.3120,
    exitPrice: 1.3180,
    pnlR: 1.8,
    pnlPercent: 0.45,
    closeTimestamp: new Date(Date.now() - 259200000).toISOString()
  }
];

const INITIAL_STRATEGIES: StrategyPerformanceRecord[] = [
  {
    strategyId: 'smc-liquidity-sweep',
    strategyName: 'SMC Liquidity Sweep & OTE Mitigation',
    totalSignals: 420,
    wins: 358,
    losses: 62,
    winRatePercent: 85.2,
    averageRR: '1:3.4',
    profitFactor: 3.85,
    maxDrawdownPercent: 3.2,
    netRPnl: 894.2
  },
  {
    strategyId: 'hft-scalp-imbalance',
    strategyName: 'HFT Volume Imbalance & FVG Fill',
    totalSignals: 680,
    wins: 554,
    losses: 126,
    winRatePercent: 81.4,
    averageRR: '1:2.8',
    profitFactor: 2.92,
    maxDrawdownPercent: 4.1,
    netRPnl: 642.0
  },
  {
    strategyId: 'macro-trend-continuation',
    strategyName: 'Macro Trend Structural Expansion (BOS)',
    totalSignals: 310,
    wins: 272,
    losses: 38,
    winRatePercent: 87.7,
    averageRR: '1:4.1',
    profitFactor: 4.20,
    maxDrawdownPercent: 2.8,
    netRPnl: 1120.5
  }
];

class DatabaseService {
  private signals: AiSignalRecord[] = [];
  private results: SignalResultRecord[] = [];
  private strategies: StrategyPerformanceRecord[] = [];
  private watchlists: Record<string, string[]> = {
    default_user: ['xau-usd', 'nasdaq-100', 'btc-usd']
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const storedSignals = localStorage.getItem(DB_KEYS.SIGNALS);
      const storedResults = localStorage.getItem(DB_KEYS.RESULTS);
      const storedStrategies = localStorage.getItem(DB_KEYS.STRATEGIES);
      const storedWatchlists = localStorage.getItem(DB_KEYS.WATCHLISTS);

      this.signals = storedSignals ? JSON.parse(storedSignals) : INITIAL_SIGNALS;
      this.results = storedResults ? JSON.parse(storedResults) : INITIAL_RESULTS;
      this.strategies = storedStrategies ? JSON.parse(storedStrategies) : INITIAL_STRATEGIES;
      if (storedWatchlists) {
        this.watchlists = JSON.parse(storedWatchlists);
      }
    } catch (err) {
      console.warn('[DatabaseService] Failed reading localStorage, using initial memory seed:', err);
      this.signals = INITIAL_SIGNALS;
      this.results = INITIAL_RESULTS;
      this.strategies = INITIAL_STRATEGIES;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DB_KEYS.SIGNALS, JSON.stringify(this.signals));
      localStorage.setItem(DB_KEYS.RESULTS, JSON.stringify(this.results));
      localStorage.setItem(DB_KEYS.STRATEGIES, JSON.stringify(this.strategies));
      localStorage.setItem(DB_KEYS.WATCHLISTS, JSON.stringify(this.watchlists));
    } catch (err) {
      console.error('[DatabaseService] Error persisting to storage:', err);
    }
  }

  // 1. SIGNALS API
  public getAllSignals(): AiSignalRecord[] {
    return [...this.signals];
  }

  public getActiveSignals(): AiSignalRecord[] {
    return this.signals.filter(s => s.status === 'ACTIVE');
  }

  public hasActiveSignalForAsset(assetId: string): boolean {
    return this.signals.some(s => s.assetId === assetId && s.status === 'ACTIVE');
  }

  public getActiveSignalForAsset(assetId: string): AiSignalRecord | null {
    return this.signals.find(s => s.assetId === assetId && s.status === 'ACTIVE') || null;
  }

  public hasActiveSignalForCandle(assetId: string, candleId: string): boolean {
    return this.signals.some(s => s.assetId === assetId && s.candleId === candleId && s.status === 'ACTIVE');
  }

  public saveSignal(signal: Omit<AiSignalRecord, 'id' | 'timestamp' | 'status' | 'candleId' | 'expiryTimestamp'> & { candleId?: string; expiryTimestamp?: string }): AiSignalRecord {
    const assetId = signal.assetId;
    const currentCandleId = signal.candleId || `m30-candle-${Math.floor(Date.now() / (30 * 60 * 1000))}`;

    // Duplicate protection: prevent same asset or same candle duplicate signals while active
    const existingActive = this.getActiveSignalForAsset(assetId);
    if (existingActive) {
      console.warn(`[DatabaseService] Active signal lock active for asset ${assetId}. Rejecting duplicate signal.`);
      return existingActive;
    }

    if (this.hasActiveSignalForCandle(assetId, currentCandleId)) {
      const candleMatch = this.signals.find(s => s.assetId === assetId && s.candleId === currentCandleId && s.status === 'ACTIVE');
      if (candleMatch) return candleMatch;
    }

    const newRecord: AiSignalRecord = {
      ...signal,
      id: `sig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'ACTIVE',
      candleId: currentCandleId,
      expiryTimestamp: signal.expiryTimestamp || new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      timestamp: new Date().toISOString()
    };
    this.signals = [newRecord, ...this.signals];
    this.saveToStorage();
    return newRecord;
  }

  public updateSignalStatus(
    signalId: string, 
    status: 'ACTIVE' | 'TP HIT' | 'SL HIT' | 'EXPIRED' | 'CANCELLED' | 'CLOSED',
    result?: 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'EXPIRED'
  ): AiSignalRecord | null {
    const idx = this.signals.findIndex(s => s.id === signalId);
    if (idx === -1) return null;

    const sig = this.signals[idx];
    sig.status = status;
    if (result) sig.result = result;
    
    this.saveToStorage();
    return sig;
  }

  public unlockAssetSignal(
    assetId: string,
    status: 'TP HIT' | 'SL HIT' | 'EXPIRED' | 'CANCELLED',
    exitPrice?: number
  ): AiSignalRecord | null {
    const activeSig = this.getActiveSignalForAsset(assetId);
    if (!activeSig) return null;

    let resultOutcome: 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'EXPIRED' = 'EXPIRED';
    if (status === 'TP HIT') resultOutcome = 'TP1_HIT';
    else if (status === 'SL HIT') resultOutcome = 'SL_HIT';
    else if (status === 'EXPIRED') resultOutcome = 'EXPIRED';

    if (exitPrice !== undefined && status !== 'CANCELLED') {
      this.logSignalResult(activeSig.id, resultOutcome, exitPrice);
    }

    return this.updateSignalStatus(activeSig.id, status, resultOutcome);
  }

  // 2. SIGNAL RESULTS & OUTCOMES API
  public getAllResults(): SignalResultRecord[] {
    return [...this.results];
  }

  public logSignalResult(
    signalId: string, 
    result: 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'EXPIRED',
    exitPrice: number
  ): SignalResultRecord | null {
    const signalIndex = this.signals.findIndex(s => s.id === signalId);
    if (signalIndex === -1) return null;

    const signal = this.signals[signalIndex];
    signal.status = 'CLOSED';
    signal.result = result;

    let pnlR = 0;
    if (result === 'TP1_HIT') pnlR = 1.8;
    else if (result === 'TP2_HIT') pnlR = 3.2;
    else if (result === 'TP3_HIT') pnlR = 5.0;
    else if (result === 'SL_HIT') pnlR = -1.0;

    signal.netR = pnlR;

    const pnlPercent = Number(((pnlR * 0.5)).toFixed(2)); // Assuming 0.5% risk per R

    const newResult: SignalResultRecord = {
      id: `res-${Date.now()}`,
      signalId: signal.id,
      assetId: signal.assetId,
      symbol: signal.symbol,
      result,
      entryPrice: signal.entry,
      exitPrice,
      pnlR,
      pnlPercent,
      closeTimestamp: new Date().toISOString()
    };

    this.results = [newResult, ...this.results];
    this.saveToStorage();
    return newResult;
  }

  // 3. STRATEGY PERFORMANCE API
  public getStrategyPerformance(): StrategyPerformanceRecord[] {
    return [...this.strategies];
  }

  // 4. USER WATCHLIST API
  public getUserWatchlist(userId: string = 'default_user'): string[] {
    return this.watchlists[userId] || ['xau-usd', 'nasdaq-100', 'btc-usd'];
  }

  public saveUserWatchlist(userId: string = 'default_user', assetIds: string[]): string[] {
    this.watchlists[userId] = assetIds;
    this.saveToStorage();
    return assetIds;
  }

  public toggleWatchlistAsset(userId: string = 'default_user', assetId: string): string[] {
    const current = this.getUserWatchlist(userId);
    const updated = current.includes(assetId)
      ? current.filter(id => id !== assetId)
      : [...current, assetId];
    return this.saveUserWatchlist(userId, updated);
  }

  // 5. DATABASE EXPORT / IMPORT FOR PRODUCTION AUDITING
  public exportDatabase(): DatabaseExportSchema {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      signals: this.signals,
      results: this.results,
      strategyStats: this.strategies,
      watchlists: Object.entries(this.watchlists).map(([userId, favoriteAssetIds]) => ({
        userId,
        favoriteAssetIds,
        lastUpdated: new Date().toISOString()
      }))
    };
  }

  public importDatabase(json: DatabaseExportSchema): boolean {
    try {
      if (json.signals) this.signals = json.signals;
      if (json.results) this.results = json.results;
      if (json.strategyStats) this.strategies = json.strategyStats;
      if (json.watchlists) {
        json.watchlists.forEach(w => {
          this.watchlists[w.userId] = w.favoriteAssetIds;
        });
      }
      this.saveToStorage();
      return true;
    } catch (err) {
      console.error('[DatabaseService] Failed to import database:', err);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();
