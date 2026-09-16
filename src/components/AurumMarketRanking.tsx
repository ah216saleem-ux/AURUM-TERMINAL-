import React, { useState, useMemo } from 'react';
import { MarketCategory, MarketRankingItem, MarketItem } from '../types';
import { getRankedTopSetups } from '../data/multiAssetIntelligence';
import { useMarket } from '../context/MarketContext';
import {
  Trophy,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Sliders,
  Flame,
  BrainCircuit,
  Filter,
  Layers,
  Activity,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface AurumMarketRankingProps {
  onSelectMarket: (market: MarketItem) => void;
  onOpenProfile: (assetId: string) => void;
}

export function AurumMarketRanking({
  onSelectMarket,
  onOpenProfile
}: AurumMarketRankingProps) {
  const { markets } = useMarket();
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');

  const rankedSetups = useMemo(() => {
    return getRankedTopSetups(selectedCategory);
  }, [selectedCategory]);

  const categoryCounts = useMemo(() => {
    const all = getRankedTopSetups('all');
    return {
      all: all.length,
      forex: all.filter(s => s.category === 'forex').length,
      commodities: all.filter(s => s.category === 'commodities').length,
      indices: all.filter(s => s.category === 'indices').length,
      crypto: all.filter(s => s.category === 'crypto').length
    };
  }, []);

  const handleCardClick = (assetId: string) => {
    const market = markets.find(m => m.id === assetId);
    if (market) {
      onSelectMarket(market);
    }
  };

  return (
    <div className="rounded-3xl bg-neutral-950 border border-amber-500/30 p-4 sm:p-5 shadow-xl shadow-amber-500/5 space-y-3.5 text-zinc-100">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold shadow-md shadow-amber-500/20">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-mono-num font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>AURUM MARKET RANKING</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-zinc-400 font-sans">
              AI ranked setups by confluence & probability
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono-num font-bold text-amber-300 flex items-center gap-1">
          <BrainCircuit className="w-3 h-3" />
          <span>REAL-TIME AI</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10.5px] font-mono-num font-bold">
        {(
          [
            { id: 'all', label: 'ALL', count: categoryCounts.all },
            { id: 'commodities', label: 'COMMODITIES', count: categoryCounts.commodities },
            { id: 'indices', label: 'INDICES', count: categoryCounts.indices },
            { id: 'forex', label: 'FOREX', count: categoryCounts.forex },
            { id: 'crypto', label: 'CRYPTO', count: categoryCounts.crypto }
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as MarketCategory | 'all')}
            className={`py-1.5 px-2.5 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === tab.id
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-extrabold'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[9.5px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === tab.id ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Ranked List Cards */}
      <div className="space-y-2.5">
        {rankedSetups.map((item) => {
          const isTop1 = item.rank === 1;
          const isTop3 = item.rank <= 3;

          return (
            <div
              key={item.assetId}
              onClick={() => handleCardClick(item.assetId)}
              className={`p-3.5 rounded-2xl transition cursor-pointer relative overflow-hidden border ${
                isTop1
                  ? 'bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : isTop3
                  ? 'bg-neutral-900/80 hover:bg-neutral-900 border-zinc-800 hover:border-amber-500/30'
                  : 'bg-neutral-900/50 hover:bg-neutral-900/80 border-zinc-850 hover:border-zinc-750'
              }`}
            >
              {/* Top Row: Rank, Symbol, Signal Badge, Setup Grade */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {/* Rank Number Badge */}
                  <div
                    className={`w-6 h-6 rounded-lg font-mono-num font-extrabold text-xs flex items-center justify-center ${
                      isTop1
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                        : item.rank === 2
                        ? 'bg-zinc-300 text-black'
                        : item.rank === 3
                        ? 'bg-amber-700/80 text-amber-100'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    #{item.rank}
                  </div>

                  {/* Symbol & Name */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm font-mono-num text-white">
                        {item.symbol}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase font-mono-num">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block -mt-0.5">
                      {item.name}
                    </span>
                  </div>
                </div>

                {/* Signal Badge & Grade */}
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-mono-num font-extrabold uppercase flex items-center gap-1 ${
                      item.signal === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : item.signal === 'SELL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.signal === 'BUY' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : item.signal === 'SELL' ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{item.signal}</span>
                  </div>

                  <div className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10.5px] font-mono-num font-extrabold">
                    {item.setupGrade}
                  </div>
                </div>
              </div>

              {/* Middle Metric Bar: Confidence & Best Mode */}
              <div className="mt-2.5 pt-2 border-t border-zinc-800/60 grid grid-cols-3 gap-2 text-[10.5px] font-mono-num items-center">
                <div>
                  <div className="flex justify-between text-zinc-400 text-[10px] mb-0.5">
                    <span>Confidence</span>
                    <span className="font-bold text-amber-400">{item.confidence}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.confidence >= 88
                          ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                          : item.confidence >= 80
                          ? 'bg-amber-400'
                          : 'bg-zinc-400'
                      }`}
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-zinc-500 block uppercase">Best Mode</span>
                  <span className="font-extrabold text-amber-300 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 inline-block">
                    {item.bestTradingMode}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase">R:R Ratio</span>
                  <span className="font-bold text-emerald-400 text-xs">{item.riskReward}</span>
                </div>
              </div>

              {/* Summary text */}
              <p className="mt-2 text-[10.5px] text-zinc-300 line-clamp-1 font-sans">
                {item.aiVerdictSummary}
              </p>

              {/* Action row */}
              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-zinc-800/40 text-[10px] font-mono-num">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Activity className="w-3 h-3 text-amber-400" />
                  <span>{item.bestSession}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProfile(item.assetId);
                    }}
                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer font-bold flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3 text-amber-400" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(item.assetId);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black transition cursor-pointer font-bold flex items-center gap-0.5 border border-amber-500/30"
                  >
                    <span>Chart</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
