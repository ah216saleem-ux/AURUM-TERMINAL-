import React, { useState, useMemo } from 'react';
import { Radio, Database, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { MarketItem } from '../../types';
import { Tilt3DCard } from './Tilt3DCard';

interface HoloMarketCardsProps {
  markets: MarketItem[];
  onSelectMarket?: (marketId: string) => void;
  onAccessTerminal: () => void;
}

const HoloMarketCardItem = React.memo<{
  asset: MarketItem;
  onSelectMarket?: (marketId: string) => void;
  onAccessTerminal: () => void;
}>(({ asset, onSelectMarket, onAccessTerminal }) => {
  const isPos = asset.changePercent >= 0;
  const isForex = asset.category === 'forex' || asset.symbol.includes('EUR') || asset.symbol.includes('GBP');
  
  let priceFormatted = '';
  if (isForex) {
    priceFormatted = asset.price.toFixed(4);
  } else if (asset.price >= 1000) {
    priceFormatted = '$' + asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    priceFormatted = '$' + asset.price.toFixed(2);
  }

  const changeFormatted = (isPos ? '+' : '') + asset.changePercent.toFixed(2) + '%';
  
  const sparkPoints = (asset.sparkline && asset.sparkline.length >= 2) 
    ? asset.sparkline 
    : [asset.price * (1 - (isPos ? 0.004 : -0.004)), asset.price * (1 + (isPos ? 0.002 : -0.002)), asset.price];

  const min = Math.min(...sparkPoints);
  const max = Math.max(...sparkPoints);
  const range = max - min || 1;
  const width = 100;
  const height = 24;

  const polylineCoords = sparkPoints.map((val, idx) => {
    const x = (idx / (sparkPoints.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Tilt3DCard
      maxTilt={6}
      elevation="sm"
      glowColor={isPos ? 'rgba(16, 185, 129, 0.16)' : 'rgba(244, 63, 94, 0.16)'}
      borderColor={isPos ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}
      className="p-3 sm:p-4 flex flex-col justify-between cursor-pointer hover:border-amber-400/40 rounded-2xl"
      onClick={() => {
        if (onSelectMarket) onSelectMarket(asset.id);
        onAccessTerminal();
      }}
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-bold text-xs sm:text-sm text-white font-cinzel tracking-tight truncate">
            {asset.symbol}
          </span>
          <span className="text-[8px] uppercase font-mono px-1 py-0.2 rounded bg-zinc-900 text-amber-400 border border-zinc-800 shrink-0">
            {asset.category.substring(0, 4)}
          </span>
        </div>

        <span className="text-[10px] text-zinc-400 font-sans block truncate mb-2">
          {asset.name}
        </span>

        <div className="mb-2">
          <span className="text-xs sm:text-base font-black text-white font-mono tabular-nums tracking-tight block">
            {priceFormatted}
          </span>
        </div>

        <div className="w-full h-6 mb-2 overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={isPos ? '#10B981' : '#F43F5E'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylineCoords}
            />
          </svg>
        </div>
      </div>

      <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
        <span className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 font-mono tabular-nums ${
          isPos
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
        }`}>
          {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {changeFormatted}
        </span>

        <span className="text-emerald-400 font-bold text-[9px]">
          LIVE
        </span>
      </div>
    </Tilt3DCard>
  );
});

HoloMarketCardItem.displayName = 'HoloMarketCardItem';

export const HoloMarketCards: React.FC<HoloMarketCardsProps> = ({
  markets,
  onSelectMarket,
  onAccessTerminal
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'COMMODITIES' | 'FOREX' | 'INDICES'>('ALL');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredMarkets = useMemo(() => {
    if (!markets || markets.length === 0) return [];
    if (activeTab === 'ALL') return markets;
    return markets.filter(m => m.category.toUpperCase() === activeTab);
  }, [markets, activeTab]);

  const displayedMarkets = isExpanded ? filteredMarkets : filteredMarkets.slice(0, 6);
  const isConnected = markets && markets.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono mb-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>EXCHANGE ORACLE PIPELINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-black tracking-tight text-white">
            LIVE MARKET <span className="gold-shimmer-text">INTELLIGENCE</span>
          </h2>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-xl mt-1 leading-normal">
            Real-time tick updates, price action volatility, and institutional orderflow tracking.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap font-mono">
          {(['ALL', 'COMMODITIES', 'FOREX', 'INDICES'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsExpanded(false);
                }}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 scale-105'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Telemetry Sync Bar */}
      <div className="mb-4 p-3 rounded-2xl bg-[#080b14]/70 border border-zinc-800/80 backdrop-blur-md flex items-center justify-between text-xs font-mono text-zinc-400">
        <span className="flex items-center gap-2 text-zinc-200">
          <Database className="w-4 h-4 text-amber-400" />
          <span>MONITORED ASSETS ({filteredMarkets.length})</span>
        </span>
        <span className="text-emerald-400 flex items-center gap-1.5 font-bold text-[11px]">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-ping'}`} />
          {isConnected ? 'LIVE FEED ACTIVE' : 'RECONNECTING...'}
        </span>
      </div>

      {/* 2-Column Mini Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayedMarkets.map((asset) => (
          <HoloMarketCardItem
            key={asset.id}
            asset={asset}
            onSelectMarket={onSelectMarket}
            onAccessTerminal={onAccessTerminal}
          />
        ))}
      </div>

      {/* Expand / Collapse "View All" Button */}
      {filteredMarkets.length > 6 && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <span>{isExpanded ? 'SHOW LESS' : `VIEW ALL ASSETS (${filteredMarkets.length})`}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
