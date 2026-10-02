import React from 'react';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';
import { MarketItem } from '../../types';

interface LiveMarketTickerStripProps {
  markets: MarketItem[];
  onAccessTerminal?: () => void;
}

export const LiveMarketTickerStrip: React.FC<LiveMarketTickerStripProps> = ({
  markets,
  onAccessTerminal
}) => {
  const isConnected = markets && markets.length > 0;

  // Duplicate list to make seamless continuous marquee
  const displayMarkets = isConnected ? [...markets, ...markets, ...markets] : [];

  return (
    <div className="w-full bg-[#04060a]/95 border-b border-amber-500/20 py-2 overflow-hidden select-none relative z-30 font-mono text-xs">
      {!isConnected ? (
        <div className="flex items-center justify-center gap-2 text-amber-400 py-0.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold tracking-wider">RECONNECTING LIVE MARKET FEEDS...</span>
        </div>
      ) : (
        <div className="overflow-hidden whitespace-nowrap flex items-center">
          <div className="animate-marquee flex items-center gap-6 shrink-0">
            {displayMarkets.map((m, idx) => {
              const isPos = m.changePercent >= 0;
              const isForex = m.category === 'forex' || m.symbol.includes('EUR') || m.symbol.includes('GBP');
              let formattedPrice = '';
              if (isForex) {
                formattedPrice = m.price.toFixed(4);
              } else if (m.price >= 1000) {
                formattedPrice = '$' + m.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              } else {
                formattedPrice = '$' + m.price.toFixed(2);
              }

              return (
                <div
                  key={`${m.id}-${idx}`}
                  onClick={onAccessTerminal}
                  className="inline-flex items-center gap-2 cursor-pointer hover:text-amber-300 transition-colors py-0.5 px-2 rounded hover:bg-zinc-900/50 shrink-0"
                >
                  <span className="font-cinzel font-bold text-white tracking-wide">{m.symbol}</span>
                  <span className="font-mono tabular-nums text-zinc-200 font-semibold">{formattedPrice}</span>
                  <span className={`inline-flex items-center gap-0.5 text-[10.5px] font-mono tabular-nums font-bold px-1.5 py-0.2 rounded ${
                    isPos ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}>
                    {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {isPos ? `+${m.changePercent.toFixed(2)}%` : `${m.changePercent.toFixed(2)}%`}
                  </span>
                  <span className="text-zinc-700 text-[10px] ml-2">|</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
