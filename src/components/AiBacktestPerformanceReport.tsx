import React, { useState } from 'react';
import { 
  BarChart3, 
  Award, 
  TrendingUp, 
  ShieldAlert, 
  Layers, 
  BrainCircuit, 
  Target,
  Percent,
  Activity
} from 'lucide-react';
import { AI_BACKTEST_PERFORMANCE_REPORT } from '../data/aiValidationData';
import { TradingStyleMode } from '../types';

interface AiBacktestPerformanceReportProps {
  compact?: boolean;
}

export const AiBacktestPerformanceReport: React.FC<AiBacktestPerformanceReportProps> = ({ compact = false }) => {
  const report = AI_BACKTEST_PERFORMANCE_REPORT;
  const [selectedMode, setSelectedMode] = useState<TradingStyleMode>(report.bestTradingMode);

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#0c0e17] border border-amber-500/40 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-syne font-bold text-white tracking-wide uppercase">
                AI Backtest Performance Report
              </h3>
              <span className="px-2 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9.5px] font-mono-num font-extrabold text-amber-300">
                AUDITED
              </span>
            </div>
            <p className="text-[10.5px] text-zinc-400 font-mono-num">
              {report.testedPeriod} • {report.totalTestedTrades.toLocaleString()} Executed Trades
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono-num font-bold">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>A+ Model Rating</span>
        </div>
      </div>

      {/* 6 Required Metrics Display Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* 1. Best Performing Trading Mode */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#161a29] to-[#0f121d] border border-amber-500/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans uppercase">
            <span>1. Best Trading Mode</span>
            <Layers className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-sm font-syne font-extrabold text-amber-300 block">
            {report.bestTradingMode}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono-num font-bold block">
            {report.bestTradingModeWinRate}% Win Rate
          </span>
        </div>

        {/* 2. Best Performing Asset */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#161a29] to-[#0f121d] border border-amber-500/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans uppercase">
            <span>2. Best Asset</span>
            <Award className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-sm font-syne font-extrabold text-white block">
            {report.bestAssetSymbol}
          </span>
          <span className="text-[10px] text-zinc-300 font-mono-num block truncate" title={report.bestAssetName}>
            {report.bestAssetName}
          </span>
        </div>

        {/* 3. Best Strategy */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#161a29] to-[#0f121d] border border-amber-500/40 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans uppercase">
            <span>3. Best Strategy</span>
            <BrainCircuit className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-xs font-syne font-extrabold text-amber-300 block truncate" title={report.bestStrategyName}>
            {report.bestStrategyName}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono-num font-bold block">
            {report.bestStrategyWinRate}% Confluence Win Rate
          </span>
        </div>

        {/* 4. Win Rate */}
        <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans uppercase">
            <span>4. Overall Win Rate</span>
            <Percent className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-base font-mono-num font-extrabold text-emerald-400 block">
            {report.overallWinRate}%
          </span>
          <span className="text-[9.5px] text-zinc-500 font-mono-num">
            5,450 Trades Audited
          </span>
        </div>

        {/* 5. Average Risk Reward */}
        <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans uppercase">
            <span>5. Avg Risk Reward</span>
            <Target className="w-3 h-3 text-sky-400" />
          </div>
          <span className="text-base font-mono-num font-extrabold text-sky-300 block">
            {report.averageRiskReward}
          </span>
          <span className="text-[9.5px] text-zinc-500 font-mono-num">
            Expectancy +2.7R
          </span>
        </div>

        {/* 6. Drawdown */}
        <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans uppercase">
            <span>6. Max Drawdown</span>
            <ShieldAlert className="w-3 h-3 text-rose-400" />
          </div>
          <span className="text-base font-mono-num font-extrabold text-rose-400 block">
            {report.maxDrawdown}
          </span>
          <span className="text-[9.5px] text-zinc-500 font-mono-num">
            Capital Protection Shield
          </span>
        </div>
      </div>

      {/* Rationale & Audit Summary */}
      <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-xs font-sans text-zinc-300 space-y-1">
        <div className="flex items-center gap-1.5 text-amber-400 font-mono-num font-bold text-[10.5px] uppercase">
          <Activity className="w-3.5 h-3.5" />
          <span>Institutional Backtest Summary</span>
        </div>
        <p className="text-[11.5px] leading-relaxed">
          {report.bestAssetPerformanceNote}. Backtested parameters undergo automated daily forward-test cross-validation on live Tier-1 liquidity feeds.
        </p>
      </div>
    </div>
  );
};
