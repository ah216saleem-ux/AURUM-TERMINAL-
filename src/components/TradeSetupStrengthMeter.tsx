import React from 'react';
import { 
  Gauge, 
  TrendingUp, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const TradeSetupStrengthMeter: React.FC = () => {
  const { selectedSignal, activeSetupStrength, selectedMarket } = useMarket();

  const strength = activeSetupStrength;
  const score = strength.overallScore;

  // Grade color scheme
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20';
      case 'A':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10';
      case 'B+':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-emerald-400';
    if (val >= 80) return 'text-amber-300';
    if (val >= 70) return 'text-amber-400';
    return 'text-zinc-400';
  };

  const getProgressBarColor = (val: number) => {
    if (val >= 90) return 'from-amber-500 via-emerald-400 to-emerald-300';
    if (val >= 80) return 'from-amber-600 via-amber-400 to-amber-300';
    return 'from-zinc-600 to-amber-500';
  };

  // Dimensions for circular SVG gauge
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreItems = [
    {
      id: 'trend',
      label: 'Trend Strength',
      icon: TrendingUp,
      score: strength.trendStrength.score,
      desc: strength.trendStrength.label,
      color: 'text-amber-400'
    },
    {
      id: 'smc',
      label: 'Smart Money Concepts',
      icon: Layers,
      score: strength.smcStructure.score,
      desc: strength.smcStructure.label,
      color: 'text-amber-300'
    },
    {
      id: 'ob',
      label: 'Order Block Validity',
      icon: ShieldCheck,
      score: strength.orderBlockValidity.score,
      desc: strength.orderBlockValidity.label,
      color: 'text-emerald-400'
    },
    {
      id: 'liq',
      label: 'Liquidity Confirmation',
      icon: Sparkles,
      score: strength.liquidityConfirmation.score,
      desc: strength.liquidityConfirmation.label,
      color: 'text-sky-400'
    },
    {
      id: 'mom',
      label: 'Momentum Alignment',
      icon: Activity,
      score: strength.momentum.score,
      desc: strength.momentum.label,
      color: 'text-indigo-400'
    }
  ];

  return (
    <div className="w-full rounded-2xl bg-glass-card border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-neutral-950 border border-amber-500/40 text-amber-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-syne">
                Trade Setup Strength Meter
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono-num font-bold">
                {selectedSignal.symbol}
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-mono-num">
              5-Factor Institutional Probability Score (0 - 100%)
            </span>
          </div>
        </div>

        {/* Grade Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black font-mono-num tracking-wide border shadow-md flex items-center gap-1.5 ${getGradeBadge(strength.grade)}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>GRADE {strength.grade}</span>
          </span>
        </div>
      </div>

      {/* Score Overview: Gauge + Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 rounded-xl bg-neutral-950/80 border border-zinc-800/90">
        {/* Left: SVG Circular Gauge */}
        <div className="md:col-span-4 flex items-center justify-center gap-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="transition-all duration-1000 ease-out"
                stroke="url(#aurumGradient)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="aurumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#F5D061" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered Score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black font-mono-num ${getScoreColor(score)}`}>
                {score}%
              </span>
              <span className="text-[9px] font-mono-num text-zinc-500 uppercase tracking-widest">
                STRENGTH
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono-num text-zinc-400 font-bold block">
              Execution Conviction
            </span>
            <span className="text-sm font-bold text-white font-mono-num">
              {score >= 90 ? 'Institutional High' : score >= 80 ? 'Optimal Setup' : 'Moderate Quality'}
            </span>
            <span className="text-xs text-zinc-400 font-mono-num block">
              Confidence: {selectedSignal.confidenceScore}%
            </span>
          </div>
        </div>

        {/* Right: AI Verdict Explanation */}
        <div className="md:col-span-8 p-3.5 rounded-lg bg-neutral-900/60 border border-zinc-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono-num font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI STRENGTH SYNTHESIS</span>
          </div>
          <p className="text-xs text-zinc-300 font-light leading-relaxed">
            {strength.verdict}
          </p>
        </div>
      </div>

      {/* 5-Factor Factor Breakdown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono-num text-zinc-400">
          <span className="font-bold uppercase tracking-wider text-zinc-500">Core Factor Weight Breakdown</span>
          <span className="text-[11px] text-amber-400/80">Calculated in real-time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {scoreItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="p-3.5 rounded-xl bg-neutral-950/70 border border-zinc-800/80 flex flex-col justify-between space-y-2 hover:border-amber-500/30 transition"
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="text-[11px] font-bold text-zinc-200 font-mono-num truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-xs font-bold font-mono-num ${getScoreColor(item.score)}`}>
                    {item.score}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(item.score)} transition-all duration-700`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>

                {/* Sub-label description */}
                <p className="text-[10px] text-zinc-400 font-mono-num line-clamp-2 leading-tight">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
