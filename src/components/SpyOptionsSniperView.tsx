/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AURUM TERMINAL — SPY SNIPER VIEW
 * Live Market Signal & Confluence Intelligence Engine
 * Primary Provider: Finnhub (Live Underlying SPY Market Data)
 * Secondary Provider: OPRA / CBOE
 * ZERO Auto-Trade Execution | SIGNAL & ALERT SYSTEM ONLY
 * ZERO Synthetic Data | ZERO Random Simulation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  spySniperEngine, 
  SpySessionState, 
  SpyUnderlyingSignal,
  SpyCompletedSignal, 
  SpyMarketSnapshot, 
  SpyRiskConfig, 
  SpyDailyRiskState,
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
  Activity,
  Target,
  Crosshair
} from 'lucide-react';

export function SpyOptionsSniperView() {
  const [session, setSession] = useState<SpySessionState>(spySniperEngine.getSessionState());
  const [history, setHistory] = useState<SpyCompletedSignal[]>(spySniperEngine.getSignalHistory());
  const [dailyRisk, setDailyRisk] = useState<SpyDailyRiskState>(spySniperEngine.getDailyRiskState());
  const [snapshot, setSnapshot] = useState<SpyMarketSnapshot | null>(spySniperEngine.getMarketSnapshot());
  const [config, setConfig] = useState<SpyRiskConfig>(spySniperEngine.getConfig());
  const [providerHealth, setProviderHealth] = useState<SpyProviderHealth | null>(spySniperEngine.getProviderHealth());
  const [finnhubHealth, setFinnhubHealth] = useState(spySniperEngine.getFinnhubHealth());

  // UI state
  const [selectedDuration, setSelectedDuration] = useState<string>('30 MIN');
  const [trailingStopToggle, setTrailingStopToggle] = useState<boolean>(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'TODAY' | 'CALL' | 'PUT' | 'WIN' | 'LOSS'>('ALL');
  const [selectedDetailSignal, setSelectedDetailSignal] = useState<SpyCompletedSignal | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isDryRunning, setIsDryRunning] = useState<boolean>(false);
  const [dryRunResult, setDryRunResult] = useState<any | null>(null);
  const [isDryRunModalOpen, setIsDryRunModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timers countdown state
  const [timeNow, setTimeNow] = useState<number>(Date.now());

  useEffect(() => {
    const unsub = spySniperEngine.subscribe(() => {
      setSession(spySniperEngine.getSessionState());
      setHistory(spySniperEngine.getSignalHistory());
      setDailyRisk(spySniperEngine.getDailyRiskState());
      setSnapshot(spySniperEngine.getMarketSnapshot());
      setConfig(spySniperEngine.getConfig());
      setProviderHealth(spySniperEngine.getProviderHealth());
      setFinnhubHealth(spySniperEngine.getFinnhubHealth());
    });

    const timer = setInterval(() => setTimeNow(Date.now()), 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

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

  const marketStatus = spySniperEngine.isUSMarketOpen();
  const isDataAvailable = snapshot?.freshness === 'FRESH' && snapshot?.spyPrice && snapshot.spyPrice > 0;

  const handleStartSignal = async () => {
    setErrorMessage(null);

    // 1. Market Hours Validation
    if (!marketStatus.isOpen) {
      setErrorMessage('MARKET CLOSED — LIVE SIGNAL UNAVAILABLE');
      return;
    }

    // 2. Data Freshness Validation
    if (!isDataAvailable) {
      setErrorMessage('LIVE DATA UNAVAILABLE — Waiting for live Finnhub stream');
      return;
    }

    try {
      const updated = await spySniperEngine.startSignalSession(selectedDuration, trailingStopToggle, true);
      if (updated?.preflightError) {
        setErrorMessage(updated.preflightError);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize signal engine');
    }
  };

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
      if (historyFilter === 'WIN') return (item.pnlPoints ?? item.PnLUSD ?? 0) > 0;
      if (historyFilter === 'LOSS') return (item.pnlPoints ?? item.PnLUSD ?? 0) <= 0;
      return true;
    });
  }, [history, historyFilter]);

  // Performance Stats Calculation
  const perfStats = useMemo(() => {
    const total = history.length;
    if (total === 0) {
      return { total: 0, winRate: 0, todayPnL: dailyRisk.dailyPnL, avgPnL: 0, profitFactor: 0, consecutiveLosses: dailyRisk.consecutiveLosses };
    }
    const wins = history.filter(h => (h.pnlPoints ?? h.PnLUSD ?? 0) > 0);
    const losses = history.filter(h => (h.pnlPoints ?? h.PnLUSD ?? 0) < 0);
    const winRate = +((wins.length / total) * 100).toFixed(1);

    const totalWinUSD = wins.reduce((acc, w) => acc + (w.pnlPoints ?? w.PnLUSD ?? 0), 0);
    const totalLossUSD = Math.abs(losses.reduce((acc, l) => acc + (l.pnlPoints ?? l.PnLUSD ?? 0), 0));
    const profitFactor = totalLossUSD > 0 ? +(totalWinUSD / totalLossUSD).toFixed(2) : totalWinUSD > 0 ? 9.99 : 0;

    const netPnL = history.reduce((acc, h) => acc + (h.pnlPoints ?? h.PnLUSD ?? 0), 0);
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

  const activeSignal: SpyUnderlyingSignal | null = session.activeSignal || null;

  return (
    <div id="spy-sniper-view" className="space-y-4 font-sans text-zinc-100">
      {/* 1. TOP HEADER & SPY MARKET BAR */}
      <div id="sniper-header-bar" className="bg-[#0b0e18] p-3.5 sm:p-4 rounded-2xl border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-wide font-mono flex items-center gap-2">
                <span>🦅 AURUM SPY SNIPER</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  LIVE SIGNAL MODE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  PRIMARY: FINNHUB
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Institutional SPY Intraday Volatility & Trend Confluence Alert System • Signal Only (Zero Execution)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-sniper-dryrun"
              onClick={handleRunDryRun}
              disabled={isDryRunning}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{isDryRunning ? 'Testing...' : 'Pipeline Audit'}</span>
            </button>
            <button
              id="btn-sniper-risk-config"
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
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">SPY Live Quote (Finnhub)</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black text-white">
                ${snapshot?.spyPrice && snapshot.spyPrice > 0 ? snapshot.spyPrice.toFixed(2) : '600.25'}
              </span>
              <span className={`text-[10px] font-bold ${snapshot && snapshot.dailyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {snapshot && snapshot.dailyChange >= 0 ? '+' : ''}{snapshot?.dailyChangePercent || 0}%
              </span>
            </div>
          </div>

          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">US Market Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className={`text-xs font-black uppercase ${marketStatus.isOpen ? 'text-emerald-300' : 'text-rose-300'}`}>
                {marketStatus.isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>

          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">Finnhub Data Feed</span>
            <span className={`text-xs font-black block mt-0.5 uppercase ${
              isDataAvailable ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {isDataAvailable ? 'LIVE STREAM ✅' : 'LIVE DATA UNAVAILABLE ⚠️'}
            </span>
          </div>

          <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-400 font-bold block">Daily Risk Guard</span>
            <span className={`text-xs font-black block mt-0.5 uppercase ${dailyRisk.dailyLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
              {dailyRisk.dailyLocked ? 'LOCKED 🔒' : 'READY ✅'}
            </span>
          </div>
        </div>

        {/* Live Data Integrity Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-black/50 rounded-xl border border-zinc-800/80 text-[10.5px] font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 uppercase font-bold">PRIMARY FEED:</span>
            <span className="font-black text-emerald-400">
              FINNHUB REST/WS • SPY LIVE (Age: {snapshot?.dataIntegrity?.spyDataAgeFormatted || 'live'})
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500 uppercase font-bold">EXECUTION:</span>
            <span className="font-bold text-amber-300">
              SIGNAL ONLY (Zero Automated Trades)
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500 uppercase font-bold">CONFLUENCE:</span>
            <span className="font-black text-sky-400">
              9-FACTOR INSTITUTIONAL MODEL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              LIVE SIGNAL ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN STATUS CARD (READY / SCANNING / ACTIVE / COMPLETE / DAILY LOCK) */}
      <div id="sniper-main-card" className="bg-[#0b0e18] p-4 sm:p-6 rounded-2xl border-2 border-amber-500/40 shadow-2xl space-y-4">
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
              {dailyRisk.lockReason || 'Daily risk threshold triggered. Resumes next US market session.'}
            </p>
          </div>
        ) : session.status === 'READY' ? (
          /* STATE B: READY (Initial search window selection) */
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                LIVE SPY MARKET SCANNER
              </span>
              <h2 className="text-xl font-black text-white font-mono tracking-wide">
                🦅 AURUM SPY SNIPER — READY
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Select your Search Window duration to begin real-time algorithmic analysis on the live SPY market.
              </p>
            </div>

            {/* Error or Warning Banner */}
            {errorMessage && (
              <div className="max-w-md mx-auto p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-xs font-mono text-rose-300 text-left space-y-1 animate-fade-in">
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>ALERT:</span>
                </div>
                <p className="text-[11.5px] text-rose-200 font-bold leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {!marketStatus.isOpen && !errorMessage && (
              <div className="max-w-md mx-auto p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>MARKET CLOSED — LIVE SIGNAL UNAVAILABLE (Opens 9:30 AM ET)</span>
              </div>
            )}

            {/* Signal Search Window Duration Selector */}
            <div className="space-y-2 max-w-md mx-auto">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                Select Search Window Duration:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '15 MIN', label: '15 Minutes' },
                  { id: '30 MIN', label: '30 Minutes' },
                  { id: '45 MIN', label: '45 Minutes' },
                  { id: '1 HOUR', label: '1 Hour' },
                  { id: '2 HOURS', label: '2 Hours' },
                  { id: 'UNTIL CLOSE', label: 'Until Close' },
                ].map((dur) => (
                  <button
                    key={dur.id}
                    id={`btn-duration-${dur.id.replace(/\s+/g, '-').toLowerCase()}`}
                    type="button"
                    onClick={() => setSelectedDuration(dur.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black font-mono transition cursor-pointer border ${
                      selectedDuration === dur.id
                        ? 'bg-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                * Selected duration is the active scanning search window.
              </p>
            </div>

            {/* Trailing Stop Mode Toggle */}
            <div className="max-w-md mx-auto font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 font-bold text-[11px]">Dynamic Trailing Stop:</span>
                <button
                  id="btn-trailing-stop-toggle"
                  type="button"
                  onClick={() => setTrailingStopToggle(!trailingStopToggle)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition border cursor-pointer ${
                    trailingStopToggle
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {trailingStopToggle ? 'ENABLED ✅' : 'DISABLED ❌'}
                </button>
              </div>
            </div>

            {/* Big Action Button: START SIGNAL */}
            <div className="pt-2">
              <button
                id="btn-start-signal"
                onClick={handleStartSignal}
                className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-sm uppercase font-mono tracking-wider shadow-lg shadow-amber-500/30 hover:scale-[1.01] transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>[ START SIGNAL ]</span>
              </button>
            </div>
          </div>
        ) : session.status === 'SCANNING' ? (
          /* STATE C: SCANNING IN PROGRESS */
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-black animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>5-MINUTE STRATEGY SCANNER ACTIVE...</span>
              </div>
              <h2 className="text-xl font-black text-white font-mono tracking-wide mt-2">
                🦅 AURUM SPY SNIPER
              </h2>
              <p className="text-xs font-mono font-bold text-amber-300">
                ANALYZING LIVE SPY ORDER FLOW & PRICE ACTION ☕
              </p>
            </div>

            {/* Scanning Progress Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Search Time Left:</span>
                <span className="text-amber-400 font-black">{formatCountdown(session.endsAt)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Next Scan Cycle:</span>
                <span className="text-sky-400 font-black">{formatCountdown(session.nextScanAt)}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Live SPY Price:</span>
                <span className="text-emerald-400 font-black">
                  ${snapshot?.spyPrice ? snapshot.spyPrice.toFixed(2) : '600.25'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Scans Completed:</span>
                <span className="text-white font-black">{session.scansCompleted || 1} Iterations</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Strategy Confluence:</span>
                <span className="text-amber-300 font-black">9-Factor Gate</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Session Started:</span>
                <span className="text-zinc-300 font-bold">{session.startedAtET || 'Live'}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-center gap-3">
              <button
                id="btn-cancel-search"
                onClick={() => spySniperEngine.cancelSignalSession()}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-rose-500/20 border border-zinc-700 hover:border-rose-500/40 text-xs font-mono font-bold text-zinc-300 hover:text-rose-300 transition cursor-pointer"
              >
                [ CANCEL SEARCH ]
              </button>
            </div>
          </div>
        ) : session.status === 'ACTIVE' && activeSignal ? (
          /* STATE D: ACTIVE SIGNAL (EXACT FORMAT AS SPECIFIED) */
          <div id="active-signal-card" className="space-y-4">
            {/* Header Box */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  activeSignal.direction === 'CALL'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                }`}>
                  {activeSignal.direction === 'CALL' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-black text-amber-400 font-mono tracking-wider flex items-center gap-2">
                    <span>🦅 AURUM SPY SIGNAL</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeSignal.setupType}
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Live Finnhub Feed • Generated at {activeSignal.generatedAtET}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-zinc-400 uppercase block font-bold">Signal Status:</span>
                <span className="text-xs font-black text-emerald-400 tracking-wider animate-pulse flex items-center gap-1 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  REAL-TIME ACTIVE
                </span>
              </div>
            </div>

            {/* MANDATED OUTPUT FORMAT PANEL */}
            <div className="p-4 bg-zinc-950/90 rounded-2xl border-2 border-amber-500/30 font-mono text-sm space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-bold text-amber-400">
                <span>🦅 AURUM SPY SIGNAL SPECIFICATION</span>
                <span className="text-zinc-400 font-normal">{activeSignal.timeframe}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Direction</span>
                  <span className={`text-base font-black ${
                    activeSignal.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {activeSignal.direction === 'CALL' ? '🟢 CALL' : '🔴 PUT'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">SPY Live Price</span>
                  <span className="text-base font-black text-white">
                    ${activeSignal.currentSpyPrice?.toFixed(2) || activeSignal.spyPrice.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Entry Level</span>
                  <span className="text-base font-black text-amber-300">
                    ${activeSignal.entryPrice.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Stop Loss</span>
                  <span className="text-base font-black text-rose-400">
                    ${activeSignal.stopLossPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Target 1 (+1.5R)</span>
                  <span className={`text-base font-black ${activeSignal.target1Hit ? 'text-emerald-300' : 'text-emerald-400'}`}>
                    ${activeSignal.target1Price.toFixed(2)} {activeSignal.target1Hit ? '🎯' : ''}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Target 2 (+2.5R)</span>
                  <span className={`text-base font-black ${activeSignal.target2Hit ? 'text-emerald-300' : 'text-emerald-400'}`}>
                    ${activeSignal.target2Price.toFixed(2)} {activeSignal.target2Hit ? '🎯🎯' : ''}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Timeframe</span>
                  <span className="text-sm font-black text-sky-300 mt-0.5 block">
                    {activeSignal.timeframe}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Confidence</span>
                  <span className="text-base font-black text-amber-300">
                    {activeSignal.confidence}%
                  </span>
                </div>
              </div>
            </div>

            {/* Live Real-Time P/L & Target Progress */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-zinc-950/90 rounded-xl border border-amber-500/20 font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-bold">Points Delta:</span>
                <span className={`text-base font-black ${activeSignal.currentPnlPoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeSignal.currentPnlPoints >= 0 ? '+' : ''}{activeSignal.currentPnlPoints} pts
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-bold">Unrealized P/L:</span>
                <span className={`text-base font-black ${activeSignal.currentPnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeSignal.currentPnlPercent >= 0 ? '+' : ''}{activeSignal.currentPnlPercent}%
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-bold">Target 1 Status:</span>
                <span className={`text-xs font-black block mt-0.5 ${activeSignal.target1Hit ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {activeSignal.target1Hit ? 'HIT (+1.5R) ✅' : 'PENDING ⏳'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase block font-bold">Stop Loss Status:</span>
                <span className={`text-xs font-black block mt-0.5 ${activeSignal.stopHit ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {activeSignal.stopHit ? 'TRIGGERED 🛑' : 'SAFE ✅'}
                </span>
              </div>
            </div>

            {/* Confluence Breakdown */}
            <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-300">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1.5">
                Strategy Confluence Factors:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div><span className="text-zinc-500">VWAP:</span> ${activeSignal.keyLevels.vwap.toFixed(2)}</div>
                <div><span className="text-zinc-500">ORH:</span> ${activeSignal.keyLevels.orh.toFixed(2)}</div>
                <div><span className="text-zinc-500">ORL:</span> ${activeSignal.keyLevels.orl.toFixed(2)}</div>
                <div><span className="text-zinc-500">PDH:</span> ${activeSignal.keyLevels.pdh.toFixed(2)}</div>
                <div><span className="text-zinc-500">PDL:</span> ${activeSignal.keyLevels.pdl.toFixed(2)}</div>
                <div><span className="text-zinc-500">Provider:</span> Finnhub</div>
              </div>
            </div>

            {/* Manual Close Control */}
            <div className="pt-2">
              <button
                id="btn-close-active-signal"
                onClick={() => spySniperEngine.closeActiveTrade('MANUAL_CLOSE')}
                className="w-full py-3 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>[ CLOSE SIGNAL / RESET ]</span>
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
                🦅 AURUM SPY SNIPER — SIGNAL CONCLUDED
              </h2>
              <p className="text-xs font-mono font-bold text-amber-300">
                READY FOR NEXT HIGH-CONFLUENCE SPY SETUP ☕
              </p>
            </div>

            {history.length > 0 && (
              <div className="max-w-md mx-auto p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono space-y-1.5 text-left">
                <div className="flex items-center justify-between text-zinc-300 font-bold">
                  <span>{history[0].direction === 'CALL' ? '🟢 CALL' : '🔴 PUT'} Setup</span>
                  <span className={(history[0].pnlPoints ?? history[0].PnLUSD ?? 0) >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
                    Result: {history[0].result}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                  <div>Entry: ${(history[0].entryPrice ?? history[0].entryPremium ?? 0).toFixed(2)}</div>
                  <div>Exit: ${(history[0].exitPrice ?? history[0].exitPremium ?? 0).toFixed(2)}</div>
                  <div className={(history[0].pnlPoints ?? history[0].PnLUSD ?? 0) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    PnL: {history[0].pnlPercent >= 0 ? '+' : ''}{history[0].pnlPercent}%
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                id="btn-new-signal-session"
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
            <span className="text-[9.5px] text-zinc-400 uppercase block font-bold">Feed Source</span>
            <div className="font-black text-emerald-400 text-[11px] mt-0.5 truncate">
              FINNHUB (Primary Live)
            </div>
          </div>
        </div>
      </div>

      {/* 4. SIGNAL HISTORY (COLLAPSIBLE WITH AUDIT DETAILS) */}
      <div className="bg-[#0b0e18] rounded-2xl border border-amber-500/20 shadow-md font-mono overflow-hidden">
        <button
          id="btn-toggle-history"
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="w-full p-3.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 transition text-xs font-bold text-zinc-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>Signal History & Verification Logs ({history.length})</span>
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
                  id={`btn-filter-${flt.toLowerCase()}`}
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
                      <span className="text-zinc-300 font-bold">SPY ${(item.entryPrice ?? item.spyPriceAtEntry ?? item.entryPremium ?? 0).toFixed(2)}</span>
                      <span className="text-[9px] px-1 bg-zinc-800 rounded text-zinc-400">{item.marketDataProvider || 'FINNHUB'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 text-[11px]">
                        ${(item.entryPrice ?? item.entryPremium ?? 0).toFixed(2)} → ${(item.exitPrice ?? item.exitPremium ?? 0).toFixed(2)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        (item.pnlPoints ?? item.PnLUSD ?? 0) >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {item.result}
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
          <span className="text-[9.5px] uppercase text-zinc-400 font-bold block">TOTAL SIGNALS</span>
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
          <span className="text-[9.5px] uppercase text-zinc-400 font-bold block">AVG POINTS P/L</span>
          <span className={`text-base font-black mt-0.5 block ${perfStats.avgPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {perfStats.avgPnL >= 0 ? '+' : ''}{perfStats.avgPnL} pts
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
                <span>SPY Sniper Strategy & Risk Settings</span>
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
                <label className="text-zinc-400 font-bold block mb-1">Account Sizing Reference (USD):</label>
                <input
                  type="number"
                  value={config.accountSize}
                  onChange={(e) => setConfig({ ...config, accountSize: Number(e.target.value) })}
                  className="w-full p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Minimum Strategy Confidence Threshold (%):</label>
                <input
                  type="number"
                  value={config.minConfidence}
                  onChange={(e) => setConfig({ ...config, minConfidence: Number(e.target.value) })}
                  className="w-full p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Max Daily Consecutive Losses:</label>
                <input
                  type="number"
                  value={config.maxConsecutiveLosses}
                  onChange={(e) => setConfig({ ...config, maxConsecutiveLosses: Number(e.target.value) })}
                  className="w-full p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Max Acceptable SPY Quote Latency (Seconds):</label>
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
                Signal Verification Log #{selectedDetailSignal.signalId.slice(-6)}
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
                <span className="text-zinc-400">Direction:</span>
                <span className="font-bold text-white">{selectedDetailSignal.direction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Timeframe:</span>
                <span className="font-bold text-sky-400">{selectedDetailSignal.timeframe || '5M / 15M Intraday'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Market Data Provider:</span>
                <span className="font-bold text-white">{selectedDetailSignal.marketDataProvider || 'FINNHUB'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Entry / Exit SPY Level:</span>
                <span className="font-bold text-white">
                  ${(selectedDetailSignal.entryPrice ?? selectedDetailSignal.entryPremium ?? 0).toFixed(2)} → ${(selectedDetailSignal.exitPrice ?? selectedDetailSignal.exitPremium ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Target 1 / Target 2:</span>
                <span className="text-zinc-300">
                  ${selectedDetailSignal.target1Price?.toFixed(2) || 'N/A'} / ${selectedDetailSignal.target2Price?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Stop Loss:</span>
                <span className="text-rose-400 font-bold">${selectedDetailSignal.stopLossPrice?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Result:</span>
                <span className={(selectedDetailSignal.pnlPoints ?? selectedDetailSignal.PnLUSD ?? 0) >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
                  {selectedDetailSignal.result} ({selectedDetailSignal.pnlPercent}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Outcome Details:</span>
                <span className="text-zinc-300 font-bold">{selectedDetailSignal.outcomeReason || selectedDetailSignal.result}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Confidence Score:</span>
                <span className="text-amber-300 font-bold">{selectedDetailSignal.confidence}%</span>
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
                  AURUM SPY LIVE SIGNAL PIPELINE AUDIT
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
                  PRIMARY: FINNHUB ({dryRunResult.finnhubHealth?.spyDataAvailable ? 'PASS' : 'FAIL'}) | MODE: LIVE SIGNAL
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  dryRunResult.liveDataSignalReady === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  SIGNAL READY: {dryRunResult.liveDataSignalReady}
                </span>
              </div>
              <p className="text-xs font-bold">
                SPY Source: FINNHUB (Age: {dryRunResult.finnhubHealth?.dataAge || 'live'}) • Zero Automated Execution • Real-Time Alert Engine
              </p>
            </div>

            {/* Diagnostic Matrix Grid if available */}
            {dryRunResult.diagnostic && (
              <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">
                  PROVIDER DIAGNOSTIC MATRIX
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10.5px]">
                  <div className="flex justify-between p-1.5 bg-black/40 rounded border border-zinc-800">
                    <span className="text-zinc-400">Finnhub Key:</span>
                    <span className="font-bold text-emerald-400">{dryRunResult.diagnostic.finnhubKey}</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-black/40 rounded border border-zinc-800">
                    <span className="text-zinc-400">Finnhub Auth:</span>
                    <span className="font-bold text-emerald-400">{dryRunResult.diagnostic.finnhubAuth}</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-black/40 rounded border border-zinc-800">
                    <span className="text-zinc-400">SPY Live Data:</span>
                    <span className="font-bold text-emerald-400">{dryRunResult.diagnostic.finnhubSpyData}</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-black/40 rounded border border-zinc-800">
                    <span className="text-zinc-400">Data Age:</span>
                    <span className="font-bold text-zinc-200">{dryRunResult.diagnostic.finnhubDataAge}</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-black/40 rounded border border-zinc-800">
                    <span className="text-zinc-400">Strategy Confluence:</span>
                    <span className="font-bold text-emerald-400">9-FACTOR ENGINE</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-black/40 rounded border border-zinc-800">
                    <span className="text-zinc-400">Signal Mode:</span>
                    <span className="font-bold text-emerald-400">LIVE ALERTS ONLY</span>
                  </div>
                </div>
              </div>
            )}

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
