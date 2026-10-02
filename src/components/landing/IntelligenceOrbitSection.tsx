import React, { useState, useEffect } from 'react';
import { Cpu, BarChart3, Radio, LineChart, Check, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';
import { Tilt3DCard } from './Tilt3DCard';

interface IntelligenceNode {
  id: 'structure' | 'monitoring' | 'context';
  title: string;
  shortLabel: string;
  tag: string;
  color: string;
  borderGlow: string;
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  punchyPoints: string[];
  metrics: { label: string; value: string }[];
}

const NODES: IntelligenceNode[] = [
  {
    id: 'structure',
    title: 'Market Structure & Orderflow',
    shortLabel: 'Structure & Flow',
    tag: '[ENGINE_01 // SMC_CORE]',
    color: 'amber',
    borderGlow: 'rgba(245, 158, 11, 0.4)',
    icon: BarChart3,
    headline: 'Real-time order block detection, fair value gaps & liquidity sweep mapping.',
    punchyPoints: [
      'Multi-timeframe BOS and CHoCH structural confirmation',
      'Institutional order block and liquidity mapping',
      'Automated Fibonacci OTE level calculation'
    ],
    metrics: [
      { label: 'SMC Precision', value: '98.4%' },
      { label: 'Timeframes', value: '5M - 4H' }
    ]
  },
  {
    id: 'monitoring',
    title: 'Real-Time Surveillance',
    shortLabel: 'Tick Surveillance',
    tag: '[ENGINE_02 // SUB_12MS]',
    color: 'sky',
    borderGlow: 'rgba(56, 189, 248, 0.4)',
    icon: Radio,
    headline: 'Sub-12ms continuous live tick ingestion with zero-latency market radar.',
    punchyPoints: [
      'Direct WebSocket feeds across active markets',
      'Instant spread anomaly and volume gap detection',
      'Multi-source oracle verification and health checks'
    ],
    metrics: [
      { label: 'Tick Latency', value: '< 12ms' },
      { label: 'Stream Health', value: '100%' }
    ]
  },
  {
    id: 'context',
    title: 'Intelligent Market Context',
    shortLabel: 'Macro Context',
    tag: '[ENGINE_03 // REGIME_AI]',
    color: 'purple',
    borderGlow: 'rgba(168, 85, 247, 0.4)',
    icon: LineChart,
    headline: 'Contextual AI synthesizing macroeconomic drivers and cross-asset correlation shifts.',
    punchyPoints: [
      'Central bank rate expectation and yield synthesis',
      'Cross-asset correlation drift and shift monitoring',
      'Automated pre-news risk freeze and classification'
    ],
    metrics: [
      { label: 'Regime Accuracy', value: '94.2%' },
      { label: 'Catalyst Sync', value: 'Active' }
    ]
  }
];

export const IntelligenceOrbitSection: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<'structure' | 'monitoring' | 'context'>('structure');
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-cycle through nodes slowly if user hasn't interacted
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setActiveNodeId(prev => {
        if (prev === 'structure') return 'monitoring';
        if (prev === 'monitoring') return 'context';
        return 'structure';
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const activeNode = NODES.find(n => n.id === activeNodeId) || NODES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>NEURAL ARCHITECTURE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight text-white">
          INSTITUTIONAL <span className="gold-shimmer-text">AI INTELLIGENCE</span>
        </h2>
        <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Three synchronized neural engines continuously auditing structure, liquidity, and macro catalysts to produce high-probability market intelligence.
        </p>
      </div>

      {/* Main 3D Orbit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        {/* Left / Center Interactive 3D Orbit Control (5 Cols on desktop) */}
        <div 
          className="lg:col-span-5 flex flex-col items-center justify-center relative p-6 sm:p-8 rounded-3xl bg-[#080b14]/70 border border-zinc-800/80 backdrop-blur-md shadow-2xl overflow-hidden"
          onMouseEnter={() => setAutoRotate(false)}
          onTouchStart={() => setAutoRotate(false)}
        >
          {/* Subtle Cybernetic Orbit Background Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-dashed border-amber-500/30 animate-spin-slow" />
            <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-amber-400/20" />
          </div>

          {/* Central AI Engine Core */}
          <div className="relative z-10 my-4 flex flex-col items-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-0.5 shadow-[0_0_40px_rgba(245,158,11,0.35)] animate-pulse-slow flex items-center justify-center">
              <div className="w-full h-full bg-[#07090f] rounded-[14px] flex flex-col items-center justify-center p-2 text-center">
                <Cpu className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-amber-300 mt-1 tracking-wider">
                  DUAL-CORE
                </span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs font-mono font-black tracking-widest text-zinc-200 block">
                AURUM AI CORE
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SYNC LATENCY: 8.4ms
              </span>
            </div>
          </div>

          {/* 3 Orbit Node Buttons */}
          <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3 mt-6 z-10">
            {NODES.map((node) => {
              const Icon = node.icon;
              const isActive = activeNodeId === node.id;
              
              const activeClasses = 
                node.color === 'amber'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : node.color === 'sky'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                    : 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]';

              return (
                <button
                  key={node.id}
                  onClick={() => {
                    setAutoRotate(false);
                    setActiveNodeId(node.id);
                  }}
                  className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    isActive
                      ? activeClasses
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-[10px] sm:text-xs font-mono font-bold leading-tight line-clamp-1">
                    {node.shortLabel}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-current animate-pulse' : 'bg-zinc-700'}`} />
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Floating Holographic Detail Panel (7 Cols on desktop) */}
        <div className="lg:col-span-7">
          <Tilt3DCard 
            glowColor={activeNode.borderGlow}
            borderColor={activeNode.borderGlow}
            className="p-6 sm:p-8"
            elevation="lg"
          >
            {/* Holographic Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeNode.color === 'amber'
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    : activeNode.color === 'sky'
                      ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                      : 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                }`}>
                  <activeNode.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block">
                    {activeNode.tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-cinzel font-black text-white">
                    {activeNode.title}
                  </h3>
                </div>
              </div>

              {/* Live Metric Badges */}
              <div className="flex items-center gap-2 self-start sm:self-auto font-mono">
                {activeNode.metrics.map((m, idx) => (
                  <div key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px]">
                    <span className="text-zinc-500 mr-1.5">{m.label}:</span>
                    <strong className="text-amber-300 font-bold">{m.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* 1-Line Punchy Statement */}
            <div className="my-5 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed">
                {activeNode.headline}
              </p>
            </div>

            {/* Punchy Bullet Points */}
            <div className="space-y-3">
              <span className="text-[10.5px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                CORE CAPABILITIES & VERIFICATION:
              </span>
              {activeNode.punchyPoints.map((point, index) => (
                <div 
                  key={index}
                  className="p-3 sm:p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/70 flex items-start gap-3 hover:border-zinc-700 transition"
                >
                  <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span className="text-xs sm:text-sm text-zinc-300 font-sans leading-normal">
                    {point}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Status Bar */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFIED NEURAL RUNTIME
              </span>
              <span className="text-zinc-500">
                AURUM ORACLE v4.8
              </span>
            </div>

          </Tilt3DCard>
        </div>

      </div>
    </div>
  );
};
