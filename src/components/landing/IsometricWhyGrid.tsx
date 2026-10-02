import React from 'react';
import { Activity, Shield, Globe, Lock, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Tilt3DCard } from './Tilt3DCard';

interface WhyFeature {
  id: string;
  tag: string;
  title: string;
  oneLineBenefit: string;
  highlight: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'amber' | 'rose' | 'sky' | 'emerald';
  glowColor: string;
  borderColor: string;
}

const FEATURES: WhyFeature[] = [
  {
    id: 'f1',
    tag: '[REALTIME]',
    title: 'Real-Time Intelligence',
    oneLineBenefit: 'Sub-12ms continuous market tick monitoring.',
    highlight: '< 12ms Sync',
    icon: Activity,
    color: 'amber',
    glowColor: 'rgba(245, 158, 11, 0.16)',
    borderColor: 'rgba(245, 158, 11, 0.4)'
  },
  {
    id: 'f2',
    tag: '[RISK_GUARD]',
    title: 'Objective Risk',
    oneLineBenefit: 'Multi-tier drawdown limits & locking.',
    highlight: '6% Equity Cap',
    icon: Shield,
    color: 'rose',
    glowColor: 'rgba(244, 63, 94, 0.16)',
    borderColor: 'rgba(244, 63, 94, 0.4)'
  },
  {
    id: 'f3',
    tag: '[CROSS_ASSET]',
    title: 'Multi-Market Coverage',
    oneLineBenefit: 'Precious metals, forex, and indices.',
    highlight: 'All Core Assets',
    icon: Globe,
    color: 'sky',
    glowColor: 'rgba(56, 189, 248, 0.16)',
    borderColor: 'rgba(56, 189, 248, 0.4)'
  },
  {
    id: 'f4',
    tag: '[SECURITY]',
    title: 'Cryptographic Access',
    oneLineBenefit: 'Encrypted institutional gateway controls.',
    highlight: 'Role Isolated',
    icon: Lock,
    color: 'emerald',
    glowColor: 'rgba(16, 185, 129, 0.16)',
    borderColor: 'rgba(16, 185, 129, 0.4)'
  }
];

export const IsometricWhyGrid: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>INSTITUTIONAL ARCHITECTURE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-black tracking-tight text-white">
          WHY <span className="gold-shimmer-text">AURUM TERMINAL</span>
        </h2>
        <p className="text-zinc-300 text-xs sm:text-sm max-w-md mx-auto leading-normal">
          Engineered for capital environments requiring continuous clarity and objective risk guards.
        </p>
      </div>

      {/* 4 Small Tiles in 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
        {FEATURES.map((feat) => {
          const Icon = feat.icon;

          const iconBg = 
            feat.color === 'amber'
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              : feat.color === 'rose'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : feat.color === 'sky'
                  ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';

          const badgeColor = 
            feat.color === 'amber'
              ? 'text-amber-300 bg-amber-500/10 border-amber-500/20'
              : feat.color === 'rose'
                ? 'text-rose-300 bg-rose-500/10 border-rose-500/20'
                : feat.color === 'sky'
                  ? 'text-sky-300 bg-sky-500/10 border-sky-500/20'
                  : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';

          return (
            <Tilt3DCard
              key={feat.id}
              glowColor={feat.glowColor}
              borderColor={feat.borderColor}
              elevation="sm"
              maxTilt={8}
              className="p-4 sm:p-5 flex flex-col justify-between h-full"
            >
              <div>
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-zinc-400">
                    {feat.tag}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${badgeColor}`}>
                    {feat.highlight}
                  </span>
                </div>

                {/* Small Icon & Title */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${iconBg} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white font-cinzel line-clamp-1">
                    {feat.title}
                  </h3>
                </div>

                {/* 1-Line ~5 Word Benefit */}
                <p className="text-[11px] sm:text-xs text-zinc-300 font-sans leading-snug">
                  {feat.oneLineBenefit}
                </p>
              </div>

              {/* Bottom Line */}
              <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>VERIFIED</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </Tilt3DCard>
          );
        })}
      </div>
    </div>
  );
};
