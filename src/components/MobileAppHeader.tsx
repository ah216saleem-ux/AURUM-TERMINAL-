import React from 'react';
import { Sparkles, Send, Radio, Zap, Bell, BookOpen, Activity } from 'lucide-react';
import { SubtleGlobe } from './SubtleGlobe';
import { useMarket } from '../context/MarketContext';
import { ConnectionValidationCard } from './ConnectionValidationCard';

export const MobileAppHeader: React.FC = () => {
  const { 
    setIsTelegramModalOpen, 
    setIsAlertCenterOpen, 
    unreadAlertCount,
    setIsDailyBriefOpen,
    setIsQaModalOpen,
    dataConnectedStatus,
    lastMarketDataUpdate,
    isDataConnected,
    isWebSocketActive,
    streamStatus,
    refreshMarketData
  } = useMarket();

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#10131e] via-[#0b0d14] to-[#07080c] border border-amber-500/25 p-5 shadow-xl">
      {/* Background ambient gold radial glow */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 rounded-full blur-2xl" />

      {/* Top row: Brand & Status Pill & Quick Action Triggers */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Brand Crest */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#242530] to-[#0d0e14] border border-amber-500/40 flex items-center justify-center shadow-md shadow-amber-500/15">
            <span className="font-cinzel text-lg font-bold bg-gradient-to-b from-[#FFF2A3] via-[#D4AF37] to-[#8C6914] bg-clip-text text-transparent">
              AT
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-syne text-base font-bold tracking-wider text-white">
                AURUM <span className="text-amber-400 font-light">AI</span>
              </h1>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[9px] font-mono-num font-bold text-amber-300">
                PRO
              </span>
            </div>
            <p className="text-[10px] font-cinzel text-zinc-400 tracking-widest uppercase">
              Trading Signals
            </p>
          </div>
        </div>

        {/* Live Signal Heartbeat, AI Brief, AI Alert Center & Telegram Button */}
        <div className="flex items-center gap-1.5">
          {/* Daily Brief Button */}
          <button
            onClick={() => setIsDailyBriefOpen(true)}
            className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 transition shadow-sm flex items-center gap-1 cursor-pointer"
            title="Open Daily AI Market Brief"
            aria-label="Daily AI Market Brief"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[10px] font-mono-num font-bold text-amber-300">Brief</span>
          </button>

          {/* Alert Center Button with Badge */}
          <button
            onClick={() => setIsAlertCenterOpen(true)}
            className="relative p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 transition shadow-sm cursor-pointer"
            title="Open AI Alert Center"
            aria-label="AI Alert Center"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-mono-num font-extrabold flex items-center justify-center shadow-md animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Telegram Wire */}
          <button
            onClick={() => setIsTelegramModalOpen(true)}
            className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/30 text-sky-400 hover:text-sky-300 transition shadow-sm cursor-pointer"
            title="Open Telegram Signal Wire"
            aria-label="Telegram signal wire"
          >
            <Send className="w-3.5 h-3.5" />
          </button>

          {/* QA & Monitor Button */}
          <button
            onClick={() => setIsQaModalOpen(true)}
            className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/30 text-amber-400 hover:text-amber-350 transition shadow-sm cursor-pointer"
            title="Open QA & Live Monitoring Control Center"
            aria-label="QA & Monitor"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Subtle 3D Globe Animation (Compact & Interactive) */}
      <div className="relative mt-2 h-28 sm:h-32 w-full flex items-center justify-center">
        <SubtleGlobe />
      </div>

      {/* Live Market Price Connection Validation Card */}
      <ConnectionValidationCard className="mt-2" />
    </div>
  );
};

