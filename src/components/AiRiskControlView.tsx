import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  AlertTriangle, 
  Award, 
  Gauge, 
  Target, 
  Zap, 
  TrendingUp, 
  Info, 
  Sliders, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { getAurumRiskEvaluation } from '../data/riskQualityData';
import { TradeSetupGrade } from '../types';

const ASSET_LIST = [
  { id: 'xau-usd', symbol: 'XAU/USD', name: 'Spot Gold' },
  { id: 'nasdaq-100', symbol: 'NASDAQ 100', name: 'US Tech Index' },
  { id: 'sp-500', symbol: 'S&P 500', name: 'US Broad Index' },
  { id: 'crude-oil', symbol: 'Oil WTI', name: 'Crude Oil' },
  { id: 'xag-usd', symbol: 'Silver', name: 'XAG/USD Spot' }
];

export const AiRiskControlView: React.FC = () => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('xau-usd');

  const selectedAsset = ASSET_LIST.find(a => a.id === selectedAssetId) || ASSET_LIST[0];
  const evalData = getAurumRiskEvaluation(selectedAssetId, '1H');

  const gradeStyle = (grade: TradeSetupGrade) => {
    switch (grade) {
      case 'A+ Setup':
        return 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30';
      case 'A Setup':
        return 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30';
      case 'B Setup':
        return 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/30';
      case 'Avoid Trade':
      default:
        return 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30 animate-pulse';
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121524] via-[#0d0f19] to-[#070911] border border-amber-500/35 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-syne tracking-wide uppercase">
                AI Risk & Quality Control System
              </h3>
              <span className="text-[10.5px] font-mono-num text-zinc-400">
                Institutional Quality Filters & Final Verdict Engine
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono-num font-bold">
            6/6 FILTERS ACTIVE
          </span>
        </div>

        {/* ASSET SELECTOR */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono-num">
          {ASSET_LIST.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setSelectedAssetId(asset.id)}
              className={`px-3 py-1.5 rounded-xl shrink-0 font-bold transition cursor-pointer border ${
                selectedAssetId === asset.id
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/25'
                  : 'bg-neutral-950 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {asset.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* 4. NO TRADE ZONE BANNER */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 font-mono-num shadow-lg ${
        evalData.noTradeZone.isNoTradeZone
          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
          : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
      }`}>
        <div className="flex items-start gap-3">
          {evalData.noTradeZone.isNoTradeZone ? (
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 block">
              Market Quality Gatekeeper
            </span>
            <h4 className="text-sm font-extrabold uppercase tracking-wide">
              {evalData.noTradeZone.title}
            </h4>
            <ul className="mt-1 space-y-0.5 text-[11px] font-sans">
              {evalData.noTradeZone.reasons.map((r, i) => (
                <li key={i} className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 5. AURUM FINAL VERDICT PANEL */}
      <div className="p-4 rounded-2xl bg-[#0b0e17] border border-amber-500/40 space-y-4 shadow-xl font-mono-num">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-widest">
              AURUM FINAL VERDICT
            </h4>
          </div>

          <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase border ${gradeStyle(evalData.setupGrade)}`}>
            {evalData.setupGrade}
          </span>
        </div>

        {/* Big Verdict Row: Decision, Confidence, Asset */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-zinc-800">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">Selected Asset</span>
            <span className="text-base font-bold text-white">{selectedAsset.name} ({selectedAsset.symbol})</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase block">Confidence Rating</span>
              <span className="text-sm font-extrabold text-emerald-400 flex items-center justify-end gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {evalData.confidence}%
              </span>
            </div>

            <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider border shadow-lg ${
              evalData.decision === 'BUY'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/30'
                : evalData.decision === 'SELL'
                  ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/30'
                  : 'bg-amber-500 text-black border-amber-400 shadow-amber-500/30'
            }`}>
              {evalData.decision}
            </span>
          </div>
        </div>

        {/* 5 Composite Scores Breakdown */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
            5-Pillar Score Composite Matrix
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[9.5px] text-zinc-500 uppercase block">Technical Score</span>
              <span className="text-sm font-bold text-zinc-100">{evalData.scores.technicalScore}%</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[9.5px] text-zinc-500 uppercase block">SMC Score</span>
              <span className="text-sm font-bold text-amber-300">{evalData.scores.smcScore}%</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[9.5px] text-zinc-500 uppercase block">Momentum Score</span>
              <span className="text-sm font-bold text-emerald-400">{evalData.scores.momentumScore}%</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[9.5px] text-zinc-500 uppercase block">News Score</span>
              <span className={`text-sm font-bold ${evalData.scores.newsScore < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {evalData.scores.newsScore}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[9.5px] text-zinc-500 uppercase block">Risk Score</span>
              <span className="text-sm font-bold text-amber-300">{evalData.scores.riskScore}%</span>
            </div>
          </div>
        </div>

        {/* Detailed Verdict Reason */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
          <span className="text-[10px] font-mono-num font-bold text-amber-300 uppercase block">
            AURUM AI Verdict Synthesis
          </span>
          <p className="text-xs text-zinc-200 font-sans leading-relaxed">
            {evalData.verdictReason}
          </p>
        </div>
      </div>

      {/* 3. RISK MANAGEMENT PANEL */}
      <div className="p-4 rounded-2xl bg-[#0c0e15] border border-zinc-800 space-y-3 font-mono-num shadow-md">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-amber-400" />
            Risk Management Parameters
          </span>

          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
            evalData.riskPanel.riskLevel === 'LOW'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : evalData.riskPanel.riskLevel === 'MEDIUM'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
          }`}>
            Risk Level: {evalData.riskPanel.riskLevel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9.5px] text-zinc-500 uppercase block">Entry Confidence</span>
            <span className="font-bold text-emerald-400 text-sm block">{evalData.riskPanel.entryConfidence}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9.5px] text-zinc-500 uppercase block">Risk to Reward Ratio</span>
            <span className="font-bold text-amber-300 text-sm block">{evalData.riskPanel.riskReward}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9.5px] text-zinc-500 uppercase block">Stop Loss Quality</span>
            <span className="font-medium text-zinc-200 text-[11px] block">{evalData.riskPanel.stopLossQuality}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 space-y-0.5">
            <span className="text-[9.5px] text-zinc-500 uppercase block">Take Profit Probability</span>
            <span className="font-medium text-zinc-200 text-[11px] block">{evalData.riskPanel.takeProfitProbability}</span>
          </div>
        </div>
      </div>

      {/* 1. TRADE QUALITY FILTER CHECKLIST (6 CHECKS) */}
      <div className="p-4 rounded-2xl bg-[#0c0e15] border border-zinc-800 space-y-3 shadow-md font-mono-num">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            Trade Quality Filter Matrix (6 Verification Checks)
          </span>
        </div>

        <div className="space-y-2">
          {Object.entries(evalData.qualityFilter).map(([key, item]) => {
            const check = item as { passed: boolean; label: string; detail: string };
            return (
              <div
                key={key}
                className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-white block">{check.label}</span>
                    <span className="text-[10.5px] text-zinc-400 font-sans block leading-tight">{check.detail}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  check.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {check.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
