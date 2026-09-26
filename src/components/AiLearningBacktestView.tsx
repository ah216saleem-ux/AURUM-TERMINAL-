import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BrainCircuit, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Target, 
  Award, 
  Cpu, 
  RefreshCcw,
  ArrowUpRight,
  Filter,
  Check
} from 'lucide-react';
import { 
  STRATEGY_PERFORMANCE_DATA, 
  ASSET_BACKTEST_DATA, 
  AI_LEARNING_STATUS 
} from '../data/backtestLearningData';
import { AiBacktestPerformanceReport } from './AiBacktestPerformanceReport';
import { QwenPerformanceAnalyticsView } from './QwenPerformanceAnalyticsView';
import { useMarket } from '../context/MarketContext';

export const AiLearningBacktestView: React.FC = () => {
  const { strategyLearning, signalHistory } = useMarket();
  const [activeSubTab, setActiveSubTab] = useState<'QWEN_TRACKER' | 'LEARNING' | 'STRATEGIES' | 'BACKTEST'>('QWEN_TRACKER');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('xau-usd');

  // Dynamically map strategy performance using live strategyLearning context
  const dynamicStrategyPerformance = STRATEGY_PERFORMANCE_DATA.map(strat => {
    let key = 'SMC';
    if (strat.shortCode === 'TREND') key = 'TREND';
    if (strat.shortCode === 'BREAKOUT') key = 'BREAKOUT';
    if (strat.shortCode === 'LIQUIDITY') key = 'LIQUIDITY';
    if (strat.shortCode === 'MOMENTUM') key = 'MOMENTUM';

    const liveWinRate = strategyLearning.winRatesByStrategy[key];
    const liveTotal = signalHistory.filter(h => {
      const rLower = h.reason.toLowerCase();
      if (key === 'SMC') return rLower.includes('smc') || rLower.includes('order block') || rLower.includes('ob') || rLower.includes('supply') || rLower.includes('demand');
      if (key === 'TREND') return rLower.includes('ema') || rLower.includes('trend') || rLower.includes('continuation');
      if (key === 'BREAKOUT') return rLower.includes('breakout') || rLower.includes('retest') || rLower.includes('resistance') || rLower.includes('support');
      if (key === 'LIQUIDITY') return rLower.includes('sweep') || rLower.includes('liquidity') || rLower.includes('bsl') || rLower.includes('ssl');
      return rLower.includes('rsi') || rLower.includes('macd') || rLower.includes('momentum') || rLower.includes('divergence');
    }).length;

    const finalTotal = strat.totalSignalsTested + liveTotal;
    const adjustedWeight = Math.min(95, Math.max(10, Math.round(liveWinRate * 1.05)));

    return {
      ...strat,
      winRate: Number(liveWinRate.toFixed(1)),
      confidenceWeight: adjustedWeight,
      totalSignalsTested: finalTotal
    };
  });

  const activeAssetSummary = ASSET_BACKTEST_DATA.find(a => a.assetId === selectedAssetId) || ASSET_BACKTEST_DATA[0];

  // Helper to render mini SVG equity curve
  const renderEquityCurve = (points: number[]) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 160;
    const height = 40;

    const coordinates = points.map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coordinates.join(' ')}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* 0. AI BACKTEST PERFORMANCE REPORT (REQUIRED VALIDATION REPORT) */}
      <AiBacktestPerformanceReport />

      {/* 1. AI LEARNING PANEL HEADER BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131625] via-[#0d101a] to-[#080a11] border border-amber-500/35 shadow-xl space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <BrainCircuit className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-syne tracking-wide uppercase">
                  AI Learning & Backtesting Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9.5px] font-mono-num font-bold">
                  EPOCH #842
                </span>
              </div>
              <span className="text-[10.5px] font-mono-num text-zinc-400">
                5,450 Executed Trade Samples (2024–2026)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono-num text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Self-Optimizing</span>
          </div>
        </div>

        {/* AI Learning Status Overview Box */}
        <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-num">
            <span className="text-[10px] uppercase font-bold text-zinc-400">AI Learning Status</span>
            <span className="text-amber-300 font-bold text-[11px]">{AI_LEARNING_STATUS.statusText}</span>
          </div>

          <div className="space-y-1.5 text-xs font-sans">
            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono-num font-bold text-[9.5px] shrink-0 mt-0.5">
                IMPROVING
              </span>
              <p className="text-[11px] text-zinc-300 leading-snug">
                <strong className="text-white">Improving models:</strong> {AI_LEARNING_STATUS.learningTasks.improvingModels}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-num font-bold text-[9.5px] shrink-0 mt-0.5">
                WEIGHTS
              </span>
              <p className="text-[11px] text-zinc-300 leading-snug">
                <strong className="text-white">Updating strategy weights:</strong> {AI_LEARNING_STATUS.learningTasks.updatingStrategyWeights}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono-num font-bold text-[9.5px] shrink-0 mt-0.5">
                OUTCOMES
              </span>
              <p className="text-[11px] text-zinc-300 leading-snug">
                <strong className="text-white">Learning from outcomes:</strong> {AI_LEARNING_STATUS.learningTasks.learningFromOutcomes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-VIEW NAVIGATION TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-neutral-950 border border-zinc-800 text-xs font-mono-num font-bold">
        <button
          onClick={() => setActiveSubTab('QWEN_TRACKER')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeSubTab === 'QWEN_TRACKER'
              ? 'bg-sky-500 text-black shadow-md shadow-sky-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Consensus Tracker</span>
        </button>

        <button
          onClick={() => setActiveSubTab('LEARNING')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeSubTab === 'LEARNING'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Panel</span>
        </button>

        <button
          onClick={() => setActiveSubTab('STRATEGIES')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeSubTab === 'STRATEGIES'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Strategies</span>
        </button>

        <button
          onClick={() => setActiveSubTab('BACKTEST')}
          className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
            activeSubTab === 'BACKTEST'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Backtest Data</span>
        </button>
      </div>

      {/* 2.5 QWEN AI PERFORMANCE TRACKER SUB-TAB CONTENT */}
      {activeSubTab === 'QWEN_TRACKER' && (
        <QwenPerformanceAnalyticsView />
      )}

      {/* 3. AI LEARNING PANEL TAB CONTENT */}
      {activeSubTab === 'LEARNING' && (
        <div className="space-y-3.5">
          {/* Highest Confidence Strategy Highlight */}
          <div className="p-3.5 rounded-2xl bg-[#0c0e15] border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Highest Confidence Strategy
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono-num font-bold">
                RANK #1
              </span>
            </div>

            <p className="text-sm font-bold text-white font-mono-num">
              {AI_LEARNING_STATUS.topConfidenceStrategy}
            </p>
          </div>

          {/* All Strategy Confidence Weights Ranking */}
          <div className="space-y-2">
            <span className="text-xs font-mono-num font-bold text-zinc-300 uppercase tracking-wider block px-1">
              Active Strategy Confidence Weights
            </span>

            <div className="space-y-2">
              {dynamicStrategyPerformance.map((strat) => (
                <div
                  key={strat.id}
                  className="p-3 rounded-xl bg-[#0c0e15] border border-zinc-800 hover:border-zinc-700 transition space-y-2 font-mono-num"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{strat.strategyName}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9.5px]">
                        Grade {strat.grade}
                      </span>
                    </div>

                    <span className="text-amber-300 font-bold">
                      {strat.confidenceWeight}% Weight
                    </span>
                  </div>

                  {/* Weight Visual Bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${strat.confidenceWeight}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] text-zinc-400">
                    <span>Win Rate: <strong className="text-emerald-400">{strat.winRate}%</strong></span>
                    <span>Avg R:R: <strong className="text-amber-300">{strat.avgRiskReward}</strong></span>
                    <span>Tested: <strong className="text-zinc-200">{strat.totalSignalsTested} Signals</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1. STRATEGY PERFORMANCE ANALYSIS TAB CONTENT */}
      {activeSubTab === 'STRATEGIES' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono-num font-bold text-zinc-300 uppercase tracking-wider">
              Strategy Performance Deep Dive
            </span>
            <span className="text-[10.5px] font-mono-num text-amber-400">
              5 Core Strategies Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {dynamicStrategyPerformance.map((strat) => (
              <div
                key={strat.id}
                className="p-4 rounded-2xl bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/30 transition space-y-3 shadow-md"
              >
                {/* Header: Title, Grade, Win Rate, Avg RR */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white font-syne">
                        {strat.strategyName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono-num font-bold">
                        {strat.grade}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono-num text-zinc-400">
                      {strat.totalSignalsTested} Historical Trades Validated
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono-num text-xs">
                    <div className="text-right">
                      <span className="text-[9.5px] text-zinc-500 uppercase block">Win Rate</span>
                      <span className="font-bold text-emerald-400 text-sm">{strat.winRate}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] text-zinc-500 uppercase block">Avg R:R</span>
                      <span className="font-bold text-amber-300 text-sm">{strat.avgRiskReward}</span>
                    </div>
                  </div>
                </div>

                {/* Successful Market Conditions */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-mono-num font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Successful Market Conditions
                  </span>
                  <ul className="space-y-1 pl-4">
                    {strat.successfulConditions.map((cond, i) => (
                      <li key={i} className="text-zinc-200 text-[11px] list-disc leading-tight">
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Failed Market Conditions */}
                <div className="space-y-1 text-xs pt-1 border-t border-zinc-900">
                  <span className="text-[10px] font-mono-num font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    Failed Market Conditions
                  </span>
                  <ul className="space-y-1 pl-4">
                    {strat.failedConditions.map((cond, i) => (
                      <li key={i} className="text-zinc-400 text-[11px] list-disc leading-tight">
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. HISTORICAL BACKTESTING BY ASSET TAB CONTENT */}
      {activeSubTab === 'BACKTEST' && (
        <div className="space-y-3.5">
          {/* Asset Selection Buttons */}
          <div className="space-y-1">
            <span className="text-xs font-mono-num font-bold text-zinc-300 uppercase tracking-wider block px-1">
              Select Asset Backtest Report
            </span>

            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs font-mono-num">
              {ASSET_BACKTEST_DATA.map((asset) => (
                <button
                  key={asset.assetId}
                  onClick={() => setSelectedAssetId(asset.assetId)}
                  className={`px-3 py-1.5 rounded-xl shrink-0 font-bold transition cursor-pointer border ${
                    selectedAssetId === asset.assetId
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/25'
                      : 'bg-neutral-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Asset Detailed Backtest Card */}
          <div className="p-4 rounded-2xl bg-[#0c0e16] border border-amber-500/30 space-y-4 shadow-xl font-mono-num">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Historical Dataset</span>
                <h3 className="text-base font-bold text-white font-syne">
                  {activeAssetSummary.name} ({activeAssetSummary.symbol})
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase block">Tested Period</span>
                <span className="text-xs font-bold text-amber-300">{activeAssetSummary.testedPeriod}</span>
              </div>
            </div>

            {/* Backtest Metrics Grid: Total Trades, Winning, Losing, Win Rate, Profit Factor, Best Timeframe */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                <span className="text-[9.5px] text-zinc-500 uppercase block">Total Trades</span>
                <span className="text-base font-bold text-white">{activeAssetSummary.totalTrades}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[9.5px] text-emerald-400 uppercase block">Winning Trades</span>
                <span className="text-base font-bold text-emerald-400">{activeAssetSummary.winningTrades}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[9.5px] text-rose-400 uppercase block">Losing Trades</span>
                <span className="text-base font-bold text-rose-400">{activeAssetSummary.losingTrades}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                <span className="text-[9.5px] text-zinc-500 uppercase block">Win Rate</span>
                <span className="text-base font-bold text-emerald-400">{activeAssetSummary.winRate}%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                <span className="text-[9.5px] text-zinc-500 uppercase block">Profit Factor</span>
                <span className="text-base font-bold text-amber-300">{activeAssetSummary.profitFactor}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                <span className="text-[9.5px] text-zinc-500 uppercase block">Best Timeframe</span>
                <span className="text-xs font-bold text-amber-200 truncate block">{activeAssetSummary.bestTimeframe}</span>
              </div>
            </div>

            {/* Total R-Multiple & Max Drawdown Row */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-neutral-950 border border-zinc-800/80 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Cumulative Return</span>
                <span className="text-sm font-bold text-emerald-400">{activeAssetSummary.totalRMultiple} Net Profit</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Max Drawdown</span>
                <span className="text-sm font-bold text-rose-400">{activeAssetSummary.maxDrawdown} Risk Dip</span>
              </div>
            </div>

            {/* Equity Curve Visualizer */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Historical Equity Growth Curve</span>
                <span className="text-emerald-400 font-bold text-[11px]">+115% Total Gain</span>
              </div>

              <div className="flex justify-center pt-1">
                {renderEquityCurve(activeAssetSummary.equityCurvePoints)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
