import React, { useState } from 'react';
import { 
  PhaseXResult 
} from './PhaseXTypes';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Target, 
  Activity, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2 
} from 'lucide-react';

interface PhaseXActiveTradeCardProps {
  result: PhaseXResult;
  onRefresh: () => void;
}

export const PhaseXActiveTradeCard: React.FC<PhaseXActiveTradeCardProps> = ({ result, onRefresh }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const liveDetails = result.liveTradeDetails;
  const decimals = result.engineDetails?.decimals || 2;
  const currentPrice = result.currentLivePrice;
  const isDataInterrupted = result.isDataInterrupted || liveDetails?.isDataInterrupted;

  const entry = liveDetails?.lockedEntry ?? result.preferredEntry;
  const sl = liveDetails?.lockedSL ?? result.stopLoss;
  const tp1 = liveDetails?.lockedTP1 ?? result.takeProfit1;
  const tp2 = liveDetails?.lockedTP2 ?? result.takeProfit2;
  const risk = liveDetails?.originalRisk ?? result.riskDistance;
  const liveR = result.liveProgressR ?? liveDetails?.currentLiveR ?? null;
  const state = liveDetails?.lifecycleState ?? result.lifecycleState ?? 'WAITING_FOR_ENTRY';
  const statusLabel = liveDetails?.displayStatusLabel ?? result.displayStatusLabel ?? 'WAITING FOR ENTRY';

  const isBuy = result.finalDirection === 'BUY';
  const isSell = result.finalDirection === 'SELL';
  const setupType = result.setupType || liveDetails?.setupType || result.engineDetails?.strategyTelemetry?.setupTypeLabel || 'WYCKOFF STRUCTURE';

  // Manual cancellation handler (WAITING_FOR_ENTRY only)
  const handleCancelSetup = async () => {
    if (!result.setupId || state !== 'WAITING_FOR_ENTRY') return;
    setIsCancelling(true);
    setCancelMessage(null);
    try {
      const res = await fetch('/api/phase-x/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupId: result.setupId,
          assetId: result.assetId
        })
      });
      const data = await res.json();
      if (data.success) {
        setCancelMessage('Setup cancelled successfully.');
        onRefresh();
      } else {
        setCancelMessage(data.message || 'Unable to cancel setup.');
      }
    } catch (err: any) {
      setCancelMessage('Network error while cancelling setup.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Status color styles
  const getStatusBadgeStyle = () => {
    switch (state) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/10';
      case 'TP1_HIT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10';
      case 'TP2_HIT':
      case 'COMPLETED':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sky-500/10';
      case 'STOP_LOSS_HIT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/10';
      case 'CANCELLED_BY_USER':
      case 'INVALIDATED_BEFORE_ENTRY':
      case 'EXPIRED':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'WAITING_FOR_ENTRY':
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    }
  };

  // Live R color
  const getLiveRStyle = () => {
    if (liveR == null) return 'text-zinc-400';
    if (liveR > 0) return 'text-emerald-400';
    if (liveR < 0) return 'text-rose-400';
    return 'text-amber-300';
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#0e111d] to-[#07090f] border border-amber-500/40 shadow-2xl space-y-4 font-mono-num relative overflow-hidden">
      {/* Ambient background accent */}
      <div className={`pointer-events-none absolute -top-16 inset-x-0 h-32 blur-3xl opacity-20 ${
        state === 'ACTIVE' || state === 'TP1_HIT' ? 'bg-emerald-500' : state === 'STOP_LOSS_HIT' ? 'bg-rose-500' : 'bg-amber-500'
      }`} />

      {/* Stale Data Protection Warning Banner (Section 18) */}
      {isDataInterrupted && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/60 text-amber-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">LIVE DATA INTERRUPTED</span>
            <span className="text-zinc-400">— Market price feed delayed. Locked levels preserved.</span>
          </div>
          <span className="text-[10px] text-amber-400 uppercase font-bold">Safety Lock Active</span>
        </div>
      )}

      {/* Gap Execution Uncertainty Banner (Section 12) */}
      {liveDetails?.gapExecutionUncertainty && (
        <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-[11px] font-mono flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span><strong>PRICE GAP OBSERVED:</strong> {liveDetails.gapDetails || 'Level crossed via price jump. Evaluated at first verified tick.'}</span>
        </div>
      )}

      {/* Top Header: Asset info and Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-zinc-400">
              {result.assetName}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {setupType}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <span>{result.symbol}</span>
            <span className="text-xs font-mono font-bold text-zinc-400">
              Live: <strong className="text-amber-300">{currentPrice ? currentPrice.toFixed(decimals) : '—'}</strong>
            </span>
          </div>
        </div>

        {/* Direction & Live Status */}
        <div className="flex items-center gap-2">
          {/* Direction Pill */}
          <div className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm tracking-wider flex items-center gap-1.5 border ${
            isBuy 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' 
              : isSell 
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' 
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
          }`}>
            {isBuy && <TrendingUp className="w-4 h-4 text-emerald-400" />}
            {isSell && <TrendingDown className="w-4 h-4 text-rose-400" />}
            <span>{result.finalDirection}</span>
          </div>

          {/* Lifecycle Status Pill */}
          <div className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider border shadow-md flex items-center gap-1.5 ${getStatusBadgeStyle()}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Live Trade Progress Metric (R-Multiple) */}
      <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Live Trade Progress:
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-base sm:text-lg font-mono font-black tracking-wide ${getLiveRStyle()}`}>
            {liveR != null ? `${liveR > 0 ? '+' : ''}${liveR.toFixed(2)}R` : '0.00R'}
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            (1R = {risk ? risk.toFixed(decimals) : '—'} pts)
          </span>
        </div>
      </div>

      {/* 4 Core Locked Trade Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
        {/* 1. Entry Price */}
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 relative overflow-hidden">
          <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold flex items-center justify-center gap-1">
            <Target className="w-3 h-3 text-amber-400" />
            <span>Entry Price</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-400 mt-1">
            {entry != null ? entry.toFixed(decimals) : '—'}
          </div>
          <div className="text-[9.5px] font-mono text-zinc-400 mt-0.5">
            Zone: {result.entryZoneLow?.toFixed(decimals)} – {result.entryZoneHigh?.toFixed(decimals)}
          </div>
        </div>

        {/* 2. Protected Stop Loss */}
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-rose-500/30 relative overflow-hidden">
          <div className="text-[10px] font-mono text-rose-300 uppercase font-semibold flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Protected SL</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-400 mt-1">
            {sl != null ? sl.toFixed(decimals) : '—'}
          </div>
          <div className="text-[9.5px] font-mono text-zinc-400 mt-0.5">
            Initial Risk: -1.0R ({risk ? risk.toFixed(decimals) : '—'})
          </div>
        </div>

        {/* 3. Take Profit 1 */}
        <div className={`p-3 rounded-xl border relative overflow-hidden ${
          liveDetails?.tp1Timestamp ? 'bg-emerald-500/15 border-emerald-500/60' : 'bg-zinc-900/90 border-emerald-500/30'
        }`}>
          <div className="text-[10px] font-mono text-emerald-300 uppercase font-semibold flex items-center justify-center gap-1">
            {liveDetails?.tp1Timestamp ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <TrendingUp className="w-3 h-3 text-emerald-400" />}
            <span>Take Profit 1</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
            {tp1 != null ? tp1.toFixed(decimals) : '—'}
          </div>
          <div className="text-[9.5px] font-mono text-emerald-400/80 mt-0.5">
            {liveDetails?.tp1Timestamp ? 'HIT (2.0R Achieved)' : 'Target: 1:2 R:R (2.0R)'}
          </div>
        </div>

        {/* 4. Take Profit 2 */}
        <div className={`p-3 rounded-xl border relative overflow-hidden ${
          liveDetails?.tp2Timestamp ? 'bg-emerald-500/20 border-emerald-500/70' : 'bg-zinc-900/90 border-emerald-500/40'
        }`}>
          <div className="text-[10px] font-mono text-emerald-300 uppercase font-semibold flex items-center justify-center gap-1">
            {liveDetails?.tp2Timestamp ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <TrendingUp className="w-3 h-3 text-emerald-400" />}
            <span>Take Profit 2</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
            {tp2 != null ? tp2.toFixed(decimals) : '—'}
          </div>
          <div className="text-[9.5px] font-mono text-emerald-400/80 mt-0.5">
            {liveDetails?.tp2Timestamp ? 'HIT (3.0R Complete)' : 'Target: 1:3 R:R (3.0R)'}
          </div>
        </div>
      </div>

      {/* Pre-Activation Manual Cancellation Control (Section 23) */}
      {state === 'WAITING_FOR_ENTRY' && (
        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] font-mono text-zinc-400">
            Setup is pending execution. You may cancel this opportunity prior to entry activation.
          </div>
          <button
            onClick={handleCancelSetup}
            disabled={isCancelling}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isCancelling ? 'CANCELLING...' : 'CANCEL SETUP'}</span>
          </button>
        </div>
      )}

      {cancelMessage && (
        <div className="text-[11px] font-mono text-amber-300 text-center">
          {cancelMessage}
        </div>
      )}

      {/* Telemetry Footer */}
      <div className="text-[10px] font-mono text-zinc-400 pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-zinc-400" />
          <span>Locked Setup ID: <strong className="text-zinc-300">{result.setupId}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Strategy: <strong className="text-amber-300">{setupType}</strong></span>
          <span className="text-zinc-600">•</span>
          <span>Confidence: <strong className="text-emerald-400">{result.tradeConfidence}%</strong></span>
          <span className="text-zinc-600">•</span>
          <span>Max Concurrent: <strong className="text-zinc-300">1</strong></span>
        </div>
      </div>
    </div>
  );
};
