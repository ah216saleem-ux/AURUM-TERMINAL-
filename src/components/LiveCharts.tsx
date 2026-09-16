import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Layers, 
  Sparkles,
  ShieldAlert,
  Target,
  Send,
  Zap,
  Eye,
  EyeOff,
  Crosshair,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { Timeframe, Candle } from '../types';

export const LiveCharts: React.FC = () => {
  const { 
    signals,
    selectedSignalId,
    setSelectedSignalId,
    selectedSignal,
    selectedMarket,
    selectedTimeframe, 
    setSelectedTimeframe,
    candles,
    chartOverlays,
    setChartOverlays,
    sendSignalToTelegram
  } = useMarket();

  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 480 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 480
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const timeframes: Timeframe[] = ['15M', '30M', '1H', '4H', '1D'];

  const smc = selectedSignal.smc;

  // Calculate Price Range and Visual Bounds
  const { minPrice, maxPrice, priceRange, maxVolume, ema20Arr, ema50Arr } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100, maxVolume: 1000, ema20Arr: [], ema50Arr: [] };
    }

    let min = Math.min(...candles.map(c => c.low));
    let max = Math.max(...candles.map(c => c.high));

    // Incorporate AI Setup levels into bounds if active
    if (chartOverlays.showTpSl && selectedSignal) {
      min = Math.min(min, selectedSignal.stopLoss * 0.998);
      max = Math.max(max, selectedSignal.takeProfit * 1.002, (selectedSignal.takeProfit2 || selectedSignal.takeProfit) * 1.002);
    }
    if (chartOverlays.showLiquidity && smc) {
      min = Math.min(min, smc.sellSideLiquidity.price * 0.998);
      max = Math.max(max, smc.buySideLiquidity.price * 1.002);
    }

    const padding = (max - min) * 0.08 || 1;
    min = min - padding;
    max = max + padding;

    const maxVol = Math.max(...candles.map(c => c.volume), 1);

    // Calculate 20 EMA
    const k20 = 2 / (20 + 1);
    let ema20 = candles[0].close;
    const e20 = candles.map(c => {
      ema20 = c.close * k20 + ema20 * (1 - k20);
      return ema20;
    });

    // Calculate 50 EMA
    const k50 = 2 / (50 + 1);
    let ema50 = candles[0].close;
    const e50 = candles.map(c => {
      ema50 = c.close * k50 + ema50 * (1 - k50);
      return ema50;
    });

    return {
      minPrice: min,
      maxPrice: max,
      priceRange: max - min,
      maxVolume: maxVol,
      ema20Arr: e20,
      ema50Arr: e50
    };
  }, [candles, chartOverlays, selectedSignal, smc]);

  const paddingLeft = 16;
  const paddingRight = 85;
  const paddingTop = 30;
  const paddingBottom = 45;
  const chartWidth = Math.max(300, dimensions.width - paddingLeft - paddingRight);
  const chartHeight = Math.max(200, dimensions.height - paddingTop - paddingBottom);

  const getY = (price: number) => {
    if (priceRange === 0) return chartHeight / 2 + paddingTop;
    return paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const candleCount = candles.length;
  const candleSpacing = chartWidth / (candleCount || 1);
  const candleBodyWidth = Math.max(2, Math.min(18, candleSpacing * 0.65));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - paddingLeft;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= chartWidth) {
      const index = Math.min(candleCount - 1, Math.max(0, Math.floor(x / candleSpacing)));
      setHoveredCandle(candles[index]);
      setMousePos({ x: x + paddingLeft, y });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setMousePos(null);
  };

  const displayCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <section id="live-charts-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-num text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>PRECISION EXECUTION ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-syne tracking-tight">
            Interactive SMC Execution Chart
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Visualized Order Blocks, Liquidity Pools (BSL/SSL), BOS/CHOCH Pivots, and Entry/SL/TP Zones.
          </p>
        </div>

        {/* Asset Selector Tabs */}
        <div className="flex items-center p-1 bg-neutral-900 rounded-xl border border-zinc-800 self-start md:self-auto overflow-x-auto max-w-full">
          {signals.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSignalId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedSignalId === s.id
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="rounded-2xl bg-glass-card border border-amber-500/30 overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6 aurum-border-glow">
        {/* Top Control Bar: Ticker Info, Timeframes, Overlays Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-800">
          {/* Active Asset Live Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white font-syne">{selectedSignal.symbol}</span>
              <span className="text-xs text-zinc-400 font-mono-num">{selectedSignal.name}</span>
            </div>
            <div className="flex items-center gap-2 font-mono-num">
              <span className="text-base font-bold text-amber-300">
                ${selectedMarket.price.toLocaleString(undefined, { minimumFractionDigits: selectedMarket.decimals })}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                selectedMarket.change >= 0 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {selectedMarket.change >= 0 ? '+' : ''}{selectedMarket.changePercent}%
              </span>
            </div>
          </div>

          {/* Timeframe Selector & Overlay Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe Buttons */}
            <div className="flex items-center p-1 bg-neutral-900 rounded-lg border border-zinc-800 text-xs font-mono-num">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-amber-500 text-black shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Overlays Toggle Menu */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-zinc-800 text-xs font-mono-num">
              <button
                onClick={() => setChartOverlays(prev => ({ ...prev, showOrderBlocks: !prev.showOrderBlocks }))}
                className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                  chartOverlays.showOrderBlocks ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Toggle SMC Order Blocks"
              >
                <Layers className="w-3 h-3" />
                <span>OB</span>
              </button>

              <button
                onClick={() => setChartOverlays(prev => ({ ...prev, showLiquidity: !prev.showLiquidity }))}
                className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                  chartOverlays.showLiquidity ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Toggle Buy/Sell-Side Liquidity Zones"
              >
                <Target className="w-3 h-3" />
                <span>BSL/SSL</span>
              </button>

              <button
                onClick={() => setChartOverlays(prev => ({ ...prev, showTpSl: !prev.showTpSl }))}
                className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                  chartOverlays.showTpSl ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Toggle Entry / TP / SL Lines"
              >
                <Zap className="w-3 h-3" />
                <span>TP/SL</span>
              </button>

              <button
                onClick={() => setChartOverlays(prev => ({ ...prev, showEma: !prev.showEma }))}
                className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                  chartOverlays.showEma ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Toggle EMA 20/50"
              >
                <span>EMA</span>
              </button>
            </div>
          </div>
        </div>

        {/* OHLCV Live Readout Bar */}
        {displayCandle && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono-num bg-neutral-950/70 px-3 py-2 rounded-lg border border-zinc-800/80 text-zinc-400">
            <span className="text-zinc-200 font-semibold">{displayCandle.timeLabel}</span>
            <span>O: <strong className="text-zinc-100">${displayCandle.open.toFixed(2)}</strong></span>
            <span>H: <strong className="text-emerald-400">${displayCandle.high.toFixed(2)}</strong></span>
            <span>L: <strong className="text-rose-400">${displayCandle.low.toFixed(2)}</strong></span>
            <span>C: <strong className="text-amber-300">${displayCandle.close.toFixed(2)}</strong></span>
            <span>Vol: <strong className="text-zinc-300">{displayCandle.volume.toLocaleString()}</strong></span>
          </div>
        )}

        {/* SVG Candlestick & SMC Canvas */}
        <div ref={containerRef} className="relative w-full h-[480px]">
          <svg
            width={dimensions.width}
            height={dimensions.height}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full cursor-crosshair select-none"
          >
            <defs>
              {/* Gold gradient for Bullish Order Block */}
              <linearGradient id="bullishObGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
              {/* Rose gradient for Bearish Order Block */}
              <linearGradient id="bearishObGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
              </linearGradient>
              {/* Entry Zone Gradient */}
              <linearGradient id="entryZoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = paddingTop + chartHeight * pct;
              const price = maxPrice - (pct * priceRange);
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={paddingLeft + chartWidth}
                    y2={y}
                    stroke="#27272a"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft + chartWidth + 8}
                    y={y + 3}
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    ${price.toFixed(selectedMarket.decimals)}
                  </text>
                </g>
              );
            })}

            {/* 1. SMC Bullish Order Block (OB+) Shaded Zone */}
            {chartOverlays.showOrderBlocks && smc?.bullishOrderBlock && (
              <g>
                <rect
                  x={paddingLeft}
                  y={getY(smc.bullishOrderBlock.high)}
                  width={chartWidth}
                  height={Math.max(4, getY(smc.bullishOrderBlock.low) - getY(smc.bullishOrderBlock.high))}
                  fill="url(#bullishObGrad)"
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft + 8}
                  y={getY(smc.bullishOrderBlock.high) + 12}
                  fill="#34d399"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  🟢 {smc.bullishOrderBlock.label}
                </text>
              </g>
            )}

            {/* 2. SMC Bearish Order Block (OB-) Shaded Zone */}
            {chartOverlays.showOrderBlocks && smc?.bearishOrderBlock && (
              <g>
                <rect
                  x={paddingLeft}
                  y={getY(smc.bearishOrderBlock.high)}
                  width={chartWidth}
                  height={Math.max(4, getY(smc.bearishOrderBlock.low) - getY(smc.bearishOrderBlock.high))}
                  fill="url(#bearishObGrad)"
                  stroke="#f43f5e"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft + 8}
                  y={getY(smc.bearishOrderBlock.high) + 12}
                  fill="#fb7185"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  🔴 {smc.bearishOrderBlock.label}
                </text>
              </g>
            )}

            {/* 3. SMC Liquidity Zones (BSL & SSL) */}
            {chartOverlays.showLiquidity && smc?.buySideLiquidity && (
              <g>
                <line
                  x1={paddingLeft}
                  y1={getY(smc.buySideLiquidity.price)}
                  x2={paddingLeft + chartWidth}
                  y2={getY(smc.buySideLiquidity.price)}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text
                  x={paddingLeft + chartWidth - 190}
                  y={getY(smc.buySideLiquidity.price) - 5}
                  fill="#38bdf8"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ⚡ {smc.buySideLiquidity.label}
                </text>
              </g>
            )}

            {chartOverlays.showLiquidity && smc?.sellSideLiquidity && (
              <g>
                <line
                  x1={paddingLeft}
                  y1={getY(smc.sellSideLiquidity.price)}
                  x2={paddingLeft + chartWidth}
                  y2={getY(smc.sellSideLiquidity.price)}
                  stroke="#fb923c"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                <text
                  x={paddingLeft + chartWidth - 190}
                  y={getY(smc.sellSideLiquidity.price) + 12}
                  fill="#fb923c"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ⚡ {smc.sellSideLiquidity.label}
                </text>
              </g>
            )}

            {/* 4. AI Trade Setup Zones: Entry Zone, SL, TP1, TP2 */}
            {chartOverlays.showTpSl && selectedSignal && (
              <g>
                {/* Entry Zone Band */}
                <rect
                  x={paddingLeft}
                  y={getY(selectedSignal.entryZone.max)}
                  width={chartWidth}
                  height={Math.max(3, getY(selectedSignal.entryZone.min) - getY(selectedSignal.entryZone.max))}
                  fill="url(#entryZoneGrad)"
                  stroke="#fbbf24"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft + 10}
                  y={getY(selectedSignal.entryZone.max) + 11}
                  fill="#fcd34d"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ENTRY ZONE: ${selectedSignal.entryZone.min} - ${selectedSignal.entryZone.max}
                </text>

                {/* Stop Loss Line */}
                <line
                  x1={paddingLeft}
                  y1={getY(selectedSignal.stopLoss)}
                  x2={paddingLeft + chartWidth}
                  y2={getY(selectedSignal.stopLoss)}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <rect
                  x={paddingLeft + chartWidth + 4}
                  y={getY(selectedSignal.stopLoss) - 8}
                  width="72"
                  height="16"
                  rx="3"
                  fill="#ef4444"
                />
                <text
                  x={paddingLeft + chartWidth + 8}
                  y={getY(selectedSignal.stopLoss) + 4}
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  SL ${selectedSignal.stopLoss}
                </text>

                {/* Take Profit 1 Line */}
                <line
                  x1={paddingLeft}
                  y1={getY(selectedSignal.takeProfit)}
                  x2={paddingLeft + chartWidth}
                  y2={getY(selectedSignal.takeProfit)}
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <rect
                  x={paddingLeft + chartWidth + 4}
                  y={getY(selectedSignal.takeProfit) - 8}
                  width="72"
                  height="16"
                  rx="3"
                  fill="#10b981"
                />
                <text
                  x={paddingLeft + chartWidth + 8}
                  y={getY(selectedSignal.takeProfit) + 4}
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  TP1 ${selectedSignal.takeProfit}
                </text>

                {/* Take Profit 2 Line */}
                {selectedSignal.takeProfit2 && (
                  <g>
                    <line
                      x1={paddingLeft}
                      y1={getY(selectedSignal.takeProfit2)}
                      x2={paddingLeft + chartWidth}
                      y2={getY(selectedSignal.takeProfit2)}
                      stroke="#059669"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <rect
                      x={paddingLeft + chartWidth + 4}
                      y={getY(selectedSignal.takeProfit2) - 8}
                      width="72"
                      height="16"
                      rx="3"
                      fill="#059669"
                    />
                    <text
                      x={paddingLeft + chartWidth + 8}
                      y={getY(selectedSignal.takeProfit2) + 4}
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      TP2 ${selectedSignal.takeProfit2}
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* 5. Volume Sub-bars (Bottom 20% of chart) */}
            {chartOverlays.showVolume && (
              <g opacity="0.35">
                {candles.map((c, i) => {
                  const x = paddingLeft + i * candleSpacing + candleSpacing / 2;
                  const volHeight = (c.volume / maxVolume) * 45;
                  const y = paddingTop + chartHeight - volHeight;
                  const isUp = c.close >= c.open;
                  return (
                    <rect
                      key={`vol-${i}`}
                      x={x - candleBodyWidth / 2}
                      y={y}
                      width={candleBodyWidth}
                      height={volHeight}
                      fill={isUp ? '#10b981' : '#f43f5e'}
                      rx="1"
                    />
                  );
                })}
              </g>
            )}

            {/* 6. EMA 20 & EMA 50 Curved Lines */}
            {chartOverlays.showEma && ema20Arr.length > 1 && (
              <path
                d={ema20Arr.reduce((acc, val, i) => {
                  const x = paddingLeft + i * candleSpacing + candleSpacing / 2;
                  const y = getY(val);
                  return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                opacity="0.85"
              />
            )}

            {chartOverlays.showEma && ema50Arr.length > 1 && (
              <path
                d={ema50Arr.reduce((acc, val, i) => {
                  const x = paddingLeft + i * candleSpacing + candleSpacing / 2;
                  const y = getY(val);
                  return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.5"
                opacity="0.75"
              />
            )}

            {/* 7. Candlesticks */}
            {candles.map((candle, i) => {
              const x = paddingLeft + i * candleSpacing + candleSpacing / 2;
              const isUp = candle.close >= candle.open;
              const candleColor = isUp ? '#10b981' : '#f43f5e';
              const yHigh = getY(candle.high);
              const yLow = getY(candle.low);
              const yOpen = getY(candle.open);
              const yClose = getY(candle.close);
              const top = Math.min(yOpen, yClose);
              const height = Math.max(2, Math.abs(yOpen - yClose));

              return (
                <g key={i} className="transition-opacity hover:opacity-80">
                  {/* High/Low Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={candleColor}
                    strokeWidth="1.2"
                  />
                  {/* Real Body */}
                  <rect
                    x={x - candleBodyWidth / 2}
                    y={top}
                    width={candleBodyWidth}
                    height={height}
                    fill={candleColor}
                    stroke={candleColor}
                    rx="1"
                  />
                </g>
              );
            })}

            {/* 8. Crosshair & Price Callout */}
            {mousePos && (
              <g>
                <line
                  x1={mousePos.x}
                  y1={paddingTop}
                  x2={mousePos.x}
                  y2={paddingTop + chartHeight}
                  stroke="#d4af37"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <line
                  x1={paddingLeft}
                  y1={mousePos.y}
                  x2={paddingLeft + chartWidth}
                  y2={mousePos.y}
                  stroke="#d4af37"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Bottom Legend & Quick Trade Setup Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs font-mono-num text-zinc-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500 inline-block" />
              <span>Bullish OB+ (Demand)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500/30 border border-rose-500 inline-block" />
              <span>Bearish OB- (Supply)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-400 inline-block" />
              <span>BSL Liquidity</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" />
              <span>EMA 20</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-400 inline-block" />
              <span>EMA 50</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-300">
              Active Setup: <strong className="text-amber-300">{selectedSignal.type} @ ${selectedSignal.entryPrice}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
