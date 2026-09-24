import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle
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
    timestamp: number;
    direction: 'BUY' | 'SELL';
    result: 'TP1 HIT' | 'TP2 HIT' | 'SL HIT' | 'EXPIRED';
    rMultiple: string;
  }>;
}

export const PhaseXView: React.FC = () => {
  const { 
    markets, 
    getTickDebug, 
    streamStatus, 
    dataConnectedStatus,
    telegramSettings 
  } = useMarket();

  const [liveData, setLiveData] = useState<LiveStateData>({
    livePrice: 0,
    tickAgeSeconds: 0,
    tickStatus: 'OFFLINE',
    pipelineState: 'MONITORING MARKET',
    cooldownRemainingSeconds: 0,
    activeSignal: null,
    history: []
  });

  const [telegramConnected, setTelegramConnected] = useState<boolean>(true);

  // Sync client Telegram settings to server if available
  useEffect(() => {
    if (telegramSettings?.botToken && telegramSettings?.chatId) {
      fetch('/api/phase-x/telegram-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramSettings.botToken,
          chatId: telegramSettings.chatId
        })
      }).catch(() => {});
    }
  }, [telegramSettings?.botToken, telegramSettings?.chatId]);

  // Unified Live Price Feed: Phase X and Home LIVE panel read the exact same feed
  const xauMarket = markets.find(m => m.id === 'xau-usd');
  const tickDebug = getTickDebug('xau-usd');

  const resolvedLivePrice = (xauMarket?.price && xauMarket.price > 0)
    ? xauMarket.price
    : (liveData.livePrice > 0 ? liveData.livePrice : 0);

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
          setLiveData(data);
        }
      })
      .catch(() => {});
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
    const interval = setInterval(() => {
      fetchLiveState();
    }, 1000);
    const tgInterval = setInterval(fetchTelegramStatus, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(tgInterval);
    };
  }, [fetchLiveState, fetchTelegramStatus]);

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
    } catch (err: any) {
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

  return (
    <div className="min-h-screen bg-[#0B0D10] text-zinc-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      <div className="max-w-4xl mx-auto w-full space-y-6">

        {/* 1. HEADER BAR */}
        <header className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
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
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
                <span>Real MT5 Feed</span>
                <span>•</span>
                <span className="text-zinc-300 font-medium">
                  Tick Age: {hasRealTicks && resolvedTickAge != null && resolvedLivePrice > 0 ? (resolvedTickAge <= 0 ? '< 1s ago' : `${resolvedTickAge}s ago`) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Controls: Live Price & Status Badge */}
          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-[#1E252E] pt-3 sm:pt-0">
            <div className="text-right font-mono">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-wider tabular-nums">
                {resolvedLivePrice > 0 ? `$${resolvedLivePrice.toFixed(2)}` : '—'}
              </div>
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider">
                XAU/USD Live Spot
              </div>
            </div>

            {/* Live Status Badge */}
            <div>
              {resolvedTickStatus === 'LIVE' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
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

        {/* 2. PIPELINE STEPPER / STATUS BAR */}
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

        {/* 3. MAIN CARD: ACTIVE SIGNAL vs WAITING CARD */}
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
                <span className="text-xs font-mono font-bold text-zinc-400 px-2.5 py-1 rounded-lg bg-[#1E252E]">
                  Timeframe: 15M
                </span>
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
                  <span className="text-xs text-emerald-400 font-bold uppercase">Take Profit 1</span>
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
                  <span className="text-xs text-emerald-400 font-bold uppercase">Take Profit 2</span>
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
                <span className="text-[11px] text-zinc-400 font-mono block mb-1">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-[#1E252E] h-1.5 rounded-full overflow-hidden">
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
                <span className="text-[11px] text-zinc-400 font-mono block mb-1">Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* WAITING CARD */
          <div className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-8 sm:p-10 shadow-lg text-center space-y-6 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Waiting for Setup
              </h2>
              <p className="text-sm text-zinc-400">
                Market is being monitored automatically for high-confluence setups.
              </p>
            </div>

            {/* Empty Placeholders Row */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4 border-t border-[#1E252E] font-mono text-xs">
              <div className="p-2 rounded-lg bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px]">Entry</span>
                <span className="text-zinc-400 font-bold">—</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px]">SL</span>
                <span className="text-zinc-400 font-bold">—</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px]">TP1</span>
                <span className="text-zinc-400 font-bold">—</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px]">TP2</span>
                <span className="text-zinc-400 font-bold">—</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px]">R:R</span>
                <span className="text-zinc-400 font-bold">—</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B0D10] border border-[#1E252E]">
                <span className="text-zinc-500 block text-[10px]">Confidence</span>
                <span className="text-zinc-400 font-bold">—</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. SIGNAL HISTORY COMPACT LIST */}
        <section className="bg-[#12161C] border border-[#1E252E] rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E252E] pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              Signal History
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              Recorded Live Signals
            </span>
          </div>

          {liveData.history && liveData.history.length > 0 ? (
            <div className="divide-y divide-[#1E252E]">
              {liveData.history.map((rec, idx) => (
                <div key={rec.setupId || idx} className="py-2.5 flex items-center justify-between font-mono text-xs hover:bg-[#1E252E]/30 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">{rec.timeFormatted}</span>
                    {rec.direction === 'BUY' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        🟢 BUY
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        🔴 SELL
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {rec.result === 'TP1 HIT' || rec.result === 'TP2 HIT' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {rec.result}
                      </span>
                    ) : rec.result === 'SL HIT' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        SL HIT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        EXPIRED
                      </span>
                    )}

                    <span className={`w-12 text-right font-bold ${
                      rec.rMultiple.startsWith('+') ? 'text-emerald-400' : rec.rMultiple.startsWith('-') ? 'text-rose-400' : 'text-zinc-500'
                    }`}>
                      {rec.rMultiple}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-zinc-500 font-mono">
              No historical trades recorded in current session.
            </div>
          )}
        </section>

      </div>

      {/* 5. FOOTER STRIP */}
      <footer className="max-w-4xl mx-auto w-full mt-6 bg-[#12161C] border border-[#1E252E] rounded-xl px-4 py-3 text-xs font-mono text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Auto Monitoring: <strong className="text-emerald-400">ACTIVE</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span>Telegram:</span>
          {isTelegramConnected ? (
            <strong className="text-emerald-400">CONNECTED</strong>
          ) : (
            <strong className="text-amber-400">DISCONNECTED</strong>
          )}
        </div>

        <div>
          <span>Data: <strong className="text-zinc-200">Live MT5 Feed</strong></span>
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
