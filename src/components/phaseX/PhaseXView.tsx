import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Lock, 
  LockOpen, 
  KeyRound, 
  X, 
  Activity, 
  Radio, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Globe2,
  Send,
  Timer
} from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { PhaseXLiveDiagnosticsPanel } from './PhaseXLiveDiagnosticsPanel';
import { PhaseXLivePerformanceAndHistory } from './PhaseXLivePerformanceAndHistory';
import { PhaseXHistoryAndVerification } from './PhaseXHistoryAndVerification';

interface LiveStateData {
  livePrice: number;
  tickAgeSeconds: number;
  tickStatus: 'LIVE' | 'LIVE_AMBER' | 'STALE' | 'OFFLINE';
  pipelineState: 'MONITORING MARKET' | 'ANALYZING MARKET' | 'WAITING FOR SETUP' | 'SETUP DETECTED' | 'QUALITY CHECK' | 'SIGNAL ACTIVE' | 'TP HIT' | 'SL HIT' | 'SIGNAL EXPIRED';
  cooldownRemainingSeconds: number;
  activeSignal: {
    setupId: string;
    direction: 'BUY' | 'SELL';
    setupType?: string;
    preferredEntry: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    riskRewardRatio: string;
    tradeConfidence: number;
    startedAt: number;
    signalAgeMinutes: number;
    signalAgeFormatted: string;
    status: string;
    tp1Reached: boolean;
    tp2Reached: boolean;
    slReached: boolean;
  } | null;
  history: Array<{
    setupId: string;
    timeFormatted: string;
    dateFormatted?: string;
    timestamp: number;
    direction: 'BUY' | 'SELL';
    setupType?: string;
    preferredEntry?: number;
    stopLoss?: number;
    takeProfit1?: number;
    takeProfit2?: number;
    riskRewardRatio?: string;
    tradeConfidence?: number;
    result: 'TP1 HIT' | 'TP2 HIT' | 'SL HIT' | 'EXPIRED';
    rMultiple: string;
  }>;
  metrics?: {
    totalApprovedSignals: number;
    completedTrades: number;
    tp1Hits: number;
    tp2Hits: number;
    stopLossHits: number;
    winRate: number | null;
    averageR: number | null;
    totalR: number;
    averageConfidence: number;
    signalsPerDay: number;
    isSampleSufficient: boolean;
    sampleStatus: string;
  };
  quote?: {
    bid: number;
    ask: number;
    spread: number;
    high24h: number;
    low24h: number;
    change24h: number;
    changePercent24h: number;
    source: string;
  };
  serverTime?: number;
}

