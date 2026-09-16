import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, ChevronRight, Zap, Target, ShieldAlert, Layers, Sliders, Star } from 'lucide-react';
import { MarketItem, SignalType } from '../types';
import { getTimeframeSetup } from '../data/timeframeSignals';
import { getCompositeAiScore, getNewsTradingStatus } from '../data/newsIntelligenceData';
import { useMarket } from '../context/MarketContext';
import { getStyleAdjustedParameters } from '../data/tradingStyleData';
import { getSignalLifecycleData } from '../data/signalLifecycleData';

interface AssetCardProps {
  market: MarketItem;
  onClick: () => void;
  index: number;
}

export const AssetCard: React.FC<AssetCardProps> = ({ market, onClick, index }) => {
  const { tradingStyleMode, isFavorite, toggleWatchlist } = useMarket();

  // Retrieve default setup and adjust with active trading style mode
  const rawSetup = getTimeframeSetup(market.id, '1H');
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
  const lifecycle = getSignalLifecycleData(market.id, market.symbol, rawSetup.entry, rawSetup.stopLoss, rawSetup.takeProfit, tradingStyleMode, '1H');
  const compositeScore = getCompositeAiScore(market.id, '1H');
  const newsStatus = getNewsTradingStatus();
  const isPositive = market.changePercent >= 0;

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
      border: 'border-emerald-500/35',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      dot: 'bg-emerald-400'
    },
    SELL: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/35',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.2)]',
      dot: 'bg-rose-400'
    },
    WAIT: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/35',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      dot: 'bg-amber-400'
    }
  };

  const style = signalConfig[rawSetup.signal] || signalConfig.WAIT;

  // Render a clean mini SVG sparkline
  const renderSparkline = () => {
    const points = market.sparkline || [10, 12, 11, 14, 13, 16, 15, 18];
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 56;
    const height = 22;

    const coordinates = points.map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const strokeColor = rawSetup.signal === 'BUY' ? '#10b981' : rawSetup.signal === 'SELL' ? '#f43f5e' : '#f59e0b';

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coordinates.join(' ')}
        />
      </svg>
    );
  };

  // Asset display titles
  const getAssetDisplay = () => {
    switch (market.id) {
      case 'xau-usd':
        return { name: 'XAU/USD', sub: 'Spot Gold' };
      case 'nasdaq-100':
        return { name: 'NASDAQ 100', sub: 'US Tech Index' };
      case 'eur-usd':
        return { name: 'EUR/USD', sub: 'Euro / US Dollar' };
      case 'gbp-usd':
        return { name: 'GBP/USD', sub: 'British Pound / USD' };
      case 'usd-jpy':
        return { name: 'USD/JPY', sub: 'US Dollar / Yen' };
      case 'aud-usd':
        return { name: 'AUD/USD', sub: 'Aussie / USD' };
      case 'usd-cad':
        return { name: 'USD/CAD', sub: 'US Dollar / CAD' };
      case 'btc-usd':
        return { name: 'BTC/USD', sub: 'Bitcoin Spot' };
      case 'sp-500':
        return { name: 'S&P 500', sub: 'US Broad Index' };
      case 'crude-oil':
        return { name: 'Oil', sub: 'WTI Crude' };
      case 'xag-usd':
        return { name: 'Silver', sub: 'XAG/USD Spot' };
      default:
        return { name: market.symbol, sub: market.name };
    }
  };

  const assetInfo = getAssetDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0c0e15] p-4 border border-zinc-800 hover:border-amber-500/40 hover:bg-[#10131d] transition-all shadow-md active:border-amber-400"
    >
      {/* Subtle gold hover glow backdrop */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-all" />

      {/* Top Row: Asset Name, Price & Signal Badge */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(market.id);
              }}
              className="p-1 -ml-1 text-zinc-600 hover:text-amber-400 transition cursor-pointer"
              title={starred ? 'Remove from Priority Watchlist' : 'Add to Priority Watchlist'}
            >
              <Star className={`w-3.5 h-3.5 ${starred ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
            </button>

            <h3 className="text-base font-bold text-white tracking-tight group-hover:text-amber-200 transition">
              {assetInfo.name}
            </h3>
            <span className="text-[11px] font-mono-num text-zinc-400">
              {assetInfo.sub}
            </span>
            {starred && (
              <span className="px-1 py-0.2 rounded bg-amber-500/15 text-[8.5px] font-mono-num font-extrabold text-amber-300 border border-amber-500/30">
                WATCH
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono-num text-zinc-100 tracking-tight">
              ${market.price.toLocaleString(undefined, { 
                minimumFractionDigits: market.decimals, 
                maximumFractionDigits: market.decimals 
              })}
            </span>
            
            {/* 24h Change indicator */}
            <span className={`inline-flex items-center text-xs font-mono-num font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {isPositive ? `+${market.changePercent}%` : `${market.changePercent}%`}
            </span>
          </div>
        </div>

        {/* Signal Badge & Style Mode */}
        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[9.5px] font-mono-num font-extrabold uppercase tracking-wide">
              {styleParams.mode}
            </span>
            {newsStatus.isBlocked && (
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-mono-num font-bold animate-pulse">
                NEWS BLOCKED
              </span>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono-num tracking-wide border ${style.bg} ${style.text} ${style.border} ${style.glow}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
              <span>{rawSetup.signal}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-mono-num text-zinc-400">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="font-semibold text-zinc-200">{styleParams.adjustedConfidence}% Conf</span>
            </div>
            <div className="opacity-80 group-hover:opacity-100 transition">
              {renderSparkline()}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Execution Matrix: Entry | SL Dist | TP Dist | R:R / TF */}
      <div className="mt-3 grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-neutral-950/70 border border-zinc-800/80 font-mono-num text-[11px]">
        <div>
          <span className="text-[10px] text-zinc-500 block">Entry</span>
          <span className="font-bold text-zinc-200 truncate block">
            ${rawSetup.entry.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-rose-400/80 block">Stop Loss</span>
          <span className="font-bold text-rose-400 truncate block">
            {styleParams.stopLossDistancePips}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-emerald-400/80 block">Take Profit</span>
          <span className="font-bold text-emerald-400 truncate block">
            {styleParams.takeProfitTarget1Pips}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-amber-400/80 block">R:R / TF</span>
          <span className="font-bold text-amber-300 truncate block">
            {styleParams.adjustedRiskReward} • {styleParams.recommendedTimeframe}
          </span>
        </div>
      </div>

      {/* Entry Style Preview */}
      <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-zinc-800/50">
        <p className="text-[11px] text-zinc-400 line-clamp-1 pr-2">
          <span className="font-mono-num font-semibold text-amber-400/90 mr-1.5">Entry Style:</span>
          {styleParams.entryStyle}
        </p>
        <div className="flex items-center text-amber-400 shrink-0 text-[11px] font-mono-num group-hover:translate-x-0.5 transition">
          <span>{styleParams.recommendedTimeframe}</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>
    </motion.div>
  );
};
