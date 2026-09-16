import React, { useState } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  Target, 
  Sparkles, 
  Zap,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { SignalType } from '../types';
import { SmartTradeApprovalChecklist } from './SmartTradeApprovalChecklist';
import { AiConfidenceBreakdown } from './AiConfidenceBreakdown';

export const TradeSignalCard: React.FC = () => {
  const { 
    selectedSignal, 
    selectedMarket, 
    tradingStyleMode,
    sendSignalToTelegram,
    setIsTelegramModalOpen
  } = useMarket();

  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const handleCopy = () => {
    const text = `AURUM AI SIGNAL

Asset: ${selectedSignal.symbol} (${selectedSignal.name})
Signal: ${selectedSignal.type}

Entry: $${selectedSignal.entryZone.min.toLocaleString()} - $${selectedSignal.entryZone.max.toLocaleString()} (Optimal: $${selectedSignal.entryPrice.toLocaleString()})
Stop Loss: $${selectedSignal.stopLoss.toLocaleString()}
Take Profit: $${selectedSignal.takeProfit.toLocaleString()} (TP2: $${selectedSignal.takeProfit2.toLocaleString()})

Timeframe: ${selectedSignal.timeframe}
Confidence: ${selectedSignal.confidenceScore}%

Reason:
${selectedSignal.marketReason}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTelegram = async () => {
    setSending(true);
    const res = await sendSignalToTelegram(selectedSignal.id);
    setSending(false);
    if (res.success) {
      setSentNotice(res.message);
      setTimeout(() => setSentNotice(null), 3000);
    }
  };

  const isBuy = selectedSignal.type === 'BUY';
  const isSell = selectedSignal.type === 'SELL';

  return (
    <div className="w-full rounded-2xl bg-glass-card border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6 aurum-glow relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {sentNotice && (
        <div className="p-3 rounded-xl bg-neutral-900 border border-amber-500/60 text-xs font-mono-num text-amber-200 flex items-center gap-2">
          <Send className="w-4 h-4 text-amber-400" />
          <span>{sentNotice}</span>
        </div>
      )}

      {/* Card Header: AURUM AI SIGNAL Brand & Quick Actions */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono-num font-bold text-amber-400 tracking-wider uppercase">
              AURUM AI SIGNAL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-white font-syne">
              {selectedSignal.symbol}
            </h3>
            <span className="text-xs text-zinc-400 font-mono-num">
              ({selectedSignal.name})
            </span>
          </div>
        </div>

        {/* Signal Badge: BUY / SELL / WAIT */}
        <div className="flex items-center gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black font-mono-num tracking-wide border flex items-center gap-1.5 ${
            isBuy 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
              : isSell 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/10'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10'
          }`}>
            {isBuy && <TrendingUp className="w-4 h-4 text-emerald-400" />}
            {isSell && <TrendingDown className="w-4 h-4 text-rose-400" />}
            {!isBuy && !isSell && <Clock className="w-4 h-4 text-amber-400" />}
            <span>{selectedSignal.type}</span>
          </span>
        </div>
      </div>

      {/* Trade Parameters: Entry, Stop Loss, Take Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-num">
        {/* Entry */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-1">
          <span className="text-zinc-500 text-[10px] uppercase font-bold block">Entry Zone / Optimal</span>
          <div className="text-base font-bold text-amber-300">
            ${selectedSignal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
          </div>
          <span className="text-[11px] text-zinc-400 block truncate">
            Zone: ${selectedSignal.entryZone.min.toLocaleString()} - ${selectedSignal.entryZone.max.toLocaleString()}
          </span>
        </div>

        {/* Stop Loss */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-1">
          <span className="text-zinc-500 text-[10px] uppercase font-bold block flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            Stop Loss (SL)
          </span>
          <div className="text-base font-bold text-rose-400">
            ${selectedSignal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
          </div>
          <span className="text-[11px] text-zinc-500 block">
            Invalidation Level
          </span>
        </div>

        {/* Take Profit */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-1">
          <span className="text-zinc-500 text-[10px] uppercase font-bold block flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-400" />
            Take Profit (TP)
          </span>
          <div className="text-base font-bold text-emerald-400">
            ${selectedSignal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
          </div>
          <span className="text-[11px] text-emerald-400/80 block">
            TP2: ${selectedSignal.takeProfit2.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
          </span>
        </div>
      </div>

      {/* Meta: Timeframe, Confidence, Risk/Reward */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl bg-neutral-900/60 border border-zinc-800 text-xs font-mono-num">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Timeframe:</span>
          <span className="font-bold text-white px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
            {selectedSignal.timeframe}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Confidence:</span>
          <span className="font-bold text-amber-300">
            {selectedSignal.confidenceScore}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Risk/Reward:</span>
          <span className="font-bold text-emerald-400">
            {selectedSignal.riskReward}
          </span>
        </div>
      </div>

      {/* Short AI Reason Explanation */}
      <div className="p-4 rounded-xl bg-neutral-950/70 border border-zinc-800/80 space-y-1.5">
        <span className="text-[11px] uppercase font-mono-num font-bold text-amber-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          AI Execution Reason:
        </span>
        <p className="text-zinc-300 text-xs leading-relaxed font-light">
          {selectedSignal.marketReason}
        </p>
      </div>

      {/* AI VALIDATION LAYER: Approval Checklist & Confidence Breakdown */}
      <div className="space-y-4 pt-2 border-t border-zinc-800/80">
        <SmartTradeApprovalChecklist
          assetId={selectedMarket.id}
          symbol={selectedSignal.symbol}
          tradingMode={tradingStyleMode}
        />

        <AiConfidenceBreakdown
          assetId={selectedMarket.id}
          timeframe={selectedSignal.timeframe}
          tradingMode={tradingStyleMode}
        />
      </div>

      {/* Action Buttons: Copy Signal & Telegram Wire */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono-num font-semibold border border-zinc-800 transition flex items-center gap-2 cursor-pointer"
          title="Copy formatted signal"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
          <span>{copied ? 'Signal Copied' : 'Copy Signal'}</span>
        </button>

        <button
          onClick={handleSendTelegram}
          disabled={sending}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:brightness-110 text-black font-bold text-xs font-mono-num flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          <Send className={`w-3.5 h-3.5 text-black ${sending ? 'animate-spin' : ''}`} />
          <span>{sending ? 'Dispatching...' : 'Send to Telegram'}</span>
        </button>
      </div>
    </div>
  );
};
