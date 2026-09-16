import React, { useState } from 'react';
import { AssetAiProfile } from '../types';
import { getAssetAiProfile } from '../data/multiAssetIntelligence';
import {
  X,
  Zap,
  Activity,
  Clock,
  Sliders,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Gauge
} from 'lucide-react';

interface AssetAiProfileModalProps {
  assetId: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenChart?: (assetId: string) => void;
}

export function AssetAiProfileModal({
  assetId,
  isOpen,
  onClose,
  onOpenChart
}: AssetAiProfileModalProps) {
  const [selectedStyleTab, setSelectedStyleTab] = useState<'scalping' | 'intraday' | 'swing'>('intraday');

  if (!isOpen) return null;

  const profile: AssetAiProfile = getAssetAiProfile(assetId);
  const weights = profile.strategyWeightAdjustment[selectedStyleTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-[#0d0e14] border border-amber-500/30 shadow-2xl shadow-amber-500/10 overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 border-b border-zinc-800/80 bg-gradient-to-r from-neutral-950 via-[#12131a] to-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold font-mono-num text-white tracking-wide">
                  {profile.symbol}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {profile.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">{profile.name} • AI Asset Profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans scrollbar-thin scrollbar-thumb-zinc-700">
          
          {/* 1. Volatility Behaviour Card */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-mono-num font-bold uppercase tracking-wider text-[11px]">
                <Activity className="w-4 h-4" />
                <span>Volatility Behaviour</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-num font-extrabold uppercase ${
                  profile.volatilityBehavior.level === 'EXTREME'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : profile.volatilityBehavior.level === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                }`}
              >
                {profile.volatilityBehavior.level} VOLATILITY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono-num text-[11px]">
              <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 block uppercase">Average Daily Range</span>
                <span className="font-bold text-zinc-200">{profile.volatilityBehavior.adrText}</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 block uppercase">Expansion Speed</span>
                <span className="font-bold text-amber-300">{profile.volatilityBehavior.speedOfExpansion}</span>
              </div>
            </div>

            <p className="text-[11.5px] text-zinc-300 leading-relaxed font-normal pt-1">
              {profile.volatilityBehavior.description}
            </p>
          </div>

          {/* 2. Best Trading Sessions */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-mono-num font-bold uppercase tracking-wider text-[11px]">
                <Clock className="w-4 h-4" />
                <span>Best Trading Sessions</span>
              </div>
              <span className="text-[10.5px] font-mono-num text-zinc-400">
                {profile.bestTradingSessions.recommendedHoursUtc}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono-num text-[11px]">
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <span className="text-[10px] text-amber-400/80 block uppercase font-bold">Primary Session</span>
                <span className="font-bold text-white text-xs">{profile.bestTradingSessions.primary}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">Secondary Session</span>
                <span className="font-bold text-zinc-300 text-xs">{profile.bestTradingSessions.secondary}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 bg-black/40 p-2 rounded-xl border border-zinc-900">
              💡 <strong className="text-zinc-200">Session Rule:</strong> {profile.bestTradingSessions.sessionNote}
            </p>
          </div>

          {/* 3. Strategy Weight Adjustment */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-mono-num font-bold uppercase tracking-wider text-[11px]">
                <Sliders className="w-4 h-4" />
                <span>Strategy Weight Adjustment</span>
              </div>
            </div>

            {/* Mode sub-tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono-num font-bold">
              {(['scalping', 'intraday', 'swing'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedStyleTab(mode)}
                  className={`py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer ${
                    selectedStyleTab === mode
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-extrabold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Strategy Weight Bars */}
            <div className="space-y-2 pt-1 font-mono-num text-[11px]">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Smart Money Concepts (SMC)</span>
                  <span className="font-bold text-amber-400">{weights.smc}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${weights.smc}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Trend Direction & Alignment</span>
                  <span className="font-bold text-emerald-400">{weights.trend}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${weights.trend}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Liquidity Pools & Sweeps</span>
                  <span className="font-bold text-sky-400">{weights.liquidity}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: `${weights.liquidity}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Momentum & Volume Delta</span>
                  <span className="font-bold text-purple-400">{weights.momentum}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${weights.momentum}%` }} />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 italic bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl">
              "{weights.rationale}"
            </p>
          </div>

          {/* 4. News Sensitivity & Catalysts */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-mono-num font-bold uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4" />
                <span>News Sensitivity</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono-num font-bold uppercase ${
                  profile.newsSensitivity.level === 'ULTRA'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {profile.newsSensitivity.level} IMPACT
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-400 font-mono-num uppercase block">Key Macro Catalysts:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.newsSensitivity.keyCatalysts.map((catalyst, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10.5px] text-zinc-200"
                  >
                    • {catalyst}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-950/15 border border-rose-500/20 text-rose-200/90 text-[11px] flex items-center justify-between">
              <span>⚠️ Risk Freeze: {profile.newsSensitivity.blackoutMinutesBefore}m before & {profile.newsSensitivity.blackoutMinutesAfter}m after high impact news</span>
            </div>
          </div>

          {/* 5. Preferred Timeframes & Institutional Behavior */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono-num font-bold uppercase tracking-wider text-[11px]">
              <Layers className="w-4 h-4" />
              <span>Preferred Timeframes & Institutional Flow</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono-num">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Scalp TF</span>
                <span className="font-bold text-amber-400 text-xs">{profile.preferredTimeframe.scalping}</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Intraday TF</span>
                <span className="font-bold text-amber-400 text-xs">{profile.preferredTimeframe.intraday}</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Swing TF</span>
                <span className="font-bold text-amber-400 text-xs">{profile.preferredTimeframe.swing}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11.5px] text-zinc-300">
              <span className="text-zinc-400 font-bold block mb-0.5">🏛️ Institutional Behavior:</span>
              {profile.institutionBehavior}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-3.5 border-t border-zinc-800/80 bg-neutral-950 flex items-center gap-2">
          {onOpenChart && (
            <button
              onClick={() => {
                onClose();
                onOpenChart(assetId);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono-num font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>View Interactive Chart & SMC</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono-num font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
