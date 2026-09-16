import React, { useMemo } from 'react';
import { 
  Star, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Layers, 
  ShieldCheck, 
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { MarketItem, TradingStyleMode } from '../types';

interface AiWatchlistViewProps {
  onSelectMarket: (market: MarketItem) => void;
  onOpenProfile: (assetId: string) => void;
}

export const AiWatchlistView: React.FC<AiWatchlistViewProps> = ({
  onSelectMarket,
  onOpenProfile
}) => {
  const { 
    markets, 
    signals, 
    watchlistAssetIds, 
    toggleWatchlist, 
    isFavorite,
    tradingStyleMode,
    setTradingStyleMode
  } = useMarket();

  // Prioritize monitoring:
  // 1. Selected assets (favorite starred)
  // 2. High confidence setups
  // 3. Preferred trading mode
  const { starredMarkets, availableMarkets } = useMemo(() => {
    const starred = markets.filter(m => watchlistAssetIds.includes(m.id));
    const unstarred = markets.filter(m => !watchlistAssetIds.includes(m.id));

    // Sort starred assets by AI confidence descending
    const sortedStarred = [...starred].sort((a, b) => {
      const sigA = signals.find(s => s.marketId === a.id);
      const sigB = signals.find(s => s.marketId === b.id);
      const confA = sigA ? sigA.confidenceScore : 70;
      const confB = sigB ? sigB.confidenceScore : 70;
      return confB - confA;
    });

    return {
      starredMarkets: sortedStarred,
      availableMarkets: unstarred
    };
  }, [markets, signals, watchlistAssetIds]);

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* AI Prioritization Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121522] via-[#0d0f17] to-[#08090f] border border-amber-500/30 shadow-lg relative overflow-hidden">
        <div className="pointer-events-none absolute -top-8 -right-8 w-36 h-36 bg-amber-500/10 rounded-full blur-xl" />
        
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <h2 className="text-sm font-syne font-bold text-white tracking-wide">
              AI Priority Watchlist
            </h2>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono-num font-extrabold text-amber-300">
            {starredMarkets.length} Priority Assets
          </span>
        </div>

        <p className="text-xs text-zinc-300 font-sans leading-relaxed mb-3">
          AURUM AI dynamically allocates computing priority to your selected assets, tracking order block formations and high-probability entries in real time.
        </p>

        {/* 3 AI Monitoring Pillars */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-[10px] font-mono-num">
          <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
            <span className="text-zinc-500 block uppercase font-sans">1. Watchlist Pool</span>
            <span className="font-bold text-amber-300">{starredMarkets.length} Tracked</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
            <span className="text-zinc-500 block uppercase font-sans">2. Filter Gate</span>
            <span className="font-bold text-emerald-400">&ge; 80% Confidence</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
            <span className="text-zinc-500 block uppercase font-sans">3. Mode Focus</span>
            <span className="font-bold text-sky-300">{tradingStyleMode}</span>
          </div>
        </div>
      </div>

      {/* Starred / Prioritized Assets Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-mono-num font-bold text-zinc-300 uppercase tracking-wider">
              Priority Monitored Assets ({starredMarkets.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono-num text-amber-400/80">
            Live Stream Active
          </span>
        </div>

        {starredMarkets.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-neutral-950 border border-zinc-800 text-zinc-400 space-y-2">
            <Star className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs font-semibold text-zinc-300">Your Watchlist is Empty</p>
            <p className="text-[11px] text-zinc-500 font-sans">
              Tap the star on any asset below to add it to your AI priority monitoring engine.
            </p>
          </div>
        ) : (
          starredMarkets.map((market) => {
            const sig = signals.find(s => s.marketId === market.id);
            const isBuy = sig?.type === 'BUY';
            const isSell = sig?.type === 'SELL';
            const confidence = sig?.confidenceScore || 80;

            return (
              <div
                key={market.id}
                onClick={() => onSelectMarket(market)}
                className="relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#111420] to-[#0c0d15] border border-amber-500/40 hover:border-amber-400/70 shadow-lg shadow-amber-500/5 transition-all cursor-pointer group"
              >
                {/* Top Row: Symbol, Category, Favorite Toggle, Signal Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(market.id);
                      }}
                      className="p-1 rounded-lg text-amber-400 hover:text-amber-300 transition cursor-pointer"
                      title="Remove from Priority Watchlist"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-syne text-sm font-bold text-white group-hover:text-amber-300 transition">
                          {market.symbol}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-[9.5px] font-mono-num font-extrabold text-amber-300 border border-amber-500/30">
                          PRIORITY #1
                        </span>
                      </div>
                      <span className="text-[10.5px] text-zinc-400 font-sans block">
                        {market.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right font-mono-num">
                      <span className="text-sm font-bold text-white block">
                        ${market.price.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                      </span>
                      <span className={`text-[10px] font-bold ${market.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {market.change >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    {sig && (
                      <span
                        className={`px-2 py-1 rounded-xl text-xs font-mono-num font-extrabold flex items-center gap-1 shadow-sm ${
                          isBuy
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isSell
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {isBuy ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{sig.type}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Confluence & Levels bar */}
                {sig && (
                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-black/60 border border-zinc-800/80 mb-2.5 text-center font-mono-num text-xs">
                    <div className="p-1 rounded bg-zinc-900/60">
                      <span className="block text-[9.5px] text-zinc-400 uppercase font-sans">Confidence</span>
                      <span className="block font-bold text-amber-300">{confidence}%</span>
                    </div>
                    <div className="p-1 rounded bg-zinc-900/60">
                      <span className="block text-[9.5px] text-zinc-400 uppercase font-sans">Mode</span>
                      <span className="block font-bold text-white">{tradingStyleMode}</span>
                    </div>
                    <div className="p-1 rounded bg-zinc-900/60">
                      <span className="block text-[9.5px] text-emerald-400/80 uppercase font-sans">Target</span>
                      <span className="block font-bold text-emerald-400">${sig.takeProfit.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* AI Rationale Summary snippet */}
                {sig && (
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-sans pt-1 border-t border-zinc-800/60">
                    <div className="flex items-center gap-1.5 text-zinc-300 truncate max-w-[70%]">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{sig.marketReason}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-400 font-mono-num font-bold text-[10.5px]">
                      <span>Open Trade</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add More Assets to Watchlist section */}
      {availableMarkets.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono-num font-bold text-zinc-400 uppercase tracking-wider">
              Add More Assets to Watchlist ({availableMarkets.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableMarkets.map((market) => (
              <div
                key={market.id}
                className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800/80 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWatchlist(market.id)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500/20 border border-zinc-800 hover:border-amber-500/40 text-zinc-500 hover:text-amber-400 transition cursor-pointer"
                    title="Add to Priority Watchlist"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <span className="font-syne font-bold text-white block">{market.symbol}</span>
                    <span className="text-[10px] text-zinc-400 font-sans block">{market.name}</span>
                  </div>
                </div>

                <div className="text-right font-mono-num">
                  <span className="font-bold text-white block text-xs">
                    ${market.price.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
                  </span>
                  <span className={`text-[10px] ${market.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {market.change >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
