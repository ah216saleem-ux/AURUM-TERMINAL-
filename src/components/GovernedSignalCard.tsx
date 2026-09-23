import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Send,
  Zap,
  Info,
  Power,
  RotateCcw
} from 'lucide-react';
import { GovernedSignal } from '../types/signalGovernanceTypes';
import { userService } from '../services/userService';
import { signalGovernanceService, ALLOWED_PAIRS } from '../services/signalGovernanceService';

interface GovernedSignalCardProps {
  signal: GovernedSignal;
  isAdmin?: boolean;
  onSendTelegram?: (signalId: string) => void;
  onOpenAssetDetail?: (assetId: string) => void;
  onRefreshGovernance?: () => void;
}

export const GovernedSignalCard: React.FC<GovernedSignalCardProps> = ({
  signal,
  isAdmin: propIsAdmin,
  onSendTelegram,
  onOpenAssetDetail,
  onRefreshGovernance
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const isAdmin = propIsAdmin ?? (userService.getRole() === 'ADMIN');

  const isApproved = signal.status === 'APPROVED';
  const isWait = signal.status === 'WAIT';
  const isBlocked = signal.status === 'BLOCKED';
  const isBuy = signal.direction === 'BUY';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(signal.formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleForceClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to FORCE CLOSE signal for ${signal.symbol}?`)) {
      signalGovernanceService.forceCloseSignal(signal.id);
      if (onRefreshGovernance) onRefreshGovernance();
    }
  };

  const handleResetCircuitBreaker = (e: React.MouseEvent) => {
    e.stopPropagation();
    signalGovernanceService.resetCircuitBreaker();
    alert('Circuit Breaker reset successfully. Fresh signal scanning resumed.');
    if (onRefreshGovernance) onRefreshGovernance();
  };

  const handleTogglePair = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const currentActive = signalGovernanceService.isPairActive(symbol);
    signalGovernanceService.setPairActive(symbol, !currentActive);
    if (onRefreshGovernance) onRefreshGovernance();
  };

  const formatPrice = (val: number): string => {
    if (!val || isNaN(val)) return '0.00';
    const decimals = signalGovernanceService.getPairDecimals(signal.symbol);
    return val.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  // Progress Bar percentage calculation: Entry -> TP1 -> TP2
  const calcProgressPercent = (): number => {
    const cp = signal.currentPrice || signal.entryPrice;
    const ep = signal.entryPrice;
    const tp2 = signal.takeProfit2;

    if (signal.lifecycleStage === 'TP2_HIT') return 100;
    if (signal.lifecycleStage === 'TP1_HIT') return 60;
    if (signal.lifecycleStage === 'SL_HIT') return 0;

    const totalDist = Math.abs(tp2 - ep);
    if (totalDist === 0) return 20;

    const currDist = isBuy ? cp - ep : ep - cp;
    if (currDist <= 0) return 10;
    
    const pct = Math.min(100, Math.max(10, Math.round((currDist / totalDist) * 100)));
    return pct;
  };

  const progressPct = calcProgressPercent();

  return (
    <div 
      id={`governed-card-${signal.id}`}
      onClick={() => onOpenAssetDetail && onOpenAssetDetail(signal.assetId)}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-zinc-950/90 text-white shadow-xl ${
        isApproved
          ? 'border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-500/5'
          : isWait
          ? 'border-amber-500/30 hover:border-amber-500/60 shadow-amber-500/5'
          : 'border-rose-500/30 hover:border-rose-500/60 shadow-rose-500/5 opacity-85'
      }`}
    >
      {/* 1. Header Bar: Pair, Direction, Live Price, Status Badge */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${
        isApproved 
          ? 'bg-emerald-500/10 border-emerald-500/20' 
          : isWait 
          ? 'bg-amber-500/10 border-amber-500/20' 
          : 'bg-rose-500/10 border-rose-500/20'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wider text-white font-mono">
              {signal.symbol}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg inline-flex items-center gap-1 ${
              isBuy 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{signal.direction}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs font-mono">
            <span className="text-zinc-500">Live:</span>
            <span className="font-bold text-amber-300">${formatPrice(signal.currentPrice)}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Single Clean Status Badge */}
        <div className="flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1 shadow-sm font-mono ${
            signal.lifecycleStage === 'TP2_HIT'
              ? 'bg-emerald-400 text-black'
              : signal.lifecycleStage === 'TP1_HIT'
              ? 'bg-emerald-500 text-black'
              : signal.lifecycleStage === 'SL_HIT'
              ? 'bg-rose-500 text-white'
              : isApproved
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
              : isWait
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
          }`}>
            {signal.lifecycleStage === 'TP2_HIT' ? (
              <>🏆 {signal.statusLabel}</>
            ) : signal.lifecycleStage === 'TP1_HIT' ? (
              <>🎯 {signal.statusLabel}</>
            ) : signal.lifecycleStage === 'SL_HIT' ? (
              <>❌ {signal.statusLabel}</>
            ) : isApproved ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {signal.statusLabel}</>
            ) : isWait ? (
              <><Clock className="w-3.5 h-3.5 text-amber-400" /> {signal.statusLabel}</>
            ) : (
              <><AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> {signal.statusLabel}</>
            )}
          </span>
        </div>
      </div>

      {/* 2. Core Trade Information */}
      <div className="p-4 space-y-3.5">
        {/* Execution Levels Grid (4 Boxes: Entry, SL, TP1, TP2) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold font-mono">Entry Zone</span>
            <span className="text-xs font-black text-zinc-100 font-mono">{signal.entryZone}</span>
          </div>
          <div>
            <span className="text-[10px] text-rose-400 block uppercase font-bold font-mono">Stop Loss (SL)</span>
            <span className="text-xs font-black text-rose-300 font-mono">{formatPrice(signal.stopLoss)}</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 block uppercase font-bold font-mono">Target 1 (TP1)</span>
            <span className="text-xs font-black text-emerald-300 font-mono">{formatPrice(signal.takeProfit1)}</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 block uppercase font-bold font-mono">Target 2 (TP2)</span>
            <span className="text-xs font-black text-emerald-300 font-mono">{formatPrice(signal.takeProfit2)}</span>
          </div>
        </div>

        {/* Confidence & Risk Level Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Confidence</span>
            <span className="text-xs font-black text-amber-300 font-mono">{signal.confidence}% Dual Consensus</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Risk Level</span>
            <span className="text-xs font-black text-emerald-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              1:2.0 ({signal.riskLevel})
            </span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Trading Mode</span>
            <span className="text-xs font-black text-white font-mono flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {signal.tradingMode}
            </span>
          </div>
        </div>

        {/* Progress Bar (Entry -> TP1 -> TP2) & Floating P/L in R */}
        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500 uppercase font-bold">Execution Trajectory:</span>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Floating P/L:</span>
              <span className={`font-black px-2 py-0.5 rounded text-xs ${
                (signal.pnlR || 0) >= 0 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {(signal.pnlR || 0) >= 0 ? '+' : ''}{(signal.pnlR || 0).toFixed(2)}R
              </span>
            </div>
          </div>

          {/* Progress Line */}
          <div className="relative w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 transition-all duration-300" 
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono font-bold">
            <span>Entry (${formatPrice(signal.entryPrice)})</span>
            <span>TP1 (${formatPrice(signal.takeProfit1)})</span>
            <span>TP2 (${formatPrice(signal.takeProfit2)})</span>
          </div>
        </div>

        {/* Blocking / Waiting Reasons if applicable */}
        {isBlocked && signal.blockedReason && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-200">Execution Guard Status:</strong>
              {signal.blockedReason}
            </div>
          </div>
        )}

        {isWait && signal.waitReason && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-200">Awaiting Governance Confluence:</strong>
              {signal.waitReason}
            </div>
          </div>
        )}

        {/* Action Buttons: Copy Signal, Send Telegram, Details Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 gap-2">
          <button
            id={`copy-signal-btn-${signal.id}`}
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-zinc-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? 'Copied' : 'Copy Signal'}</span>
          </button>

          <div className="flex items-center gap-2">
            {onSendTelegram && isApproved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendTelegram(signal.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Telegram</span>
              </button>
            )}

            {/* Details Accordion Toggle */}
            <button
              id={`details-toggle-${signal.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border ${
                showDetails 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Details</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3. COLLAPSIBLE DETAILS AREA */}
        {showDetails && (
          <div className="pt-3 border-t border-amber-500/20 space-y-3 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800/80">
            {/* 7 Gates Status Checklist */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>7 Institutional Governance Gates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  signal.approvalGates.marketRegime,
                  signal.approvalGates.engineRecommendation,
                  signal.approvalGates.aiValidation,
                  signal.approvalGates.riskLevel,
                  signal.approvalGates.newsStatus,
                  signal.approvalGates.qualityScore,
                  signal.approvalGates.exposureLimits
                ].map((gate, i) => (
                  <div key={i} className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-zinc-200 text-[11px]">{gate.name}</div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[170px]">{gate.value}</div>
                    </div>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      gate.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {gate.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ADMIN CONTROLS SECTION */}
            {isAdmin && (
              <div className="pt-2 border-t border-zinc-800 space-y-3 font-mono">
                <div className="text-[11px] font-bold text-amber-400 uppercase flex items-center justify-between">
                  <span>Administrator Operational Controls</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    ADMIN
                  </span>
                </div>

                {/* Admin Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleForceClose}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Power className="w-3.5 h-3.5 text-rose-400" />
                    <span>Force Close Signal</span>
                  </button>

                  <button
                    onClick={handleResetCircuitBreaker}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset Circuit Breaker</span>
                  </button>
                </div>

                {/* Pairs Active / Inactive Toggles */}
                <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">
                    Institutional Pairs Control (Active/Inactive):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ALLOWED_PAIRS.map((sym) => {
                      const isActive = signalGovernanceService.isPairActive(sym);
                      return (
                        <button
                          key={sym}
                          onClick={(e) => handleTogglePair(e, sym)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                          <span>{sym}: {isActive ? 'ON' : 'OFF'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
