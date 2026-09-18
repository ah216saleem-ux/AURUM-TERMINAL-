import React, { useState, useEffect } from 'react';
import { Activity, Radio, CheckCircle, Clock, Zap, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { ASSET_PROVIDER_CONFIGS, TickDebugInfo } from '../services/marketDataService';

interface LiveTickDebugPanelProps {
  assetId?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const LiveTickDebugPanel: React.FC<LiveTickDebugPanelProps> = ({
  assetId: propAssetId,
  className = '',
  defaultExpanded = true
}) => {
  const { selectedMarket, streamStatus, getTickDebug, refreshMarketData } = useMarket();
  const currentAssetId = propAssetId || selectedMarket?.id || 'xau-usd';
  const [selectedDebugAsset, setSelectedDebugAsset] = useState<string>(currentAssetId);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [now, setNow] = useState<number>(Date.now());

  // Sync selected asset if prop changes
  useEffect(() => {
    if (propAssetId) {
      setSelectedDebugAsset(propAssetId);
    } else if (selectedMarket?.id) {
      setSelectedDebugAsset(selectedMarket.id);
    }
  }, [propAssetId, selectedMarket?.id]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const debug: TickDebugInfo = getTickDebug(selectedDebugAsset);
  const config = ASSET_PROVIDER_CONFIGS[selectedDebugAsset] || ASSET_PROVIDER_CONFIGS['xau-usd'];
  const decimals = config?.decimals ?? 2;

  const secondsAgo = debug.lastTickTimestamp > 0 
    ? Math.max(0, Math.floor((now - debug.lastTickTimestamp) / 1000))
    : 0;

  const isPriceDifferent = debug.currentPrice !== debug.previousPrice;
  const isLive = streamStatus === 'LIVE' && debug.messageReceived === 'YES' && secondsAgo < 10;

  const supportedAssetKeys = [
    'xau-usd', 'xag-usd', 'eur-usd', 'gbp-usd', 
    'usd-jpy', 'aud-usd', 'usd-cad', 'sp-500', 'nasdaq-100'
  ];

  return (
    <div className={`rounded-2xl bg-zinc-950 border border-amber-500/30 overflow-hidden font-mono-num shadow-lg ${className}`}>
      {/* Panel Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between cursor-pointer select-none hover:bg-zinc-850 transition"
      >
        <div className="flex items-center gap-2">
          <Activity className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-200">
            Real-Time Tick Pipeline Debug
          </span>
          <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded ${
            isLive 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            {isLive ? 'STREAMING 🟢' : 'STALE 🟡'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400">
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
          <span className="text-xs text-zinc-500">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 space-y-3 text-xs">
          {/* Asset Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold">
            {supportedAssetKeys.map(key => {
              const itemConf = ASSET_PROVIDER_CONFIGS[key];
              const isSelected = selectedDebugAsset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDebugAsset(key)}
                  className={`px-2 py-0.8 rounded-lg whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-black font-black shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {itemConf?.providerSymbol || key.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Debug Parameters Grid as requested */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
            {/* 1. Symbol */}
            <div className="space-y-0.5">
              <div className="text-[9.5px] uppercase tracking-wider text-zinc-500 font-bold">
                Symbol:
              </div>
              <div className="text-sm font-black text-amber-300 flex items-center gap-1">
                <span>{debug.symbol}</span>
                <span className="text-[10px] font-normal text-zinc-400">({config?.name})</span>
              </div>
            </div>

            {/* 2. Last Tick Timestamp */}
            <div className="space-y-0.5">
              <div className="text-[9.5px] uppercase tracking-wider text-zinc-500 font-bold">
                Last Tick:
              </div>
              <div className="text-xs font-bold text-zinc-200">
                {debug.lastTickTimeFormatted}
                <span className="text-[10px] text-zinc-400 block font-normal">
                  ({secondsAgo}s ago)
                </span>
              </div>
            </div>

            {/* 3. Previous Price vs Current Price */}
            <div className="space-y-0.5">
              <div className="text-[9.5px] uppercase tracking-wider text-zinc-500 font-bold">
                Previous Price:
              </div>
              <div className="text-xs font-medium text-zinc-400">
                ${debug.previousPrice.toFixed(decimals)}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[9.5px] uppercase tracking-wider text-zinc-500 font-bold">
                Current Price:
              </div>
              <div className="text-sm font-black text-white flex items-center gap-1">
                <span>${debug.currentPrice.toFixed(decimals)}</span>
                {isPriceDifferent && (
                  debug.priceDirection === 'up' 
                    ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 inline" />
                    : <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 inline" />
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Message Received Status & Feed Verification */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-900 text-[10.5px]">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-zinc-500 uppercase font-bold text-[9px] mr-1">
                  Message Received:
                </span>
                <span className={`font-black ${debug.messageReceived === 'YES' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {debug.messageReceived} ({debug.totalTicksReceived} ticks)
                </span>
              </div>

              <div>
                <span className="text-zinc-500 uppercase font-bold text-[9px] mr-1">
                  Feed Source:
                </span>
                <span className="font-bold text-amber-400">
                  {debug.source}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => refreshMarketData()}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5 text-amber-400" />
              <span>Poll Refresh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
