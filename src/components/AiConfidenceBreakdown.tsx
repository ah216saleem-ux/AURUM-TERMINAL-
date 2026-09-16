import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  TrendingUp, 
  Layers, 
  Newspaper, 
  Zap,
  Activity
} from 'lucide-react';
import { getAiConfidenceBreakdown } from '../data/aiValidationData';
import { Timeframe, TradingStyleMode } from '../types';

interface AiConfidenceBreakdownProps {
  assetId?: string;
  timeframe?: Timeframe;
  tradingMode?: TradingStyleMode;
  customBreakdown?: {
    smcConfirmationPercent: number;
    trendAlignmentPercent: number;
    liquidityConfirmationPercent: number;
    momentumPercent: number;
    newsSafetyPercent: number;
    finalConfidenceScore: number;
  };
}

export const AiConfidenceBreakdown: React.FC<AiConfidenceBreakdownProps> = ({
  assetId = 'xau-usd',
  timeframe = '1H',
  tradingMode = 'INTRADAY',
  customBreakdown
}) => {
  const tf = (timeframe || '1H') as Timeframe;
  const tm = (tradingMode || 'INTRADAY') as TradingStyleMode;
  const breakdown = customBreakdown || getAiConfidenceBreakdown(assetId, tf, tm);

  const getBarColor = (val: number) => {
    if (val >= 90) return 'from-amber-400 to-amber-500';
    if (val >= 82) return 'from-emerald-400 to-emerald-500';
    if (val >= 75) return 'from-sky-400 to-sky-500';
    return 'from-rose-400 to-rose-500';
  };

  const metrics = [
    {
      label: 'SMC Confirmation',
      value: breakdown.smcConfirmationPercent,
      icon: BrainCircuit,
      colorText: 'text-amber-400',
      detail: 'Order block mitigation & structural displacement'
    },
    {
      label: 'Trend Alignment',
      value: breakdown.trendAlignmentPercent,
      icon: TrendingUp,
      colorText: 'text-emerald-400',
      detail: 'Multi-timeframe EMA stack & momentum vector'
    },
    {
      label: 'Liquidity Confirmation',
      value: breakdown.liquidityConfirmationPercent,
      icon: Layers,
      colorText: 'text-sky-400',
      detail: 'Asia/NY session high/low liquidity sweep'
    },
    {
      label: 'Momentum',
      value: breakdown.momentumPercent,
      icon: Zap,
      colorText: 'text-amber-300',
      detail: 'RSI divergence & volume expansion spike'
    },
    {
      label: 'News Safety',
      value: breakdown.newsSafetyPercent,
      icon: Newspaper,
      colorText: 'text-emerald-300',
      detail: 'Macro news filter & low-volatility gap check'
    }
  ];

  return (
    <div className="space-y-3.5 p-4 rounded-2xl bg-[#090b12] border border-amber-500/35 shadow-xl relative overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-syne font-bold text-white tracking-wide uppercase">
              AI Confidence Breakdown
            </h4>
            <p className="text-[10px] text-zinc-400 font-mono-num">
              Multi-Layer Algorithmic Confluence Analysis
            </p>
          </div>
        </div>

        {/* Final AI Confidence Score Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-500/50 px-3 py-1.5 rounded-xl shadow-lg shadow-amber-500/10">
          <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block leading-tight">
              Final AI Confidence
            </span>
            <span className="text-base font-mono-num font-black text-amber-300">
              {breakdown.finalConfidenceScore}%
            </span>
          </div>
        </div>
      </div>

      {/* 5 Required Confirmation Breakdown Sliders/Progress Items */}
      <div className="space-y-2.5">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono-num">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${item.colorText}`} />
                  <span className="text-zinc-200 font-bold">{item.label}</span>
                </div>
                <span className={`font-black ${item.colorText}`}>
                  {item.value}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${getBarColor(item.value)} transition-all duration-500`}
                  style={{ width: `${item.value}%` }}
                />
              </div>

              <span className="text-[9.5px] text-zinc-500 font-mono-num block pl-5">
                {item.detail}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Confluence Note */}
      <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono-num text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-amber-400" />
          <span>Calculated across 5 confluent AI models</span>
        </div>
        <span className="text-emerald-400 font-bold">Grade A+ Setup</span>
      </div>
    </div>
  );
};
