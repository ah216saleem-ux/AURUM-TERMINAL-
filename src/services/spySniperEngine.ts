/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AURUM TERMINAL — SPY 0DTE OPTIONS SNIPER CLIENT ENGINE
 * Connected to Server-Authoritative Engine (/api/spy-sniper/*)
 * Real CBOE Options Exchange + Yahoo Real-Time Quotes & Candles
 * Zero Mock Data, Zero Math.random(), Zero Synthetic Greeks.
 */

export interface SpyOptionContract {
  contractSymbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expirationDate: string;
  dte: number;
  bid: number;
  ask: number;
  mid: number;
  last: number;
  volume: number;
  openInterest: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  source: string;
}

export interface SpyDataIntegrity {
  spyDataStatus: 'LIVE' | 'DELAYED' | 'STALE';
  optionsDataStatus: 'LIVE' | 'DELAYED' | 'STALE';
  optionsFeedClassification: 'REAL-TIME' | 'DELAYED' | 'UNKNOWN';
  lastUpdateET: string;
  spyLatencySeconds: number;
  optionsLatencySeconds: number;
  qqqLatencySeconds: number;
  esLatencySeconds: number;
  vixLatencySeconds: number;
  isOptionsDelayed: boolean;
  freshnessGatePassed: boolean;
  maxAcceptableLatencySeconds: number;
  cboeRawTimestamp: string;
}

export interface SpyMarketSnapshot {
  spyPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  timestamp: number;
  timestampET: string;
  vwap: number;
  orh: number;
  orl: number;
  pdh: number;
  pdl: number;
  qqqPrice: number;
  qqqChangePercent: number;
  esPrice: number;
  esChangePercent: number;
  vixPrice: number;
  marketStructure: 'BULLISH' | 'BEARISH' | 'RANGE' | 'UNCLEAR';
  structureDetail: string;
  correlationStatus: 'CONFIRMED' | 'DIVERGENT' | 'MIXED';
  orderFlowStatus: 'UNAVAILABLE';
  freshness: 'FRESH' | 'STALE' | 'OFFLINE';
  dataIntegrity?: SpyDataIntegrity;
}

export interface SpyCandidate {
  id: string;
  direction: 'CALL' | 'PUT';
  setupType: string;
  selectedContract: SpyOptionContract;
  scores: {
    marketStructure: number;
    liquidity: number;
    vwap: number;
    openingRange: number;
    volumeMomentum: number;
    optionQuality: number;
    correlation: number;
    orderFlow: number;
    riskTiming: number;
  };
  totalConfidence: number;
  hardGatesPassed: boolean;
  rejectionReason: string | null;
  rank: number;
}

export interface SpyActiveTrade {
  tradeId: string;
  candidateId: string;
  direction: 'CALL' | 'PUT';
  contractSymbol: string;
  strike: number;
  entryPremium: number;
  currentPremium: number;
  targetPremium: number;
  stopPremium: number;
  initialStopPremium: number;
  trailingStopActive: boolean;
  startedAt: number;
  startedAtET: string;
  marketCloseET: string;
  confidence: number;
  suggestedContracts: number;
  maxRiskUSD: number;
  pnlDollar: number;
  pnlPercent: number;
  status: 'ACTIVE' | 'CLOSED';
  exitReason: string | null;
}

export interface SpyCompletedSignal {
  signalId: string;
  date: string;
  marketDateET: string;
  direction: 'CALL' | 'PUT';
  strike: number;
  contractSymbol: string;
  entryPremium: number;
  exitPremium: number;
  PnLUSD: number;
  PnLPercent: number;
  result: 'TP_HIT' | 'SL_HIT' | 'TRAILING_SL_HIT' | 'MANUAL_CLOSE' | 'EXPIRED';
  confidence: number;
  startedAtET: string;
  closedAtET: string;
}

export interface SpySessionState {
  sessionId: string;
  status: 'READY' | 'SCANNING' | 'ACTIVE' | 'COMPLETE' | 'DAILY_LOCKED' | 'NEWS_LOCKED' | 'OFFLINE';
  selectedDuration: string;
  trailingStopMode: boolean;
  startedAt: number | null;
  startedAtET: string | null;
  endsAt: number | null;
  nextScanAt: number | null;
  scansCompleted: number;
  bestCandidate: SpyCandidate | null;
}

export interface SpyDailyRiskState {
  marketDateET: string;
  dailyPnL: number;
  consecutiveLosses: number;
  tradesToday: number;
  dailyLocked: boolean;
  lockReason: string | null;
}

export interface SpyRiskConfig {
  accountSize: number;
  maxRiskPercent: number;
  maxDollarRisk: number;
  maxContracts: number;
  maxConsecutiveLosses: number;
  minConfidence: number;
  paperMode: boolean;
  maxAcceptableLatencySeconds: number;
}

const STORAGE_KEYS = {
  CLIENT_SESSION: 'aurum_spy_session_v3',
  CLIENT_HISTORY: 'aurum_spy_history_v3',
  CLIENT_CONFIG: 'aurum_spy_config_v3'
};

class SpySniperEngine {
  private session: SpySessionState = {
    sessionId: `client_${Date.now()}`,
    status: 'READY',
    selectedDuration: '30 MIN',
    trailingStopMode: true,
    startedAt: null,
    startedAtET: null,
    endsAt: null,
    nextScanAt: null,
    scansCompleted: 0,
    bestCandidate: null
  };
  private activeTrade: SpyActiveTrade | null = null;
  private signalHistory: SpyCompletedSignal[] = [];
  private dailyRisk: SpyDailyRiskState = {
    marketDateET: this.getTodayET(),
    dailyPnL: 0,
    consecutiveLosses: 0,
    tradesToday: 0,
    dailyLocked: false,
    lockReason: null
  };
  private snapshot: SpyMarketSnapshot | null = null;
  private candidates: SpyCandidate[] = [];
  private config: SpyRiskConfig = {
    accountSize: 25000,
    maxRiskPercent: 2.0,
    maxDollarRisk: 500,
    maxContracts: 10,
    maxConsecutiveLosses: 2,
    minConfidence: 80,
    paperMode: true,
    maxAcceptableLatencySeconds: 180
  };

  private listeners: Set<() => void> = new Set();
  private syncTimer: any = null;

  constructor() {
    this.loadLocalStorage();
    this.startSyncLoop();
  }

  private getTodayET(): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(new Date());
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const d = parts.find(p => p.type === 'day')?.value;
    return `${y}-${m}-${d}`;
  }

  private loadLocalStorage() {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEYS.CLIENT_CONFIG);
      if (savedConfig) this.config = { ...this.config, ...JSON.parse(savedConfig) };

      const savedHistory = localStorage.getItem(STORAGE_KEYS.CLIENT_HISTORY);
      if (savedHistory) this.signalHistory = JSON.parse(savedHistory);
    } catch (e) {
      console.error('[SPY Sniper Client] Error reading localStorage:', e);
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  private startSyncLoop() {
    // Poll server state every 2 seconds
    const fetchState = async () => {
      try {
        const res = await fetch('/api/spy-sniper/state');
        if (res.ok) {
          const data = await res.json();
          if (data.session) this.session = data.session;
          this.activeTrade = data.activeTrade || null;
          if (data.dailyRisk) this.dailyRisk = data.dailyRisk;
          if (data.config) this.config = data.config;
          if (data.snapshot) this.snapshot = data.snapshot;
          if (Array.isArray(data.candidates)) this.candidates = data.candidates;
          if (Array.isArray(data.history)) {
            this.signalHistory = data.history;
            try {
              localStorage.setItem(STORAGE_KEYS.CLIENT_HISTORY, JSON.stringify(data.history));
            } catch {}
          }
          this.notify();
        }
      } catch (err) {
        // If network temporarily drops, mark freshness as STALE/OFFLINE
        if (this.snapshot) {
          this.snapshot.freshness = 'STALE';
          this.notify();
        }
      }
    };

    fetchState();
    this.syncTimer = setInterval(fetchState, 2000);
  }

  public isUSMarketOpen(): { isOpen: boolean; reason: string } {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const day = parts.find(p => p.type === 'weekday')?.value;
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);

    if (day === 'Sat' || day === 'Sun') {
      return { isOpen: false, reason: 'US Market is Closed (Weekend)' };
    }

    const currentMinutes = hour * 60 + minute;
    const marketOpenMinutes = 9 * 60 + 30; // 9:30 AM
    const marketCloseMinutes = 16 * 60; // 4:00 PM

    if (currentMinutes < marketOpenMinutes) {
      return { isOpen: false, reason: 'Pre-Market (Opens 9:30 AM ET)' };
    }
    if (currentMinutes >= marketCloseMinutes) {
      return { isOpen: false, reason: 'Post-Market (Closed 4:00 PM ET)' };
    }

    return { isOpen: true, reason: 'Market is Open' };
  }

  // Session Actions (Sent to Server)
  public async startSignalSession(duration: string, trailingStopMode: boolean) {
    try {
      const res = await fetch('/api/spy-sniper/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, trailingStopMode })
      });
      if (res.ok) {
        const updatedSession = await res.json();
        this.session = updatedSession;
        this.notify();
      }
    } catch (e) {
      console.error('[SPY Sniper Client] Failed to start signal session:', e);
    }
  }

  public async cancelSignalSession() {
    try {
      const res = await fetch('/api/spy-sniper/session/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const updatedSession = await res.json();
        this.session = updatedSession;
        this.notify();
      }
    } catch (e) {
      console.error('[SPY Sniper Client] Failed to cancel session:', e);
    }
  }

  public async closeActiveTrade(reason: string = 'MANUAL_CLOSE') {
    try {
      const res = await fetch('/api/spy-sniper/trade/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        this.activeTrade = null;
        this.session.status = 'COMPLETE';
        this.notify();
      }
    } catch (e) {
      console.error('[SPY Sniper Client] Failed to close active trade:', e);
    }
  }

  public async updateConfig(newConfig: Partial<SpyRiskConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENT_CONFIG, JSON.stringify(this.config));
      await fetch('/api/spy-sniper/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {
      console.error('[SPY Sniper Client] Failed to update config on server:', e);
    }
    this.notify();
  }

  // Getters
  public getSessionState(): SpySessionState {
    return { ...this.session };
  }

  public getActiveTrade(): SpyActiveTrade | null {
    return this.activeTrade ? { ...this.activeTrade } : null;
  }

  public getSignalHistory(): SpyCompletedSignal[] {
    return [...this.signalHistory];
  }

  public getDailyRiskState(): SpyDailyRiskState {
    return { ...this.dailyRisk };
  }

  public getMarketSnapshot(): SpyMarketSnapshot | null {
    return this.snapshot ? { ...this.snapshot } : null;
  }

  public getConfig(): SpyRiskConfig {
    return { ...this.config };
  }

  public getLatestCandidates(): SpyCandidate[] {
    return [...this.candidates];
  }

  public async executeDryRun(): Promise<any> {
    try {
      const res = await fetch('/api/spy-sniper/dry-run');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('[SPY Sniper Client] Failed to execute dry-run:', e);
    }
    return null;
  }
}

export const spySniperEngine = new SpySniperEngine();
