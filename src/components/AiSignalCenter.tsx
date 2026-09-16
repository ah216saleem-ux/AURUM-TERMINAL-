import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  Target, 
  Percent, 
  Check, 
  Copy, 
  RefreshCw, 
  Layers, 
  ArrowUpRight,
  Radio,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Gauge
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { AiTradeSignal, SignalType } from '../types';

export const AiSignalCenter: React.FC = () => {
  const { 
    signals, 
    selectedSignalId, 
    setSelectedSignalId, 
    sendSignalToTelegram,
    setIsTelegramModalOpen,
    telegramSettings,
    isAiGenerating,
    regenerateAiSignals,
    markets
  } = useMarket();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL' | 'WAIT'>('ALL');

  const handleCopy = (signal: AiTradeSignal, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `AURUM TERMINAL SIGNAL

Asset: ${signal.symbol} (${signal.name})
Signal: ${signal.type}
Entry: $${signal.entryZone.min.toLocaleString()} - $${signal.entryZone.max.toLocaleString()} (Optimal: $${signal.entryPrice.toLocaleString()})
SL: $${signal.stopLoss.toLocaleString()}
TP: TP1 $${signal.takeProfit.toLocaleString()} | TP2 $${signal.takeProfit2.toLocaleString()}
Timeframe: ${signal.timeframe}
Confidence: ${signal.confidenceScore}%
Reason: ${signal.marketReason}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(signal.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTelegram = async (signalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSendingId(signalId);
    const res = await sendSignalToTelegram(signalId);
    setSendingId(null);
    if (res.success) {
      setSentNotice(res.message);
      setTimeout(() => setSentNotice(null), 3500);
    }
  };

  const filteredSignals = signals.filter(s => {
    if (filterType === 'ALL') return true;
    return s.type === filterType;
  });

  const getSignalBadge = (type: SignalType) => {
    switch (type) {
      case 'BUY':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono-num tracking-wide">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>BUY</span>
          </div>
        );
      case 'SELL':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono-num tracking-wide">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>SELL</span>
          </div>
        );
      case 'WAIT':
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono-num tracking-wide">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>WAIT</span>
          </div>
        );
    }
  };

  return (
    <section id="ai-signals-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Toast notification for telegram send */}
      {sentNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-neutral-900 border border-amber-500/50 shadow-2xl text-xs font-mono-num text-amber-200 flex items-center gap-3 aurum-glow">
          <Send className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>{sentNotice}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-num text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL AI SIGNAL ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-syne tracking-tight">
            AI Trade Signal Center
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
            Real-time autonomous setups for Gold, Silver, NASDAQ 100, S&P 500, and Crude Oil with Smart Money Concepts (SMC) confirmation.
          </p>
        </div>

        {/* Controls: Filter & Regenerate */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Signal Filter Chips */}
          <div className="flex items-center p-1 bg-neutral-900 rounded-xl border border-zinc-800 text-xs font-mono-num">
            {(['ALL', 'BUY', 'SELL', 'WAIT'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  filterType === t 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={regenerateAiSignals}
            disabled={isAiGenerating}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-mono-num flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            title="Recalculate AI market weights and confluence"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isAiGenerating ? 'animate-spin' : ''}`} />
            <span>{isAiGenerating ? 'Scanning SMC...' : 'Re-Scan SMC'}</span>
          </button>
        </div>
      </div>

      {/* Grid of AI Signals (Cards for all 5 assets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSignals.map(signal => {
          const isSelected = selectedSignalId === signal.id;
          const isCopied = copiedId === signal.id;
          const isSending = sendingId === signal.id;
          const liveMarket = markets.find(m => m.id === signal.marketId);
          const livePrice = liveMarket ? liveMarket.price : signal.entryPrice;

          return (
            <div
              key={signal.id}
              onClick={() => setSelectedSignalId(signal.id)}
              className={`relative rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between border ${
                isSelected 
                  ? 'bg-gradient-to-b from-[#16171f] to-[#0c0d12] border-amber-500/60 aurum-glow shadow-xl shadow-amber-500/10 ring-1 ring-amber-400/30' 
                  : 'bg-glass-card border-zinc-800/80 hover:border-amber-500/30 hover:bg-[#111218]'
              }`}
            >
              {/* Top Row: Symbol, Signal Badge, Live Price */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white font-syne tracking-wide">
                        {signal.symbol}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono-num">
                        {signal.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono-num text-zinc-400">Live:</span>
                      <span className="text-sm font-bold font-mono-num text-amber-300">
                        ${livePrice.toLocaleString(undefined, { minimumFractionDigits: liveMarket?.decimals || 2 })}
                      </span>
                    </div>
                  </div>

                  {getSignalBadge(signal.type)}
                </div>

                {/* SMC Tag Badge & Multi-Timeframe Confluence */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono-num font-semibold text-amber-300">
                    SMC: {signal.smc.structure}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-mono-num text-zinc-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{signal.multiTimeframe.agreementCount}/5 MTF Conf</span>
                  </span>
                </div>

                {/* Trade Setup Matrix (Entry, SL, TP1, TP2, R:R, TF) */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-neutral-950/80 border border-zinc-800/90 text-xs font-mono-num">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block">Entry Zone</span>
                    <span className="text-zinc-100 font-bold block truncate">
                      ${signal.entryZone.min.toLocaleString()} - ${signal.entryZone.max.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-amber-400/90 font-mono-num">
                      Optimal: ${signal.entryPrice.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block">Stop Loss (SL)</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-500" />
                      ${signal.stopLoss.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-500">Invalidation</span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60">
                    <span className="text-zinc-500 text-[10px] uppercase block">Take Profit 1 & 2</span>
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <Target className="w-3 h-3 text-emerald-500" />
                      <span>TP1: ${signal.takeProfit.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-emerald-300/80 block">
                      TP2: ${signal.takeProfit2.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60">
                    <span className="text-zinc-500 text-[10px] uppercase block">Risk:Reward / TF</span>
                    <span className="text-amber-300 font-bold block">
                      {signal.riskReward}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      Timeframe: {signal.timeframe}
                    </span>
                  </div>
                </div>

                {/* AI Confidence Meter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono-num">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-amber-400" />
                      <span>AI Model Confidence:</span>
                    </span>
                    <span className="font-bold text-amber-300">{signal.confidenceScore}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${signal.confidenceScore}%` }}
                    />
                  </div>
                </div>

                {/* AI Reason (Why Valid) */}
                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-mono-num text-amber-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Validation Reason:
                  </span>
                  <p className="text-zinc-300 text-xs leading-relaxed font-light line-clamp-3">
                    {signal.marketReason}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Inspect on Chart, Send to Telegram, Copy */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSignalId(signal.id);
                    document.getElementById('live-charts-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono-num font-medium flex items-center gap-1.5 transition border border-zinc-800 cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inspect Chart</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleCopy(signal, e)}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 transition border border-zinc-800 cursor-pointer"
                    title="Copy formatted signal text"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => handleSendTelegram(signal.id, e)}
                    disabled={isSending}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:brightness-110 text-black text-xs font-bold font-mono-num flex items-center gap-1.5 transition cursor-pointer"
                    title={`Send ${signal.symbol} signal to Telegram`}
                  >
                    <Send className={`w-3.5 h-3.5 text-black ${isSending ? 'animate-spin' : ''}`} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
