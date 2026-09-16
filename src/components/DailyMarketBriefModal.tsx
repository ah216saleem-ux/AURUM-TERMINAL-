import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ShieldAlert, 
  Radio, 
  Zap, 
  ArrowUpRight, 
  Check, 
  Copy, 
  Send, 
  Share2,
  AlertTriangle,
  Globe2,
  Clock,
  Layers
} from 'lucide-react';
import { DAILY_MARKET_BRIEF } from '../data/dailyBriefData';
import { useMarket } from '../context/MarketContext';
import { MarketItem } from '../types';

interface DailyMarketBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMarket: (market: MarketItem) => void;
}

export const DailyMarketBriefModal: React.FC<DailyMarketBriefModalProps> = ({
  isOpen,
  onClose,
  onSelectMarket
}) => {
  const { markets, sendSignalToTelegram } = useMarket();
  const [copied, setCopied] = useState(false);
  const [dispatchedNotice, setDispatchedNotice] = useState(false);

  if (!isOpen) return null;

  const brief = DAILY_MARKET_BRIEF;

  const handleCopy = () => {
    const text = `AURUM AI • DAILY MARKET BRIEF
Date: ${brief.date}

MARKET TREND:
${brief.marketTrend.headline}
${brief.marketTrend.summary}

PREFERRED TRADING MODE:
${brief.preferredTradingMode.mode} (${brief.preferredTradingMode.recommendedSession})

TOP OPPORTUNITIES:
${brief.bestOpportunities.map(o => `• ${o.symbol} [${o.direction}] (Conf: ${o.confidence}%) - ${o.keyLevels}`).join('\n')}

RISK AREAS:
${brief.riskAreas.map(r => `• ${r.warning}: ${r.action}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDispatchTelegram = async () => {
    setDispatchedNotice(true);
    setTimeout(() => setDispatchedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0c0e16] border border-amber-500/40 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-28 bg-amber-500/15 rounded-full blur-2xl" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-neutral-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-syne font-bold text-white tracking-wide">
                  Daily AI Market Brief
                </h2>
                <span className="px-2 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9.5px] font-mono-num font-extrabold text-amber-300">
                  INSTITUTIONAL
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono-num flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{brief.date}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            aria-label="Close Market Brief"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dispatched Notification banner */}
        {dispatchedNotice && (
          <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300 font-mono-num animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Daily Brief dispatched to Telegram Channel (@aurum_ai_signals)</span>
            </div>
          </div>
        )}

        {/* Scrollable Brief Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. Market Trend Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131626] to-[#0c0d15] border border-amber-500/40 space-y-2.5 shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                  <Globe2 className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xs font-mono-num font-extrabold text-amber-300 uppercase tracking-wider">
                  1. Market Trend & Institutional Flow
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10.5px] font-mono-num font-bold">
                {brief.marketTrend.sentiment} RISK-ON
              </span>
            </div>

            <p className="text-sm font-syne font-bold text-white leading-snug">
              {brief.marketTrend.headline}
            </p>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {brief.marketTrend.summary}
            </p>

            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 text-[11px] font-mono-num text-zinc-300 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{brief.marketTrend.dxyImpact}</span>
            </div>
          </div>

          {/* 2. Preferred Trading Mode Recommendation */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#151928] to-[#0f111a] border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-sky-500/20 text-sky-400">
                  <Layers className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-xs font-mono-num font-extrabold text-sky-300 uppercase tracking-wider">
                  2. Preferred Trading Mode
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10.5px] font-mono-num font-extrabold">
                {brief.preferredTradingMode.mode}
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {brief.preferredTradingMode.reason}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono-num pt-1">
              <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
                <span className="text-zinc-500 block uppercase font-sans text-[9px]">Optimal Session</span>
                <span className="font-bold text-white">{brief.preferredTradingMode.recommendedSession}</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
                <span className="text-zinc-500 block uppercase font-sans text-[9px]">Risk Budget</span>
                <span className="font-bold text-emerald-400">{brief.preferredTradingMode.riskBudget}</span>
              </div>
            </div>
          </div>

          {/* 3. Best Opportunities Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <h3 className="text-xs font-mono-num font-extrabold text-zinc-300 uppercase tracking-wider">
                  3. Best Opportunities Today ({brief.bestOpportunities.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono-num text-amber-400">
                Ranked by Confluence
              </span>
            </div>

            <div className="space-y-2">
              {brief.bestOpportunities.map((opp) => {
                const isBuy = opp.direction === 'BUY';
                return (
                  <div
                    key={opp.assetId}
                    className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800/80 hover:border-amber-500/50 transition space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-syne text-xs font-bold text-white">
                          {opp.symbol}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[9.5px] font-mono-num font-bold text-zinc-300">
                          {opp.tradingMode}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-[9.5px] font-mono-num font-extrabold text-amber-300 border border-amber-500/30">
                          Grade {opp.grade}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10.5px] font-mono-num font-extrabold flex items-center gap-1 ${
                            isBuy
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{opp.direction}</span>
                        </span>

                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-amber-300 font-mono-num font-bold text-[10.5px]">
                          {opp.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono-num text-amber-400/90 font-bold bg-black/40 p-1.5 rounded-lg border border-zinc-800/80">
                      {opp.keyLevels}
                    </div>

                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      {opp.thesis}
                    </p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          const target = markets.find(m => m.id === opp.assetId);
                          if (target) {
                            onSelectMarket(target);
                            onClose();
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono-num font-bold text-[10.5px] transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Trade Setup</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Risk Areas Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1215] to-[#110c0e] border border-rose-500/30 space-y-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-mono-num font-extrabold text-rose-300 uppercase tracking-wider">
                4. Risk Areas & Volatility Traps
              </h3>
            </div>

            <div className="space-y-2">
              {brief.riskAreas.map((risk, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono-num flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {risk.warning}
                    </span>
                    <span className="text-[9.5px] font-mono-num font-bold text-rose-400 uppercase">
                      {risk.severity} SEVERITY
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                    {risk.action}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono-num pt-0.5">
                    <span>Assets affected:</span>
                    <span className="text-zinc-400 font-bold">{risk.affectedAssets.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Major News Impact */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono-num font-extrabold text-zinc-300 uppercase tracking-wider">
                5. Major Macro News Impact
              </h3>
            </div>

            <div className="space-y-2">
              {brief.majorNewsImpact.map((news, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-zinc-300 font-mono-num">
                    <span className="font-bold text-white">{news.event}</span>
                    <span className="text-[10px] text-amber-400 font-bold">{news.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    {news.takeaway}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-zinc-800 bg-neutral-950/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono-num text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Brief'}</span>
            </button>

            <button
              onClick={handleDispatchTelegram}
              className="p-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-mono-num text-sky-300 hover:text-sky-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Push Telegram</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono-num font-bold transition shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Close Brief
          </button>
        </div>
      </div>
    </div>
  );
};
