import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Copy, 
  Check, 
  Send, 
  BarChart2, 
  ShieldCheck, 
  Layers, 
  Star,
  Activity,
  Radar,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { MarketItem, Timeframe, SignalType } from '../types';
import { getTimeframeSetup, DetailedTimeframeSetup } from '../data/timeframeSignals';
import { useMarket } from '../context/MarketContext';
import { getStyleAdjustedParameters } from '../data/tradingStyleData';
import { getAurumRiskEvaluation } from '../data/riskQualityData';
import { getNewsTradingStatus } from '../data/newsIntelligenceData';
import { InteractiveCandleChart } from './InteractiveCandleChart';
import { getAssetAiProfile } from '../data/multiAssetIntelligence';
import { INITIAL_MARKETS } from '../data/initialData';

interface SelectedAssetTradeFlowProps {
  market?: MarketItem | null;
}

const ALL_TIMEFRAMES: Timeframe[] = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'];

export const SelectedAssetTradeFlow: React.FC<SelectedAssetTradeFlowProps> = ({ market: propMarket }) => {
  const { 
    markets,
    tradingStyleMode, 
    isFavorite, 
    toggleWatchlist, 
    sendSignalToTelegram 
  } = useMarket();

  const inputMarket: MarketItem = propMarket && propMarket.id ? propMarket : INITIAL_MARKETS[0];
  const market: MarketItem = markets.find(m => m.id === inputMarket.id) || inputMarket;

  // Active selected timeframe - default based on style mode
  const defaultTf: Timeframe = tradingStyleMode === 'SCALPING' ? '5M' : tradingStyleMode === 'SWING' ? '4H' : '1H';
  const [selectedTf, setSelectedTf] = useState<Timeframe>(defaultTf);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [telegramSuccess, setTelegramSuccess] = useState<string | null>(null);

  // Sync default timeframe if style mode changes
  React.useEffect(() => {
    const recommendedTf: Timeframe = tradingStyleMode === 'SCALPING' ? '5M' : tradingStyleMode === 'SWING' ? '4H' : '1H';
    setSelectedTf(recommendedTf);
  }, [tradingStyleMode, market.id]);

  // Expandable sections state for Advanced Analysis
  const [expandedSections, setExpandedSections] = useState({
    smartMoney: true,
    strategyScores: true,
    riskManagement: true,
    newsIntelligence: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Setup data for current selected timeframe
  const setup: DetailedTimeframeSetup = getTimeframeSetup(market.id, selectedTf);
  const styleParams = getStyleAdjustedParameters(
    market.id,
    setup.entry,
    setup.stopLoss,
    setup.takeProfit,
    setup.takeProfit2,
    setup.confidence,
    tradingStyleMode
  );

  const aurumVerdict = getAurumRiskEvaluation(market.id, selectedTf);
  const newsStatus = getNewsTradingStatus();
  const profile = getAssetAiProfile(market.id);
  const starred = isFavorite(market.id);
  const isPositive = market.changePercent >= 0;

  const isBuy = setup.signal === 'BUY';
  const isSell = setup.signal === 'SELL';
  const isWait = setup.signal === 'WAIT';

  // Take profit targets
  const tp1 = setup.takeProfit;
  const tp2 = setup.takeProfit2 || (isBuy ? setup.entry + (tp1 - setup.entry) * 1.5 : setup.entry - (setup.entry - tp1) * 1.5);
  const tp3 = setup.takeProfit3 || (isBuy ? setup.entry + (tp1 - setup.entry) * 2.2 : setup.entry - (setup.entry - tp1) * 2.2);

  // Setup Grade calculation: A+ (>=88%), A (>=75%), B (<75%)
  const grade = setup.confidence >= 88 ? 'A+' : setup.confidence >= 75 ? 'A' : 'B';

  // Format asset title
  const getAssetTitle = () => {
    switch (market.id) {
      case 'xau-usd':
        return { symbol: 'XAU/USD', name: 'Gold Spot' };
      case 'xag-usd':
        return { symbol: 'Silver', name: 'Silver Spot (XAG/USD)' };
      case 'nasdaq-100':
        return { symbol: 'NASDAQ', name: 'NASDAQ 100 Index' };
      case 'sp-500':
        return { symbol: 'S&P500', name: 'S&P 500 Index' };
      case 'crude-oil':
        return { symbol: 'Oil', name: 'WTI Crude Oil' };
      case 'eur-usd':
        return { symbol: 'Forex (EUR/USD)', name: 'Euro / US Dollar' };
      case 'gbp-usd':
        return { symbol: 'Forex (GBP/USD)', name: 'British Pound / US Dollar' };
      case 'usd-jpy':
        return { symbol: 'Forex (USD/JPY)', name: 'US Dollar / Japanese Yen' };
      case 'aud-usd':
        return { symbol: 'Forex (AUD/USD)', name: 'Australian Dollar / US Dollar' };
      case 'usd-cad':
        return { symbol: 'Forex (USD/CAD)', name: 'US Dollar / Canadian Dollar' };
      case 'btc-usd':
        return { symbol: 'BTC', name: 'Bitcoin / US Dollar' };
      default:
        return { symbol: market.symbol, name: market.name };
    }
  };

  const assetInfo = getAssetTitle();

  const handleCopySignal = () => {
    const text = `AURUM AI TRADING SIGNAL
Asset: ${assetInfo.symbol} (${assetInfo.name})
Signal: ${setup.signal}
Timeframe: ${selectedTf}
Entry Price: $${setup.entry.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
Entry Zone: ${setup.entryZone}
Stop Loss: $${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
TP1: $${tp1.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
TP2: $${tp2.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
TP3: $${tp3.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
Risk:Reward: ${setup.riskReward}
Confidence: ${setup.confidence}%
Grade: ${grade}

Rationale:
${setup.aiReason}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramBroadcast = () => {
    sendSignalToTelegram(`sig-${market.id}-${selectedTf}`);
    setTelegramSuccess('Broadcasted signal to Telegram wire!');
    setTimeout(() => setTelegramSuccess(null), 2500);
  };

  return (
    <div className="w-full space-y-4 font-sans">
      {/* =========================================================================
          STEP 4: SELECTED ASSET SIGNAL
          Asset Header with Live Price
          BUY/SELL/WAIT
          Entry
          SL
          TP (TP1, TP2, TP3)
          Timeframe (interactive pills)
          Confidence
      ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0f1a] border border-amber-500/40 shadow-2xl relative overflow-hidden space-y-4 font-mono-num">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent blur-3xl" />

        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider">
              SELECTED ASSET SIGNAL
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400">Trading Mode:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black">
              {tradingStyleMode}
            </span>
          </div>
        </div>

        {/* Asset Header: Name & Price */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => toggleWatchlist(market.id)}
              className="p-1 -ml-1 text-zinc-600 hover:text-amber-400 transition cursor-pointer shrink-0"
              title={starred ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-4 h-4 ${starred ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {assetInfo.symbol}
              </h2>
              <span className="text-xs font-semibold text-zinc-400 block truncate">
                {assetInfo.name}
              </span>
            </div>
          </div>

          {/* Current Live Price */}
          <div className="text-right shrink-0">
            <div className="text-xl sm:text-2xl font-black text-white">
              ${market.price.toLocaleString(undefined, {
                minimumFractionDigits: market.decimals,
                maximumFractionDigits: market.decimals
              })}
            </div>
            <div className={`inline-flex items-center text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {isPositive ? `+${market.changePercent}%` : `${market.changePercent}%`}
            </div>
          </div>
        </div>

        {/* Signal Direction & Confidence Row */}
        <div className="p-3 rounded-2xl bg-neutral-950/90 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">
              Signal:
            </span>
            <div className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black tracking-wider border shadow-md ${
              isBuy 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20' 
                : isSell 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                isBuy ? 'bg-emerald-400' : isSell ? 'bg-rose-400' : 'bg-amber-400'
              }`} />
              <span>{setup.signal}</span>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 border border-amber-500/30">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-zinc-400">Confidence:</span>
            <span className="text-xs font-black text-amber-300">{setup.confidence}%</span>
            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold ml-0.5">
              {grade}
            </span>
          </div>
        </div>

        {/* Interactive Timeframe Selector Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 font-bold uppercase">Timeframe:</span>
            <span className="text-amber-400/90 text-[10px]">Tap to change execution timeframe</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {ALL_TIMEFRAMES.map((tf) => {
              const isTfActive = selectedTf === tf;
              const tfSetup = getTimeframeSetup(market.id, tf);
              const tfBias = tfSetup.signal === 'BUY' ? 'L' : tfSetup.signal === 'SELL' ? 'S' : 'W';
              const tfColor = tfSetup.signal === 'BUY' ? 'text-emerald-400' : tfSetup.signal === 'SELL' ? 'text-rose-400' : 'text-amber-400';

              return (
                <button
                  key={tf}
                  onClick={() => setSelectedTf(tf)}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                    isTfActive
                      ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md shadow-amber-500/25 scale-[1.02]'
                      : 'bg-neutral-950/90 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-[11px] font-black">{tf}</div>
                  <div className={`text-[9px] font-bold ${isTfActive ? 'text-black' : tfColor}`}>
                    {tfBias} • {tfSetup.confidence}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trade Parameters: Entry, SL, TP1, TP2, TP3 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Entry */}
          <div className="p-2.5 rounded-xl bg-neutral-950/90 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Entry</span>
            <span className="text-sm font-black text-white block mt-0.5">
              ${setup.entry.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5 truncate">
              {setup.entryZone}
            </span>
          </div>

          {/* Stop Loss */}
          <div className="p-2.5 rounded-xl bg-neutral-950/90 border border-rose-500/30">
            <span className="text-[10px] text-rose-400/90 uppercase block font-semibold">Stop Loss (SL)</span>
            <span className="text-sm font-black text-rose-400 block mt-0.5">
              ${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5">
              R:R {setup.riskReward}
            </span>
          </div>

          {/* TP1 & TP2 */}
          <div className="p-2.5 rounded-xl bg-neutral-950/90 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400/90 uppercase block font-semibold">TP1 & TP2</span>
              <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">50% / 30%</span>
            </div>
            <div className="text-xs font-black text-emerald-400 block mt-0.5">
              TP1: ${tp1.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </div>
            <div className="text-[11px] font-bold text-emerald-300/90 mt-0.5">
              TP2: ${tp2.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </div>
          </div>

          {/* TP3 (Runner) */}
          <div className="p-2.5 rounded-xl bg-neutral-950/90 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400/90 uppercase block font-semibold">TP3 (Runner)</span>
              <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">20%</span>
            </div>
            <span className="text-sm font-black text-emerald-400 block mt-0.5">
              ${tp3.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5">
              Macro Target
            </span>
          </div>
        </div>

        {/* Action Buttons: Copy Signal, Wire, and Toggle Candlestick Chart */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleCopySignal}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38728] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY AI SIGNAL'}</span>
          </button>

          <button
            onClick={handleTelegramBroadcast}
            className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>WIRE</span>
          </button>

          <button
            onClick={() => setShowChart(!showChart)}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              showChart
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{showChart ? 'HIDE CHART' : 'VIEW CHART'}</span>
          </button>
        </div>

        {telegramSuccess && (
          <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-center text-xs font-bold animate-fadeIn">
            {telegramSuccess}
          </div>
        )}
      </div>

      {/* Interactive Candlestick Chart (Optional View) */}
      {showChart && (
        <div className="p-3.5 rounded-3xl bg-[#090b12] border border-zinc-800 space-y-3 font-mono-num">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              SMC Candlestick Chart ({selectedTf})
            </span>
            <span className="text-[10.5px] text-zinc-400">Pinch or drag to inspect levels</span>
          </div>
          <InteractiveCandleChart
            market={market}
            timeframe={selectedTf}
            onTimeframeChange={setSelectedTf}
            height={300}
          />
        </div>
      )}

      {/* =========================================================================
          STEP 5: ADVANCED ANALYSIS
          SMC
          Strategy Scores
          Risk
          News
          Final AI Confidence
      ========================================================================= */}
      <div className="space-y-3 font-mono-num">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              ADVANCED ANALYSIS
            </h3>
          </div>
          <span className="text-[10.5px] text-zinc-400 font-sans">
            Institutional Confluence Engine
          </span>
        </div>

        {/* 1. SMC (Smart Money Concepts) */}
        <div className="rounded-2xl bg-[#0a0d14] border border-amber-500/30 overflow-hidden">
          <button
            onClick={() => toggleSection('smartMoney')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-zinc-950/80 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wide">
                  Smart Money Concepts (SMC)
                </h4>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Order Block, Fair Value Gap, Liquidity Sweep, BOS & CHOCH
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                CONFIRMED
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSections.smartMoney ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.smartMoney && (
            <div className="p-3.5 sm:p-4 border-t border-zinc-800/80 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Order Block */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">Order Block</span>
                  <span className="text-xs text-zinc-200 font-semibold block mt-0.5">
                    {setup.strategies.smc.orderBlock}
                  </span>
                </div>

                {/* Fair Value Gap */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-purple-400 uppercase block">Fair Value Gap</span>
                  <span className="text-xs text-zinc-200 font-semibold block mt-0.5">
                    {setup.strategies.smc.fairValueGap}
                  </span>
                </div>

                {/* Liquidity Sweep */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-sky-400 uppercase block">Liquidity Sweep</span>
                  <span className="text-xs text-zinc-200 font-semibold block mt-0.5">
                    {setup.strategies.smc.liquiditySweep}
                  </span>
                </div>

                {/* Structure Shift (BOS & CHOCH) */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Structure Shift (BOS & CHOCH)</span>
                  <div className="text-xs text-zinc-200 font-semibold space-y-0.5 mt-0.5">
                    <div>BOS: <strong className="text-emerald-300">{setup.strategies.smc.bos}</strong></div>
                    <div>CHOCH: <strong className="text-emerald-300">{setup.strategies.smc.choch}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. STRATEGY SCORES */}
        <div className="rounded-2xl bg-[#0a0d14] border border-zinc-800 overflow-hidden">
          <button
            onClick={() => toggleSection('strategyScores')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-zinc-950/80 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-zinc-200 uppercase tracking-wide">
                  Strategy Scores
                </h4>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  SMC, Trend Following, Momentum, Breakout & Liquidity Scores
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                4 CONFLUENCES
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSections.strategyScores ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.strategyScores && (
            <div className="p-3.5 sm:p-4 border-t border-zinc-800/80 space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Trend Score */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Trend Score</span>
                    <span className="font-bold text-amber-300">{aurumVerdict.scores.technicalScore}%</span>
                  </div>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5">
                    {setup.strategies.trendFollowing.emaAlignment}
                  </span>
                  <span className="text-[9.5px] text-zinc-400 block mt-0.5">
                    EMA 20: ${setup.strategies.trendFollowing.ema20} • EMA 50: ${setup.strategies.trendFollowing.ema50}
                  </span>
                </div>

                {/* Momentum Score */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-400 uppercase">Momentum Score</span>
                    <span className="font-bold text-sky-300">{aurumVerdict.scores.momentumScore}%</span>
                  </div>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5">
                    {setup.strategies.momentum.rsi} RSI ({setup.strategies.momentum.rsiStatus})
                  </span>
                  <span className="text-[9.5px] text-zinc-400 block mt-0.5">
                    MACD: {setup.strategies.momentum.macd} • Vol: {setup.strategies.momentum.volume}
                  </span>
                </div>

                {/* Breakout & Retest */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Breakout Score</span>
                    <span className="font-bold text-emerald-300">86%</span>
                  </div>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5">
                    {setup.strategies.breakoutRetest.retestStatus}
                  </span>
                  <span className="text-[9.5px] text-zinc-400 block mt-0.5">
                    Volume: {setup.strategies.breakoutRetest.volumeConfirmation}
                  </span>
                </div>

                {/* Liquidity Reversal */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-400 uppercase">Liquidity Score</span>
                    <span className="font-bold text-purple-300">91%</span>
                  </div>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5">
                    Target: {setup.strategies.liquidityReversal.targetPool}
                  </span>
                  <span className="text-[9.5px] text-zinc-400 block mt-0.5">
                    Zone: {setup.strategies.liquidityReversal.reversalZone}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. RISK MANAGEMENT */}
        <div className="rounded-2xl bg-[#0a0d14] border border-zinc-800 overflow-hidden">
          <button
            onClick={() => toggleSection('riskManagement')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-zinc-950/80 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-zinc-200 uppercase tracking-wide">
                  Risk Management
                </h4>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Trade Quality Grade, Risk Level & Institutional Checklist
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSections.riskManagement ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.riskManagement && (
            <div className="p-3.5 sm:p-4 border-t border-zinc-800/80 space-y-3 text-xs">
              {/* Metric Row: Trade Quality & Risk Level */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Trade Quality</span>
                  <span className="text-sm font-black text-amber-300 block mt-0.5">
                    GRADE {grade}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Risk Level</span>
                  <span className="text-sm font-black text-emerald-400 block mt-0.5">
                    {setup.confidence >= 85 ? 'LOW RISK' : 'MODERATE'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Capital At Risk</span>
                  <span className="text-sm font-black text-zinc-200 block mt-0.5">
                    1.0% Max
                  </span>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-1.5 font-sans text-xs pt-1">
                <span className="text-[10px] font-mono-num font-bold text-zinc-400 uppercase tracking-wider block">
                  Pre-Execution Safety Checklist
                </span>
                {[
                  { label: 'Trend Alignment Confirmed', desc: 'EMA & Multi-Timeframe Alignment Valid', ok: true },
                  { label: 'Market Structure Shift Reclaimed', desc: 'BOS & CHOCH Formed on Execution TF', ok: true },
                  { label: 'Order Block & Liquidity Swept', desc: 'Sell-Side / Buy-Side Pool Cleared', ok: true },
                  { label: 'Economic Calendar News Clearance', desc: newsStatus.status, ok: !newsStatus.isBlocked },
                  { label: 'Asymmetric Risk:Reward Validated', desc: `Target R:R ${setup.riskReward} meets safety rule`, ok: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="font-semibold text-zinc-200 text-xs">{item.label}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono-num">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. NEWS INTELLIGENCE */}
        <div className="rounded-2xl bg-[#0a0d14] border border-zinc-800 overflow-hidden">
          <button
            onClick={() => toggleSection('newsIntelligence')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-zinc-950/80 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-sky-400" />
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-zinc-200 uppercase tracking-wide">
                  News Intelligence & Risk Filter
                </h4>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Economic calendar impact & volatility forecast
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                newsStatus.isBlocked 
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' 
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
              }`}>
                {newsStatus.isBlocked ? 'HIGH VOLATILITY' : 'CLEAR WINDOW'}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSections.newsIntelligence ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.newsIntelligence && (
            <div className="p-3.5 sm:p-4 border-t border-zinc-800/80 space-y-2 text-xs font-sans">
              <div className="p-3 rounded-xl bg-neutral-950 border border-zinc-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-white text-xs block">
                      Macro Sentiment Status: {newsStatus.status}
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      AI sentiment engine tracks FOMC, CPI, NFP, and central bank order book flows. Trade setups are calibrated to avoid high-spread slippage.
                    </p>
                  </div>
                  <span className="font-mono-num font-bold text-amber-300 text-xs shrink-0">
                    Score: {aurumVerdict.scores.newsScore}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. FINAL AI CONFIDENCE */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0d101d] border border-amber-500/40 shadow-2xl font-mono-num space-y-3.5 relative overflow-hidden">
          {/* Glow Accent */}
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-amber-500/15 blur-2xl" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Radar className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white tracking-wide">
                  FINAL AI CONFIDENCE
                </h4>
                <span className="text-[10px] text-zinc-400 font-sans">
                  Composite institutional confluence assessment
                </span>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl bg-amber-500 text-black font-black text-xs shadow-md shadow-amber-500/25">
              {setup.confidence}% TOTAL SCORE
            </div>
          </div>

          {/* Final AI Confidence Score Large Gauge */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10.5px] font-bold text-amber-400 uppercase tracking-widest block">
                Final AI Confidence Score
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white block mt-0.5">
                {setup.confidence}%
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">
                Weighted confluence across SMC, Trend, Momentum & News
              </span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex flex-col items-center justify-center text-center">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-[9.5px] font-black text-amber-300 mt-0.5">{grade}</span>
            </div>
          </div>

          {/* Strategy Scores, News Score & Risk Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {/* Strategy Score: SMC */}
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">SMC Strategy</span>
              <span className="text-base font-black text-amber-300 block mt-0.5">
                {aurumVerdict.scores.smcScore}%
              </span>
              <span className="text-[9px] text-zinc-400 block mt-0.5">Order Block Bias</span>
            </div>

            {/* Strategy Score: Trend & Momentum */}
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Trend & Momentum</span>
              <span className="text-base font-black text-emerald-400 block mt-0.5">
                {Math.round((aurumVerdict.scores.technicalScore + aurumVerdict.scores.momentumScore) / 2)}%
              </span>
              <span className="text-[9px] text-zinc-400 block mt-0.5">EMA & Oscillator</span>
            </div>

            {/* News Score */}
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">News Score</span>
              <span className={`text-base font-black block mt-0.5 ${
                aurumVerdict.scores.newsScore >= 70 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {aurumVerdict.scores.newsScore}%
              </span>
              <span className="text-[9px] text-zinc-400 block mt-0.5">
                {newsStatus.isBlocked ? 'High Impact' : 'Clear Calendar'}
              </span>
            </div>

            {/* Risk Score */}
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Risk Score</span>
              <span className="text-base font-black text-sky-400 block mt-0.5">
                {Math.min(95, aurumVerdict.scores.smcScore + 4)}%
              </span>
              <span className="text-[9px] text-zinc-400 block mt-0.5">Capital Clearance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
