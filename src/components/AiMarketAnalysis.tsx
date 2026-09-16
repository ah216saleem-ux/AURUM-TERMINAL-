import React, { useState } from 'react';
import { 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Send, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Bot
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const AiMarketAnalysis: React.FC = () => {
  const { 
    signals, 
    selectedSignalId, 
    setSelectedSignalId, 
    selectedSignal, 
    selectedMarket,
    sendSignalToTelegram
  } = useMarket();

  const [customQuestion, setCustomQuestion] = useState('');
  const [aiChatLog, setAiChatLog] = useState<{ q: string; a: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const isBullish = selectedSignal.trend.includes('Bullish');
  const isBearish = selectedSignal.trend.includes('Bearish');

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const q = customQuestion;
    setCustomQuestion('');
    setIsThinking(true);

    setTimeout(() => {
      let answer = '';
      const qLower = q.toLowerCase();
      if (qLower.includes('risk') || qLower.includes('loss') || qLower.includes('sl')) {
        answer = `For ${selectedSignal.symbol}, risk is capped at $${selectedSignal.stopLoss.toLocaleString()} (${selectedSignal.timeframe} invalidation). Do not risk more than 1.5% of equity.`;
      } else if (qLower.includes('target') || qLower.includes('tp') || qLower.includes('profit')) {
        answer = `Primary target is $${selectedSignal.takeProfit.toLocaleString()} with extended target at $${(selectedSignal.takeProfit2 || selectedSignal.takeProfit * 1.02).toLocaleString()} providing a ${selectedSignal.riskReward} risk-to-reward ratio.`;
      } else if (qLower.includes('entry') || qLower.includes('buy') || qLower.includes('sell')) {
        answer = `Current trade recommendation is ${selectedSignal.type} with optimal fill near $${selectedSignal.entryPrice.toLocaleString()}. Current market is at $${selectedMarket.price.toLocaleString()}.`;
      } else {
        answer = `Aurum AI models detect strong structural resonance for ${selectedSignal.symbol}. Macro factors and institutional order flow indicate high probability continuation toward $${selectedSignal.takeProfit.toLocaleString()}.`;
      }

      setAiChatLog(prev => [...prev, { q, a: answer }]);
      setIsThinking(false);
    }, 800);
  };

  return (
    <section id="ai-analysis-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-num text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>DEEP NEURAL DIAGNOSTICS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-syne tracking-tight">
            AI Market Analysis & Reasoning
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Autonomous trend detection, multi-tier support/resistance maps, and institutional bullish/bearish balance.
          </p>
        </div>

        {/* Asset Selector Tabs */}
        <div className="flex items-center p-1 bg-neutral-900 rounded-xl border border-zinc-800 self-start md:self-auto">
          {signals.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSignalId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold transition cursor-pointer ${
                selectedSignalId === s.id
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Container */}
      <div className="rounded-2xl bg-glass-card border border-amber-500/25 p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Trend Detection & High-Level Stance */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-zinc-800 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white font-mono-num">
                {selectedSignal.symbol} Trend Detection
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono-num">
                {selectedSignal.timeframe} Resolution
              </span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm font-sans pt-1 max-w-2xl leading-relaxed">
              {selectedSignal.bullishBearishReasoning.aiVerdict}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end self-start lg:self-auto">
            <span className="text-[10px] font-mono-num text-zinc-500 uppercase tracking-wider mb-1">
              Trend Status
            </span>
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-mono-num ${
                isBullish
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : isBearish
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isBullish ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{selectedSignal.trend.toUpperCase()}</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono-num mt-1">
              Confidence Rating: <strong className="text-amber-300">{selectedSignal.confidenceScore}%</strong>
            </span>
          </div>
        </div>

        {/* Support & Resistance Architecture */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white font-syne flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Algorithmic Support & Resistance Levels
            </span>
            <span className="text-[11px] font-mono-num text-zinc-500">
              CURRENT SPOT: ${selectedMarket.price.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Supports */}
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-emerald-500/20">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800 text-xs text-emerald-400 font-semibold font-mono-num">
                <span>SUPPORT ZONES (DEMAND BLOCKS)</span>
                <span>BIDS</span>
              </div>
              <div className="space-y-2">
                {selectedSignal.supportLevels.map((lvl, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono-num py-1.5 px-2 rounded bg-zinc-900/60">
                    <span className="text-zinc-400">S{idx + 1} Support</span>
                    <span className="font-bold text-emerald-400">${lvl.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resistances */}
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-rose-500/20">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800 text-xs text-rose-400 font-semibold font-mono-num">
                <span>RESISTANCE ZONES (SUPPLY BLOCKS)</span>
                <span>OFFERS</span>
              </div>
              <div className="space-y-2">
                {selectedSignal.resistanceLevels.map((lvl, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono-num py-1.5 px-2 rounded bg-zinc-900/60">
                    <span className="text-zinc-400">R{idx + 1} Resistance</span>
                    <span className="font-bold text-rose-400">${lvl.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bullish / Bearish Reasoning Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bullish Factors */}
          <div className="p-5 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono-num uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4" />
              <span>Bullish Catalysts & Technical Signals</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300 font-sans">
              {selectedSignal.bullishBearishReasoning.bullishFactors.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bearish Risks & Invalidation */}
          <div className="p-5 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono-num uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4" />
              <span>Bearish Risks & Invalidation Trigger</span>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300 font-sans">
              {selectedSignal.bullishBearishReasoning.bearishRisks.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 pt-3 border-t border-zinc-800 text-xs font-mono-num text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              <strong className="block text-[10px] text-amber-400 uppercase">Invalidation Rule:</strong>
              {selectedSignal.bullishBearishReasoning.invalidationTrigger}
            </div>
          </div>
        </div>

        {/* Interactive AI Assistant Consultation */}
        <div className="p-5 rounded-xl bg-neutral-950 border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white font-syne uppercase tracking-wider">
                Ask Aurum AI Assistant about {selectedSignal.symbol}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono-num">
              Online • Live Telemetry Connected
            </span>
          </div>

          {/* Chat history */}
          {aiChatLog.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {aiChatLog.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="text-zinc-400 font-mono-num flex items-center gap-1">
                    <span className="text-amber-400">User:</span> {item.q}
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                    <strong className="text-amber-300 font-mono-num mr-1">Aurum AI:</strong> {item.a}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prompt Form */}
          <form onSubmit={handleAskAi} className="flex items-center gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder={`Ask about ${selectedSignal.symbol} target, stop loss, risk, or entry timing...`}
              className="flex-1 px-3.5 py-2 rounded-lg bg-neutral-900 border border-zinc-800 text-white text-xs font-mono-num focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={isThinking || !customQuestion.trim()}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isThinking ? 'Analyzing...' : 'Inquire'}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
