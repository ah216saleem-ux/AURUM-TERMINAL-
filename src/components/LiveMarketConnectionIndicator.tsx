import React, { useState, useEffect } from 'react';
import { Radio, Activity, AlertTriangle, Wifi, WifiOff, CheckCircle2, Clock, RefreshCw, Zap } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

interface LiveMarketConnectionIndicatorProps {
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const LiveMarketConnectionIndicator: React.FC<LiveMarketConnectionIndicatorProps> = ({
  compact = false,
  showDetails = true,
  className = ''
}) => {
  const {
    dataConnectedStatus,
    isWebSocketActive,
    streamStatus,
    lastMarketDataUpdate,
    setIsRealDataModalOpen,
    refreshMarketData
  } = useMarket();

  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Update seconds ago live counter every 500ms
  useEffect(() => {
    const updateElapsed = () => {
      const diff = Math.max(0, (Date.now() - (lastMarketDataUpdate || Date.now())) / 1000);
      setSecondsAgo(parseFloat(diff.toFixed(1)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 500);
    return () => clearInterval(interval);
  }, [lastMarketDataUpdate]);

  const isFeedLive = secondsAgo < 8 && dataConnectedStatus === 'LIVE';
  const isFeedStale = secondsAgo >= 8 && secondsAgo < 15;
  const isFeedStopped = secondsAgo >= 15;

  const handleManualRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      await refreshMarketData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => setIsRealDataModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer border shadow-sm ${
          isFeedLive
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            : isFeedStale
            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 animate-pulse'
        } ${className}`}
        title={`Market Data: ${isWebSocketActive ? 'WebSocket' : 'REST Fallback'} • Last tick: ${secondsAgo}s ago`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isFeedLive
              ? 'bg-emerald-400 animate-pulse'
              : isFeedStale
              ? 'bg-amber-400'
              : 'bg-rose-500 animate-ping'
          }`}
        />
        <span>{isFeedLive ? 'LIVE MARKET DATA ✅' : isFeedStale ? 'FEED DELAYED ⚠️' : 'FEED STOPPED 🔴'}</span>
        <span className="text-[10px] opacity-75 font-normal">({secondsAgo}s)</span>
      </button>
    );
  }

  return (
    <div
      onClick={() => setIsRealDataModalOpen(true)}
      className={`p-2.5 sm:p-3 rounded-xl bg-zinc-950/90 border transition-all duration-150 cursor-pointer shadow-md group ${
        isFeedLive
          ? 'border-emerald-500/30 hover:border-emerald-500/50'
          : isFeedStale
          ? 'border-amber-500/40 hover:border-amber-500/60 bg-amber-950/20'
          : 'border-rose-500/50 hover:border-rose-500/70 bg-rose-950/20'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Indicator Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isFeedLive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : isFeedStale
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            {isFeedLive ? (
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            ) : isFeedStale ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-black tracking-wide text-white">
                {isFeedLive
                  ? 'LIVE MARKET DATA ✅'
                  : isFeedStale
                  ? 'FEED DELAYED ⚠️'
                  : 'FEED STOPPED 🔴'}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold uppercase border ${
                  isWebSocketActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}
              >
                {isWebSocketActive ? 'WS STREAM' : 'REST POLLING'}
              </span>
            </div>

            {showDetails && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-zinc-500" />
                  Last tick: <span className="font-bold text-zinc-200">{secondsAgo}s ago</span>
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">
                  {secondsAgo < 3 ? 'FRESH (<3s)' : secondsAgo < 8 ? 'NORMAL' : 'STALE'}
                </span>
                <span>•</span>
                <span className="text-zinc-500 hidden sm:inline">LBMA / CME / SPOT</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Manual Trigger & Details Prompt */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Force Market Data Resync"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <span className="hidden md:inline-block text-[10px] font-mono text-amber-400/90 group-hover:text-amber-300 transition underline decoration-amber-500/40">
            Diagnostics →
          </span>
        </div>
      </div>

      {/* Warning Alert if feed stops */}
      {isFeedStopped && (
        <div className="mt-2 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[11px] font-mono text-rose-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Warning: Feed paused ({secondsAgo}s). Attempting background reconnect...</span>
          </span>
          <button
            onClick={handleManualRefresh}
            className="px-2 py-0.5 rounded bg-rose-500 text-black font-bold text-[10px] hover:bg-rose-400 cursor-pointer"
          >
            Reconnect Now
          </button>
        </div>
      )}
    </div>
  );
};