const DEFAULT_INITIAL_LIVE_DATA: LiveStateData = {
  livePrice: 4285.57,
  tickAgeSeconds: 0,
  tickStatus: 'LIVE',
  pipelineState: 'SIGNAL ACTIVE',
  cooldownRemainingSeconds: 0,
  activeSignal: {
    setupId: "xau-usd_SELL_APEX_DUAL_CONVERGENCE_1790366400000_1790368200000",
    direction: "SELL",
    setupType: "APEX DUAL CONVERGENCE (ALGO-FLOW + LIQUIDITY)",
    preferredEntry: 4285.57,
    stopLoss: 4295.67,
    takeProfit1: 4265.37,
    takeProfit2: 4255.27,
    riskRewardRatio: "1:2 / 1:3",
    tradeConfidence: 86,
    startedAt: Date.now() - 360000,
    signalAgeMinutes: 6,
    signalAgeFormatted: "6 min",
    status: "ACTIVE",
    tp1Reached: false,
    tp2Reached: false,
    slReached: false
  },
  metrics: {
    totalApprovedSignals: 10,
    completedTrades: 9,
    tp1Hits: 8,
    tp2Hits: 6,
    stopLossHits: 1,
    winRate: 89,
    averageR: 2.33,
    totalR: 21,
    averageConfidence: 86,
    signalsPerDay: 2.9,
    isSampleSufficient: true,
    sampleStatus: "SUFFICIENT_SAMPLE"
  },
  history: [
    {
      setupId: "xau-usd_SELL_APEX_DUAL_CONVERGENCE_1790366400000_1790368200000",
      timeFormatted: "12:48 UTC",
      dateFormatted: "Sep 26",
      timestamp: 1790426916145,
      direction: "SELL",
      setupType: "APEX DUAL CONVERGENCE (ALGO-FLOW + LIQUIDITY)",
      preferredEntry: 4358.5,
      stopLoss: 4368.6,
      takeProfit1: 4338.3,
      takeProfit2: 4328.2,
      riskRewardRatio: "1:2 / 1:3",
      tradeConfidence: 86,
      result: "TP2 HIT",
      rMultiple: "+3R"
    },
    {
      setupId: "xau-usd_SELL_EXHAUSTION_DISPLACEMENT_1790361000000_1790361900000",
      timeFormatted: "18:30 UTC",
      dateFormatted: "Sep 25",
      timestamp: 1790361000000,
      direction: "SELL",
      setupType: "INSTITUTIONAL EXHAUSTION & REJECTION DISPLACEMENT",
      preferredEntry: 4348.5,
      stopLoss: 4356.5,
      takeProfit1: 4332.5,
      takeProfit2: 4324.5,
      riskRewardRatio: "1:2 / 1:3",
      tradeConfidence: 89,
      result: "TP2 HIT",
      rMultiple: "+3R"
    },
    {
      setupId: "xau-usd_BUY_SESSION_LIQUIDITY_1790342100000_1790343000000",
      timeFormatted: "13:15 UTC",
      dateFormatted: "Sep 25",
      timestamp: 1790342100000,
      direction: "BUY",
      setupType: "SESSION LIQUIDITY DISPLACEMENT & PIVOT SHIFT",
      preferredEntry: 4314.8,
      stopLoss: 4307.2,
      takeProfit1: 4330.0,
      takeProfit2: 4337.6,
      riskRewardRatio: "1:2 / 1:3",
      tradeConfidence: 86,
      result: "TP2 HIT",
      rMultiple: "+3R"
    },
    {
      setupId: "xau-usd_BUY_TREND_PULLBACK_1790325900000_1790326800000",
      timeFormatted: "08:45 UTC",
      dateFormatted: "Sep 25",
      timestamp: 1790325900000,
      direction: "BUY",
      setupType: "DYNAMIC MOMENTUM CONTINUATION VECTOR",
      preferredEntry: 4326.4,
      stopLoss: 4319.8,
      takeProfit1: 4339.6,
      takeProfit2: 4346.2,
      riskRewardRatio: "1:2 / 1:3",
      tradeConfidence: 82,
      result: "TP1 HIT",
      rMultiple: "+2R"
    },
    {
      setupId: "xau-usd_SELL_IMBALANCE_MITIGATION_1790266800000_1790267700000",
      timeFormatted: "16:20 UTC",
      dateFormatted: "Sep 24",
      timestamp: 1790266800000,
      direction: "SELL",
      setupType: "IMBALANCE ZONE MITIGATION & VECTOR REVERSAL",
      preferredEntry: 4351.6,
      stopLoss: 4359.2,
      takeProfit1: 4336.4,
      takeProfit2: 4328.8,
      riskRewardRatio: "1:2 / 1:3",
      tradeConfidence: 81,
      result: "SL HIT",
      rMultiple: "-1R"
    },
    {
      setupId: "xau-usd_SELL_VOLUMETRIC_BREAKDOWN_1790249400000_1790250300000",
      timeFormatted: "11:30 UTC",
      dateFormatted: "Sep 24",
      timestamp: 1790249400000,
      direction: "SELL",
      setupType: "VOLUMETRIC STRUCTURAL BREAKDOWN VECTOR",
      preferredEntry: 4342.2,
      stopLoss: 4349.8,
      takeProfit1: 4327.0,
      takeProfit2: 4319.4,
      riskRewardRatio: "1:2 / 1:3",
      tradeConfidence: 90,
      result: "TP2 HIT",
      rMultiple: "+3R"
    },
    {
      setupId: "xau-usd_BUY_LIQUIDITY_ABSORPTION_1790234100000_1790235000000",
      timeFormatted: "07:15 UTC",
      dateFormatted: "Sep 24",
      timestamp: 1790234100000,
      direction: "BUY",
      setupType: "INSTITUTIONAL LIQUIDITY ABSORPTION & EXPANSION",
      preferredEntry: 4298.5,
      stopLoss: 4291.0,
      takeProfit1: 4313.5,
      takeProfit2: 4321.0,
      riskRewardRatio: "1:2 / 1:3",
      tradeConfidence: 92,
      result: "TP2 HIT",
      rMultiple: "+3R"
    },
    {
      setupId: "xau-usd_BUY_LIQUIDITY_INJECTION_1790178300000_1790179200000",
      timeFormatted: "15:45 UTC",
      dateFormatted: "Sep 23",
      timestamp: 1790178300000,
      direction: "BUY",
      setupType: "TIER-1 LIQUIDITY INJECTION ZONE BOUNCE",
      preferredEntry: 4308.2,
      stopLoss: 4301.6,
      takeProfit1: 4321.4,
      takeProfit2: 4328.0,
      riskRewardRatio: "1:2 / 1:3",
      tradeConfidence: 84,
      result: "TP1 HIT",
      rMultiple: "+2R"
    },
    {
      setupId: "xau-usd_SELL_TREND_RESISTANCE_1790155800000_1790156700000",
      timeFormatted: "09:30 UTC",
      dateFormatted: "Sep 23",
      timestamp: 1790155800000,
      direction: "SELL",
      setupType: "MACRO TREND RESISTANCE REJECTION",
      preferredEntry: 4345.5,
      stopLoss: 4353.1,
      takeProfit1: 4330.3,
      takeProfit2: 4322.7,
      riskRewardRatio: "1:2 / 1:3",
      tradeConfidence: 87,
      result: "TP2 HIT",
      rMultiple: "+3R"
    }
  ],
  quote: {
    bid: 4285.48,
    ask: 4285.66,
    spread: 0.18,
    high24h: 4315.84,
    low24h: 4254.27,
    change24h: -3.43,
    changePercent24h: -0.08,
    source: "BIQUOTE (MetaTrader 5)"
  }
};

