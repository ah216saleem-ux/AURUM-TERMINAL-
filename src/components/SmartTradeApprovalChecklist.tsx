import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Activity,
  Check,
  Zap
} from 'lucide-react';
import { getSmartTradeApprovalChecklist } from '../data/aiValidationData';
import { TradingStyleMode } from '../types';

interface SmartTradeApprovalChecklistProps {
  assetId?: string;
  symbol?: string;
  tradingMode?: TradingStyleMode;
  isCompact?: boolean;
}

export const SmartTradeApprovalChecklist: React.FC<SmartTradeApprovalChecklistProps> = ({
  assetId = 'xau-usd',
  symbol = 'XAU/USD',
  tradingMode = 'INTRADAY',
  isCompact = false
}) => {
  const tm = (tradingMode || 'INTRADAY') as TradingStyleMode;
  const approval = getSmartTradeApprovalChecklist(assetId, symbol, tm);

  return (
    <div className="space-y-3.5 p-4 rounded-2xl bg-[#090b12] border border-amber-500/40 shadow-2xl relative overflow-hidden">
      {/* Glow */}
      <div className={`pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 ${approval.isApproved ? 'bg-emerald-500/10' : 'bg-rose-500/10'} rounded-full blur-2xl`} />

      {/* Header with TRADE APPROVED vs NO TRADE Big Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-syne font-bold text-white tracking-wide uppercase">
              Smart Trade Approval Checklist
            </h4>
            <span className="text-[10px] text-zinc-400 font-mono-num">
              Pre-Execution AI Verification Layer
            </span>
          </div>
        </div>

        {/* OUTPUT BADGE: TRADE APPROVED OR NO TRADE */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 shadow-lg transition-all ${
          approval.isApproved
            ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-emerald-500/20'
            : 'bg-rose-500/15 border-rose-500/60 text-rose-300 shadow-rose-500/20'
        }`}>
          {approval.isApproved ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 animate-pulse" />
          )}
          <div>
            <span className="text-[9px] font-mono-num font-bold uppercase tracking-wider block text-zinc-400 leading-tight">
              AI Decision Output
            </span>
            <span className="text-sm font-syne font-black tracking-wider uppercase">
              {approval.status}
            </span>
          </div>
        </div>
      </div>

      {/* The 6 Strict Checklist Criteria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {approval.items.map((item) => (
          <div 
            key={item.key} 
            className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition ${
              item.passed 
                ? 'bg-neutral-950/80 border-emerald-500/35 hover:border-emerald-500/60' 
                : 'bg-neutral-950/80 border-rose-500/35 hover:border-rose-500/60'
            }`}
          >
            <div className={`mt-0.5 p-1 rounded-md flex-shrink-0 ${
              item.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {item.passed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <XCircle className="w-3.5 h-3.5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-zinc-200 truncate">
                  {item.label}
                </span>
                <span className={`text-[9.5px] font-mono-num font-extrabold px-1.5 py-0.2 rounded ${
                  item.passed ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                }`}>
                  {item.value}
                </span>
              </div>
              <p className="text-[9.5px] font-mono-num text-zinc-400 leading-tight mt-0.5">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rationale Banner */}
      <div className={`p-2.5 rounded-xl border text-xs font-mono-num flex items-center justify-between gap-2 ${
        approval.isApproved 
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
          : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
      }`}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span className="text-[11px] leading-snug">{approval.rationale}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/50 border border-zinc-700 text-zinc-300 flex-shrink-0">
          Score: {approval.approvalScore}/100
        </span>
      </div>
    </div>
  );
};
