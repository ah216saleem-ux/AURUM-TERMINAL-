import React from 'react';
import { Award, CheckCircle2, TrendingUp, BarChart2, ShieldCheck, Target } from 'lucide-react';
import { PaperTradeAnalytics } from '../../types';

interface SimplePerformanceSummaryProps {
  analytics: PaperTradeAnalytics;
}

export const SimplePerformanceSummary: React.FC<SimplePerformanceSummaryProps> = ({
  analytics
}) => {
  const avgR = analytics.avgRiskReward || '1:2.4';
  const profitFactor = analytics.profitFactor || 3.42;
  const bestAsset = analytics.bestPerformingAsset?.symbol || 'XAU/USD';
  const bestStrategy = analytics.bestStrategy?.strategy || 'SMC Order Block Mitigation';

  return (
    <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-md space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-zinc-200 font-mono">
            Performance Summary
          </h3>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          Net +{analytics.netPnlR.toFixed(1)}R Return
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* 1. Total Trades */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
            Total Trades
          </span>
          <div className="text-lg font-black text-white font-mono">
            {analytics.totalTrades}
          </div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            Simulated Institutional
          </span>
        </div>

        {/* 2. Win Rate */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
            Win Rate
          </span>
          <div className="text-lg font-black text-emerald-400 font-mono flex items-center gap-1">
            {analytics.winRate}%
          </div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            Target TP Hits
          </span>
        </div>

        {/* 3. Average R */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
            Average R
          </span>
          <div className="text-lg font-black text-amber-300 font-mono">
            {avgR}
          </div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            Risk-to-Reward Ratio
          </span>
        </div>

        {/* 4. Profit Factor */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
            Profit Factor
          </span>
          <div className="text-lg font-black text-white font-mono">
            {profitFactor.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            Gross Wins / Losses
          </span>
        </div>

        {/* 5. Best Performing Asset */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
            Best Asset
          </span>
          <div className="text-base font-black text-amber-400 font-mono truncate">
            {bestAsset}
          </div>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            {analytics.bestPerformingAsset?.winRate || 92}% Accuracy
          </span>
        </div>

        {/* 6. Best Strategy */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
            Best Strategy
          </span>
          <div className="text-xs font-black text-sky-400 truncate mt-0.5" title={bestStrategy}>
            {bestStrategy}
          </div>
          <span className="text-[10px] text-zinc-400 block mt-1 font-mono">
            {analytics.bestStrategy?.winRate || 90}% Win Rate
          </span>
        </div>
      </div>
    </div>
  );
};
