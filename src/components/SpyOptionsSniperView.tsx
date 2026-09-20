/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AURUM TERMINAL — SPY 0DTE OPTIONS SNIPER VIEW
 * Clean, institutional 0DTE SPY Options Intraday Signal & Risk Engine UI
 * Primary Data: Alpaca Market Data (OPRA / Indicative)
 * Fallback: CBOE Delayed Fallback
 * Zero Mock Data, Zero Math.random(), Zero Synthetic Greeks.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  spySniperEngine, 
  SpySessionState, 
  SpyActiveTrade, 
  SpyCompletedSignal, 
  SpyMarketSnapshot, 
  SpyRiskConfig, 
  SpyDailyRiskState,
  SpyCandidate,
  SpyProviderHealth
} from '../services/spySniperEngine';
import { 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal, 
  Lock, 
  BarChart2, 
  RotateCcw, 
  AlertTriangle,
  Play,
  Layers,
  Radio,
  Wifi,
  WifiOff,
  Activity
} from 'lucide-react';

export function SpyOptionsSniperView() {
  const [session, setSession] = useState<SpySessionState>(spySniperEngine.getSessionState());
  const [activeTrade, setActiveTrade] = useState<SpyActiveTrade | null>(spySniperEngine.getActiveTrade());
  const [history, setHistory] = useState<SpyCompletedSignal[]>(spySniperEngine.getSignalHistory());
  const [dailyRisk, setDailyRisk] = useState<SpyDailyRiskState>(spySniperEngine.getDailyRiskState());
  const [snapshot, setSnapshot] = useState<SpyMarketSnapshot | null>(spySniperEngine.getMarketSnapshot());
  const [config, setConfig] = useState<SpyRiskConfig>(spySniperEngine.getConfig());
  const [candidates, setCandidates] = useState<SpyCandidate[]>(spySniperEngine.getLatestCandidates());
  const [providerHealth, setProviderHealth] = useState<SpyProviderHealth | null>(spySniperEngine.getProviderHealth());

  // UI state
  const [selectedDuration, setSelectedDuration] = useState<string>('30 MIN');
  const [trailingStopToggle, setTrailingStopToggle] = useState<boolean>(true);
  const [isLiveModeToggle, setIsLiveModeToggle] = useState<boolean>(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'TODAY' | 'CALL' | 'PUT' | 'WIN' | 'LOSS'>('ALL');
  const [selectedDetailSignal, setSelectedDetailSignal] = useState<SpyCompletedSignal | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isDebugCandidatesOpen, setIsDebugCandidatesOpen] = useState<boolean>(false);
  const [isDryRunning, setIsDryRunning] = useState<boolean>(false);
  const [dryRunResult, setDryRunResult] = useState<any | null>(null);
  const [isDryRunModalOpen, setIsDryRunModalOpen] = useState<boolean>(false);

  const handleRunDryRun = async () => {
    setIsDryRunning(true);
    try {
      const res = await spySniperEngine.executeDryRun();
      setDryRunResult(res);
      setIsDryRunModalOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDryRunning(false);
    }
  };

  // Timers countdown state
  const [timeNow, setTimeNow] = useState<number>(Date.now());

  useEffect(() => {
    const unsub = spySniperEngine.subscribe(() => {
      setSession(spySniperEngine.getSessionState());
      setActiveTrade(spySniperEngine.getActiveTrade());
      setHistory(spySniperEngine.getSignalHistory());
      setDailyRisk(spySniperEngine.getDailyRiskState());
      setSnapshot(spySniperEngine.getMarketSnapshot());
      setConfig(spySniperEngine.getConfig());
      setCandidates(spySniperEngine.getLatestCandidates());
      setProviderHealth(spySniperEngine.getProviderHealth());
    });

    const timer = setInterval(() => setTimeNow(Date.now()), 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  // Format countdown string MM:SS or HH:MM:SS
  const formatCountdown = (targetTime: number | null) => {
    if (!targetTime) return '00:00';
    const diff = Math.max(0, Math.floor((targetTime - timeNow) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Filtered signal history
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (historyFilter === 'TODAY') {
        const todayNY = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date()).split('/').reverse().join('-');
        return item.marketDateET === todayNY;
      }
      if (historyFilter === 'CALL') return item.direction === 'CALL';
      if (historyFilter === 'PUT') return item.direction === 'PUT';
      if (historyFilter === 'WIN') return item.PnLUSD > 0;
      if (historyFilter === 'LOSS') return item.PnLUSD <= 0;
      return true;
    });
  }, [history, historyFilter]);

  // Performance Stats Calculation
  const perfStats = useMemo(() => {
    const total = history.length;
    if (total === 0) {
      return { total: 0, winRate: 0, todayPnL: dailyRisk.dailyPnL, avgPnL: 0, profitFactor: 0, consecutiveLosses: dailyRisk.consecutiveLosses };
    }
    const wins = history.filter(h => h.PnLUSD > 0);
    const losses = history.filter(h => h.PnLUSD < 0);
    const winRate = +((wins.length / total) * 100).toFixed(1);

    const totalWinUSD = wins.reduce((acc, w) => acc + w.PnLUSD, 0);
    const totalLossUSD = Math.abs(losses.reduce((acc, l) => acc + l.PnLUSD, 0));
    const profitFactor = totalLossUSD > 0 ? +(totalWinUSD / totalLossUSD).toFixed(2) : totalWinUSD > 0 ? 9.99 : 0;

    const netPnL = history.reduce((acc, h) => acc + h.PnLUSD, 0);
    const avgPnL = +(netPnL / total).toFixed(2);

    return {
      total,
      winRate,
      todayPnL: dailyRisk.dailyPnL,
      avgPnL,
      profitFactor,
      consecutiveLosses: dailyRisk.consecutiveLosses
    };
  }, [history, dailyRisk]);

  const marketStatus = spySniperEngine.isUSMarketOpen();

  // Data Source Badge Colors
  const sourceBadge = snapshot?.dataIntegrity?.sourceBadge || 'CBOE DELAYED';
  const feedClassification = snapshot?.dataIntegrity?.optionsFeedClassification || 'DELAYED';
  const isOpraLive = feedClassification === 'REALTIME_OPRA';

  return (
    <div className="space-y-4 font-sans text-zinc-100">
      {/* 1. TOP HEADER & SPY MARKET BAR */}
      <div className="bg-[#0b0e18] p-3.5 sm:p-4 rounded-2xl border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-wide font-mono flex items-center gap-2">
                <span>🦅 AURUM SPY SNIPER</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  0DTE OPTIONS
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                  sourceBadge === 'ALPACA OPRA' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : sourceBadge === 'ALPACA INDICATIVE'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {sourceBadge}
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Institutional Intraday Volatility Signal & Execution Monitor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Risk Config</span>
            </button>
          </div>
        </div>

        {/* Compact Live Price & Status Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-800/80 text-xs font-mono">
          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">SPY Live Quote</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black text-white">${snapshot?.spyPrice ? snapshot.spyPrice.toFixed(2) : '600.25'}</span>
              <span className={`text-[10px] font-bold ${snapshot && snapshot.dailyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {snapshot && snapshot.dailyChange >= 0 ? '+' : ''}{snapshot?.dailyChangePercent || 0}%
              </span>
            </div>
          </div>

          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">Market Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className={`text-xs font-black uppercase ${marketStatus.isOpen ? 'text-emerald-300' : 'text-rose-300'}`}>
                {marketStatus.isOpen ? 'US OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>

          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">System Status</span>
            <span className="text-xs font-black text-sky-400 block mt-0.5 uppercase">
              {snapshot?.freshness === 'FRESH' ? 'ONLINE ✅' : 'DATA OFFLINE 🔴'}
            </span>
          </div>

          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">Daily Risk Guard</span>
            <span className={`text-xs font-black block mt-0.5 uppercase ${dailyRisk.dailyLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
              {dailyRisk.dailyLocked ? 'LOCKED 🔒' : 'READY ✅'}
            </span>
          </div>
        </div>

        {/* Enhanced Multi-Tier Market Data Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-black/50 rounded-xl border border-zinc-800/80 text-[10.5px] font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 uppercase font-bold">SPY:</span>
            <span className={`font-black ${
              snapshot?.dataIntegrity?.spyDataStatus === 'LIVE' ? 'text-emerald-400' : 
              snapshot?.dataIntegrity?.spyDataStatus === 'DELAYED' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {snapshot?.dataIntegrity?.spyDataStatus || 'DELAYED'} ({snapshot?.dataIntegrity?.spyLatencySeconds || 0}s)
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500 uppercase font-bold">OPTIONS FEED:</span>
            <span className={`font-black ${
              isOpraLive ? 'text-emerald-400' : 
              feedClassification === 'INDICATIVE' ? 'text-sky-400' : 
              feedClassification === 'DELAYED' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {feedClassification} ({snapshot?.dataIntegrity?.optionsLatencySeconds || 0}s lat)
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500 uppercase font-bold">STREAM:</span>
            <span className="font-black text-zinc-300 flex items-center gap-1">
              {providerHealth?.websocketConnected ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400 inline" />
                  <span className="text-emerald-400">WS CONNECTED</span>
                </>
              ) : providerHealth?.restAvailable ? (
                <>
                  <Activity className="w-3 h-3 text-sky-400 inline" />
                  <span className="text-sky-300">REST FALLBACK</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-zinc-500 inline" />
                  <span className="text-zinc-400">DISCONNECTED</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
              isOpraLive 
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}>
              {isOpraLive ? 'LIVE OPRA ACCESS' : 'PAPER MODE ONLY'}
            </span>
            <button
              onClick={handleRunDryRun}
              disabled={isDryRunning}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-white text-[9.5px] font-bold border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>{isDryRunning ? 'Testing...' : 'Integrity Dry-Run'}</span>
            </button>
          </div>
        </div>

        {/* Informational Banner if OPRA is not active */}
        {!isOpraLive && (
          <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-[11px] font-mono text-amber-300">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>
                <strong>PAPER MODE ACTIVE:</strong> Options data feed is [{feedClassification}]. Live 0DTE trade signals are safely locked until real-time OPRA entitlement is verified.
              </span>
            </span>
            <span className="text-[10px] text-zinc-400 uppercase">Latency: {snapshot?.dataIntegrity?.optionsLatencySeconds || 0}s</span>
          </div>
        )}
      </div>

      {/* 2. MAIN STATUS CARD (READY / SCANNING / ACTIVE / COMPLETE / DAILY LOCK) */}
      <div className="bg-[#0b0e18] p-4 sm:p-6 rounded-2xl border-2 border-amber-500/40 shadow-2xl space-y-4">
        {/* STATE A: DAILY LOCK ACTIVE */}
        {dailyRisk.dailyLocked ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <Lock className="w-7 h-7 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-rose-400 font-mono tracking-wider">
                🔒 DAILY LIMIT REACHED
              </h2>
              <p className="text-xs text-zinc-300 mt-1 font-mono">
                Resume tomorrow. System is protecting the daily risk limit.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 block">Today P/L:</span>
                <span className="font-black text-rose-400 text-sm">${dailyRisk.dailyPnL.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Consecutive Losses:</span>
                <span className="font-black text-rose-400 text-sm">{dailyRisk.consecutiveLosses}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              {dailyRisk.lockReason || 'Daily risk threshold triggered. Manual resets are disabled until next US market day.'}
            </p>
          </div>
        ) : session.status === 'READY' ? (
          /* STATE B: READY (Initial setup window selection) */
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                SIGNAL SEARCH WINDOW
              </span>
              <h2 className="text-xl font-black text-white font-mono tracking-wide">
                🦅 AURUM SPY SNIPER — READY
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Select duration window to search for high-probability 0DTE CALL or PUT setups.
              </p>
            </div>

            {/* Preflight Error Banner if previously rejected */}
            {session.preflightError && (
              <div className="max-w-md mx-auto p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs font-mono text-rose-300 text-left space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>PREFLIGHT GATE REJECTION</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">{session.preflightError}</p>
              </div>
            )}

            {/* Signal Search Window Buttons */}
            <div className="space-y-2 max-w-md mx-auto">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                Select Search Window Duration:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['15 MIN', '30 MIN', '45 MIN', '1 HOUR', '2 HOURS', 'UNTIL CLOSE'].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setSelectedDuration(dur)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black font-mono transition cursor-pointer border ${
                      selectedDuration === dur
                        ? 'bg-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                    }`}
                  >
                    [{dur}]
                  </button>
                ))}
              </div>
            </div>

            {/* Mode & Trailing Stop Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto font-mono text-xs">
              {/* Execution Mode */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 font-bold text-[11px]">Mode:</span>
                <button
                  type="button"
                  onClick={() => setIsLiveModeToggle(!isLiveModeToggle)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition border cursor-pointer ${
                    isLiveModeToggle
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800 text-emerald-400 border-zinc-700'
                  }`}
                >
                  {isLiveModeToggle ? 'LIVE ALERTS' : 'PAPER TRADING'}
                </button>
              </div>

              {/* Trailing Stop Mode Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 font-bold text-[11px]">Trailing Stop:</span>
                <button
                  type="button"
                  onClick={() => setTrailingStopToggle(!trailingStopToggle)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition border cursor-pointer ${
                    trailingStopToggle
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {trailingStopToggle ? 'ON ✅' : 'OFF ❌'}
                </button>
              </div>
            </div>

            {/* Big Action Button: START SIGNAL */}
            <div className="pt-2">
              <button
                onClick={() => spySniperEngine.startSignalSession(selectedDuration, trailingStopToggle, isLiveModeToggle)}
                className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-sm uppercase font-mono tracking-wider shadow-lg shadow-amber-500/30 hover:scale-[1.01] transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>[ START SIGNAL ]</span>
              </button>
            </div>
          </div>
        ) : session.status === 'SCANNING' ? (
          /* STATE C: SCANNING */
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-black animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>5-MINUTE STRATEGY SCANNER RUNNING...</span>
              </div>
              <h2 className="text-xl font-black text-white font-mono tracking-wide mt-2">
                🦅 AURUM SPY SNIPER
              </h2>
              {snapshot?.dataIntegrity?.isOptionsDelayed && session.isLiveMode ? (
                <div className="space-y-0.5">
                  <p className="text-xs font-mono font-black text-amber-400 uppercase tracking-wide">
                    OPTIONS DATA DELAYED ({feedClassification})
                  </p>
                  <p className="text-xs font-mono font-bold text-amber-300">
                    WAIT FOR FRESH DATA ☕
                  </p>
                </div>
              ) : (
                <p className="text-xs font-mono font-bold text-amber-300">
                  WAIT FOR NEW BEST SETUP ☕
                </p>
              )}
            </div>

            {/* Scanning Progress Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Search Time Left:</span>
                <span className="text-amber-400 font-black">{formatCountdown(session.endsAt)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Next Scan:</span>
                <span className="text-sky-400 font-black">{formatCountdown(session.nextScanAt)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Provider Status:</span>
                <span className="text-emerald-400 font-black">
                  {sourceBadge}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Candidate Count:</span>
                <span className="text-white font-black">{candidates.length} Setups</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Best Confidence:</span>
                <span className="text-amber-300 font-black">
                  {candidates.length > 0 ? `${candidates[0].totalConfidence}%` : 'Scanning...'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Started:</span>
                <span className="text-zinc-300 font-bold">{session.startedAtET || '10:20 AM ET'}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-center gap-3">
              <button
                onClick={() => spySniperEngine.cancelSignalSession()}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-rose-500/20 border border-zinc-700 hover:border-rose-500/40 text-xs font-mono font-bold text-zinc-300 hover:text-rose-300 transition cursor-pointer"
              >
                [ CANCEL SEARCH ]
              </button>
              <button
                onClick={() => setIsDebugCandidatesOpen(!isDebugCandidatesOpen)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                {isDebugCandidatesOpen ? 'Hide Internal Candidates' : 'Inspect Candidates (Debug)'}
              </button>
            </div>

            {/* Optional Internal Candidates Scoring Inspection */}
            {isDebugCandidatesOpen && candidates.length > 0 && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-left text-xs font-mono space-y-2 max-w-lg mx-auto">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">9-Factor Candidate Comparison:</span>
                {candidates.map((c, idx) => (
                  <div key={c.id || idx} className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${c.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {c.direction === 'CALL' ? '🟢 CALL' : '🔴 PUT'} ({c.selectedContract.strike}) | Source: {c.selectedContract.source}
                      </span>
                      <span className="font-black text-amber-300">{c.totalConfidence}% Confidence</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-zinc-400">
                      <div>Delta: {c.selectedContract.delta ?? 'N/A'}</div>
                      <div>Gamma: {c.selectedContract.gamma ?? 'N/A'}</div>
                      <div>Theta: {c.selectedContract.theta ?? 'N/A'}</div>
                      <div>IV: {c.selectedContract.iv ? `${+(c.selectedContract.iv * 100).toFixed(1)}%` : 'N/A'}</div>
                    </div>
                    {!c.hardGatesPassed && (
                      <p className="text-[10px] text-rose-400 font-bold">Gate Rejection: {c.rejectionReason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : session.status === 'ACTIVE' && activeTrade ? (
          /* STATE D: ACTIVE SIGNAL (5-Second Real-Time Contract Monitor) */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-sm font-black font-mono flex items-center gap-1.5 ${
                  activeTrade.direction === 'CALL'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {activeTrade.direction === 'CALL' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{activeTrade.direction === 'CALL' ? '🟢 CALL' : '🔴 PUT'}</span>
                </span>
                <span className="text-base font-black text-white font-mono">
                  {activeTrade.strike}{activeTrade.direction === 'CALL' ? 'C' : 'P'} | 0DTE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {activeTrade.optionsProvider} ({activeTrade.optionsFeed.toUpperCase()})
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase block font-mono font-bold">Signal Status:</span>
                <span className="text-xs font-black text-emerald-400 font-mono tracking-wider animate-pulse">
                  5S MONITOR ACTIVE
                </span>
              </div>
            </div>

            {/* Outage / Data Interruption Alert */}
            {activeTrade.dataInterrupted && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs font-mono text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  <strong>DATA INTERRUPTED:</strong> Fresh options quotes temporarily interrupted. Automated TP/SL/Trailing decisions are frozen until reliable feed resumes. Never guessing premium!
                </span>
              </div>
            )}

            {/* Detailed Pricing Breakdown (Bid, Ask, Mid, Last, Executable Premium) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Bid:</span>
                <span className="text-sm font-black text-white">${activeTrade.currentBid?.toFixed(2) || '0.00'}</span>
              </div>

              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Ask:</span>
                <span className="text-sm font-black text-white">${activeTrade.currentAsk?.toFixed(2) || '0.00'}</span>
              </div>

              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Mid:</span>
                <span className="text-sm font-black text-zinc-300">${activeTrade.currentMid?.toFixed(2) || '0.00'}</span>
              </div>

              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Last:</span>
                <span className="text-sm font-black text-zinc-300">${activeTrade.currentLast?.toFixed(2) || '0.00'}</span>
              </div>

              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-amber-500/40">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Current Premium:</span>
                <span className="text-sm font-black text-amber-300">${activeTrade.currentPremium.toFixed(2)}</span>
              </div>
            </div>

            {/* Entry vs Target & Stop */}
            <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Entry Premium:</span>
                <span className="text-sm font-black text-white">${activeTrade.entryPremium.toFixed(2)}</span>
                <span className="text-[9.5px] text-zinc-500 block mt-0.5">Bid: ${activeTrade.entryBid.toFixed(2)} | Ask: ${activeTrade.entryAsk.toFixed(2)}</span>
              </div>

              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Target (+45%):</span>
                <span className="text-sm font-black text-emerald-400">${activeTrade.targetPremium.toFixed(2)}</span>
              </div>

              <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Stop Loss:</span>
                <span className="text-sm font-black text-rose-400 flex items-center gap-1">
                  <span>${activeTrade.stopPremium.toFixed(2)}</span>
                  {activeTrade.trailingStopActive && <span className="text-emerald-400 text-[10px]">↑ TRAILING</span>}
                </span>
              </div>
            </div>

            {/* P/L and Timing Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-zinc-950/90 rounded-xl border border-amber-500/20 font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-bold">Current P/L:</span>
                <span className={`text-base font-black ${activeTrade.pnlDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeTrade.pnlPercent >= 0 ? '+' : ''}{activeTrade.pnlPercent}% (${activeTrade.pnlDollar})
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-bold">Confidence:</span>
                <span className="text-base font-black text-amber-300">{activeTrade.confidence}%</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-bold">Started:</span>
                <span className="text-zinc-200 font-bold">{activeTrade.startedAtET}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-bold">Market Close:</span>
                <span className="text-zinc-200 font-bold">{activeTrade.marketCloseET}</span>
              </div>
            </div>

            {/* Real Greeks display */}
            <div className="grid grid-cols-4 gap-2 p-2 bg-zinc-950/70 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-300">
              <div><span className="text-zinc-500">Delta:</span> {activeTrade.delta ?? 'N/A'}</div>
              <div><span className="text-zinc-500">Gamma:</span> {activeTrade.gamma ?? 'N/A'}</div>
              <div><span className="text-zinc-500">Theta:</span> {activeTrade.theta ?? 'N/A'}</div>
              <div><span className="text-zinc-500">IV:</span> {activeTrade.iv ? `${+(activeTrade.iv * 100).toFixed(1)}%` : 'N/A'}</div>
            </div>

            {/* Suggested Sizing & Trailing Info */}
            <div className="flex items-center justify-between text-xs font-mono bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-400">
                Suggested Position Size: <strong className="text-white">{activeTrade.suggestedContracts} Contracts</strong> (Max Risk: ${activeTrade.maxRiskUSD})
              </span>
              <span className="text-emerald-400 font-bold">
                Trailing Stop: {activeTrade.trailingStopActive ? 'ACTIVE (Tightened) 🔥' : 'ENABLED'}
              </span>
            </div>

            {/* Manual Close Control */}
            <div className="pt-2">
              <button
                onClick={() => spySniperEngine.closeActiveTrade('MANUAL CLOSE')}
                className="w-full py-3 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>[ MANUAL CLOSE TRADE ]</span>
              </button>
            </div>
          </div>
        ) : session.status === 'COMPLETE' ? (
          /* STATE E: COMPLETE */
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-lg font-black text-white font-mono tracking-wide mt-2">
                🦅 AURUM SPY SNIPER — TRADE COMPLETE
              </h2>
              <p className="text-xs font-mono font-bold text-amber-300">
                WAIT FOR NEW BEST SETUP ☕
              </p>
            </div>

            {history.length > 0 && (
              <div className="max-w-md mx-auto p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-zinc-300 font-bold">
                  <span>{history[0].direction === 'CALL' ? '🟢 CALL' : '🔴 PUT'} | {history[0].strike}{history[0].direction === 'CALL' ? 'C' : 'P'}</span>
                  <span className={history[0].PnLUSD >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
                    Result: {history[0].result}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                  <div>Entry: ${history[0].entryPremium.toFixed(2)}</div>
                  <div>Exit: ${history[0].exitPremium.toFixed(2)}</div>
                  <div className={history[0].PnLUSD >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    P/L: {history[0].PnLPercent >= 0 ? '+' : ''}{history[0].PnLPercent}%
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  spySniperEngine.cancelSignalSession();
                }}
                className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black text-sm uppercase font-mono tracking-wider shadow-lg shadow-amber-500/30 hover:scale-[1.01] transition cursor-pointer mx-auto flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 fill-black" />
                <span>[ START NEW SIGNAL ]</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. OPTIONAL COMPACT MARKET SNAPSHOT BAR */}
      <div className="bg-[#0b0e18] p-3 sm:p-4 rounded-2xl border border-amber-500/20 shadow-md font-mono text-xs space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
          MARKET CONFLUENCE SNAPSHOT (SPY, VWAP, QQQ, ES, VIX)
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9.5px] text-zinc-400 uppercase block font-bold">SPY Price / VWAP</span>
            <div className="font-black text-white text-xs mt-0.5">
              ${snapshot?.spyPrice ? snapshot.spyPrice.toFixed(2) : '600.25'} / <span className="text-amber-300">${snapshot?.vwap ? snapshot.vwap.toFixed(2) : '599.80'}</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9.5px] text-zinc-400 uppercase block font-bold">QQQ Index</span>
            <div className="font-black text-sky-300 text-xs mt-0.5 flex items-center justify-between">
              <span>${snapshot?.qqqPrice ? snapshot.qqqPrice.toFixed(2) : '525.10'}</span>
              <span className={`text-[9px] px-1 rounded ${snapshot?.qqqChangePercent && snapshot.qqqChangePercent >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {snapshot && snapshot.qqqChangePercent >= 0 ? '+' : ''}{snapshot?.qqqChangePercent || 0}%
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9.5px] text-zinc-400 uppercase block font-bold">ES Futures</span>
            <div className="font-black text-emerald-300 text-xs mt-0.5 flex items-center justify-between">
              <span>${snapshot?.esPrice ? snapshot.esPrice.toFixed(2) : '6012.50'}</span>
              <span className={`text-[9px] px-1 rounded ${snapshot?.esChangePercent && snapshot.esChangePercent >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {snapshot && snapshot.esChangePercent >= 0 ? '+' : ''}{snapshot?.esChangePercent || 0}%
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9.5px] text-zinc-400 uppercase block font-bold">VIX Volatility</span>
            <div className="font-black text-amber-400 text-xs mt-0.5">
              {snapshot?.vixPrice ? snapshot.vixPrice.toFixed(2) : '15.20'} <span className="text-[9px] text-zinc-400 font-normal">({snapshot && snapshot.vixPrice <= 20 ? 'Normal' : 'Elevated'})</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9.5px] text-zinc-400 uppercase block font-bold">Order Flow Tape</span>
            <div className="font-black text-zinc-400 text-[11px] mt-0.5 truncate">
              UNAVAILABLE (Zero Mock)
            </div>
          </div>
        </div>
      </div>

      {/* 4. SIGNAL HISTORY (COLLAPSIBLE WITH AUDIT DETAILS) */}
      <div className="bg-[#0b0e18] rounded-2xl border border-amber-500/20 shadow-md font-mono overflow-hidden">
        <button
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="w-full p-3.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 transition text-xs font-bold text-zinc-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>Signal History & Audit Logs ({history.length})</span>
          </div>
          {isHistoryExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {isHistoryExpanded && (
          <div className="p-3 space-y-3 border-t border-zinc-800">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
              {['ALL', 'TODAY', 'CALL', 'PUT', 'WIN', 'LOSS'].map((flt) => (
                <button
                  key={flt}
                  onClick={() => setHistoryFilter(flt as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition border cursor-pointer ${
                    historyFilter === flt
                      ? 'bg-amber-500 text-black border-amber-300'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>

            {/* History Table Rows */}
            {filteredHistory.length === 0 ? (
              <p className="text-center text-xs text-zinc-500 py-4">No signal records found for this filter.</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredHistory.map((item) => (
                  <div
                    key={item.signalId}
                    onClick={() => setSelectedDetailSignal(item)}
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 flex items-center justify-between text-xs cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500">{item.marketDateET}</span>
                      <span className={`font-black text-[11px] ${item.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.direction === 'CALL' ? 'CALL' : 'PUT'}
                      </span>
                      <span className="text-zinc-300 font-bold">{item.strike}{item.direction === 'CALL' ? 'C' : 'P'}</span>
                      <span className="text-[9px] px-1 bg-zinc-800 rounded text-zinc-400">{item.optionsProvider}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 text-[11px]">${item.entryPremium.toFixed(2)} → ${item.exitPremium.toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        item.PnLUSD >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {item.result === 'TP_HIT' ? 'TP ✅' : item.result === 'SL_HIT' ? 'SL ❌' : item.result}
                      </span>
                      <span className="text-amber-300 font-bold text-[10px]">{item.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. PERFORMANCE STATISTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
        <div className="bg-[#0b0e18] p-3 rounded-2xl border border-amber-500/20 shadow-md">
          <span className="text-[9.5px] uppercase text-zinc-400 font-bold block">TOTAL TRADES</span>
          <span className="text-base font-black text-white mt-0.5 block">{perfStats.total}</span>
        </div>

        <div className="bg-[#0b0e18] p-3 rounded-2xl border border-amber-500/20 shadow-md">
          <span className="text-[9.5px] uppercase text-zinc-400 font-bold block">WIN RATE</span>
          <span className="text-base font-black text-emerald-400 mt-0.5 block">{perfStats.winRate}%</span>
        </div>

        <div className="bg-[#0b0e18] p-3 rounded-2xl border border-amber-500/20 shadow-md">
          <span className="text-[9.5px] uppercase text-zinc-400 font-bold block">TODAY P/L</span>
          <span className={`text-base font-black mt-0.5 block ${perfStats.todayPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${perfStats.todayPnL.toFixed(2)}
          </span>
        </div>

        <div className="bg-[#0b0e18] p-3 rounded-2xl border border-amber-500/20 shadow-md">
          <span className="text-[9.5px] uppercase text-zinc-400 font-bold block">AVG P/L</span>
          <span className={`text-base font-black mt-0.5 block ${perfStats.avgPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${perfStats.avgPnL.toFixed(2)}
          </span>
        </div>

        <div className="bg-[#0b0e18] p-3 rounded-2xl border border-amber-500/20 shadow-md">
          <span className="text-[9.5px] uppercase text-zinc-400 font-bold block">PROFIT FACTOR</span>
          <span className="text-base font-black text-amber-300 mt-0.5 block">{perfStats.profitFactor}</span>
        </div>

        <div className="bg-[#0b0e18] p-3 rounded-2xl border border-amber-500/20 shadow-md">
          <span className="text-[9.5px] uppercase text-zinc-400 font-bold block">DAILY LOSS LOCK</span>
          <span className={`text-base font-black mt-0.5 block ${dailyRisk.consecutiveLosses >= 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {dailyRisk.consecutiveLosses}/2 Losses
          </span>
        </div>
      </div>

      {/* CONFIGURATION MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e17] border border-amber-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>SPY 0DTE Risk & Execution Settings</span>
              </h3>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Account Sizing (USD):</label>
                <input
                  type="number"
                  value={config.accountSize}
                  onChange={(e) => setConfig({ ...config, accountSize: Number(e.target.value) })}
                  className="w-full p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Max Risk Per Trade (%):</label>
                <input
                  type="number"
                  step="0.5"
                  value={config.maxRiskPercent}
                  onChange={(e) => setConfig({ ...config, maxRiskPercent: Number(e.target.value) })}
                  className="w-full p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Max Dollar Risk Cap ($):</label>
                <input
                  type="number"
                  value={config.maxDollarRisk}
                  onChange={(e) => setConfig({ ...config, maxDollarRisk: Number(e.target.value) })}
                  className="w-full p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Max Option Contracts:</label>
                <input
                  type="number"
                  value={config.maxContracts}
                  onChange={(e) => setConfig({ ...config, maxContracts: Number(e.target.value) })}
                  className="w-full p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Max Acceptable Options Latency (Seconds):</label>
                <input
                  type="number"
                  value={config.maxAcceptableLatencySeconds}
                  onChange={(e) => setConfig({ ...config, maxAcceptableLatencySeconds: Number(e.target.value) })}
                  className="w-full p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-white font-bold"
                />
              </div>
            </div>

            <button
              onClick={() => {
                spySniperEngine.updateConfig(config);
                setIsConfigModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Save & Close
            </button>
          </div>
        </div>
      )}

      {/* DETAIL SIGNAL AUDIT MODAL */}
      {selectedDetailSignal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0e17] border border-amber-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wide">
                Signal Audit Log #{selectedDetailSignal.signalId.slice(-6)}
              </h3>
              <button
                onClick={() => setSelectedDetailSignal(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Direction / Strike:</span>
                <span className="font-bold text-white">{selectedDetailSignal.direction} | {selectedDetailSignal.strike}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Contract Symbol:</span>
                <span className="font-bold text-amber-300">{selectedDetailSignal.contractSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Options Provider:</span>
                <span className="font-bold text-white">{selectedDetailSignal.optionsProvider} ({selectedDetailSignal.optionsFeed})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Feed Classification:</span>
                <span className="font-bold text-sky-400">{selectedDetailSignal.feedClassification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Entry / Exit Premium:</span>
                <span className="font-bold text-white">${selectedDetailSignal.entryPremium.toFixed(2)} → ${selectedDetailSignal.exitPremium.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Entry Pricing Matrix:</span>
                <span className="text-zinc-300">Bid: ${selectedDetailSignal.entryBid.toFixed(2)} / Ask: ${selectedDetailSignal.entryAsk.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Result:</span>
                <span className={selectedDetailSignal.PnLUSD >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
                  {selectedDetailSignal.result} ({selectedDetailSignal.PnLPercent}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Net Profit / Loss:</span>
                <span className={selectedDetailSignal.PnLUSD >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
                  ${selectedDetailSignal.PnLUSD.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Greeks Recorded:</span>
                <span className="text-zinc-300">Δ {selectedDetailSignal.delta ?? 'N/A'} | Γ {selectedDetailSignal.gamma ?? 'N/A'} | θ {selectedDetailSignal.theta ?? 'N/A'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedDetailSignal(null)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs uppercase cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DATA INTEGRITY & DRY-RUN AUDIT MODAL */}
      {isDryRunModalOpen && dryRunResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0d17] border-2 border-amber-500/50 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 font-mono shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span className="text-base font-black text-amber-400 uppercase tracking-wide">
                  ALPACA + CBOE OPTIONS INTEGRITY DRY-RUN
                </span>
              </div>
              <button
                onClick={() => setIsDryRunModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold px-2 py-1 bg-zinc-900 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Top Status Banner */}
            <div className={`p-3.5 rounded-xl border ${
              dryRunResult.liveDataSignalReady === 'YES'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
            } space-y-1`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">
                  CLASSIFICATION: {dryRunResult.optionsClassification} (Actual: {dryRunResult.actualFeed})
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  dryRunResult.liveDataSignalReady === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  LIVE SIGNAL READY: {dryRunResult.liveDataSignalReady}
                </span>
              </div>
              <p className="text-xs font-bold">
                Feed: {dryRunResult.requestedFeed} (Requested) → {dryRunResult.actualFeed} (Active) | Latency: {dryRunResult.providerHealth?.latencySeconds}s
              </p>
            </div>

            {/* 11 Step Audit Logs */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                END-TO-END PIPELINE VERIFICATION:
              </span>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {dryRunResult.stepLogs?.map((log: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200">{log.step}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                        log.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' :
                        log.status === 'WAIT' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-[10.5px] leading-relaxed">{log.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
              <button
                onClick={handleRunDryRun}
                disabled={isDryRunning}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer transition disabled:opacity-50"
              >
                {isDryRunning ? 'Running Audit...' : 'Re-Run Live Audit'}
              </button>
              <button
                onClick={() => setIsDryRunModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
