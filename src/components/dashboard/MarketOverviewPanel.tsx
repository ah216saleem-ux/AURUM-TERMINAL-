import React from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, Zap, Activity, Clock, Radio, Globe } from 'lucide-react';
import { MarketItem } from '../../types';
import { detectMarketRegime } from '../../services/marketRegimeEngine';
import { getCurrentMarketSession } from '../../utils/marketContextHelpers';

interface MarketOverviewPanelProps {
  markets: MarketItem[];
  onSelectMarket?: (market: MarketItem) => void;
}

export const MarketOverviewPanel: React.FC<MarketOverviewPanelProps> = ({
  markets,
  onSelectMarket
}) => {
  const sessionInfo = getCurrentMarketSession();

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-zinc-200 font-mono">
            Market Overview
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            LIVE FEED
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1 text-amber-300">
            <Globe className="w-3 h-3" />
            Session: <span className="font-bold">{sessionInfo.activeSession.toUpperCase()}</span>
          </span>
          <span>•</span>
          <span>{markets.length} Assets Synchronized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {markets.map((market) => {
          const regimeInfo = detectMarketRegime(market);
          const isBullish = market.changePercent >= 0;
          const directionLabel = isBullish ? 'Bullish' : 'Bearish';
          
          // Map regime to clean market condition label
          let marketCondition = 'Trending';
          if (regimeInfo.regime === 'Range Market') {
            marketCondition = 'Range Bound';
          } else if (regimeInfo.regime === 'High Volatility') {
            marketCondition = 'High Volatility';
          } else if (regimeInfo.regime === 'Low Volatility') {
            marketCondition = 'Low Volatility';
          } else {
            marketCondition = 'Trending';
          }

          // Determine trading mode based on category & volatility
          let tradingMode = 'INTRADAY';
          if (market.category === 'crypto' || Math.abs(market.changePercent) > 1.8) {
            tradingMode = 'SCALPING';
          } else if (market.category === 'indices' || market.category === 'commodities') {
            tradingMode = 'INTRADAY';
          } else {
            tradingMode = Math.abs(market.changePercent) < 0.25 ? 'SWING' : 'INTRADAY';
          }

          // Confidence score calculation
          const confidence = Math.min(94, Math.max(76, Math.round(82 + Math.abs(market.changePercent) * 4)));

          // Risk level calculation
          let riskLabel = 'Risk LOW';
          if (confidence < 80 || Math.abs(market.changePercent) > 2.0) {
            riskLabel = 'Risk HIGH';
          } else if (confidence < 86) {
            riskLabel = 'Risk MEDIUM';
          } else {
            riskLabel = 'Risk LOW';
          }

          const lastTickFormatted = market.lastTickTimestamp
            ? new Date(market.lastTickTimestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

          const bidVal = market.bid != null ? market.bid : market.price - (market.decimals === 4 ? 0.0001 : 0.05);
          const askVal = market.ask != null ? market.ask : market.price + (market.decimals === 4 ? 0.0001 : 0.05);

          return (
            <div
              key={market.id}
              onClick={() => onSelectMarket && onSelectMarket(market)}
              className="p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-amber-500/40 transition-all duration-150 cursor-pointer group shadow-sm flex flex-col justify-between space-y-3"
            >
              {/* Asset, Live Price & Direction Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-white tracking-tight font-mono">
                      {market.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                      {market.decimals === 4 ? 'FX' : market.category.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium truncate block max-w-[140px]">
                    {market.name}
                  </span>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="text-base font-black font-mono text-amber-300 flex items-center gap-1">
                    <span>${market.price.toLocaleString('en-US', { minimumFractionDigits: market.decimals, maximumFractionDigits: market.decimals })}</span>
                  </div>
                  <div className={`text-[11px] font-bold font-mono flex items-center gap-0.5 ${
                    isBullish ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isBullish ? '+' : ''}{market.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Status Pill: Direction & Last Tick */}
              <div className="flex items-center justify-between">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 border ${
                  isBullish
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{directionLabel}</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Tick: <span className="text-zinc-200 font-bold">{lastTickFormatted}</span></span>
                </div>
              </div>

              {/* Bid / Ask Strip */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/60">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Bid</span>
                  <span className="font-bold text-zinc-200">${bidVal.toFixed(market.decimals)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold block">Ask</span>
                  <span className="font-bold text-zinc-200">${askVal.toFixed(market.decimals)}</span>
                </div>
              </div>

              {/* Middle Metrics: Condition & Mode */}
              <div className="grid grid-cols-2 gap-2 text-xs py-1 border-t border-zinc-900">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Market Condition</span>
                  <span className="font-semibold text-zinc-200">{marketCondition}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Trading Mode</span>
                  <span className="font-black text-amber-300 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {tradingMode}
                  </span>
                </div>
              </div>

              {/* Footer: Confidence & Risk */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-900">
                <div className="font-mono text-zinc-300 font-bold">
                  Confidence {confidence}%
                </div>

                <div className={`font-bold text-xs flex items-center gap-1 ${
                  riskLabel === 'Risk LOW' 
                    ? 'text-emerald-400' 
                    : riskLabel === 'Risk MEDIUM' 
                    ? 'text-amber-400' 
                    : 'text-rose-400'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{riskLabel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
