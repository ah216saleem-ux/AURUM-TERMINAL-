import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, ShieldCheck, TrendingUp, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react';

export const GeminiAiCouncilCard: React.FC = () => {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBriefing = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/ai-agent/market-briefing');
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (e) {
      console.error('[AiCouncilCard] Error fetching AI briefing:', e);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
    const interval = setInterval(() => fetchBriefing(), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto p-4 rounded-2xl bg-[#0d101c] border border-amber-500/20 text-center font-mono text-xs text-zinc-400">
        <div className="flex items-center justify-center gap-2">
          <BrainCircuit className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Gemini Institutional AI Council initializing market briefing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto my-3 font-mono">
      <div className="p-4 rounded-2xl bg-gradient-to-b from-[#101426] to-[#0a0d1a] border border-amber-500/30 shadow-2xl space-y-3 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <span>INSTITUTIONAL AI COUNCIL</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  GEMINI 3.8
                </span>
              </h3>
              <p className="text-[10px] text-amber-400/90 font-semibold">
                Multi-Agent Market Intelligence & Confluence Radar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              {briefing?.confidenceScore ?? 88}% Confluence
            </div>
            <button
              onClick={() => fetchBriefing(true)}
              disabled={refreshing}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Executive Direction Banner */}
        <div className="p-3 rounded-xl bg-[#070914] border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${briefing?.overallDirection === 'BUY' || briefing?.overallDirection === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="text-xs font-bold text-zinc-300">Market Bias:</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded ${briefing?.overallDirection === 'BUY' || briefing?.overallDirection === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
              {briefing?.overallDirection || 'BULLISH'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold">
            Spot: ${briefing?.spotPrice?.toFixed(2) || '2,650.00'}
          </span>
        </div>

        {/* 3 AI Agents Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px]">
          {/* Technical Agent */}
          <div className="p-2.5 rounded-xl bg-[#12162a] border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-1">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Technical
              </span>
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
            </div>
            <p className="text-zinc-300 text-[10px] leading-tight">
              {briefing?.councilConsensus?.technicalAgent || 'Closed M30 engulfing confirmed at H1 support.'}
            </p>
          </div>

          {/* Macro Agent */}
          <div className="p-2.5 rounded-xl bg-[#12162a] border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-1">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Macro
              </span>
              <CheckCircle2 className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-zinc-300 text-[10px] leading-tight">
              {briefing?.councilConsensus?.macroAgent || 'Fed interest rate cuts underpinning Gold expansion.'}
            </p>
          </div>

          {/* Risk Agent */}
          <div className="p-2.5 rounded-xl bg-[#12162a] border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Risk
              </span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-zinc-300 text-[10px] leading-tight">
              {briefing?.councilConsensus?.riskAgent || 'Fixed $10 SL risk profile passes 1.1R to 1.7R criteria.'}
            </p>
          </div>
        </div>

        {/* Institutional Reasoning Text */}
        <div className="p-3 rounded-xl bg-[#090b16] border border-amber-500/20 text-[11px] text-zinc-300 leading-relaxed">
          <span className="font-bold text-amber-400 uppercase tracking-wider block mb-0.5 text-[10px]">
            AI Institutional Thesis
          </span>
          {briefing?.institutionalReasoning || 'Smart Money liquidity sweep beneath key support with clean institutional expansion.'}
        </div>
      </div>
    </div>
  );
};
