import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Play, 
  RotateCcw,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { SignalLifecycleData, SignalLifecycleStageId, TradingStyleMode, Timeframe } from '../types';
import { getSignalLifecycleData } from '../data/signalLifecycleData';

interface SignalLifecycleTimelineProps {
  assetId: string;
  symbol: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  tradingMode?: TradingStyleMode;
  timeframe?: Timeframe;
}

export const SignalLifecycleTimeline: React.FC<SignalLifecycleTimelineProps> = ({
  assetId,
  symbol,
  entryPrice,
  stopLoss,
  takeProfit,
  tradingMode = 'INTRADAY',
  timeframe = '1H'
}) => {
  const modeKey = (tradingMode as TradingStyleMode) || 'INTRADAY';
  const tfKey = (timeframe as Timeframe) || '1H';

  const initialData = useMemo(() => {
    return getSignalLifecycleData(assetId, symbol, entryPrice, stopLoss, takeProfit, modeKey, tfKey);
  }, [assetId, symbol, entryPrice, stopLoss, takeProfit, modeKey, tfKey]);

  // Interactive Stage simulation state
  const [activeStageIndex, setActiveStageIndex] = useState<number>(initialData.currentStageIndex);

  const STAGES_LIST: Array<{
    id: SignalLifecycleStageId;
    title: string;
    subtext: string;
    description: string;
    criterion: string;
  }> = [
    {
      id: 'SETUP_DETECTED',
      title: '1. Setup Detected',
      subtext: 'Algorithmic Pattern Found',
      description: 'Liquidity sweep confirmed below session low. Fair Value Gap (FVG) identified on 15M/1H.',
      criterion: 'Price sweeps sell-side liquidity pool and prints displacement candle.'
    },
    {
      id: 'CONFIRMATION_WAITING',
      title: '2. Confirmation Waiting',
      subtext: 'Institutional Validation',
      description: 'Awaiting internal Change of Character (CHOCH) & volume delta momentum alignment.',
      criterion: 'M15/1H candle close above structure break level with institutional delta.'
    },
    {
      id: 'ENTRY_READY',
      title: '3. Entry Ready',
      subtext: 'Optimal Zone Tap',
      description: `Price enters 61.8%–78.6% Optimal Trade Entry (OTE) mitigation zone at $${entryPrice.toLocaleString()}.`,
      criterion: 'Limit/Market orders ready. Stop Loss fixed at structural invalidation.'
    },
    {
      id: 'TRADE_ACTIVE',
      title: '4. Trade Active',
      subtext: 'Execution & Trailing Protection',
      description: `Order filled. Protective SL locked at $${stopLoss.toLocaleString()}. Risk parameters enforced.`,
      criterion: 'Position live in market. Stop loss trailing to Breakeven at +1R profit.'
    },
    {
      id: 'TP_HIT',
      title: '5. TP Hit / SL Hit',
      subtext: 'Terminal Objective',
      description: `Take Profit target reached at $${takeProfit.toLocaleString()}. Max reward locked.`,
      criterion: 'Liquidity target mitigation and partial profit execution.'
    }
  ];

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-neutral-950/90 border border-amber-500/30 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-syne font-bold text-white tracking-wide">
                Signal Lifecycle Timeline
              </h3>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-[9.5px] font-mono-num font-bold text-amber-300 border border-amber-500/30">
                5 STAGES
              </span>
            </div>
            <p className="text-[10.5px] text-zinc-400 font-sans">
              Track setup progression from initial detection to terminal profit
            </p>
          </div>
        </div>

        {/* Quick Stepper Reset / Advance controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveStageIndex(prev => Math.max(0, prev - 1))}
            disabled={activeStageIndex === 0}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer text-[10px] font-mono-num"
            title="Previous Stage"
          >
            Prev
          </button>
          <button
            onClick={() => setActiveStageIndex(prev => Math.min(4, prev + 1))}
            disabled={activeStageIndex === 4}
            className="p-1.5 px-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 disabled:opacity-30 cursor-pointer text-[10px] font-mono-num font-bold"
            title="Next Stage"
          >
            Next Stage &rarr;
          </button>
        </div>
      </div>

      {/* Progress Bar & Status Pill */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono-num">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-amber-300">
              Current Stage: {STAGES_LIST[activeStageIndex].title}
            </span>
          </div>
          <span className="text-zinc-400 font-bold">
            {((activeStageIndex + 1) / 5) * 100}% Complete
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 p-0.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${((activeStageIndex + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Vertical 5-Stage Timeline Stepper */}
      <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
        {STAGES_LIST.map((stage, idx) => {
          const isCompleted = idx < activeStageIndex;
          const isCurrent = idx === activeStageIndex;
          const isPending = idx > activeStageIndex;

          return (
            <div
              key={stage.id}
              onClick={() => setActiveStageIndex(idx)}
              className={`relative flex items-start gap-3.5 p-3 rounded-xl transition-all cursor-pointer ${
                isCurrent 
                  ? 'bg-gradient-to-r from-[#171b2b] to-[#0f111a] border border-amber-500/50 shadow-md shadow-amber-500/10' 
                  : isCompleted
                  ? 'bg-neutral-900/60 border border-zinc-800/80 hover:border-zinc-700'
                  : 'bg-neutral-950/40 border border-zinc-900/80 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Node Circle */}
              <div 
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono-num font-bold transition shadow-sm ${
                  isCompleted
                    ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-amber-500 text-black shadow-amber-500/30 ring-4 ring-amber-500/20'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-mono-num font-bold ${isCurrent ? 'text-amber-300' : isCompleted ? 'text-emerald-300' : 'text-zinc-400'}`}>
                      {stage.title}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-sans">
                      ({stage.subtext})
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.2 rounded text-[9.5px] font-mono-num font-bold uppercase ${
                      isCompleted
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : isCurrent
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                    }`}
                  >
                    {isCompleted ? 'COMPLETED' : isCurrent ? 'ACTIVE NOW' : 'PENDING'}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {stage.description}
                </p>

                {/* SMC Validation Criterion pill */}
                <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-400 font-mono-num pt-0.5">
                  <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Rule: {stage.criterion}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rationale & Mode Note Footer */}
      <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80 text-xs font-sans text-zinc-400 space-y-1">
        <div className="flex items-center gap-1.5 text-amber-400 font-mono-num font-bold text-[10.5px] uppercase">
          <Sparkles className="w-3 h-3" />
          <span>Execution Protocol Note</span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          AURUM AI monitors this setup via the {tradingMode} execution engine ({timeframe}). Stop Loss invalidation is strictly capped at <span className="font-mono-num font-bold text-rose-400">${stopLoss.toLocaleString()}</span>. Target objective: <span className="font-mono-num font-bold text-emerald-400">${takeProfit.toLocaleString()}</span>.
        </p>
      </div>
    </div>
  );
};
