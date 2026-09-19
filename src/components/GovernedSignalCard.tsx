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
  Lock,
  Compass,
  Layers,
  Activity,
  BarChart2,
  BrainCircuit,
  Sliders
} from 'lucide-react';
import { GovernedSignal, SignalLifecycleStage } from '../types/signalGovernanceTypes';
import { userService } from '../services/userService';

interface GovernedSignalCardProps {
  signal: GovernedSignal;
  isAdmin?: boolean;
  onSendTelegram?: (signalId: string) => void;
  onOpenAssetDetail?: (assetId: string) => void;
}

const LIFECYCLE_STEPS: { stage: SignalLifecycleStage; label: string }[] = [
  { stage: 'GENERATED', label: 'Generated' },
  { stage: 'VALIDATED', label: 'Validated' },
  { stage: 'APPROVED', label: 'Approved' },
  { stage: 'ACTIVE', label: 'Active' },
  { stage: 'TP1_HIT', label: 'TP1' },
  { stage: 'TP2_HIT', label: 'TP2' },
];

export const GovernedSignalCard: React.FC<GovernedSignalCardProps> = ({
  signal,
  isAdmin: propIsAdmin,
  onSendTelegram,
  onOpenAssetDetail
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isAdminAuditOpen, setIsAdminAuditOpen] = useState<boolean>(false);
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

  // Lifecycle progression helper
  const getLifecycleStepIndex = (stage: SignalLifecycleStage): number => {
    switch (stage) {
      case 'GENERATED': return 0;
      case 'VALIDATED': return 1;
      case 'APPROVED': return 2;
      case 'ACTIVE': return 3;
      case 'TP1_HIT': return 4;
      case 'TP2_HIT': return 5;
      case 'SL_HIT': return 3; // branching off active
      case 'EXPIRED': return 5;
      default: return 2;
    }
  };

  const currentStepIdx = getLifecycleStepIndex(signal.lifecycleStage);

  const formatPrice = (val: number): string => {
    if (!val || isNaN(val)) return '0.00';
    const isFxFourDecimals = signal.symbol.includes('/') && 
      !signal.symbol.includes('XAU') && 
      !signal.symbol.includes('XAG') && 
      !signal.symbol.includes('JPY');
    const decimals = isFxFourDecimals ? 4 : 2;
    return val.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

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
      {/* 1. Header Bar: AURUM SIGNAL & Status Badge */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${
        isApproved 
          ? 'bg-emerald-500/10 border-emerald-500/20' 
          : isWait 
          ? 'bg-amber-500/10 border-amber-500/20' 
          : 'bg-rose-500/10 border-rose-500/20'
      }`}>
        <div className="flex items-center gap-2">
          <div className="text-xs font-black tracking-widest uppercase font-mono text-zinc-300">
            AURUM SIGNAL
          </div>
          <span className="text-zinc-600">•</span>
          <span className="text-[11px] font-mono text-zinc-400 font-bold">
            {signal.timeframe}
          </span>
        </div>

        {/* Status Pill: Green (Approved), Yellow (Wait), Red (Blocked) */}
        <div className="flex items-center gap-1.5">
          {isApproved ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500 text-black flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              APPROVED SIGNAL ✅
            </span>
          ) : isWait ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              WAIT ⏳
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              BLOCKED 🔴
            </span>
          )}
        </div>
      </div>

      {/* 2. Core Trade Information */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Asset, Live Price & Direction Row */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Asset</div>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span>{signal.assetName}</span>
              <span className="text-xs font-mono font-bold text-zinc-400">({signal.symbol})</span>
            </div>
            {signal.currentPrice > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-mono">
                <span className="text-zinc-500">Live Price:</span>
                <span className="font-bold text-amber-300">${formatPrice(signal.currentPrice)}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Direction</div>
            <div className={`text-base font-black px-3 py-1 rounded-xl inline-flex items-center gap-1.5 ${
              isBuy 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{signal.direction}</span>
            </div>
          </div>
        </div>

        {/* Execution Levels Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Entry Zone</span>
            <span className="text-xs font-black text-zinc-100 font-mono">{signal.entryZone}</span>
          </div>
          <div>
            <span className="text-[10px] text-rose-400 block uppercase font-bold">Stop Loss</span>
            <span className="text-xs font-black text-rose-300 font-mono">{formatPrice(signal.stopLoss)}</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 block uppercase font-bold">Take Profit 1</span>
            <span className="text-xs font-black text-emerald-300 font-mono">{formatPrice(signal.takeProfit1)}</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 block uppercase font-bold">Take Profit 2</span>
            <span className="text-xs font-black text-emerald-300 font-mono">{formatPrice(signal.takeProfit2)}</span>
          </div>
        </div>

        {/* Meta Parameters: Trading Mode, Confidence, Risk Level */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Trading Mode</span>
            <span className="text-xs font-black text-amber-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {signal.tradingMode}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Confidence</span>
            <span className="text-xs font-black text-white font-mono">{signal.confidence}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Risk Level</span>
            <span className={`text-xs font-black flex items-center gap-1 ${
              signal.riskLevel === 'LOW' 
                ? 'text-emerald-400' 
                : signal.riskLevel === 'MEDIUM' 
                ? 'text-amber-400' 
                : 'text-rose-400'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              {signal.riskLevel}
            </span>
          </div>
        </div>

        {/* 4. Lifecycle Stepper Tracking */}
        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span className="uppercase font-bold text-zinc-500">Signal Lifecycle:</span>
            <span className="font-bold text-amber-400">{signal.lifecycleStageLabel}</span>
          </div>

          <div className="grid grid-cols-6 gap-1 items-center">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.stage} className="flex flex-col items-center space-y-1">
                  <div className={`w-full h-1.5 rounded-full transition-all ${
                    isPast
                      ? 'bg-emerald-400'
                      : isCurrent
                      ? signal.lifecycleStage === 'SL_HIT' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400 animate-pulse'
                      : 'bg-zinc-800'
                  }`} />
                  <span className={`text-[9px] font-mono truncate ${
                    isCurrent ? 'font-black text-white' : isPast ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blocking / Waiting Notices if not approved */}
        {isBlocked && signal.blockedReason && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-200">Execution Blocked by Risk Gate:</strong>
              {signal.blockedReason}
            </div>
          </div>
        )}

        {isWait && signal.waitReason && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-200">Awaiting Governance Confluence:</strong>
              {signal.waitReason}
            </div>
          </div>
        )}

        {/* 5. Card Footer Actions: Copy Section 7 Output & Telegram */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 gap-2">
          <button
            id={`copy-signal-btn-${signal.id}`}
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-zinc-700"
            title="Copy Clean Institutional Format"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? 'Signal Copied' : 'Copy Signal'}</span>
          </button>

          <div className="flex items-center gap-2">
            {onSendTelegram && isApproved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendTelegram(signal.id);
                }}
                className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Broadcast Approved Signal to Telegram Channel"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Telegram</span>
              </button>
            )}

            {/* Admin Audit Toggle Button */}
            {isAdmin && (
              <button
                id={`admin-audit-toggle-${signal.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdminAuditOpen(!isAdminAuditOpen);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  isAdminAuditOpen 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Audit</span>
                {isAdminAuditOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* 6. ADVANCED DETAILS (ADMIN ONLY) */}
        {isAdmin && isAdminAuditOpen && (
          <div className="pt-3 border-t border-amber-500/20 space-y-3 bg-zinc-900/70 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Institutional Governance Audit (Admin Internal)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                CONFIDENTIAL
              </span>
            </div>

            {/* 7 Gates Status Checklist */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-zinc-300 uppercase">Approval Gates Evaluation:</div>
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
                  <div key={i} className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
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

            {/* Section 3 Required Admin Intelligence Modules */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">1. Gann Alignment</span>
                <span className="text-zinc-200">{signal.adminAudit.gannAlignment}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">2. SMC Confirmation</span>
                <span className="text-zinc-200">{signal.adminAudit.smcConfirmation}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">3. Liquidity Analysis</span>
                <span className="text-zinc-200">{signal.adminAudit.liquidityAnalysis}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">4. AI Multi-Model Agreement</span>
                <span className="text-zinc-200">{signal.adminAudit.aiAgreement}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">5. Market Regime & ATR</span>
                <span className="text-zinc-200">{signal.adminAudit.marketRegime}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">6. Risk Calculations & Sizing</span>
                <div className="text-zinc-200 space-y-0.5">
                  <div>Allocation: {signal.adminAudit.riskCalculations.riskDollars}</div>
                  <div>Recommended Lot Size: {signal.adminAudit.riskCalculations.lotSize}</div>
                  <div>Max Loss: {signal.adminAudit.riskCalculations.maxLossR}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">7. Historical Comparison</span>
                <span className="text-zinc-300">{signal.adminAudit.historicalComparison}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
