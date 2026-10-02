import React, { useState } from 'react';
import { Shield, ShieldCheck, CheckCircle2, ChevronRight, Info, X } from 'lucide-react';
import { Tilt3DCard } from './Tilt3DCard';

interface RiskNode {
  id: string;
  name: string;
  tag: string;
  gaugeValue: number; // 0-100
  gaugeLabel: string;
  status: 'OPTIMAL' | 'GUARDED' | 'LOCKED';
  color: 'emerald' | 'amber' | 'rose' | 'sky';
  shortDesc: string;
  detailPoints: string[];
}

const RISK_NODES: RiskNode[] = [
  {
    id: 'volatility',
    name: 'Volatility & ATR',
    tag: '[RISK_01]',
    gaugeValue: 34,
    gaugeLabel: '34% Safe Band',
    status: 'OPTIMAL',
    color: 'emerald',
    shortDesc: 'Real-time ATR audits identify regime shifts and widen stop buffers.',
    detailPoints: [
      'Continuous 5M/15M True Range expansion monitoring',
      'Dynamic stop-loss multiplier during session opens',
      'Sudden wick outlier isolation to prevent stop hunting'
    ]
  },
  {
    id: 'drawdown',
    name: 'Drawdown Breaker',
    tag: '[RISK_02]',
    gaugeValue: 20,
    gaugeLabel: '1.2% / 6.0% Max',
    status: 'OPTIMAL',
    color: 'amber',
    shortDesc: 'Position sizing calculator enforcing strict account equity risk caps.',
    detailPoints: [
      'Hard 6% maximum drawdown kill-switch across active pairs',
      'Consecutive loss streak breaker after 3 negative outcomes',
      'Automated equity recovery with halved position sizing'
    ]
  },
  {
    id: 'spread',
    name: 'Spread & Liquidity',
    tag: '[RISK_03]',
    gaugeValue: 12,
    gaugeLabel: '0.40 Pip Normal',
    status: 'OPTIMAL',
    color: 'sky',
    shortDesc: 'Detection of liquidity gaps, rollover widening, and spread spikes.',
    detailPoints: [
      'Sub-millisecond bid/ask spread anomaly filtering',
      'Session rollover blackout defense window (21:45 - 22:15 UTC)',
      'Zero execution when spread exceeds 2.5x standard deviation'
    ]
  },
  {
    id: 'correlation',
    name: 'Correlation Limits',
    tag: '[RISK_04]',
    gaugeValue: 50,
    gaugeLabel: '1 / 2 Metals Active',
    status: 'GUARDED',
    color: 'rose',
    shortDesc: 'Alignment monitoring between USD index, yields, and gold spot.',
    detailPoints: [
      'Prevents simultaneous duplicate exposure on Gold & Silver',
      'Multi-currency balance check preventing 3x short USD exposure',
      'Index hedging verification on NASDAQ & S&P 500 setups'
    ]
  }
];

interface RiskShieldHudProps {
  onAccessTerminal: () => void;
}

export const RiskShieldHud: React.FC<RiskShieldHudProps> = ({ onAccessTerminal }) => {
  // Hidden by default; toggled on tap
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = selectedNodeId ? RISK_NODES.find(n => n.id === selectedNodeId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>CAPITAL PRESERVATION HUD</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-black tracking-tight text-white">
          RISK <span className="gold-shimmer-text">INTELLIGENCE</span>
        </h2>
        <p className="text-zinc-300 text-xs sm:text-sm max-w-md mx-auto leading-normal">
          Defensive shields auditing volatility, drawdown caps, spread anomalies, and asset correlation.
        </p>
      </div>

      {/* Main HUD Shield Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* 2x2 Grid Gauges */}
        <div className={`p-5 sm:p-6 rounded-3xl bg-[#080b14]/75 border border-zinc-800/80 backdrop-blur-md shadow-xl space-y-4 ${selectedNode ? 'lg:col-span-6' : 'lg:col-span-12 max-w-3xl mx-auto w-full'}`}>
          
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">
                  DEFENSIVE ENGINE
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white font-cinzel">
                  ACTIVE PRESERVATION
                </h3>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              GUARDED
            </span>
          </div>

          {/* 2x2 Grid of Gauges */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            {RISK_NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              
              const borderStyles = isSelected
                ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700';

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(prev => prev === node.id ? null : node.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between active:scale-98 ${borderStyles}`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[9px] text-zinc-400 mb-1">
                      <span>{node.tag}</span>
                      <span className="font-bold text-emerald-400">{node.status}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white font-cinzel line-clamp-1">
                      {node.name}
                    </h4>
                  </div>

                  <div className="mt-2.5">
                    <div className="flex justify-between items-center text-[10px] text-zinc-300 font-bold mb-1">
                      <span className="text-amber-300">{node.gaugeLabel}</span>
                      <span className="text-[9px] text-zinc-500">{isSelected ? 'Tapped (Hide)' : 'Tap details'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          node.color === 'emerald'
                            ? 'bg-emerald-500'
                            : node.color === 'amber'
                              ? 'bg-amber-500'
                              : node.color === 'sky'
                                ? 'bg-sky-500'
                                : 'bg-rose-500'
                        }`}
                        style={{ width: `${node.gaugeValue}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!selectedNode && (
            <div className="pt-1 text-center">
              <span className="text-[11px] font-mono text-zinc-400 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Tap any gauge node above to inspect details & enforcement rules.
              </span>
            </div>
          )}
        </div>

        {/* Selected Diagnostic Details Panel (Shown only when tapped) */}
        {selectedNode && (
          <div className="lg:col-span-6 animate-fadeIn">
            <Tilt3DCard
              glowColor="rgba(244, 63, 94, 0.16)"
              borderColor="rgba(244, 63, 94, 0.4)"
              elevation="lg"
              className="p-5 sm:p-6 space-y-4 rounded-3xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNodeId(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 pr-8">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                    MODULE DETAILS
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
                    {selectedNode.name}
                  </h3>
                </div>

                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {selectedNode.gaugeLabel}
                </span>
              </div>

              {/* 1-Line Description */}
              <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                {selectedNode.shortDesc}
              </p>

              {/* Enforced Rules List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                  ENFORCED RULES:
                </span>
                {selectedNode.detailPoints.map((point, index) => (
                  <div 
                    key={index}
                    className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-2.5"
                  >
                    <div className="w-4 h-4 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span className="text-xs text-zinc-300 font-sans leading-tight">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              {/* Verification Footer */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10.5px] font-mono text-zinc-400">
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  CIRCUIT BREAKER ACTIVE
                </span>
                <button
                  onClick={onAccessTerminal}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer min-h-[44px] py-1"
                >
                  <span>TERMINAL MATRIX</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </Tilt3DCard>
          </div>
        )}

      </div>
    </div>
  );
};
