import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, ChevronRight, Zap, Star } from 'lucide-react';
import { MarketItem, SignalType } from '../types';
import { getTimeframeSetup } from '../data/timeframeSignals';
import { useMarket } from '../context/MarketContext';
import { getStyleAdjustedParameters } from '../data/tradingStyleData';
import { ASSET_PROVIDER_CONFIGS } from '../services/marketDataService';

interface AssetCardProps {
  market: MarketItem;
  onClick: () => void;
  index: number;
  isSelected?: boolean;
  customTitle?: string;
  customSubtitle?: string;
  forexMarkets?: MarketItem[];
  onSelectForexPair?: (market: MarketItem) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ 
  market, 
  onClick, 
  index, 
  isSelected = false,
  customTitle,
  customSubtitle,
  forexMarkets,
  onSelectForexPair
}) => {
  if (!market || !market.id) return null;

  const { tradingStyleMode, isFavorite, toggleWatchlist } = useMarket();

  const prevPriceRef = React.useRef<number>(market.price);
  const [flash, setFlash] = React.useState<'up' | 'down' | null>(null);

  React.useEffect(() => {
    if (market.price > prevPriceRef.current) {
      setFlash('up');
      const timer = setTimeout(() => setFlash(null), 350);
      return () => clearTimeout(timer);
    } else if (market.price < prevPriceRef.current) {
      setFlash('down');
      const timer = setTimeout(() => setFlash(null), 350);
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = market.price;
  }, [market.price]);

  // Retrieve timeframe setup and adjust with active trading style mode
  const defaultTf = tradingStyleMode === 'SCALPING' ? '5M' : tradingStyleMode === 'SWING' ? '4H' : '1H';
  const rawSetup = getTimeframeSetup(market.id, defaultTf);
  const styleParams = getStyleAdjustedParameters(
    market.id,
    rawSetup.entry,
    rawSetup.stopLoss,
    rawSetup.takeProfit,
    rawSetup.takeProfit2,
    rawSetup.confidence,
    tradingStyleMode
  );

  const starred = isFavorite(market.id);
  const isPositive = market.changePercent >= 0;

  // Signal direction
  const biasText = rawSetup.signal === 'BUY' ? 'LONG' : rawSetup.signal === 'SELL' ? 'SHORT' : 'WAIT';

  // Signal color styling
  const signalConfig: Record<SignalType, {
    bg: string;
    text: string;
    border: string;
    glow: string;
    dot: string;
  }> = {
    BUY: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      dot: 'bg-emerald-400'
    },
    SELL: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]',
      dot: 'bg-rose-400'
    },
    WAIT: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      dot: 'bg-amber-400'
    }
  };

  const style = signalConfig[rawSetup.signal] || signalConfig.WAIT;

  // Render a clean SVG sparkline trend indicator
  const renderTrendIndicator = () => {
    const points = market.sparkline || [10, 12, 11, 14, 13, 16, 15, 18];
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 84;
    const height = 30;

    const coordinates = points.map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const strokeColor = isPositive ? '#10b981' : '#f43f5e';

    return (
      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={`grad-${market.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={coordinates.join(' ')}
          />
        </svg>
      </div>
    );
  };

  // Asset display titles
  const getAssetDisplay = () => {
    switch (market.id) {
      case 'xau-usd':
        return { symbol: 'XAU/USD', name: 'Gold Spot' };
      case 'xag-usd':
        return { symbol: 'XAG/USD', name: 'Silver' };
      case 'nasdaq-100':
        return { symbol: 'NASDAQ 100', name: 'NASDAQ 100' };
      case 'sp-500':
        return { symbol: 'S&P 500', name: 'S&P 500' };
      case 'crude-oil':
        return { symbol: 'WTI Crude Oil', name: 'WTI Crude Oil' };
      case 'eur-usd':
        return { symbol: 'EUR/USD', name: 'EUR/USD' };
      case 'gbp-usd':
        return { symbol: 'GBP/USD', name: 'GBP/USD' };
      case 'usd-jpy':
        return { symbol: 'USD/JPY', name: 'USD/JPY' };
      case 'aud-usd':
        return { symbol: 'AUD/USD', name: 'AUD/USD' };
      case 'usd-cad':
        return { symbol: 'USD/CAD', name: 'USD/CAD' };
      case 'btc-usd':
        return { symbol: 'BTC/USD', name: 'BTC/USD' };
      default:
        return { symbol: market.symbol, name: market.name };
    }
  };

  const assetInfo = getAssetDisplay();
  const title = customTitle || assetInfo.symbol;
  const subtitle = customSubtitle || (assetInfo.name !== assetInfo.symbol ? assetInfo.name : undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.035 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-3xl backdrop-blur-xl p-4 sm:p-5 transition-all shadow-xl ${
        isSelected
          ? 'bg-[#121626] border-2 border-amber-400 shadow-[0_0_30px_rgba(212,175,55,0.28)] ring-1 ring-amber-400/50'
          : 'bg-[#0b0e17]/85 border border-zinc-800/80 hover:border-amber-500/50 hover:bg-[#101422] hover:shadow-[0_10px_35px_rgba(212,175,55,0.12)] active:border-amber-400'
      }`}
    >
      {/* Background Gold Ambient Sheen */}
      <div className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br transition-all duration-500 blur-3xl ${
        isSelected ? 'from-amber-500/30 via-amber-400/15 to-transparent' : 'from-amber-500/10 via-amber-400/5 to-transparent group-hover:from-amber-500/20'
      }`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />

      <div className="relative space-y-3.5">
        {/* Top Header: Asset Name (Large), Subtitle, Star, Selected Badge & Trading Mode Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(market.id);
              }}
              className="p-1 -ml-1 text-zinc-600 hover:text-amber-400 transition cursor-pointer shrink-0"
              title={starred ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-4 h-4 ${starred ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg sm:text-xl font-black tracking-tight transition truncate ${
                  isSelected ? 'text-amber-300' : 'text-white group-hover:text-amber-300'
                }`}>
                  {title}
                </h3>
                {isSelected && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-mono-num font-black text-[9.5px] uppercase tracking-wider shadow-md shadow-amber-500/30">
                    SELECTED
                  </span>
                )}
              </div>
              {subtitle && (
                <span className="text-xs font-semibold text-zinc-400 block truncate">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Trading Mode & Details Arrow */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300/90 font-mono-num font-bold text-[10.5px] uppercase tracking-wider">
              {tradingStyleMode}
            </span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
              isSelected 
                ? 'bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/30' 
                : 'bg-zinc-900/90 border border-zinc-800 text-zinc-400 group-hover:text-amber-300 group-hover:border-amber-500/40 group-hover:bg-amber-500/15'
            }`}>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Forex Sub-Pair Selector (if forex card with multiple pairs) */}
        {forexMarkets && forexMarkets.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none font-mono-num text-[10.5px] font-bold">
            <span className="text-[10px] uppercase text-zinc-500 shrink-0 font-semibold mr-0.5">Pair:</span>
            {forexMarkets.map(fx => {
              const isFxActive = fx.id === market.id;
              return (
                <button
                  key={fx.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectForexPair) onSelectForexPair(fx);
                    else onClick();
                  }}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                    isFxActive
                      ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {fx.symbol}
                </button>
              );
            })}
          </div>
        )}

        {/* Center Row: Large Live Price, 24h Change & Trend Indicator */}
        <div className="flex items-end justify-between gap-3 pt-0.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono-num font-bold text-zinc-500 uppercase tracking-widest block">
                Live Price {market.lastTickTimestamp ? `• ${new Date(market.lastTickTimestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
              </span>
              {ASSET_PROVIDER_CONFIGS[market.id] && (
                <span className="text-[9px] font-mono-num px-1.5 py-0.5 rounded bg-zinc-900 border border-amber-500/20 text-amber-300/80">
                  {ASSET_PROVIDER_CONFIGS[market.id].primaryProvider === 'BINANCE' 
                    ? 'Binance API' 
                    : ASSET_PROVIDER_CONFIGS[market.id].primaryProvider === 'BIQUOTE'
                    ? 'BIQUOTE'
                    : 'Yahoo Finance'}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              <div className="flex items-baseline gap-2.5">
                <span className={`text-2xl sm:text-3xl font-black font-mono-num tracking-tight transition-all duration-300 rounded px-1.5 py-0.5 ${
                  flash === 'up' 
                    ? 'text-emerald-400 bg-emerald-500/15 scale-[1.02] shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                    : flash === 'down' 
                    ? 'text-rose-400 bg-rose-500/15 scale-[1.02] shadow-[0_0_12px_rgba(244,63,94,0.2)]' 
                    : 'text-white'
                }`}>
                  ${market.price.toLocaleString(undefined, { 
                    minimumFractionDigits: market.decimals, 
                    maximumFractionDigits: market.decimals 
                  })}
                </span>
                
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-mono-num font-bold border ${
                  isPositive 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                  {isPositive ? `+${market.changePercent}%` : `${market.changePercent}%`}
                </span>
              </div>

              {market.bid != null && market.ask != null && (
                <div className="flex items-center gap-2 text-[10px] font-mono-num font-bold text-zinc-500 bg-zinc-950/50 px-2 py-0.5 rounded border border-zinc-900 w-fit">
                  <span>BID: <span className="text-zinc-300">${market.bid.toFixed(market.decimals)}</span></span>
                  <span className="text-zinc-700">|</span>
                  <span>ASK: <span className="text-zinc-300">${market.ask.toFixed(market.decimals)}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Small Trend Indicator Wave */}
          <div className="hidden xs:block">
            {renderTrendIndicator()}
          </div>
        </div>

        {/* Bottom Row: Live Asset Signal Pill & Confidence % */}
        <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-num text-zinc-400 font-semibold uppercase">
              Signal:
            </span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black font-mono-num tracking-wide border ${style.bg} ${style.text} ${style.border} ${style.glow}`}>
              <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
              <span>{biasText}</span>
            </div>
          </div>

          {/* Confidence % */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-950/80 border border-amber-500/25 font-mono-num">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs font-black text-amber-300">
              {styleParams.adjustedConfidence}%
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Confidence</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
