import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Layers, 
  Sliders, 
  Check, 
  Activity, 
  UserCheck, 
  Lock
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { AiTradeSignal } from '../types';
import { getPaperTradeRecords } from '../data/paperTradingTracker';
import { signalGovernanceService } from '../services/signalGovernanceService';
import { GovernedSignalCard } from './GovernedSignalCard';
import { userService } from '../services/userService';
import { SignalGovernanceStatus } from '../types/signalGovernanceTypes';

export const AiSignalCenter: React.FC = () => {
  const { 
    signals, 
    selectedSignalId, 
    setSelectedSignalId, 
    sendSignalToTelegram,
    isAiGenerating,
    regenerateAiSignals,
    markets
  } = useMarket();

  const [governanceFilter, setGovernanceFilter] = useState<'APPROVED' | 'WAIT' | 'BLOCKED' | 'ALL'>('APPROVED');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [adminModeOverride, setAdminModeOverride] = useState<boolean | null>(null);

  const currentUserRole = userService.getRole();
  const isAdmin = adminModeOverride !== null ? adminModeOverride : (currentUserRole === 'ADMIN');

  // Fetch paper trades for live portfolio risk state
  const paperTrades = useMemo(() => {
    return getPaperTradeRecords();
  }, [signals]);

  // Run institutional signal governance engine on all signals
  const governanceResults = useMemo(() => {
    return signalGovernanceService.governAllSignals(signals, markets, paperTrades);
  }, [signals, markets, paperTrades]);

  const { governedSignals, portfolioRisk, stats } = governanceResults;

  // Filter signals based on Governance status (Default: APPROVED only) & Direction
  const filteredSignals = useMemo(() => {
    return governedSignals.filter(s => {
      // Governance filter
      if (governanceFilter !== 'ALL' && s.status !== governanceFilter) {
        return false;
      }
      // Direction filter
      if (directionFilter !== 'ALL' && s.direction !== directionFilter) {
        return false;
      }
      return true;
    });
  }, [governedSignals, governanceFilter, directionFilter]);

  const handleSendTelegram = async (signalId: string) => {
    setSendingId(signalId);
    const res = await sendSignalToTelegram(signalId);
    setSendingId(null);
    if (res.success) {
      setSentNotice(res.message);
      setTimeout(() => setSentNotice(null), 3500);
    }
  };

  const handleOpenAssetDetail = (assetId: string) => {
    setSelectedSignalId(assetId);
    const chartSec = document.getElementById('live-charts-section');
    if (chartSec) {
      chartSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="institutional-signal-governance-engine" className="space-y-6">
      {/* 1. Engine Header & Live Governance Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[11px] font-black border border-amber-500/40">
              GOVERNANCE LAYER
            </span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-xs font-mono text-zinc-400 font-semibold">
              Simple Professional Mode
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Institutional Signal Governance</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Multi-gate validation filtering signals across Market Regime, Dual AI Consensus, Risk Limits, Macro News, and unified 82+ Quality score.
          </p>
        </div>

        {/* Global Controls: Admin Toggle & Refresh */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Admin vs User Mode Switcher */}
          <button
            id="toggle-admin-user-mode-btn"
            onClick={() => setAdminModeOverride(!isAdmin)}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
            }`}
            title="Switch between simplified user view and admin governance audit view"
          >
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{isAdmin ? 'ADMIN AUDIT VIEW' : 'USER SIMPLE VIEW'}</span>
          </button>

          <button
            id="refresh-governance-signals-btn"
            onClick={() => regenerateAiSignals()}
            disabled={isAiGenerating}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold font-mono flex items-center gap-1.5 transition-all border border-zinc-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isAiGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isAiGenerating ? 'Evaluating Gates...' : 'Re-verify Gates'}</span>
          </button>
        </div>
      </div>

      {/* 2. Portfolio Risk Control Banner (Section 5) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        portfolioRisk.riskLimitsReached
          ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/20'
          : 'bg-zinc-900/40 border-zinc-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <ShieldAlert className={`w-4 h-4 ${portfolioRisk.riskLimitsReached ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
              Portfolio Risk Control Guard
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-400">Risk Gate:</span>
            {portfolioRisk.riskLimitsReached ? (
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 flex items-center gap-1">
                <AlertOctagon className="w-3 h-3 text-rose-400" />
                LIMITS REACHED (NEW SIGNALS BLOCKED)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                PROTECTION ACTIVE & CLEAR
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Open Positions</span>
            <span className={`font-mono font-black ${portfolioRisk.openPositionsCount >= portfolioRisk.maxOpenPositions ? 'text-rose-400' : 'text-zinc-200'}`}>
              {portfolioRisk.openPositionsCount} / {portfolioRisk.maxOpenPositions} Max
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Correlated Metals</span>
            <span className={`font-mono font-black ${portfolioRisk.correlatedExposure.metals >= 2 ? 'text-rose-400' : 'text-zinc-200'}`}>
              {portfolioRisk.correlatedExposure.metals} / 2 Max
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Consecutive Losses</span>
            <span className={`font-mono font-black ${portfolioRisk.consecutiveLosses >= portfolioRisk.maxConsecutiveLosses ? 'text-rose-400' : 'text-zinc-200'}`}>
              {portfolioRisk.consecutiveLosses} / {portfolioRisk.maxConsecutiveLosses} Circuit
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Active Drawdown</span>
            <span className={`font-mono font-black ${portfolioRisk.currentDrawdownPercent >= portfolioRisk.maxDrawdownPercent ? 'text-rose-400' : 'text-emerald-400'}`}>
              {portfolioRisk.currentDrawdownPercent}% (Max {portfolioRisk.maxDrawdownPercent}%)
            </span>
          </div>
        </div>

        {portfolioRisk.limitViolationReason && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{portfolioRisk.limitViolationReason}</span>
          </div>
        )}
      </div>

      {/* 3. Filter Controls: Approval Status Tabs (Default: APPROVED) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 overflow-x-auto max-w-full">
          <button
            id="filter-approved-tab"
            onClick={() => setGovernanceFilter('APPROVED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              governanceFilter === 'APPROVED'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>APPROVED ({stats.approved})</span>
          </button>

          <button
            id="filter-wait-tab"
            onClick={() => setGovernanceFilter('WAIT')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              governanceFilter === 'WAIT'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>WAITING ({stats.waiting})</span>
          </button>

          <button
            id="filter-blocked-tab"
            onClick={() => setGovernanceFilter('BLOCKED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              governanceFilter === 'BLOCKED'
                ? 'bg-rose-500 text-black shadow-md shadow-rose-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>BLOCKED ({stats.blocked})</span>
          </button>

          <button
            id="filter-all-tab"
            onClick={() => setGovernanceFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              governanceFilter === 'ALL'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            ALL ({stats.total})
          </button>
        </div>

        {/* Direction Filter: ALL / BUY / SELL */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-zinc-500 text-[11px] mr-1">Direction:</span>
          {(['ALL', 'BUY', 'SELL'] as const).map(dir => (
            <button
              key={dir}
              onClick={() => setDirectionFilter(dir)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                directionFilter === dir
                  ? 'bg-zinc-800 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>

      {/* Broadcast Sent Notice */}
      {sentNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{sentNotice}</span>
        </div>
      )}

      {/* 4. Governed Signals Grid */}
      {filteredSignals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
          <Clock className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">No Signals Match Active Filter</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {governanceFilter === 'APPROVED' 
              ? 'No signals currently pass all 7 institutional approval gates. Capital preservation is active.'
              : 'Try selecting a different status tab or direction filter.'}
          </p>
          {governanceFilter !== 'ALL' && (
            <button
              onClick={() => setGovernanceFilter('ALL')}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition"
            >
              View All Governed Signals
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSignals.map(signal => (
            <GovernedSignalCard
              key={signal.id}
              signal={signal}
              isAdmin={isAdmin}
              onSendTelegram={handleSendTelegram}
              onOpenAssetDetail={handleOpenAssetDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
};
