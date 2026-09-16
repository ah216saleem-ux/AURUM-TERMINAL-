import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Check, 
  Send, 
  Trash2, 
  ArrowUpRight, 
  ShieldAlert, 
  Layers, 
  Zap, 
  PlusCircle, 
  CheckCheck,
  Clock
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { AiAlert, MarketItem } from '../types';

interface AiAlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAssetChart: (market: MarketItem) => void;
}

export const AiAlertCenterModal: React.FC<AiAlertCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenAssetChart
}) => {
  const { 
    aiAlerts, 
    unreadAlertCount, 
    markAlertAsRead, 
    markAllAlertsAsRead, 
    dismissAlert, 
    triggerSimulatedAlert,
    sendSignalToTelegram,
    markets 
  } = useMarket();

  const [filter, setFilter] = useState<'ALL' | 'HIGH_CONFIDENCE' | 'UNREAD'>('ALL');
  const [telegramNotice, setTelegramNotice] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    return aiAlerts.filter(alert => {
      if (filter === 'HIGH_CONFIDENCE') return alert.confidence >= 85;
      if (filter === 'UNREAD') return !alert.read;
      return true;
    });
  }, [aiAlerts, filter]);

  if (!isOpen) return null;

  const handleOpenTrade = (alert: AiAlert) => {
    markAlertAsRead(alert.id);
    const targetMarket = markets.find(m => m.id === alert.assetId);
    if (targetMarket) {
      onOpenAssetChart(targetMarket);
      onClose();
    }
  };

  const handleSendTelegram = async (alert: AiAlert) => {
    markAlertAsRead(alert.id);
    const res = await sendSignalToTelegram(alert.assetId);
    setTelegramNotice(`Dispatched ${alert.symbol} alert to Telegram wire.`);
    setTimeout(() => setTelegramNotice(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[#0d0f17] border border-amber-500/40 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/15 rounded-full blur-2xl" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-syne font-bold text-white tracking-wide">
                  AI Alert Center
                </h2>
                {unreadAlertCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono-num font-extrabold shadow-sm">
                    {unreadAlertCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Real-time high-probability institutional setup notifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            aria-label="Close Alert Center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telegram Dispatched Notification banner */}
        {telegramNotice && (
          <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300 font-mono-num animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{telegramNotice}</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-bold uppercase">Wire Live</span>
          </div>
        )}

        {/* Filter Bar & Controls */}
        <div className="p-3 border-b border-zinc-800/80 bg-black/40 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 text-[11px] font-mono-num font-bold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              All ({aiAlerts.length})
            </button>

            <button
              onClick={() => setFilter('HIGH_CONFIDENCE')}
              className={`px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                filter === 'HIGH_CONFIDENCE'
                  ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>A+ / 85%+</span>
            </button>

            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Unread ({unreadAlertCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {unreadAlertCount > 0 && (
              <button
                onClick={markAllAlertsAsRead}
                className="p-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10.5px] font-mono-num text-zinc-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Read All</span>
              </button>
            )}

            <button
              onClick={triggerSimulatedAlert}
              className="p-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[10.5px] font-mono-num text-amber-300 hover:text-amber-200 transition flex items-center gap-1 cursor-pointer"
              title="Simulate incoming high-probability setup alert"
            >
              <PlusCircle className="w-3 h-3 text-amber-400" />
              <span>Trigger Test</span>
            </button>
          </div>
        </div>

        {/* Alerts Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-950/60 border border-zinc-800 text-zinc-400 space-y-2">
              <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300 font-sans">No alerts in this category</p>
              <p className="text-xs text-zinc-500 font-sans">
                AURUM AI continuously scans institutional liquidity pools. When a high-grade setup forms, an alert will trigger here.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isBuy = alert.signal === 'BUY';
              return (
                <div
                  key={alert.id}
                  onClick={() => markAlertAsRead(alert.id)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    !alert.read
                      ? 'bg-gradient-to-b from-[#161a29] to-[#0f121d] border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : 'bg-neutral-950/80 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Unread Indicator dot */}
                  {!alert.read && (
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400" />
                  )}

                  {/* Header Row: Symbol, Signal & Mode */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-syne text-sm font-bold text-white">
                        {alert.symbol}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-sans hidden sm:inline">
                        {alert.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono-num text-zinc-300 font-bold border border-zinc-700/60">
                        {alert.tradingMode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mr-3">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-mono-num font-extrabold flex items-center gap-1 shadow-sm ${
                          isBuy
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{alert.signal}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono-num font-bold text-[11px]">
                        {alert.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Explicit Setup Levels Display (Asset, BUY/SELL, Trading Mode, Confidence, Entry, SL, TP) */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-black/60 border border-zinc-800/80 mb-2.5 text-center font-mono-num">
                    <div className="p-1 rounded bg-zinc-900/60">
                      <span className="block text-[9.5px] text-zinc-400 uppercase font-sans">Entry</span>
                      <span className="block text-xs font-bold text-white">
                        ${alert.entry.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-1 rounded bg-zinc-900/60">
                      <span className="block text-[9.5px] text-rose-400/80 uppercase font-sans">Stop Loss</span>
                      <span className="block text-xs font-bold text-rose-400">
                        ${alert.stopLoss.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-1 rounded bg-zinc-900/60">
                      <span className="block text-[9.5px] text-emerald-400/80 uppercase font-sans">Take Profit</span>
                      <span className="block text-xs font-bold text-emerald-400">
                        ${alert.takeProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* AI Reason Box */}
                  <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-zinc-800/80 mb-3 text-xs font-sans space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10.5px] uppercase tracking-wider font-mono-num">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Reason & Confluence</span>
                    </div>
                    <p className="text-zinc-300 text-[11.5px] leading-relaxed">
                      {alert.aiReason}
                    </p>
                  </div>

                  {/* Footer Action Row */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-xs">
                    <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-500 font-mono-num">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp}</span>
                      <span className="mx-1">•</span>
                      <span className="text-amber-400/90 font-bold">Grade {alert.setupGrade}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendTelegram(alert);
                        }}
                        className="p-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                        title="Send alert to Telegram"
                      >
                        <Send className="w-3 h-3 text-sky-400" />
                        <span className="text-[10.5px] font-mono-num">Telegram</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTrade(alert);
                        }}
                        className="p-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono-num font-bold text-[11px] transition shadow-md shadow-amber-500/20 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Execute</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 text-zinc-500 hover:text-rose-400 border border-zinc-800 transition cursor-pointer"
                        title="Dismiss alert"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-800 bg-neutral-950/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono-num">
              Monitoring 11 Global Assets 24/7
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono-num font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
