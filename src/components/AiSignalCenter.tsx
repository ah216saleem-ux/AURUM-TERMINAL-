import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  Target, 
  Check, 
  Copy, 
  RefreshCw, 
  Zap, 
  Crosshair, 
  BrainCircuit,
  Trophy,
  ChevronDown,
  ShieldCheck,
  Flame,
  ArrowUpDown
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { AiTradeSignal, SignalType } from '../types';
import { rankSignalsByOpportunity, SignalRankMetric } from '../utils/signalRankingHelper';

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

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL' | 'WAIT'>('ALL');
  const [sortByRanking, setSortByRanking] = useState<boolean>(true);
  const [expandedReasoningIds, setExpandedReasoningIds] = useState<Record<string, boolean>>({});
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Tick clock every second for countdown timer accuracy
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Confluence & Opportunity Ranking for all assets
  const rankedSignalMetrics = useMemo(() => {
    return rankSignalsByOpportunity(signals, markets);
  }, [signals, markets]);

  const toggleReasoning = (signalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedReasoningIds(prev => ({
      ...prev,
      [signalId]: !prev[signalId]
    }));
  };

  const handleCopy = (signal: AiTradeSignal, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `AURUM TERMINAL SIGNAL

Asset: ${signal.symbol} (${signal.name})
Signal: ${signal.type}
Grade: ${signal.setupStrength?.grade || 'A+'}
Confidence: ${signal.confidenceScore}%
AI Consensus: AURUM: ${signal.type} ✅ | Qwen: ${signal.type} ✅ (2/2 Confirmed)
Entry: $${signal.entryZone.min.toLocaleString()} - $${signal.entryZone.max.toLocaleString()} (Optimal: $${signal.entryPrice.toLocaleString()})
SL: $${signal.stopLoss.toLocaleString()}
TP1: $${signal.takeProfit.toLocaleString()}
TP2: $${signal.takeProfit2.toLocaleString()}
Timeframe: ${signal.timeframe}
Valid for: 4 Hours`;
    
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

  // Filter and sort items based on Opportunity Ranking
  const displayItems = useMemo(() => {
    let items = [...rankedSignalMetrics];
    if (filterType !== 'ALL') {
      items = items.filter(item => item.signal.type === filterType);
    }
    if (sortByRanking) {
      // Already ranked #1, #2, #3...
      return items;
    } else {
      // Natural order
      return items.sort((a, b) => {
        const indexA = signals.findIndex(s => s.id === a.signal.id);
        const indexB = signals.findIndex(s => s.id === b.signal.id);
        return indexA - indexB;
      });
    }
  }, [rankedSignalMetrics, filterType, sortByRanking, signals]);

  const getSignalBadge = (type: SignalType) => {
    switch (type) {
      case 'BUY':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-black font-mono-num tracking-wide shadow-sm shadow-emerald-500/10">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>BUY</span>
          </div>
        );
      case 'SELL':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/50 text-xs font-black font-mono-num tracking-wide shadow-sm shadow-rose-500/10">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>SELL</span>
          </div>
        );
      case 'WAIT':
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-black font-mono-num tracking-wide shadow-sm shadow-amber-500/10">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>WAIT</span>
          </div>
        );
    }
  };

  // Helper for countdown computation
  const getCountdownString = (signal: AiTradeSignal) => {
    let gen = currentTime - 1800000;
    const rawTimestamp = (signal as any).timestamp;
    const rawGen = signal.generatedAt;

    if (typeof rawTimestamp === 'number' && !isNaN(rawTimestamp)) {
      gen = rawTimestamp;
    } else if (typeof rawTimestamp === 'string') {
      const parsed = new Date(rawTimestamp).getTime();
      if (!isNaN(parsed)) gen = parsed;
    } else if (typeof rawGen === 'string') {
      const parsed = new Date(rawGen).getTime();
      if (!isNaN(parsed)) {
        gen = parsed;
      } else if (rawGen.toLowerCase().includes('just now')) {
        gen = currentTime;
      } else {
        const matchMin = rawGen.match(/(\d+)\s*min/i);
        if (matchMin) {
          gen = currentTime - parseInt(matchMin[1], 10) * 60 * 1000;
        } else {
          const matchHour = rawGen.match(/(\d+)\s*h/i);
          if (matchHour) {
            gen = currentTime - parseInt(matchHour[1], 10) * 3600 * 1000;
          }
        }
      }
    }
    
    const expiry = gen + 4 * 3600 * 1000;
    const diff = expiry - currentTime;
    if (diff <= 0 || signal.isExpired) return 'EXPIRED';

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

      {/* Section Header with Rank Telemetry */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-num text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>SIGNAL RANKING & OPPORTUNITY CENTER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-syne tracking-tight">
            AI Trade Signal Intelligence
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl font-sans">
            Ranked by Confidence, Dual AI Agreement, Risk:Reward, News Safety, and Market Structure Quality.
          </p>
        </div>

        {/* Controls: Ranking Sort & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Rank Sort */}
          <button
            onClick={() => setSortByRanking(!sortByRanking)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono-num font-bold flex items-center gap-1.5 transition cursor-pointer ${
              sortByRanking 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20' 
                : 'bg-neutral-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{sortByRanking ? 'Top Opportunities First' : 'Default Asset Order'}</span>
          </button>

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
            <span>{isAiGenerating ? 'Scanning...' : 'Re-Scan'}</span>
          </button>
        </div>
      </div>

      {/* Top 3 Opportunity Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {rankedSignalMetrics.slice(0, 3).map((metric, idx) => {
          const sig = metric.signal;
          const isTop1 = idx === 0;
          return (
            <div
              key={`top-bar-${sig.id}`}
              onClick={() => setSelectedSignalId(sig.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer relative overflow-hidden flex items-center justify-between ${
                isTop1 
                  ? 'bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 border-amber-500/50 shadow-md shadow-amber-500/10' 
                  : 'bg-neutral-900/60 border-zinc-800 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg font-mono-num font-extrabold text-xs flex items-center justify-center ${
                  idx === 0 
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30' 
                    : idx === 1 
                    ? 'bg-zinc-300 text-black' 
                    : 'bg-amber-700/80 text-amber-100'
                }`}>
                  #{metric.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white font-mono-num">{sig.symbol}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                      sig.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : sig.type === 'SELL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {sig.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono-num block">
                    Confluence Score: <strong className="text-amber-300">{metric.totalScore}/100</strong>
                  </span>
                </div>
              </div>

              <div className="text-right font-mono-num">
                <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Grade</span>
                <span className="text-xs font-black text-amber-300">{metric.structureQuality} ({metric.confidenceScore}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid of Simplified AI Signal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map(({ signal, rank, totalScore, structureQuality, aiAgreement, newsSafety }) => {
          const isSelected = selectedSignalId === signal.id;
          const isCopied = copiedId === signal.id;
          const isSending = sendingId === signal.id;
          const liveMarket = markets.find(m => m.id === signal.marketId);
          const decimals = liveMarket?.decimals || 2;
          const grade = signal.setupStrength?.grade || structureQuality || 'A+';
          const isExpanded = !!expandedReasoningIds[signal.id];
          const countdown = getCountdownString(signal);
          const isExpired = countdown === 'EXPIRED';

          return (
            <div
              key={signal.id}
              onClick={() => setSelectedSignalId(signal.id)}
              className={`relative rounded-2xl p-5 sm:p-6 transition-all cursor-pointer flex flex-col justify-between border space-y-4 ${
                isSelected 
                  ? 'bg-gradient-to-b from-[#181922] to-[#0c0d12] border-amber-500/70 aurum-glow shadow-2xl shadow-amber-500/10 ring-1 ring-amber-400/40' 
                  : 'bg-glass-card border-zinc-800/90 hover:border-amber-500/40 hover:bg-[#111218]'
              }`}
            >
              {/* Header: Asset, Rank Badge, Signal & Grade */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono-num text-xs font-extrabold border border-amber-500/40">
                        #{rank} TOP SETUP
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono-num font-bold">
                        GRADE {grade}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white font-syne tracking-tight">
                        {signal.symbol}
                      </h3>
                      <span className="text-xs text-zinc-400 font-sans">
                        ({signal.name})
                      </span>
                    </div>
                  </div>

                  {getSignalBadge(signal.type)}
                </div>

                {/* Confidence Bar & Dual AI Agreement */}
                <div className="p-3 rounded-xl bg-neutral-950/90 border border-zinc-800 space-y-2 text-xs font-mono-num">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px] font-bold uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Confidence:
                    </span>
                    <span className="font-extrabold text-amber-300 text-sm">{signal.confidenceScore}%</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${signal.confidenceScore}%` }}
                    />
                  </div>

                  {/* AURUM + Qwen Agreement */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[11px]">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
                      <span>AURUM + Qwen:</span>
                    </span>
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <span>{aiAgreement}</span>
                      <span>✅</span>
                    </span>
                  </div>
                </div>

                {/* Core Trade Parameters: Entry, SL, TP1, TP2 */}
                {isExpired ? (
                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                    <span className="text-xs text-zinc-500 font-bold uppercase block">Setup Expired</span>
                    <span className="text-[11px] text-zinc-600">Wait for next candle confirmation</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-neutral-950/90 border border-zinc-800/90 text-xs font-mono-num">
                    {/* Entry */}
                    <div className="space-y-0.5">
                      <span className="text-zinc-500 text-[10px] uppercase font-semibold block">Entry Optimal</span>
                      <span className="text-amber-300 font-black text-sm block">
                        ${signal.entryPrice.toLocaleString(undefined, { minimumFractionDigits: decimals })}
                      </span>
                    </div>

                    {/* Stop Loss */}
                    <div className="space-y-0.5">
                      <span className="text-rose-500/90 text-[10px] uppercase font-semibold block flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-500" />
                        Stop Loss (SL)
                      </span>
                      <span className="text-rose-400 font-black text-sm block">
                        ${signal.stopLoss.toLocaleString(undefined, { minimumFractionDigits: decimals })}
                      </span>
                    </div>

                    {/* Take Profit 1 */}
                    <div className="space-y-0.5 pt-1.5 border-t border-zinc-900">
                      <span className="text-emerald-500/90 text-[10px] uppercase font-semibold block flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-500" />
                        Take Profit 1 (TP1)
                      </span>
                      <span className="text-emerald-400 font-black text-sm block">
                        ${signal.takeProfit.toLocaleString(undefined, { minimumFractionDigits: decimals })}
                      </span>
                    </div>

                    {/* Take Profit 2 */}
                    <div className="space-y-0.5 pt-1.5 border-t border-zinc-900">
                      <span className="text-emerald-500/90 text-[10px] uppercase font-semibold block flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-500" />
                        Take Profit 2 (TP2)
                      </span>
                      <span className="text-emerald-300 font-black text-sm block">
                        ${signal.takeProfit2.toLocaleString(undefined, { minimumFractionDigits: decimals })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Countdown Timer Strip */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs font-mono-num">
                  <span className="text-zinc-400 text-[11px] font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Countdown:</span>
                  </span>
                  <span className={`font-black ${isExpired ? 'text-zinc-500' : 'text-emerald-400'}`}>
                    {countdown}
                  </span>
                </div>

                {/* Expandable AI Reasoning Section */}
                <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/70 overflow-hidden">
                  <button
                    onClick={(e) => toggleReasoning(signal.id, e)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left text-zinc-300 hover:text-white transition cursor-pointer"
                  >
                    <span className="text-[11px] font-bold uppercase font-mono-num flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Detailed AI Reasoning
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-zinc-800/80 space-y-2 text-xs font-sans text-zinc-300">
                      <p className="leading-relaxed text-[11.5px]">
                        <strong>Setup Context:</strong> {signal.marketReason}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 font-mono-num text-[10.5px] text-zinc-400">
                        <span>Risk:Reward: <strong className="text-amber-300">{signal.riskReward}</strong></span>
                        <span>News Risk: <strong className="text-emerald-400">{newsSafety}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Inspect Chart, Send Telegram, Copy */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
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
