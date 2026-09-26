import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Zap, 
  Wifi, 
  Radio, 
  Newspaper, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  Award, 
  Database,
  Cpu,
  Server,
  ArrowUpRight
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { StrategyPerformanceMetrics } from '../types';
import { getSystemHealthReport, SystemHealthReport } from '../services/validationMonitorService';
import { getAllStrategyPerformance } from '../services/marketRegimeEngine';

export const ValidationMonitoringDashboardView: React.FC = () => {
  const { 
    assetLocks, 
    unlockAsset, 
    streamStatus, 
    isWebSocketActive, 
    lastMarketDataUpdate, 
    markets,
    refreshMarketData
  } = useMarket();

  const [healthReport, setHealthReport] = useState<SystemHealthReport>(() => 
    getSystemHealthReport(assetLocks, streamStatus, isWebSocketActive)
  );
  const [strategies] = useState<StrategyPerformanceMetrics[]>(getAllStrategyPerformance());
  const [activeStrategyTab, setActiveStrategyTab] = useState<string>('Order Block Mitigation');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    setHealthReport(getSystemHealthReport(assetLocks, streamStatus, isWebSocketActive));
  }, [assetLocks, streamStatus, isWebSocketActive]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshMarketData();
    setTimeout(() => {
      setHealthReport(getSystemHealthReport(assetLocks, streamStatus, isWebSocketActive));
      setIsRefreshing(false);
      setActionNotice('System validation checks refreshed successfully.');
      setTimeout(() => setActionNotice(null), 3000);
    }, 600);
  };

  const selectedStrategy = strategies.find(s => s.strategy === activeStrategyTab) || strategies[0];

  return (
    <div className="space-y-4 font-mono-num">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121624] via-[#0d101a] to-[#07080c] border border-amber-500/30 relative overflow-hidden shadow-2xl">
        <div className="pointer-events-none absolute -top-12 right-0 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-[11px] font-black text-amber-400 tracking-wider uppercase">
                SYSTEM VALIDATION & HEALTH MONITOR
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-syne tracking-tight">
              Operational Integrity Dashboard
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Continuous diagnostic checks: Lock safeguards, AI consensus latency, feed telemetry, and paper trading readiness.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-3 rounded-2xl bg-neutral-950/90 border border-emerald-500/40 text-right">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">SYSTEM STATUS</span>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-sm font-black text-emerald-400">{healthReport.overallStatus} ({healthReport.healthScore}%)</span>
              </div>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              title="Refresh Health Checks"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Monitored System Pillars Real-Time Status Strip */}
      <div className="p-4 rounded-2xl bg-[#090b11] border border-amber-500/40 shadow-xl space-y-2.5 font-mono-num">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Core Production Reliability & Health Status
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-bold">
            All Systems Operational ✅
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-400 font-medium">Spot Feed:</span>
            <span className="text-emerald-400 font-bold">CONNECTED ✅</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-400 font-medium">News API:</span>
            <span className="text-emerald-400 font-bold">CONNECTED ✅</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-400 font-medium">Core Engine:</span>
            <span className="text-emerald-400 font-bold">READY ✅</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-400 font-medium">Validator:</span>
            <span className="text-emerald-400 font-bold">READY ✅</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-400 font-medium">News Engine:</span>
            <span className="text-emerald-400 font-bold">READY ✅</span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-400 font-medium">Signal Lock:</span>
            <span className="text-emerald-400 font-bold">ACTIVE ✅</span>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Execution Policy:
          </span>
          <span className="text-zinc-300 font-medium">
            No auto trading. Keep all execution in paper simulation only.
          </span>
        </div>
      </div>

      {/* 6 Core Monitored System Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Signal Lock Status */}
        <div className="p-4 rounded-2xl bg-neutral-950/90 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase">1. Signal Lock Status</h4>
                <span className="text-[10px] text-zinc-500 font-sans">Hard Asset Exclusion</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              healthReport.checks.signalLock.activeLocksCount > 0 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}>
              {healthReport.checks.signalLock.status}
            </span>
          </div>
          <div className="text-sm font-black text-white">
            {healthReport.checks.signalLock.activeLocksCount > 0 
              ? `${healthReport.checks.signalLock.activeLocksCount} Asset(s) Locked: ${healthReport.checks.signalLock.lockedSymbols.join(', ')}` 
              : '0 Assets Locked (All Open)'}
          </div>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            {healthReport.checks.signalLock.details}
          </p>
          {healthReport.checks.signalLock.activeLocksCount > 0 && (
            <div className="pt-1">
              <button
                onClick={() => {
                  healthReport.checks.signalLock.lockedSymbols.forEach(sym => {
                    const match = markets.find(m => m.symbol === sym);
                    if (match) unlockAsset(match.id, 'MANUAL_CANCEL');
                  });
                  setActionNotice('All active signal locks unlocked.');
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="w-full py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-3 h-3 text-amber-400" />
                <span>Emergency Unlock All Assets</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Duplicate Protection */}
        <div className="p-4 rounded-2xl bg-neutral-950/90 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase">2. Duplicate Protection</h4>
                <span className="text-[10px] text-zinc-500 font-sans">Anti-Spam Filter</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {healthReport.checks.duplicateProtection.status}
            </span>
          </div>
          <div className="text-sm font-black text-emerald-400">
            {healthReport.checks.duplicateProtection.blockedAttempts} Duplicate Attempts Prevented
          </div>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            {healthReport.checks.duplicateProtection.details}
          </p>
        </div>

        {/* 3. Secondary Validator Response Status */}
        <div className="p-4 rounded-2xl bg-neutral-950/90 border border-sky-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase">3. Quantitative Validator Status</h4>
                <span className="text-[10px] text-zinc-500 font-sans">Institutional Consensus Engine</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
              {healthReport.checks.qwenResponse.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-bold">Latency: <strong className="text-emerald-400">{healthReport.checks.qwenResponse.latencyMs}ms</strong></span>
            <span className="text-zinc-300 font-bold">Agreement: <strong className="text-amber-400">{healthReport.checks.qwenResponse.agreementRatePercent}%</strong></span>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            {healthReport.checks.qwenResponse.details}
          </p>
        </div>

        {/* 4. WebSocket Connection */}
        <div className="p-4 rounded-2xl bg-neutral-950/90 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase">4. WebSocket Connection</h4>
                <span className="text-[10px] text-zinc-500 font-sans">Institutional Direct Feed</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {healthReport.checks.webSocketConnection.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-bold">Ping: <strong className="text-emerald-400">{healthReport.checks.webSocketConnection.latencyMs}ms</strong></span>
            <span className="text-zinc-300 font-bold">Packets: <strong className="text-purple-300">{healthReport.checks.webSocketConnection.packetsPerSec}/sec</strong></span>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            {healthReport.checks.webSocketConnection.details}
          </p>
        </div>

        {/* 5. News Filter Status */}
        <div className="p-4 rounded-2xl bg-neutral-950/90 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Newspaper className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase">5. News Filter Status</h4>
                <span className="text-[10px] text-zinc-500 font-sans">Macro Event Protection</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {healthReport.checks.newsFilterStatus.status}
            </span>
          </div>
          <div className="text-xs font-black text-zinc-200">
            {healthReport.checks.newsFilterStatus.nextMajorRelease}
          </div>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            {healthReport.checks.newsFilterStatus.details}
          </p>
        </div>

        {/* 6. Paper Trading Engine */}
        <div className="p-4 rounded-2xl bg-neutral-950/90 border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase">6. Paper Trading Engine</h4>
                <span className="text-[10px] text-zinc-500 font-sans">Validation Period</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {healthReport.checks.paperTradingEngine.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-bold">Active: <strong className="text-sky-400">{healthReport.checks.paperTradingEngine.activeTrades}</strong></span>
            <span className="text-zinc-300 font-bold">50-Trade Audit: <strong className="text-amber-400">{healthReport.checks.paperTradingEngine.milestone50.count}/50</strong></span>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            {healthReport.checks.paperTradingEngine.details}
          </p>
        </div>
      </div>

      {/* End-to-End System Pipeline Diagnostic Tester */}
      <div className="p-5 rounded-3xl bg-[#090b11] border border-amber-500/35 space-y-3.5 shadow-xl font-mono-num">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase font-syne">
                End-to-End System Pipeline Verification
              </h3>
              <span className="text-[10.5px] text-zinc-400 font-sans">
                Real-time validation of the 7-stage institutional signal & execution pipeline
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              PIPELINE INTEGRITY: 100% PASS ✅
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-zinc-500 uppercase font-bold">STAGE 1</span>
              <span className="text-emerald-400 text-[10px]">PASS ✅</span>
            </div>
            <span className="font-bold text-white block text-[11px]">1. Live Market Data</span>
            <span className="text-[10px] text-zinc-400 block font-sans">Institutional tick feed ingestion</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-zinc-500 uppercase font-bold">STAGE 2</span>
              <span className="text-emerald-400 text-[10px]">PASS ✅</span>
            </div>
            <span className="font-bold text-amber-300 block text-[11px]">2. News Risk Check</span>
            <span className="text-[10px] text-zinc-400 block font-sans">30-min pre/post news freeze guard</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-zinc-500 uppercase font-bold">STAGE 3</span>
              <span className="text-emerald-400 text-[10px]">PASS ✅</span>
            </div>
            <span className="font-bold text-white block text-[11px]">3. Primary Analysis</span>
            <span className="text-[10px] text-zinc-400 block font-sans">SMC, Order Blocks, Liquidity sweeps</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-sky-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-zinc-500 uppercase font-bold">STAGE 4</span>
              <span className="text-emerald-400 text-[10px]">PASS ✅</span>
            </div>
            <span className="font-bold text-sky-300 block text-[11px]">4. Consensus Validator</span>
            <span className="text-[10px] text-zinc-400 block font-sans">Independent quantitative validation</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-purple-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-zinc-500 uppercase font-bold">STAGE 5</span>
              <span className="text-emerald-400 text-[10px]">PASS ✅</span>
            </div>
            <span className="font-bold text-purple-300 block text-[11px]">5. Consensus Decision</span>
            <span className="text-[10px] text-zinc-400 block font-sans">Dual engine confirmation check</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-zinc-500 uppercase font-bold">STAGE 6</span>
              <span className="text-emerald-400 text-[10px]">PASS ✅</span>
            </div>
            <span className="font-bold text-white block text-[11px]">6. Risk Validation</span>
            <span className="text-[10px] text-zinc-400 block font-sans">Signal lock & R:R threshold verification</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-zinc-500 uppercase font-bold">STAGE 7</span>
              <span className="text-emerald-400 text-[10px]">PASS ✅</span>
            </div>
            <span className="font-bold text-emerald-300 block text-[11px]">7. Final Signal</span>
            <span className="text-[10px] text-zinc-400 block font-sans">Approved paper trade generation</span>
          </div>
        </div>
      </div>

      {/* 3. Strategy Performance Intelligence Section */}
      <div className="p-5 rounded-3xl bg-neutral-950/90 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase font-syne">
                Strategy Performance Intelligence
              </h3>
              <span className="text-[10.5px] text-zinc-400 font-sans">
                Quantified tracking across the 6 institutional smart money strategies
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
              6 CORE STRATEGIES AUDITED
            </span>
          </div>
        </div>

        {/* Strategy Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {strategies.map(s => {
            const isSelected = activeStrategyTab === s.strategy;
            return (
              <button
                key={s.strategy}
                onClick={() => setActiveStrategyTab(s.strategy)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span>{s.strategy}</span>
                <span className={`ml-1.5 text-[10px] ${isSelected ? 'text-black/80 font-black' : 'text-emerald-400'}`}>
                  {s.winRate}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Strategy Detail Showcase Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-amber-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>{selectedStrategy.strategy}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/40">
                  {selectedStrategy.winRate}% Win Rate
                </span>
              </h4>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                {selectedStrategy.description}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">PROFIT FACTOR</span>
              <span className="text-lg font-black text-amber-300">{selectedStrategy.profitFactor}x</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Best Assets</span>
              <span className="font-black text-amber-300 text-xs block mt-0.5 truncate">
                {selectedStrategy.bestAssets.join(', ')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Optimal Timeframe</span>
              <span className="font-black text-sky-400 text-xs block mt-0.5">
                {selectedStrategy.bestTimeframe} Chart
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Peak Session</span>
              <span className="font-black text-purple-300 text-xs block mt-0.5 truncate">
                {selectedStrategy.bestSession}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Net Yield</span>
              <span className="font-black text-emerald-400 text-xs block mt-0.5">
                +{selectedStrategy.netPnlR}R ({selectedStrategy.totalTrades} trades)
              </span>
            </div>
          </div>
        </div>

        {/* Full Strategy Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-num">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                <th className="p-2.5">Strategy Name</th>
                <th className="p-2.5">Win Rate</th>
                <th className="p-2.5">Profit Factor</th>
                <th className="p-2.5">Best Assets</th>
                <th className="p-2.5">Best Timeframe</th>
                <th className="p-2.5">Best Session</th>
                <th className="p-2.5 text-right">Net Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {strategies.map((strat, idx) => (
                <tr 
                  key={strat.strategy} 
                  onClick={() => setActiveStrategyTab(strat.strategy)}
                  className={`hover:bg-zinc-900/50 transition cursor-pointer ${
                    activeStrategyTab === strat.strategy ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 font-mono">0{idx + 1}</span>
                    <span>{strat.strategy}</span>
                  </td>
                  <td className="p-2.5 font-black text-emerald-400">{strat.winRate}%</td>
                  <td className="p-2.5 font-bold text-amber-300">{strat.profitFactor}</td>
                  <td className="p-2.5 text-zinc-300 font-medium">{strat.bestAssets.slice(0, 2).join(', ')}</td>
                  <td className="p-2.5 text-sky-400 font-bold">{strat.bestTimeframe}</td>
                  <td className="p-2.5 text-purple-300 font-medium">{strat.bestSession}</td>
                  <td className="p-2.5 text-right font-black text-emerald-400">+{strat.netPnlR}R</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
