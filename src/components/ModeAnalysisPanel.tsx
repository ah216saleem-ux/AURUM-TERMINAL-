import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Target, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Activity, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Sliders, 
  Gauge, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { TradingStyleMode, SignalType } from '../types';
import { useMarket } from '../context/MarketContext';
import { computeModeDecision, ModeDecisionResult } from '../data/modeDecisionEngine';

interface ModeAnalysisPanelProps {
  initialAssetId?: string;
  selectedAssetId?: string;
  isCompact?: boolean;
}

export const ModeAnalysisPanel: React.FC<ModeAnalysisPanelProps> = ({ 
  initialAssetId,
  selectedAssetId,
  isCompact = false 
}) => {
  const { 
    tradingStyleMode, 
    setTradingStyleMode, 
    selectedSignal, 
    markets, 
    setSelectedSignalId 
  } = useMarket();

  const [activeAssetId, setActiveAssetId] = useState<string>(
    selectedAssetId || initialAssetId || selectedSignal?.marketId || 'xau-usd'
  );

  // Sync with selectedAssetId if provided
  React.useEffect(() => {
    if (selectedAssetId) {
      setActiveAssetId(selectedAssetId);
    }
  }, [selectedAssetId]);

  const [isExpanded, setIsExpanded] = useState<boolean>(!isCompact);

  // Compute decision result for the selected asset and active mode
  const decision: ModeDecisionResult = computeModeDecision(activeAssetId, tradingStyleMode);

  // Signal color styling
  const signalBadgeConfig: Record<SignalType, {
    bg: string;
    text: string;
    border: string;
    glow: string;
    dot: string;
  }> = {
    BUY: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      dot: 'bg-emerald-400'
    },
    SELL: {
      bg: 'bg-rose-500/20',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      dot: 'bg-rose-400'
    },
    WAIT: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      dot: 'bg-amber-400'
    }
  };

  const badgeStyle = signalBadgeConfig[decision.signal] || signalBadgeConfig.WAIT;

  const MODES: { id: TradingStyleMode; label: string; icon: string }[] = [
    { id: 'SCALPING', label: 'SCALPING', icon: '⚡' },
    { id: 'INTRADAY', label: 'INTRADAY', icon: '🎯' },
    { id: 'SWING', label: 'SWING', icon: '🌊' }
  ];

  return (
    <div className="w-full rounded-2xl bg-[#0c0e16] border border-amber-500/30 shadow-xl overflow-hidden font-sans">
      {/* Top Header: Title, Mode Selector Chips & Toggle */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/10 via-neutral-900 to-transparent border-b border-zinc-800/80">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5 font-mono-num uppercase">
                <span>AI MODE DECISION PANEL</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-extrabold">
                  {decision.mode}
                </span>
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono-num">
                Calibrated weights & priority execution matrix
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-mono-num font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800"
          >
            {isExpanded ? 'Collapse' : 'Expand Details'}
          </button>
        </div>

        {/* Mode Selector Tabs (SCALPING | INTRADAY | SWING) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-950 border border-zinc-800/90 font-mono-num text-xs font-bold">
          {MODES.map((m) => {
            const isActive = tradingStyleMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setTradingStyleMode(m.id)}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black shadow-md shadow-amber-500/20 font-black scale-[1.01]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Asset Switcher Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 scrollbar-none font-mono-num text-[11px]">
          <span className="text-[10px] uppercase text-zinc-500 shrink-0 font-bold">Asset:</span>
          {markets.map((m) => {
            const isSelected = activeAssetId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveAssetId(m.id);
                  setSelectedSignalId(m.id);
                }}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-bold cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {m.symbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Decision Output Row: Signal Badge, Confidence, Reason */}
      <div className="p-3.5 sm:p-4 space-y-3.5">
        <div className="p-3.5 rounded-xl bg-[#090b11] border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-num uppercase tracking-wider text-zinc-400">
                Selected Mode Decision ({decision.assetSymbol})
              </span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono-num text-[9.5px]">
                {decision.targetHoldTime}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Signal Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black font-mono-num tracking-wide border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} ${badgeStyle.glow}`}>
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot} animate-pulse`} />
                <span>{decision.signal}</span>
              </div>

              {/* Final AI Confidence */}
              <div className="flex items-center gap-1 font-mono-num">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm font-bold text-white">
                  Final AI Confidence: <span className="text-emerald-400 font-extrabold">{decision.finalConfidence}%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick R:R & Target Speed */}
          <div className="flex items-center gap-2 font-mono-num text-xs bg-neutral-950 p-2 rounded-lg border border-zinc-800/80 shrink-0">
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">Risk : Reward</span>
              <span className="font-bold text-amber-300">{decision.riskReward}</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <span className="text-[9px] text-zinc-500 block uppercase">Execution</span>
              <span className="font-bold text-zinc-200 truncate">{decision.executionSpeed}</span>
            </div>
          </div>
        </div>

        {/* AI Decision Reason Statement */}
        <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800/80 text-xs">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-zinc-300 leading-relaxed font-sans text-[11.5px]">
              <span className="font-mono-num font-bold text-amber-400 mr-1.5">
                {decision.mode} VERDICT:
              </span>
              {decision.decisionReason}
            </p>
          </div>
        </div>

        {/* Strategy Weights Breakdown */}
        <div className="space-y-2 p-3 rounded-xl bg-[#090b11] border border-zinc-800 font-mono-num">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase font-bold tracking-wider text-[11px] text-zinc-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Strategy Weight Allocation ({decision.mode})</span>
            </span>
            <span className="text-[10px] text-amber-400 font-semibold">100% Calibrated</span>
          </div>

          {/* 4 Core Strategy Weight Bars: SMC | Trend | Liquidity | Momentum */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* SMC */}
            <div className="p-2 rounded-lg bg-neutral-950 border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">SMC</span>
                <span className="font-bold text-amber-300">{decision.strategyWeights.smc}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${decision.strategyWeights.smc}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
            </div>

            {/* Trend */}
            <div className="p-2 rounded-lg bg-neutral-950 border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Trend</span>
                <span className="font-bold text-emerald-400">{decision.strategyWeights.trend}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${decision.strategyWeights.trend}%` }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                  className="h-full bg-emerald-400 rounded-full"
                />
              </div>
            </div>

            {/* Liquidity */}
            <div className="p-2 rounded-lg bg-neutral-950 border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Liquidity</span>
                <span className="font-bold text-blue-400">{decision.strategyWeights.liquidity}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${decision.strategyWeights.liquidity}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full bg-blue-400 rounded-full"
                />
              </div>
            </div>

            {/* Momentum */}
            <div className="p-2 rounded-lg bg-neutral-950 border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Momentum</span>
                <span className="font-bold text-purple-400">{decision.strategyWeights.momentum}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${decision.strategyWeights.momentum}%` }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="h-full bg-purple-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Section: Priority Checklist & Signal Requirements */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 pt-1"
            >
              {/* Mode Priority Checklist */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-num">
                  <span className="text-zinc-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{decision.mode} Priority Confirmation Checklist</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">ALL CRITERIA ACTIVE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono-num text-xs">
                  {decision.priorities.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#0b0e17] border border-zinc-800/70 flex items-start gap-2"
                    >
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase shrink-0 mt-0.5 ${
                        p.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {p.status}
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-zinc-200 block text-[11px]">{p.name}</span>
                        <p className="text-[10.5px] text-zinc-400 font-sans leading-tight">{p.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signal Requirements & Execution Matrix */}
              <div className="p-3 rounded-xl bg-[#090b11] border border-amber-500/20 space-y-2 font-mono-num">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Signal Execution Requirements</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">{decision.modeBadge}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {decision.requirements.map((req, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-neutral-950 border border-zinc-800">
                      <span className="text-[9.5px] text-zinc-500 block uppercase">{req.label}</span>
                      <span className="font-bold text-zinc-200 text-[11px] block truncate">{req.value}</span>
                    </div>
                  ))}
                </div>

                {/* SL / TP / Entry Matrix */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/70 text-xs">
                  <div className="p-2 rounded-lg bg-neutral-950 border border-zinc-800 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase block">Entry Target</span>
                    <span className="font-bold text-zinc-100 block">${decision.entryPrice}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-rose-500/30 text-center">
                    <span className="text-[9px] text-rose-400 uppercase block">Stop Loss ({decision.slDistanceText})</span>
                    <span className="font-bold text-rose-400 block">${decision.stopLoss}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950 border border-emerald-500/30 text-center">
                    <span className="text-[9px] text-emerald-400 uppercase block">Take Profit ({decision.tpDistanceText})</span>
                    <span className="font-bold text-emerald-400 block">${decision.takeProfit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
