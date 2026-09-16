import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Maximize2, 
  Eye, 
  EyeOff, 
  Layers, 
  Crosshair, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Target,
  Sparkles,
  Zap
} from 'lucide-react';
import { MarketItem, Timeframe, Candle } from '../types';
import { getTimeframeSetup, DetailedTimeframeSetup } from '../data/timeframeSignals';
import { generateSampleCandles } from '../data/initialData';

interface InteractiveCandleChartProps {
  market: MarketItem;
  timeframe: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
  height?: number;
}

export const InteractiveCandleChart: React.FC<InteractiveCandleChartProps> = ({
  market,
  timeframe,
  onTimeframeChange,
  height = 320
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(500);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Overlay toggles
  const [showOrderBlock, setShowOrderBlock] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);
  const [showLevels, setShowLevels] = useState(true);

  // Measure container dimensions
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Retrieve the signal setup for this market and timeframe
  const setup: DetailedTimeframeSetup = useMemo(() => {
    return getTimeframeSetup(market.id, timeframe);
  }, [market.id, timeframe]);

  // Generate responsive candle data matching the market price and timeframe
  const candles: Candle[] = useMemo(() => {
    return generateSampleCandles(market.price, 32, timeframe);
  }, [market.id, timeframe, market.price]);

  // Derive Order Block and Liquidity numeric bounds
  const obBounds = useMemo(() => {
    // If trade is BUY, order block is generally slightly below or at entry
    const isBuy = setup.signal === 'BUY';
    const entry = setup.entry;
    const obSpread = market.price * 0.0035;

    if (isBuy) {
      return {
        type: 'Bullish Demand OB',
        low: +(entry - obSpread).toFixed(market.decimals),
        high: +(entry + obSpread * 0.4).toFixed(market.decimals),
        color: '#10b981',
        label: 'Bullish Demand Order Block'
      };
    } else {
      return {
        type: 'Bearish Supply OB',
        low: +(entry - obSpread * 0.4).toFixed(market.decimals),
        high: +(entry + obSpread).toFixed(market.decimals),
        color: '#f43f5e',
        label: 'Bearish Supply Order Block'
      };
    }
  }, [setup, market.price, market.decimals]);

  // Liquidity target levels
  const liquidityLevel = useMemo(() => {
    const isBuy = setup.signal === 'BUY';
    return {
      type: isBuy ? 'Buy-Side Liquidity (BSL)' : 'Sell-Side Liquidity (SSL)',
      price: setup.takeProfit,
      label: isBuy ? 'BSL Target Pool' : 'SSL Liquidity Target'
    };
  }, [setup]);

  // Dynamic Chart Bounds
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (!candles.length) return { minPrice: 0, maxPrice: 100, priceRange: 100 };

    let min = Math.min(...candles.map(c => c.low));
    let max = Math.max(...candles.map(c => c.high));

    // Incorporate TP, SL, and OB into chart view range
    if (showLevels) {
      min = Math.min(min, setup.stopLoss);
      max = Math.max(max, setup.takeProfit);
      if (setup.takeProfit2) max = Math.max(max, setup.takeProfit2);
    }
    if (showOrderBlock) {
      min = Math.min(min, obBounds.low);
      max = Math.max(max, obBounds.high);
    }

    const padding = (max - min) * 0.08 || 1;
    min = min - padding;
    max = max + padding;

    return {
      minPrice: min,
      maxPrice: max,
      priceRange: max - min || 1
    };
  }, [candles, setup, obBounds, showLevels, showOrderBlock]);

  // Chart Margins
  const paddingLeft = 10;
  const paddingRight = 78;
  const paddingTop = 28;
  const paddingBottom = 28;

  const chartWidth = Math.max(200, containerWidth - paddingLeft - paddingRight);
  const chartHeight = Math.max(160, height - paddingTop - paddingBottom);

  const getY = (price: number) => {
    if (priceRange === 0) return chartHeight / 2 + paddingTop;
    return paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const candleSpacing = chartWidth / (candles.length || 1);
  const candleBodyWidth = Math.max(3, Math.min(12, candleSpacing * 0.65));

  // Mouse & Touch Tracking
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - paddingLeft;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= chartWidth) {
      const idx = Math.min(candles.length - 1, Math.max(0, Math.floor(x / candleSpacing)));
      setHoveredCandle(candles[idx]);
      setMousePos({ x: paddingLeft + idx * candleSpacing + candleSpacing / 2, y });
    }
  };

  const handlePointerLeave = () => {
    setHoveredCandle(null);
    setMousePos(null);
  };

  const activeDisplayCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="w-full space-y-2 select-none" ref={containerRef}>
      {/* Chart Control Toolbar: Overlays & Candle HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-mono-num">
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowLevels(!showLevels)}
            className={`px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
              showLevels 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Levels</span>
          </button>

          <button
            onClick={() => setShowOrderBlock(!showOrderBlock)}
            className={`px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
              showOrderBlock 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Order Block</span>
          </button>

          <button
            onClick={() => setShowLiquidity(!showLiquidity)}
            className={`px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
              showLiquidity 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Liquidity</span>
          </button>
        </div>

        {/* OHLC Bar HUD */}
        {activeDisplayCandle && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-neutral-950/80 px-2 py-0.5 rounded-md border border-zinc-800/80">
            <span>O: <span className="text-zinc-200">${activeDisplayCandle.open.toFixed(market.decimals)}</span></span>
            <span>H: <span className="text-emerald-400">${activeDisplayCandle.high.toFixed(market.decimals)}</span></span>
            <span>L: <span className="text-rose-400">${activeDisplayCandle.low.toFixed(market.decimals)}</span></span>
            <span>C: <span className={activeDisplayCandle.close >= activeDisplayCandle.open ? 'text-emerald-400' : 'text-rose-400'}>
              ${activeDisplayCandle.close.toFixed(market.decimals)}
            </span></span>
          </div>
        )}
      </div>

      {/* SVG Interactive Candlestick Stage */}
      <div className="relative rounded-2xl bg-[#090b10] border border-zinc-800/90 overflow-hidden shadow-inner">
        {/* Subtle grid backdrop lines */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-5" />

        <svg
          width={containerWidth}
          height={height}
          className="overflow-visible cursor-crosshair"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {/* Bullish Order Block Gradient */}
            <linearGradient id="bullishObGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>

            {/* Bearish Order Block Gradient */}
            <linearGradient id="bearishObGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
            </linearGradient>

            {/* Liquidity Zone Gradient */}
            <linearGradient id="liquidityGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Horizontal Reference Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const p = minPrice + pct * priceRange;
            const y = getY(p);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartWidth}
                  y2={y}
                  stroke="#27272a"
                  strokeDasharray="2 3"
                  strokeWidth="0.75"
                  opacity="0.4"
                />
                <text
                  x={containerWidth - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#71717a"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  ${p.toFixed(market.decimals)}
                </text>
              </g>
            );
          })}

          {/* ORDER BLOCK ZONE: Shaded Box */}
          {showOrderBlock && (() => {
            const yHigh = getY(obBounds.high);
            const yLow = getY(obBounds.low);
            const topY = Math.min(yHigh, yLow);
            const boxHeight = Math.max(14, Math.abs(yLow - yHigh));
            const isBullish = setup.signal === 'BUY';

            return (
              <g className="transition-opacity duration-300">
                <rect
                  x={paddingLeft}
                  y={topY}
                  width={chartWidth}
                  height={boxHeight}
                  fill={isBullish ? 'url(#bullishObGrad)' : 'url(#bearishObGrad)'}
                  stroke={isBullish ? '#10b981' : '#f43f5e'}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  strokeOpacity="0.6"
                  rx="4"
                />
                <rect
                  x={paddingLeft + 8}
                  y={topY - 8}
                  width={145}
                  height={15}
                  rx="3"
                  fill="#000000"
                  fillOpacity="0.85"
                  stroke={isBullish ? '#10b981' : '#f43f5e'}
                  strokeWidth="0.75"
                />
                <text
                  x={paddingLeft + 14}
                  y={topY + 3}
                  fill={isBullish ? '#34d399' : '#fb7185'}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {isBullish ? '● DEMAND ORDER BLOCK' : '● SUPPLY ORDER BLOCK'}
                </text>
              </g>
            );
          })()}

          {/* LIQUIDITY ZONES: Buy-Side / Sell-Side Sweep Band */}
          {showLiquidity && (() => {
            const yLiq = getY(liquidityLevel.price);
            return (
              <g className="transition-opacity duration-300">
                <line
                  x1={paddingLeft}
                  y1={yLiq}
                  x2={paddingLeft + chartWidth}
                  y2={yLiq}
                  stroke="#c084fc"
                  strokeWidth="1.25"
                  strokeDasharray="5 3"
                  strokeOpacity="0.75"
                />
                <rect
                  x={paddingLeft + chartWidth - 142}
                  y={yLiq - 8}
                  width={140}
                  height={15}
                  rx="3"
                  fill="#180b29"
                  stroke="#c084fc"
                  strokeWidth="0.75"
                />
                <text
                  x={paddingLeft + chartWidth - 72}
                  y={yLiq + 3}
                  textAnchor="middle"
                  fill="#e9d5ff"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  ⚡ {liquidityLevel.label}
                </text>
              </g>
            );
          })()}

          {/* CANDLESTICKS: Wicks and Real OHLC Bodies */}
          {candles.map((candle, idx) => {
            const x = paddingLeft + idx * candleSpacing + candleSpacing / 2;
            const yHigh = getY(candle.high);
            const yLow = getY(candle.low);
            const yOpen = getY(candle.open);
            const yClose = getY(candle.close);

            const isBullish = candle.close >= candle.open;
            const bodyColor = isBullish ? '#10b981' : '#f43f5e';
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(2, Math.abs(yOpen - yClose));

            const isHovered = hoveredCandle && hoveredCandle.time === candle.time;

            return (
              <g key={candle.time} opacity={hoveredCandle && !isHovered ? 0.45 : 1}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={bodyColor}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Candle Body */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={bodyTop}
                  width={candleBodyWidth}
                  height={bodyHeight}
                  fill={bodyColor}
                  rx="1"
                />
              </g>
            );
          })}

          {/* KEY EXECUTION LEVELS: ENTRY, STOP LOSS, TAKE PROFIT */}
          {showLevels && (() => {
            const yEntry = getY(setup.entry);
            const ySl = getY(setup.stopLoss);
            const yTp = getY(setup.takeProfit);

            return (
              <g>
                {/* 1. ENTRY LEVEL (Amber) */}
                <line
                  x1={paddingLeft}
                  y1={yEntry}
                  x2={paddingLeft + chartWidth}
                  y2={yEntry}
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <rect
                  x={containerWidth - 76}
                  y={yEntry - 9}
                  width={72}
                  height={18}
                  rx="4"
                  fill="#fbbf24"
                />
                <text
                  x={containerWidth - 40}
                  y={yEntry + 3.5}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  ENTRY ${setup.entry.toFixed(market.decimals)}
                </text>

                {/* 2. STOP LOSS LEVEL (Red/Rose) */}
                <line
                  x1={paddingLeft}
                  y1={ySl}
                  x2={paddingLeft + chartWidth}
                  y2={ySl}
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                />
                <rect
                  x={containerWidth - 76}
                  y={ySl - 9}
                  width={72}
                  height={18}
                  rx="4"
                  fill="#f43f5e"
                />
                <text
                  x={containerWidth - 40}
                  y={ySl + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  SL ${setup.stopLoss.toFixed(market.decimals)}
                </text>

                {/* 3. TAKE PROFIT LEVEL (Emerald) */}
                <line
                  x1={paddingLeft}
                  y1={yTp}
                  x2={paddingLeft + chartWidth}
                  y2={yTp}
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
                <rect
                  x={containerWidth - 76}
                  y={yTp - 9}
                  width={72}
                  height={18}
                  rx="4"
                  fill="#10b981"
                />
                <text
                  x={containerWidth - 40}
                  y={yTp + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  TP ${setup.takeProfit.toFixed(market.decimals)}
                </text>
              </g>
            );
          })()}

          {/* Interactive Crosshair */}
          {mousePos && (
            <g pointerEvents="none">
              <line
                x1={mousePos.x}
                y1={paddingTop}
                x2={mousePos.x}
                y2={paddingTop + chartHeight}
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <line
                x1={paddingLeft}
                y1={mousePos.y}
                x2={paddingLeft + chartWidth}
                y2={mousePos.y}
                stroke="#d4af37"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.8"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Legend & Level Callout Pills */}
      <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono-num pt-1">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
          <span className="text-[10px] text-amber-300 block uppercase">Entry Level</span>
          <span className="font-bold text-amber-400">
            ${setup.entry.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
          <span className="text-[10px] text-rose-300 block uppercase">Stop Loss</span>
          <span className="font-bold text-rose-400">
            ${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
          <span className="text-[10px] text-emerald-300 block uppercase">Take Profit</span>
          <span className="font-bold text-emerald-400">
            ${setup.takeProfit.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
          </span>
        </div>
      </div>
    </div>
  );
};
