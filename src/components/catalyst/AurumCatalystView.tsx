import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Radio, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Target,
  Zap
} from 'lucide-react';

export type CatalystStatus =
  | 'SCANNING'
  | 'WAITING'
  | 'SIGNAL ACTIVE'
  | 'TP1 HIT'
  | 'TP2 HIT'
  | 'SL HIT'
  | 'MISSED ENTRY'
  | 'COOLDOWN';

export interface CatalystPublicState {
  module: 'AURUM CATALYST';
  asset: 'GOLD / XAUUSD';
  status: CatalystStatus;
  livePrice: number;
  telegramConnected: boolean;
  signal: {
    direction: 'BUY' | 'SELL';
    entry: string;
    sl: string;
    tp1: string;
    tp2: string;
  } | null;
  serverTime: number;
}

export const AurumCatalystView: React.FC = () => {
  const [state, setState] = useState<CatalystPublicState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchState = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/catalyst/state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('[CatalystView] Error fetching Catalyst state:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  const triggerForceScan = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/catalyst/force-scan', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.error('[CatalystView] Force scan error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Fast polling for instant live price & status updates (every 3 seconds)
    const interval = setInterval(() => {
      fetchState();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const currentStatus: CatalystStatus = state?.status || 'WAITING';
  const signal = state?.signal || null;
  const isSignalActive = currentStatus === 'SIGNAL ACTIVE' || (signal !== null && currentStatus !== 'COOLDOWN');
  const livePrice = state?.livePrice ? state.livePrice.toFixed(2) : '4150.00';
  const telegramConnected = state?.telegramConnected ?? true;

  // Status Badge Configuration
  const getStatusBadgeConfig = (status: CatalystStatus) => {
    switch (status) {
      case 'SIGNAL ACTIVE':
        return {
          label: 'SIGNAL ACTIVE',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-pulse',
          icon: Zap
        };
      case 'TP1 HIT':
        return {
          label: 'TP1 HIT',
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
          dot: 'bg-cyan-400',
          icon: Target
        };
      case 'TP2 HIT':
        return {
          label: 'TP2 HIT',
          color: 'text-amber-300 bg-amber-500/15 border-amber-400/40',
          dot: 'bg-amber-400 animate-pulse',
          icon: CheckCircle2
        };
      case 'SL HIT':
        return {
          label: 'SL HIT',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          dot: 'bg-rose-400',
          icon: AlertCircle
        };
      case 'MISSED ENTRY':
        return {
          label: 'MISSED ENTRY',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: AlertCircle
        };
      case 'COOLDOWN':
        return {
          label: 'COOLDOWN',
          color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
          dot: 'bg-indigo-400 animate-pulse',
          icon: Clock
        };
      case 'SCANNING':
        return {
          label: 'SCANNING',
          color: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
          dot: 'bg-amber-400 animate-ping',
          icon: Radio
        };
      case 'WAITING':
      default:
        return {
          label: 'WAITING',
          color: 'text-zinc-300 bg-zinc-800/60 border-zinc-700/50',
          dot: 'bg-zinc-400 animate-pulse',
          icon: Clock
        };
    }
  };

  const statusConfig = getStatusBadgeConfig(currentStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="w-full max-w-lg mx-auto px-3 sm:px-4 py-4 space-y-4 font-mono-num select-none">
      {/* 1. Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#10121a] to-[#090a0f] border border-amber-500/25 p-5 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-md shadow-amber-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white flex items-center gap-1.5">
                AURUM CATALYST
              </h1>
              <p className="text-[11px] font-semibold tracking-wider text-amber-400/90 uppercase">
                GOLD / XAUUSD
              </p>
            </div>
          </div>

          <button
            onClick={() => triggerForceScan()}
            disabled={refreshing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white text-[11px] transition active:scale-95 disabled:opacity-50"
            title="Scan market now"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Scan</span>
          </button>
        </div>

        {/* Live Spot Ticker Banner */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400 font-medium">LIVE SPOT PRICE</span>
          </div>
          <div className="text-base sm:text-lg font-black text-white tracking-tight">
            ${livePrice}
          </div>
        </div>
      </div>

      {/* 2. Primary Status Card */}
      <div className="rounded-2xl bg-[#0b0d13] border border-zinc-800/80 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
            Current Status
          </span>
          <div className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border flex items-center gap-1.5 ${statusConfig.color}`}>
            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* 3. Active Trade Signal Details (Rendered when signal is active or in progress) */}
        {signal && (
          <div className="mt-3 pt-4 border-t border-zinc-800/80 space-y-4">
            {/* Direction Pill */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Action
              </span>
              <div className={`px-4 py-1.5 rounded-xl font-black text-sm tracking-wider flex items-center gap-1.5 border shadow-lg ${
                signal.direction === 'BUY'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-500/10'
              }`}>
                {signal.direction === 'BUY' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{signal.direction}</span>
              </div>
            </div>

            {/* Metric Grid: Entry, SL, TP1, TP2 */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Entry */}
              <div className="rounded-xl bg-zinc-900/70 border border-zinc-800/80 p-3 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  Entry
                </span>
                <span className="text-base font-black text-white tracking-tight mt-1">
                  ${signal.entry}
                </span>
              </div>

              {/* Stop Loss */}
              <div className="rounded-xl bg-rose-950/20 border border-rose-900/30 p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-rose-300/80 tracking-wider">
                    SL
                  </span>
                  <span className="text-[10px] font-bold text-rose-400">
                    {signal.direction === 'BUY' ? '-$10' : '+$10'}
                  </span>
                </div>
                <span className="text-base font-black text-rose-300 tracking-tight mt-1">
                  ${signal.sl}
                </span>
              </div>

              {/* TP1 */}
              <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/30 p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-emerald-300/80 tracking-wider">
                    TP1
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    +$7
                  </span>
                </div>
                <span className="text-base font-black text-emerald-300 tracking-tight mt-1">
                  ${signal.tp1}
                </span>
              </div>

              {/* TP2 */}
              <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-amber-300/80 tracking-wider">
                    TP2
                  </span>
                  <span className="text-[10px] font-bold text-amber-400">
                    +$11
                  </span>
                </div>
                <span className="text-base font-black text-amber-300 tracking-tight mt-1">
                  ${signal.tp2}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* When NO active signal is present */}
        {!signal && (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
              <StatusIcon className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-400 font-medium max-w-xs">
              {currentStatus === 'COOLDOWN'
                ? 'Cooling down after trade completion. Re-analyzing market shortly.'
                : currentStatus === 'MISSED ENTRY'
                ? 'Price extended before entry. Standing by for next closed candle setup.'
                : 'Monitoring market for valid trade setups.'}
            </p>
          </div>
        )}
      </div>

      {/* 4. Telegram Status Footer */}
      <div className="rounded-2xl bg-[#0b0d13] border border-zinc-800/80 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-zinc-300">
            Telegram
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${telegramConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
          <span className={`text-xs font-bold tracking-wider uppercase ${
            telegramConnected ? 'text-emerald-400' : 'text-zinc-400'
          }`}>
            {telegramConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
    </div>
  );
};
