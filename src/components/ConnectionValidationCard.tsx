import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

interface ConnectionValidationCardProps {
  compact?: boolean;
  className?: string;
  assetId?: string;
}

export const ConnectionValidationCard: React.FC<ConnectionValidationCardProps> = ({ 
  compact = false,
  className = '',
  assetId
}) => {
  const { 
    lastMarketDataUpdate, 
    streamStatus, 
    refreshMarketData,
    getTickDebug,
    selectedMarket
  } = useMarket();

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targetAssetId = assetId || selectedMarket?.id || 'xau-usd';
  const debug = getTickDebug(targetAssetId);

  const secondsAgo = debug.lastTickTimestamp > 0 
    ? Math.max(0, Math.floor((now - debug.lastTickTimestamp) / 1000)) 
    : (lastMarketDataUpdate > 0 ? Math.max(0, Math.floor((now - lastMarketDataUpdate) / 1000)) : 0);

  // Real Tick Validation:
  // LIVE only when:
  // 1. Real price tick received (debug.totalTicksReceived > 0 or debug.messageReceived === 'YES')
  // 2. Timestamp updated (< 10 seconds ago)
  // 3. Status is LIVE
  const isRealLive = streamStatus === 'LIVE' && debug.messageReceived === 'YES' && secondsAgo < 10;
  const isPriceUpdated = debug.totalTicksReceived > 0;

  if (compact) {
    return (
      <div className={`p-2.5 sm:p-3 rounded-xl bg-zinc-950/90 border ${isRealLive ? 'border-emerald-500/30' : 'border-amber-500/30'} text-xs font-mono-num ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-zinc-400">STATUS:</span>
            <span className={`flex items-center gap-1 font-bold ${isRealLive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isRealLive ? 'LIVE 🟢' : 'STALE 🟡'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10.5px] text-zinc-400">
            <span>Last Tick: <strong className="text-zinc-200">{secondsAgo}s ago</strong></span>
            <span>•</span>
            <span>Price: <strong className={isPriceUpdated ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>{isPriceUpdated ? 'Updated' : 'Waiting...'}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 sm:p-3.5 rounded-2xl bg-zinc-950 border ${isRealLive ? 'border-emerald-500/35' : 'border-amber-500/35'} shadow-md font-mono-num ${className}`}>
      <div className="grid grid-cols-3 gap-2 text-center sm:text-left items-center">
        {/* Col 1: Connection status - LIVE only when real tick received and recent */}
        <div className="space-y-0.5">
          <div className="text-[9.5px] uppercase tracking-wider text-zinc-400 font-bold">
            STATUS:
          </div>
          <div className="text-xs sm:text-sm font-black flex items-center justify-center sm:justify-start gap-1">
            {isRealLive ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>LIVE</span>
                <span className="text-xs">🟢</span>
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <span>STALE</span>
                <span className="text-xs">🟡</span>
              </span>
            )}
          </div>
          {!isRealLive && (
            <div className="text-[9px] text-amber-300 font-medium">
              Waiting for market data
            </div>
          )}
        </div>

        {/* Col 2: Last Tick Timestamp */}
        <div className="space-y-0.5 border-x border-zinc-900 px-2">
          <div className="text-[9.5px] uppercase tracking-wider text-zinc-400 font-bold flex items-center justify-between">
            <span>LAST TICK:</span>
            {debug.totalTicksReceived > 0 && secondsAgo <= 3 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
            )}
          </div>
          <div className="text-xs sm:text-sm font-black text-zinc-200">
            {debug.totalTicksReceived > 0 
              ? (secondsAgo === 0 ? 'Just now' : `${secondsAgo}s ago`) 
              : 'Waiting for tick...'}
          </div>
          <div className="text-[9px] text-zinc-400 flex items-center gap-1">
            <span className="font-mono text-zinc-300 font-bold">{debug.lastTickTimeFormatted}</span>
            <span className="text-zinc-600">•</span>
            <span className="truncate text-zinc-500">{debug.source || 'BIQUOTE FEED'}</span>
          </div>
        </div>

        {/* Col 3: Price State */}
        <div className="space-y-0.5 pl-1">
          <div className="text-[9.5px] uppercase tracking-wider text-zinc-400 font-bold">
            PRICE:
          </div>
          <div className="text-xs sm:text-sm font-black flex items-center justify-center sm:justify-start gap-1">
            <span className={isPriceUpdated ? 'text-emerald-400' : 'text-zinc-400'}>
              {isPriceUpdated ? 'Updated' : 'Waiting...'}
            </span>
            <button
              onClick={() => refreshMarketData()}
              className="text-zinc-500 hover:text-amber-400 transition cursor-pointer ml-1 p-0.5"
              title="Refresh Live Price"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="text-[9px] text-zinc-400">
            {debug.messageReceived === 'YES' ? `✅ (${debug.totalTicksReceived} ticks)` : 'No ticks yet'}
          </div>
        </div>
      </div>
    </div>
  );
};