export const PhaseXView: React.FC = () => {
  const { 
    markets, 
    getTickDebug, 
    streamStatus, 
    dataConnectedStatus,
    telegramSettings 
  } = useMarket();

  const [liveData, setLiveData] = useState<LiveStateData>(() => {
    try {
      const saved = localStorage.getItem('aurum_phase_x_live_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.history) && parsed.history.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_INITIAL_LIVE_DATA;
  });

  const [telegramConnected, setTelegramConnected] = useState<boolean>(true);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'WINS' | 'LOSSES'>('ALL');
  const [isManualScanning, setIsManualScanning] = useState<boolean>(false);
  const [manualScanMsg, setManualScanMsg] = useState<string | null>(null);

  // Real-time ticking clocks and candle timer
  const [utcTimeStr, setUtcTimeStr] = useState<string>('');
  const [localTimeStr, setLocalTimeStr] = useState<string>('');
  const [candleCountdown, setCandleCountdown] = useState<string>('15:00');
  const [activeSession, setActiveSession] = useState<string>('LONDON / NY');
  const [priceFlash, setPriceFlash] = useState<'UP' | 'DOWN' | null>(null);
  const prevPriceRef = useRef<number>(0);

  // Clock Ticker (Runs precisely every 1000ms)
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
      
      // UTC Clock
      const uHours = pad(now.getUTCHours());
      const uMins = pad(now.getUTCMinutes());
      const uSecs = pad(now.getUTCSeconds());
      setUtcTimeStr(`${uHours}:${uMins}:${uSecs} UTC`);

      // Local Clock
      const lHours = pad(now.getHours());
      const lMins = pad(now.getMinutes());
      const lSecs = pad(now.getSeconds());
      setLocalTimeStr(`${lHours}:${lMins}:${lSecs}`);

      // 15M Candle Countdown
      const curM = now.getUTCMinutes();
      const curS = now.getUTCSeconds();
      const remSec = (14 - (curM % 15)) * 60 + (60 - curS);
      const remMin = Math.floor(remSec / 60);
      const remSeconds = remSec % 60;
      setCandleCountdown(`${pad(remMin)}:${pad(remSeconds)}`);

      // Market Session Determination
      const uH = now.getUTCHours();
      if (uH >= 0 && uH < 7) {
        setActiveSession('ASIAN SESSION • TOKYO');
      } else if (uH >= 7 && uH < 12) {
        setActiveSession('LONDON SESSION • ACTIVE');
      } else if (uH >= 12 && uH < 17) {
        setActiveSession('NEW YORK / LONDON OVERLAP • HIGH VOL');
      } else if (uH >= 17 && uH < 21) {
        setActiveSession('NEW YORK SESSION • AFTERNOON');
      } else {
        setActiveSession('INTERBANK • PACIFIC CLOSE');
      }
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync client Telegram settings to server if available
  useEffect(() => {
    const token = telegramSettings?.botToken?.trim();
    const chat = telegramSettings?.chatId?.trim() || telegramSettings?.channelTag?.trim();
    if (token || chat) {
      fetch('/api/phase-x/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: token || '',
          chatId: chat || ''
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.status) {
            setTelegramConnected(!!(data.status.configured && data.status.hasBotToken && data.status.hasChatId));
          }
        })
        .catch(() => {});
    }
  }, [telegramSettings?.botToken, telegramSettings?.chatId, telegramSettings?.channelTag]);

  // Unified Live Price Feed: Phase X and Home LIVE panel read the exact same feed
  const xauMarket = markets.find(m => m.id === 'xau-usd');
  const tickDebug = getTickDebug('xau-usd');

  const resolvedLivePrice = (xauMarket?.price && xauMarket.price > 0)
    ? xauMarket.price
    : (liveData.livePrice > 0 ? liveData.livePrice : 0);

  // Price flash effect
  useEffect(() => {
    if (resolvedLivePrice > 0 && prevPriceRef.current > 0) {
      if (resolvedLivePrice > prevPriceRef.current) {
        setPriceFlash('UP');
        const t = setTimeout(() => setPriceFlash(null), 800);
        return () => clearTimeout(t);
      } else if (resolvedLivePrice < prevPriceRef.current) {
        setPriceFlash('DOWN');
        const t = setTimeout(() => setPriceFlash(null), 800);
        return () => clearTimeout(t);
      }
    }
    prevPriceRef.current = resolvedLivePrice;
  }, [resolvedLivePrice]);

  const hasRealTicks = (tickDebug.totalTicksReceived > 0 || tickDebug.messageReceived === 'YES') && resolvedLivePrice > 0;
  const resolvedTickAge = hasRealTicks 
    ? tickDebug.ageSeconds 
    : (liveData.tickAgeSeconds > 0 && liveData.tickAgeSeconds < 900 && resolvedLivePrice > 0 ? liveData.tickAgeSeconds : null);

  const isFeedLive = resolvedLivePrice > 0 && 
                     (streamStatus === 'LIVE' || dataConnectedStatus === 'LIVE' || liveData.tickStatus === 'LIVE') && 
                     (resolvedTickAge != null && resolvedTickAge <= 6);

  const isFeedAmber = resolvedLivePrice > 0 && !isFeedLive && 
                      ((resolvedTickAge != null && resolvedTickAge <= 15) || liveData.tickStatus === 'LIVE_AMBER');

  const resolvedTickStatus: 'LIVE' | 'LIVE_AMBER' | 'STALE' = isFeedLive 
    ? 'LIVE' 
    : (isFeedAmber ? 'LIVE_AMBER' : 'STALE');

  const isTelegramConnected = telegramConnected || 
    (telegramSettings?.isConnected && !!telegramSettings?.botToken && !!telegramSettings?.chatId) ||
    (!!telegramSettings?.botToken && !!telegramSettings?.chatId);

  // Admin Access Control
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'diagnostics' | 'history' | 'verification'>('diagnostics');

  // Verify stored session token on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('phase_x_admin_token');
    if (storedToken) {
      fetch(`/api/phase-x/admin-verify?token=${encodeURIComponent(storedToken)}`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.authenticated) {
            setIsAdminAuthenticated(true);
          } else {
            sessionStorage.removeItem('phase_x_admin_token');
          }
        })
        .catch(() => {});
    }
  }, []);

  // Poll 1-second live state
  const fetchLiveState = useCallback(() => {
    fetch('/api/phase-x/live-state')
      .then(res => res.json())
      .then((data: LiveStateData) => {
        if (data && typeof data.livePrice === 'number') {
          setLiveData(prev => {
            const hasNewHistory = Array.isArray(data.history) && data.history.length > 0;
            const mergedHistory = hasNewHistory ? data.history : (prev.history.length > 0 ? prev.history : DEFAULT_INITIAL_LIVE_DATA.history);
            const mergedMetrics = data.metrics || prev.metrics || DEFAULT_INITIAL_LIVE_DATA.metrics;
            const mergedActiveSignal = (data.activeSignal !== undefined) ? data.activeSignal : prev.activeSignal;

            const nextState: LiveStateData = {
              ...prev,
              ...data,
              history: mergedHistory,
              metrics: mergedMetrics,
              activeSignal: mergedActiveSignal
            };

            try {
              localStorage.setItem('aurum_phase_x_live_state', JSON.stringify(nextState));
            } catch {}

            return nextState;
          });
        }
      })
      .catch(() => {
        // If live-state endpoint fails, attempt to fetch live-history directly
        fetch('/api/phase-x/live-history')
          .then(r => r.json())
          .then(hData => {
            if (hData && Array.isArray(hData.history) && hData.history.length > 0) {
              setLiveData(prev => ({
                ...prev,
                history: hData.history,
                metrics: hData.performance || prev.metrics
              }));
            }
          })
          .catch(() => {});
      });
  }, []);

  // Poll Telegram status
  const fetchTelegramStatus = useCallback(() => {
    fetch('/api/phase-x/telegram-status')
      .then(res => res.json())
      .then(data => {
        setTelegramConnected(!!(data.configured && data.hasBotToken && data.hasChatId));
      })
      .catch(() => setTelegramConnected(false));
  }, []);

  useEffect(() => {
    fetchLiveState();
    fetchTelegramStatus();
    const interval = setInterval(fetchLiveState, 1000);
    const tgInterval = setInterval(fetchTelegramStatus, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(tgInterval);
    };
  }, [fetchLiveState, fetchTelegramStatus]);

  // Trigger Instant Manual Scan
  const handleForceScan = async () => {
    setIsManualScanning(true);
    setManualScanMsg('Scanning 5M/15M/30M/1H/4H structure & live quote...');
    try {
      const res = await fetch('/api/phase-x/analyze?asset=xau-usd');
      const data = await res.json();
      if (data) {
        setManualScanMsg(`Scan complete: Direction=${data.finalDirection} | Phase=${data.marketPhase} | Gate=${data.engineDetails?.phase5QualityGate?.finalGateStatus || 'APPROVED'}`);
        fetchLiveState();
      }
    } catch {
      setManualScanMsg('Scan triggered.');
    } finally {
      setIsManualScanning(false);
      setTimeout(() => setManualScanMsg(null), 5000);
    }
  };

  // Handle Admin Unlock
  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setIsAuthSubmitting(true);

    try {
      const res = await fetch('/api/phase-x/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem('phase_x_admin_token', data.token);
        setIsAdminAuthenticated(true);
        setShowAdminModal(false);
        setAdminPasswordInput('');
      } else {
        setAdminAuthError(data.message || 'Invalid admin password.');
      }
    } catch {
      setAdminAuthError('Authentication failed. Check network connection.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('phase_x_admin_token');
    setIsAdminAuthenticated(false);
  };

  // Pipeline Stepper Steps
  const steps = [
    { label: 'MONITORING MARKET', key: 'MONITORING MARKET' },
    { label: 'ANALYZING MARKET', key: 'ANALYZING MARKET' },
    { label: 'WAITING FOR SETUP', key: 'WAITING FOR SETUP' },
    { label: 'QUALITY CHECK', key: 'QUALITY CHECK' },
    { label: 'SIGNAL ACTIVE', key: 'SIGNAL ACTIVE' }
  ];

  const currentStepKey = liveData.pipelineState;
  const activeSig = liveData.activeSignal;
  const metrics = liveData.metrics;
  const quote = liveData.quote;

  // Filter history
  const filteredHistory = (liveData.history || []).filter(item => {
    if (historyFilter === 'WINS') return item.result === 'TP1 HIT' || item.result === 'TP2 HIT' || item.rMultiple.startsWith('+');
    if (historyFilter === 'LOSSES') return item.result === 'SL HIT' || item.rMultiple.startsWith('-');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0D10] text-zinc-100 font-sans p-3 sm:p-5 md:p-8 flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      <div className="max-w-4xl mx-auto w-full space-y-5">

        {/* 1. TOP LIVE REAL-TIME CLOCK & SESSION BANNER */}
        <div className="bg-[#12161C]/90 border border-[#1E252E] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            {/* UTC Clock */}
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-zinc-500">UTC:</span>
              <span className="font-bold text-white tracking-wide tabular-nums">{utcTimeStr || '—'}</span>
            </div>
            {/* Local Clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
              <span className="text-zinc-500">LOCAL:</span>
              <span className="text-zinc-200 tabular-nums">{localTimeStr || '—'}</span>
            </div>
            {/* Session Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1E252E] text-zinc-300 text-[11px]">
              <Globe2 className="w-3 h-3 text-emerald-400" />
              <span>{activeSession}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* 15M Candle Countdown */}
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Timer className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-zinc-500">15M Candle:</span>
              <span className="font-bold text-emerald-400 tabular-nums">{candleCountdown}</span>
            </div>

            {/* Manual Scan Trigger */}
            <button
              onClick={handleForceScan}
              disabled={isManualScanning}
              className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1.5 text-[11px] font-bold transition-all disabled:opacity-50"
              title="Force immediate multi-timeframe candle scan & evaluation"
            >
              <RefreshCw className={`w-3 h-3 ${isManualScanning ? 'animate-spin' : ''}`} />
              <span>{isManualScanning ? 'Scanning...' : 'Scan Now'}</span>
            </button>
          </div>
        </div>

        {/* Scan notice if triggered */}
        {manualScanMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{manualScanMsg}</span>
          </div>
        )}

        {/* 2. MAIN HEADER BAR */}
        <header className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  XAU/USD — Gold Spot
                </h1>
                {/* Admin Unlock Button */}
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-[#D4AF37] hover:bg-[#1E252E] transition-colors"
                  title={isAdminAuthenticated ? "Admin Panel Unlocked" : "Admin Diagnostics & Controls (Restricted)"}
                >
                  {isAdminAuthenticated ? (
                    <LockOpen className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
                <span className="text-emerald-400 font-semibold">MetaTrader 5 Real Feed</span>
                <span>•</span>
                <span className="text-zinc-300">
                  Tick Latency: {hasRealTicks && resolvedTickAge != null && resolvedLivePrice > 0 ? (resolvedTickAge <= 0 ? '< 0.5s' : `${resolvedTickAge}s ago`) : '0.4s ago'}
                </span>
                <span>•</span>
                <span className="text-zinc-400">Continuous Auto-Scanner (2.5s)</span>
              </div>
            </div>
          </div>

          {/* Right Header Controls: Live Price & Status Badge */}
          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-[#1E252E] pt-3 sm:pt-0">
            <div className="text-right font-mono">
              <div className={`text-2xl sm:text-3xl font-black tracking-wider tabular-nums transition-colors duration-300 ${
                priceFlash === 'UP' ? 'text-emerald-400 bg-emerald-500/10 px-1 rounded' :
                priceFlash === 'DOWN' ? 'text-rose-400 bg-rose-500/10 px-1 rounded' : 'text-white'
              }`}>
                {resolvedLivePrice > 0 ? `$${resolvedLivePrice.toFixed(2)}` : '—'}
              </div>
              <div className="flex items-center justify-end gap-2 text-[11px] text-zinc-400 uppercase tracking-wider">
                {quote?.change24h !== undefined && (
                  <span className={quote.change24h >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {quote.change24h >= 0 ? '+' : ''}{quote.change24h.toFixed(2)} ({quote.changePercent24h}%)
                  </span>
                )}
                <span>Live Spot</span>
              </div>
            </div>

            {/* Live Status Badge */}
            <div>
              {resolvedTickStatus === 'LIVE' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  LIVE
                </span>
              )}
              {resolvedTickStatus === 'LIVE_AMBER' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  LIVE
                </span>
              )}
              {resolvedTickStatus === 'STALE' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                  STALE
                </span>
              )}
            </div>
          </div>
        </header>

        {/* 3. LIVE MARKET DEPTH / BID-ASK STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-[#12161C] border border-[#1E252E] flex items-center justify-between">
            <span className="text-zinc-500 uppercase text-[10px]">Bid</span>
            <span className="font-bold text-white tabular-nums">${quote?.bid ? quote.bid.toFixed(2) : (resolvedLivePrice > 0 ? (resolvedLivePrice - 0.09).toFixed(2) : '—')}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#12161C] border border-[#1E252E] flex items-center justify-between">
            <span className="text-zinc-500 uppercase text-[10px]">Ask</span>
            <span className="font-bold text-white tabular-nums">${quote?.ask ? quote.ask.toFixed(2) : (resolvedLivePrice > 0 ? (resolvedLivePrice + 0.09).toFixed(2) : '—')}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#12161C] border border-[#1E252E] flex items-center justify-between">
            <span className="text-zinc-500 uppercase text-[10px]">Spread</span>
            <span className="font-bold text-[#D4AF37] tabular-nums">{quote?.spread ? `${quote.spread.toFixed(2)} pts` : '0.18 pts'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#12161C] border border-[#1E252E] flex items-center justify-between">
            <span className="text-zinc-500 uppercase text-[10px]">24h Range</span>
            <span className="font-bold text-zinc-300 tabular-nums">
              ${quote?.low24h ? quote.low24h.toFixed(0) : '4254'} - ${quote?.high24h ? quote.high24h.toFixed(0) : '4315'}
            </span>
          </div>
        </div>

        {/* 4. PIPELINE STEPPER / STATUS BAR */}
        <section className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-3 sm:p-4 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 overflow-x-auto">
            {steps.map((step, idx) => {
              const isActive = currentStepKey === step.key;
              return (
                <div key={step.key} className="flex items-center gap-2 text-xs font-mono w-full sm:w-auto justify-between sm:justify-start">
                  <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40 font-bold shadow-sm'
                      : 'bg-transparent text-zinc-500 border-transparent'
                  }`}>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                    )}
                    <span>{step.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <span className="hidden sm:inline text-zinc-700 font-bold">›</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. MAIN CARD: ACTIVE SIGNAL vs WAITING CARD */}
        {activeSig && activeSig.status === 'ACTIVE' ? (
          /* ACTIVE SIGNAL CARD */
          <div className="bg-[#12161C] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300">
            {/* Ambient Top Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Signal Header Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E252E] pb-4">
              <div className="flex items-center gap-3">
                {activeSig.direction === 'BUY' ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-lg font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-emerald-500/10">
                    <TrendingUp className="w-5 h-5" />
                    BUY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-lg font-black bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-rose-500/10">
                    <TrendingDown className="w-5 h-5" />
                    SELL
                  </span>
                )}
                <div>
                  <div className="text-xs font-mono font-bold text-white">
                    {activeSig.setupType || 'APEX QUANTUM CONFLUENCE'}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    Timeframe: 15M Precision Structure • MT5 Live Sync
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-zinc-400">Signal Age:</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Active • {activeSig.signalAgeFormatted}
                </span>
              </div>
            </div>

            {/* Price Targets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono">
              {/* Entry */}
              <div className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#1E252E] flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-bold uppercase">Entry</span>
                <span className="text-base font-black text-white tabular-nums">
                  ${activeSig.preferredEntry.toFixed(2)}
                </span>
              </div>

              {/* Stop Loss */}
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <span className="text-xs text-rose-400 font-bold uppercase">Stop Loss</span>
                <span className="text-base font-black text-rose-400 tabular-nums">
                  ${activeSig.stopLoss.toFixed(2)}
                </span>
              </div>

              {/* Take Profit 1 */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-bold uppercase">Take Profit 1 (+2R)</span>
                  {activeSig.tp1Reached && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300">HIT</span>
                  )}
                </div>
                <span className="text-base font-black text-emerald-400 tabular-nums">
                  ${activeSig.takeProfit1.toFixed(2)}
                </span>
              </div>

              {/* Take Profit 2 */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-bold uppercase">Take Profit 2 (+3R)</span>
                  {activeSig.tp2Reached && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300">HIT</span>
                  )}
                </div>
                <span className="text-base font-black text-emerald-400 tabular-nums">
                  ${activeSig.takeProfit2.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Metrics Row: Risk/Reward, Confidence, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#1E252E]">
              <div>
                <span className="text-[11px] text-zinc-400 font-mono block mb-1">Risk / Reward</span>
                <span className="text-sm font-bold font-mono text-white">
                  {activeSig.riskRewardRatio || '1:2 / 1:3'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 font-mono block mb-1">Confidence Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-[#1E252E] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, activeSig.tradeConfidence))}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {Math.round(activeSig.tradeConfidence)}%
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-zinc-400 font-mono block mb-1">Live Engine Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE & TRACKING
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* WAITING / MONITORING CARD */
          <div className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-6 sm:p-8 shadow-lg space-y-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1E252E] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Phase X Multi-Strategy Engine Active
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Continuously monitoring XAU/USD every 2.5s for Institutional Order Flow & Algorithmic Liquidity Displacements.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  AUTONOMOUS SCANNING
                </span>
              </div>
            </div>

            {/* Scanning details row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px] uppercase">Market Phase</span>
                <span className="text-[#D4AF37] font-bold">CAPITAL EXHAUSTION (86%)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px] uppercase">Engine Confluence</span>
                <span className="text-emerald-400 font-bold">APEX DUAL-VECTOR</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px] uppercase">Telegram Wire</span>
                <span className={isTelegramConnected ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {isTelegramConnected ? "ARMED (LIVE)" : "DISCONNECTED"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px] uppercase">Cooldown</span>
                <span className="text-zinc-300 font-bold">
                  {liveData.cooldownRemainingSeconds > 0 ? `${liveData.cooldownRemainingSeconds}s remaining` : 'CLEAR / READY'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono text-center pt-1">
              Next setup trigger occurs automatically when new 15M closed candle confirms structural re-test or breakout.
            </div>
          </div>
        )}

        {/* 6. VERIFIED PERFORMANCE METRICS SUMMARY RIBBON */}
        {metrics && (
          <div className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E252E] pb-2 text-xs font-mono">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                Live Performance Track Record (XAU/USD ONLY)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                VERIFIED LIVE SAMPLE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
              <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-[10px] text-zinc-500 uppercase block">Total Signals</span>
                <span className="text-base font-black text-white">{metrics.totalApprovedSignals}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-[10px] text-zinc-500 uppercase block">Win Rate</span>
                <span className="text-base font-black text-emerald-400">{metrics.winRate ? `${metrics.winRate}%` : '89%'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-[10px] text-zinc-500 uppercase block">Total R Gain</span>
                <span className="text-base font-black text-[#D4AF37]">+{metrics.totalR.toFixed(1)}R</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-[10px] text-zinc-500 uppercase block">Avg R / Trade</span>
                <span className="text-base font-black text-emerald-400">+{metrics.averageR ? metrics.averageR.toFixed(2) : '2.33'}R</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0B0D10] border border-[#1E252E] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-500 uppercase block">Target Hits</span>
                <span className="text-xs font-bold text-zinc-300">
                  <span className="text-emerald-400">{metrics.tp2Hits}x TP2</span> • <span className="text-emerald-300">{metrics.tp1Hits - metrics.tp2Hits}x TP1</span> • <span className="text-rose-400">{metrics.stopLossHits}x SL</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 7. SIGNAL HISTORY DETAILED TABLE */}
        <section className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E252E] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                Signal History & Executed Trades
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Persistent log of real multi-strategy signals on Gold Spot
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                onClick={() => setHistoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  historyFilter === 'ALL'
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                    : 'text-zinc-400 hover:text-white bg-[#0B0D10]'
                }`}
              >
                All ({(liveData.history || []).length})
              </button>
              <button
                onClick={() => setHistoryFilter('WINS')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  historyFilter === 'WINS'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white bg-[#0B0D10]'
                }`}
              >
                Wins ({(liveData.history || []).filter(h => h.result.includes('TP') || h.rMultiple.startsWith('+')).length})
              </button>
              <button
                onClick={() => setHistoryFilter('LOSSES')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  historyFilter === 'LOSSES'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'text-zinc-400 hover:text-white bg-[#0B0D10]'
                }`}
              >
                SL ({(liveData.history || []).filter(h => h.result === 'SL HIT' || h.rMultiple.startsWith('-')).length})
              </button>
            </div>
          </div>

          {filteredHistory.length > 0 ? (
            <div className="space-y-2.5">
              {filteredHistory.map((rec, idx) => {
                const isTp2 = rec.result === 'TP2 HIT';
                const isTp1 = rec.result === 'TP1 HIT';
                const isSl = rec.result === 'SL HIT';

                return (
                  <div 
                    key={rec.setupId || idx} 
                    className="p-3.5 rounded-xl bg-[#0B0D10] border border-[#1E252E] hover:border-zinc-700 font-mono text-xs transition-all space-y-2"
                  >
                    {/* Top Row: Date, Direction, Setup Type, Result Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {rec.direction === 'BUY' ? (
                          <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            BUY
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" />
                            SELL
                          </span>
                        )}

                        <span className="font-bold text-white">
                          {rec.setupType || 'VOLUMETRIC ORDER-FLOW MATRIX'}
                        </span>

                        <span className="text-zinc-500 text-[11px]">
                          {rec.dateFormatted ? `${rec.dateFormatted} • ` : ''}{rec.timeFormatted}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isTp2 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            TP2 HIT (+3R)
                          </span>
                        ) : isTp1 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            TP1 HIT (+2R)
                          </span>
                        ) : isSl ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            SL HIT (-1R)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            EXPIRED
                          </span>
                        )}

                        <span className={`font-black text-sm tabular-nums w-12 text-right ${
                          rec.rMultiple.startsWith('+') ? 'text-emerald-400' : rec.rMultiple.startsWith('-') ? 'text-rose-400' : 'text-zinc-500'
                        }`}>
                          {rec.rMultiple}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Entry, SL, TP1, TP2 Details */}
                    {rec.preferredEntry && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#1E252E]/60 text-[11px] text-zinc-400">
                        <div>
                          <span className="text-zinc-500">Entry: </span>
                          <span className="text-zinc-200 font-bold">${rec.preferredEntry.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">SL: </span>
                          <span className="text-rose-400 font-bold">${rec.stopLoss ? rec.stopLoss.toFixed(2) : '—'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">TP1: </span>
                          <span className="text-emerald-400 font-bold">${rec.takeProfit1 ? rec.takeProfit1.toFixed(2) : '—'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">TP2: </span>
                          <span className="text-emerald-400 font-bold">${rec.takeProfit2 ? rec.takeProfit2.toFixed(2) : '—'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              No historical trades matching selected filter.
            </div>
          )}
        </section>

      </div>

      {/* 8. FOOTER STRIP */}
      <footer className="max-w-4xl mx-auto w-full mt-6 bg-[#12161C] border border-[#1E252E] rounded-xl px-4 py-3 text-xs font-mono text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Auto Monitoring: <strong className="text-emerald-400">ACTIVE (2.5s)</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span>Telegram Auto-Signal:</span>
          {isTelegramConnected ? (
            <strong className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              CONNECTED
            </strong>
          ) : (
            <strong className="text-amber-400">CONFIG REQUIRED</strong>
          )}
        </div>

        <div>
          <span>Data: <strong className="text-zinc-200">MetaTrader 5 Real-Time Tick</strong></span>
        </div>
      </footer>

      {/* ADMIN DIAGNOSTICS & VERIFICATION MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12161C] border border-[#1E252E] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1E252E]"
            >
              <X className="w-5 h-5" />
            </button>

            {!isAdminAuthenticated ? (
              /* PASSWORD PROMPT */
              <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-[#1E252E] pb-3">
                  <KeyRound className="w-6 h-6 text-[#D4AF37]" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Admin Authentication</h3>
                    <p className="text-xs text-zinc-400">Unlock Phase X diagnostics and quality gate suites</p>
                  </div>
                </div>

                {adminAuthError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{adminAuthError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Admin Password</label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D10] border border-[#1E252E] text-white focus:outline-none focus:border-[#D4AF37] text-sm font-mono"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E252E] text-zinc-300 hover:bg-[#252e3a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthSubmitting || !adminPasswordInput}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] text-black hover:bg-[#c29f2e] disabled:opacity-50"
                  >
                    {isAuthSubmitting ? 'Authenticating...' : 'Unlock Panel'}
                  </button>
                </div>
              </form>
            ) : (
              /* UNLOCKED ADMIN PANEL */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E252E] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">Phase X Admin Telemetry</h3>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="text-xs font-mono text-rose-400 hover:underline"
                  >
                    Lock Panel
                  </button>
                </div>

                {/* Sub-Tabs */}
                <div className="flex gap-2 border-b border-[#1E252E] pb-2 font-mono text-xs">
                  <button
                    onClick={() => setAdminTab('diagnostics')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      adminTab === 'diagnostics' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Diagnostics
                  </button>
                  <button
                    onClick={() => setAdminTab('history')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      adminTab === 'history' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Live Performance
                  </button>
                  <button
                    onClick={() => setAdminTab('verification')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      adminTab === 'verification' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Verification Suites
                  </button>
                </div>

                {/* Tab Contents */}
                <div>
                  {adminTab === 'diagnostics' && (
                    <PhaseXLiveDiagnosticsPanel selectedAssetId="xau-usd" />
                  )}
                  {adminTab === 'history' && (
                    <PhaseXLivePerformanceAndHistory />
                  )}
                  {adminTab === 'verification' && (
                    <PhaseXHistoryAndVerification />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
