import React from 'react';
import { ShieldCheck, Globe, Radio, ArrowUp, Send, Bot, Sparkles } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const Footer: React.FC = () => {
  const { setIsTelegramModalOpen } = useMarket();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#050608] border-t border-amber-500/20 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Trading Hubs & AI Model Telemetry for all 5 assets */}
        <div className="p-5 rounded-xl bg-neutral-950/80 border border-zinc-800/80">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 text-xs font-mono-num">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              AURUM AI SMC PIPELINE (5 CORE ASSET ENGINES ACTIVE)
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              TELEGRAM WIRE SYNCED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-mono-num">
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">GOLD (XAU/USD)</span>
              <span className="text-emerald-400 font-semibold">BUY • 92% CONF</span>
              <span className="text-[10px] text-zinc-400 block font-medium mt-0.5">TP1: $2,685.00</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">SILVER (XAG/USD)</span>
              <span className="text-emerald-400 font-semibold">BUY • 89% CONF</span>
              <span className="text-[10px] text-zinc-400 block font-medium mt-0.5">TP1: $32.80</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">NASDAQ 100</span>
              <span className="text-emerald-400 font-semibold">BUY • 86% CONF</span>
              <span className="text-[10px] text-zinc-400 block font-medium mt-0.5">TP1: 20,250.00</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">S&P 500</span>
              <span className="text-amber-400 font-semibold">WAIT • 74% CONF</span>
              <span className="text-[10px] text-zinc-400 block font-medium mt-0.5">Trigger: 5,695.00</span>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block">CRUDE OIL</span>
              <span className="text-rose-400 font-semibold">SELL • 84% CONF</span>
              <span className="text-[10px] text-zinc-400 block font-medium mt-0.5">TP1: $68.50</span>
            </div>
          </div>
        </div>

        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4 border-t border-zinc-900">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-amber-500/40 flex items-center justify-center font-cinzel font-bold text-amber-400 text-sm">
                AT
              </div>
              <span className="font-syne font-bold text-lg text-white tracking-wider">
                AURUM <span className="text-amber-400 font-light">TERMINAL</span>
                <span className="ml-2 text-xs font-mono-num font-bold text-amber-300">AI</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-cinzel tracking-widest uppercase">
              Global Markets. Live Intelligence.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-num">
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 transition cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Bot Wire</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-4 border-t border-zinc-900/80 text-[11px] font-sans text-zinc-600 leading-relaxed">
          Risk Disclaimer: Aurum Terminal AI is an algorithmic financial intelligence and trade signal assistant. AI predictions, confidence scores, and trade signals are provided for analytical and informational purposes. Trading Gold, Silver, futures, commodities, and equities involves substantial financial risk of loss. Always apply disciplined capital allocation and stop-loss management.
        </div>
      </div>
    </footer>
  );
};
