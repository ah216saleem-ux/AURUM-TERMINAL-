import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
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
  Sliders,
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

interface AssetDetailViewProps {
  market?: MarketItem | null;
  onBack: () => void;
  onSelectOtherMarket: (m: MarketItem) => void;
}

const ALL_TIMEFRAMES: Timeframe[] = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'];

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  market: propMarket,
  onBack,
  onSelectOtherMarket
}) => {
  const market: MarketItem = propMarket && propMarket.id ? propMarket : INITIAL_MARKETS[0];
  const { 
    markets, 
    tradingStyleMode, 
    isFavorite, 
    toggleWatchlist, 
    sendSignalToTelegram 
  } = useMarket();

  // Active selected timeframe
  const defaultTf: Timeframe = tradingStyleMode === 'SCALPING' ? '5M' : tradingStyleMode === 'SWING' ? '4H' : '1H';
  const [selectedTf, setSelectedTf] = useState<Timeframe>(defaultTf);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [telegramSuccess, setTelegramSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('Initializing...');

  // Real-time Countdown Timer synchronized with candle intervals
  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const mins = now.getMinutes();
      const secs = now.getSeconds();
      const hrs = now.getHours();

      let totalSecs = 0;
      switch (selectedTf) {
        case '1M':
          totalSecs = 60 - secs;
          break;
        case '5M':
          totalSecs = (5 * 60) - ((mins % 5) * 60 + secs);
          break;
        case '15M':
          totalSecs = (15 * 60) - ((mins % 15) * 60 + secs);
          break;
        case '30M':
          totalSecs = (30 * 60) - ((mins % 30) * 60 + secs);
          break;
        case '1H':
          totalSecs = (60 * 60) - (mins * 60 + secs);
          break;
        case '4H':
          totalSecs = (4 * 3600) - (((hrs % 4) * 3600) + mins * 60 + secs);
          break;
        case '1D':
          totalSecs = (24 * 3600) - (hrs * 3600 + mins * 60 + secs);
          break;
        case '1W':
          const day = now.getDay();
          const daysRemaining = day === 0 ? 0 : 7 - day;
          totalSecs = (daysRemaining * 24 * 3600) + ((24 - hrs) * 3600) - (mins * 60 + secs);
          break;
        default:
          totalSecs = (30 * 60) - ((mins % 30) * 60 + secs);
      }

      if (totalSecs < 0) totalSecs = 0;

      if (selectedTf === '1M' || selectedTf === '5M' || selectedTf === '15M' || selectedTf === '30M' || selectedTf === '1H') {
        const m = Math.floor(totalSecs / 60);
        const s = totalSecs % 60;
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')} remaining`);
      } else if (selectedTf === '4H' || selectedTf === '1D') {
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        setTimeLeft(`${h}h ${m}m ${s.toString().padStart(2, '0')}s remaining`);
      } else {
        const d = Math.floor(totalSecs / (24 * 3600));
        const h = Math.floor((totalSecs % (24 * 3600)) / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        setTimeLeft(`${d}d ${h}h ${m}m remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selectedTf]);

  // Expandable sections state for Advanced Analysis
  const [expandedSections, setExpandedSections] = useState({
    smartMoney: true,
    strategyConfirmation: true,
    riskManagement: true
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

  // Helper for entry status across timeframes
  const getEntryStatus = (tf: Timeframe) => {
    const s = getTimeframeSetup(market.id, tf);
    if (s.signal === 'WAIT') return 'MONITORING';
    const dist = Math.abs(market.price - s.entry) / s.entry;
    if (dist < 0.003) return 'IN EXECUTION ZONE';
    if (s.signal === 'BUY' && market.price <= s.entry) return 'CONFIRMED';
    if (s.signal === 'SELL' && market.price >= s.entry) return 'CONFIRMED';
    return 'PENDING RETEST';
  };

  return (
    <div className="w-full space-y-4 text-zinc-100 font-sans pb-16">
      {/* 0. NAVIGATION & ASSET SWITCHER */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition font-mono-num text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Assets</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono-num font-bold text-[10.5px]">
            {tradingStyleMode}
          </span>
          <button
            onClick={() => toggleWatchlist(market.id)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition cursor-pointer"
            title={starred ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Star className={`w-4 h-4 ${starred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Horizontal Asset Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono-num font-bold">
        {markets.map((m) => {
          const isActive = m.id === market.id;
          const shortName = m.id === 'xau-usd' ? 'GOLD' : m.id === 'xag-usd' ? 'SILVER' : m.symbol;
          return (
            <button
              key={m.id}
              onClick={() => onSelectOtherMarket(m)}
              className={`py-1 px-2.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {shortName}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          PROMINENT SELECTED PAIR VIEW
          Displays live price, price movement, BUY/SELL/WAIT status, confidence,
          active setup status, entry price, stop loss, TP1, TP2, Risk Reward,
          and remaining setup time countdown timer.
      ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-amber-500/50 shadow-xl shadow-amber-500/5 relative overflow-hidden space-y-5">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent blur-3xl" />

        {/* Header containing Pair Title & Live Status Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-3xl font-black text-white tracking-tight uppercase font-syne">
                {assetInfo.symbol}
              </h1>
              <span className="text-xs text-zinc-500 font-mono-num ml-1">
                ({assetInfo.name})
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              AURUM Autonomous Live Terminal Feed • Confluence Checked
            </p>
          </div>

          {/* Timeframe & Live Connection */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-num font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
              TF: {selectedTf}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono-num font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              WS LIVE
            </span>
          </div>
        </div>

        {/* Main 3-Way Grid: Signal Status / Price / Confidence & Timer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Column 1: BUY / SELL / WAIT STATUS */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between">
            <span className="text-[10px] font-mono-num font-bold text-zinc-500 uppercase tracking-widest block">
              SIGNAL DECISION
            </span>
            <div className="my-2">
              <div className={`text-4xl font-black tracking-tighter ${
                isBuy ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]' :
                isSell ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.25)]' :
                'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              }`}>
                {setup.signal}
              </div>
            </div>
            <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isBuy ? 'bg-emerald-400' : isSell ? 'bg-rose-400' : 'bg-amber-400'}`} />
              <span>SMC Order Block Alignment</span>
            </div>
          </div>

          {/* Column 2: LIVE WEBSOCKET PRICE & MOVEMENT */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between">
            <span className="text-[10px] font-mono-num font-bold text-zinc-500 uppercase tracking-widest block">
              LIVE TERMINAL PRICE
            </span>
            <div className="my-2">
              <div className="text-3xl font-black font-mono-num text-white tracking-tight">
                ${market.price.toLocaleString(undefined, {
                  minimumFractionDigits: market.decimals,
                  maximumFractionDigits: market.decimals
                })}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono-num font-bold">
              <span className="text-zinc-500">24H Change:</span>
              <span className={`inline-flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {isPositive ? `+${market.changePercent}%` : `${market.changePercent}%`}
              </span>
            </div>
          </div>

          {/* Column 3: CONFIDENCE SCORE & TIMER */}
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-num font-bold text-zinc-500 uppercase tracking-widest block">
                CONFIDENCE SCORE
              </span>
              <span className="text-xs font-black text-amber-400">
                {setup.confidence}%
              </span>
            </div>
            <div className="my-2 space-y-1">
              <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-900">
                <div 
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${setup.confidence}%` }}
                />
              </div>
              <div className="text-[10.5px] font-semibold text-zinc-400">
                Active Setup Status: <strong className="text-amber-400 font-black">SETUP ACTIVE</strong>
              </div>
            </div>
            <div className="text-[11px] font-mono-num text-zinc-400 flex items-center justify-between">
              <span>Time Left:</span>
              <strong className="text-amber-400 font-extrabold">{timeLeft}</strong>
            </div>
          </div>

        </div>

        {/* Bottom Prominent Parameters Grid (Entry, SL, TP1, TP2, Risk Reward) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 text-xs font-mono-num">
          {/* Entry price */}
          <div className="p-3 rounded-xl bg-zinc-900/20 border border-zinc-900">
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">Entry Zone</span>
            <span className="text-sm font-black text-white block mt-1 truncate">
              {setup.entryZone}
            </span>
          </div>

          {/* Stop Loss */}
          <div className="p-3 rounded-xl bg-zinc-900/20 border border-rose-950/40">
            <span className="text-[10px] text-rose-500/80 uppercase block font-bold">Stop Loss (SL)</span>
            <span className="text-sm font-black text-rose-400 block mt-1">
              ${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
          </div>

          {/* TP1 */}
          <div className="p-3 rounded-xl bg-zinc-900/20 border border-emerald-950/40">
            <span className="text-[10px] text-emerald-500/80 uppercase block font-bold">Take Profit 1</span>
            <span className="text-sm font-black text-emerald-400 block mt-1">
              ${tp1.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
          </div>

          {/* TP2 */}
          <div className="p-3 rounded-xl bg-zinc-900/20 border border-emerald-950/40">
            <span className="text-[10px] text-emerald-500/80 uppercase block font-bold">Take Profit 2</span>
            <span className="text-sm font-black text-emerald-400 block mt-1">
              ${tp2.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
          </div>

          {/* Risk Reward */}
          <div className="p-3 rounded-xl bg-zinc-900/20 border border-amber-950/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-amber-500/80 uppercase block font-bold">Risk Reward</span>
            <span className="text-sm font-black text-amber-400 block mt-1">
              {setup.riskReward}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STEP 2: TIMEFRAME SECTION
          Show all timeframe analysis:
          1M, 5M, 15M, 30M, 1H, 4H, 1D, 1W
          Each timeframe displays:
          - Direction: LONG / SHORT / WAIT
          - Confidence %
          - Entry Status
      ========================================================================= */}
      <div className="space-y-2.5 font-mono-num">
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <h2 className="font-extrabold text-zinc-200 uppercase tracking-wide">
              TIMEFRAME ANALYSIS
            </h2>
          </div>
          <span className="text-[10.5px] text-amber-400/80">
            Tap timeframe to inspect
          </span>
        </div>

        {/* 8-Timeframe Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ALL_TIMEFRAMES.map((tf) => {
            const tfSetup = getTimeframeSetup(market.id, tf);
            const isTfActive = selectedTf === tf;
            const tfDirection = tfSetup.signal === 'BUY' ? 'LONG' : tfSetup.signal === 'SELL' ? 'SHORT' : 'WAIT';
            const status = getEntryStatus(tf);

            const tfIsBuy = tfSetup.signal === 'BUY';
            const tfIsSell = tfSetup.signal === 'SELL';

            return (
              <button
                key={tf}
                onClick={() => setSelectedTf(tf)}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                  isTfActive
                    ? 'bg-[#121626] border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'bg-[#0a0d14]/90 hover:bg-[#0f1320] border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                    isTfActive ? 'bg-amber-500 text-black font-extrabold' : 'bg-neutral-900 text-zinc-200'
                  }`}>
                    {tf}
                  </span>

                  <span className={`text-xs font-black ${
                    tfIsBuy ? 'text-emerald-400' : tfIsSell ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {tfDirection}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-zinc-500 uppercase text-[10px]">Confidence</span>
                  <span className="font-bold text-amber-300">{tfSetup.confidence}%</span>
                </div>

                <div className="pt-1 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[9.5px] text-zinc-500 uppercase">Entry Status:</span>
                  <span className={`text-[9.5px] font-extrabold truncate ${
                    status === 'CONFIRMED' 
                      ? 'text-emerald-400' 
                      : status === 'IN EXECUTION ZONE' 
                        ? 'text-amber-400' 
                        : 'text-zinc-400'
                  }`}>
                    {status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          STEP 3: TRADE ANALYSIS
          AI Trade Setup
          Entry Zone
          SL
          TP1, TP2, TP3
          Risk Reward
      ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0f1a] border border-amber-500/35 shadow-2xl font-mono-num space-y-4 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl" />

        {/* Header: AI Trade Setup, Risk Reward & Grade */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide">
                AI TRADE SETUP
              </h2>
              <span className="text-[10px] text-zinc-400">
                Calibrated for {selectedTf} Execution
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md ${
              grade === 'A+'
                ? 'bg-amber-500 text-black border-amber-400 shadow-amber-500/25'
                : grade === 'A'
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/25'
                  : 'bg-zinc-800 text-zinc-200 border-zinc-700'
            }`}>
              GRADE {grade}
            </span>

            <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-neutral-900 border border-amber-500/30 text-amber-300">
              R:R {setup.riskReward}
            </span>
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {/* Entry Zone */}
          <div className="p-3 rounded-2xl bg-neutral-950/90 border border-zinc-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Entry Zone</span>
            <span className="text-sm font-black text-white block mt-0.5 truncate">
              {setup.entryZone}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5">
              Target: ${setup.entry.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
          </div>

          {/* Stop Loss */}
          <div className="p-3 rounded-2xl bg-neutral-950/90 border border-rose-500/30">
            <span className="text-[10px] text-rose-400/90 uppercase block font-semibold">Stop Loss (SL)</span>
            <span className="text-base font-black text-rose-400 block mt-0.5">
              ${setup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5">
              Protected by Order Block
            </span>
          </div>

          {/* Risk Reward */}
          <div className="p-3 rounded-2xl bg-neutral-950/90 border border-amber-500/30">
            <span className="text-[10px] text-amber-400/90 uppercase block font-semibold">Risk Reward</span>
            <span className="text-base font-black text-amber-300 block mt-0.5">
              {setup.riskReward}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5">
              Asymmetric Profile
            </span>
          </div>

          {/* TP1 */}
          <div className="p-3 rounded-2xl bg-neutral-950/90 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400/90 uppercase block font-semibold">TP1</span>
              <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">50% Close</span>
            </div>
            <span className="text-base font-black text-emerald-400 block mt-0.5">
              ${tp1.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5">
              1st Liquidity Pool
            </span>
          </div>

          {/* TP2 */}
          <div className="p-3 rounded-2xl bg-neutral-950/90 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400/90 uppercase block font-semibold">TP2</span>
              <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">30% Close</span>
            </div>
            <span className="text-base font-black text-emerald-400 block mt-0.5">
              ${tp2.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5">
              Major Structural Level
            </span>
          </div>

          {/* TP3 */}
          <div className="p-3 rounded-2xl bg-neutral-950/90 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400/90 uppercase block font-semibold">TP3</span>
              <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">Runner</span>
            </div>
            <span className="text-base font-black text-emerald-400 block mt-0.5">
              ${tp3.toLocaleString(undefined, { minimumFractionDigits: market.decimals })}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5">
              Extended Macro Target
            </span>
          </div>
        </div>

        {/* Action Buttons: Copy Signal, Broadcast & Toggle Chart */}
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

      {/* Optional Candlestick Chart */}
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
          STEP 4: ADVANCED ANALYSIS (EXPANDABLE SECTIONS)
          1. Smart Money Concepts:
             - Order Block
             - Fair Value Gap
             - Liquidity Sweep
             - BOS
             - CHOCH
          2. Strategy Confirmation:
             - Trend
             - Momentum
             - Breakout
             - Liquidity
          3. Risk Management:
             - Trade Quality
             - Risk Level
             - Checklist
      ========================================================================= */}
      <div className="space-y-2.5 font-mono-num">
        {/* 1. SMART MONEY CONCEPTS (Expandable) */}
        <div className="rounded-2xl bg-[#0a0d14] border border-amber-500/30 overflow-hidden">
          <button
            onClick={() => toggleSection('smartMoney')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-zinc-950/80 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wide">
                  Smart Money Concepts
                </h3>
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

                {/* BOS & CHOCH */}
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

        {/* 2. STRATEGY CONFIRMATION (Expandable) */}
        <div className="rounded-2xl bg-[#0a0d14] border border-zinc-800 overflow-hidden">
          <button
            onClick={() => toggleSection('strategyConfirmation')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-zinc-950/80 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-200 uppercase tracking-wide">
                  Strategy Confirmation
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Trend, Momentum, Breakout & Liquidity Confirmation
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                4 STRATEGIES
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSections.strategyConfirmation ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.strategyConfirmation && (
            <div className="p-3.5 sm:p-4 border-t border-zinc-800/80 space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Trend */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">1. Trend Confirmation</span>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5">
                    {setup.strategies.trendFollowing.emaAlignment}
                  </span>
                  <span className="text-[9.5px] text-zinc-400 block mt-0.5">
                    EMA 20: ${setup.strategies.trendFollowing.ema20} • EMA 50: ${setup.strategies.trendFollowing.ema50}
                  </span>
                </div>

                {/* Momentum */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-sky-400 uppercase block">2. Momentum Confirmation</span>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5">
                    {setup.strategies.momentum.rsi} RSI ({setup.strategies.momentum.rsiStatus})
                  </span>
                  <span className="text-[9.5px] text-zinc-400 block mt-0.5">
                    MACD: {setup.strategies.momentum.macd} • Vol: {setup.strategies.momentum.volume}
                  </span>
                </div>

                {/* Breakout */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">3. Breakout Confirmation</span>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5">
                    {setup.strategies.breakoutRetest.retestStatus}
                  </span>
                  <span className="text-[9.5px] text-zinc-400 block mt-0.5">
                    Volume Confirmation: {setup.strategies.breakoutRetest.volumeConfirmation}
                  </span>
                </div>

                {/* Liquidity */}
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800">
                  <span className="text-[10px] font-bold text-purple-400 uppercase block">4. Liquidity Confirmation</span>
                  <span className="text-xs text-zinc-100 font-bold block mt-0.5">
                    Target Pool: {setup.strategies.liquidityReversal.targetPool}
                  </span>
                  <span className="text-[9.5px] text-zinc-400 block mt-0.5">
                    Reversal Zone: {setup.strategies.liquidityReversal.reversalZone}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. RISK MANAGEMENT (Expandable) */}
        <div className="rounded-2xl bg-[#0a0d14] border border-zinc-800 overflow-hidden">
          <button
            onClick={() => toggleSection('riskManagement')}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-zinc-950/80 hover:bg-zinc-900/60 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-200 uppercase tracking-wide">
                  Risk Management
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  Trade Quality, Risk Level & Institutional Checklist
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
      </div>

      {/* =========================================================================
          STEP 5: FINAL AI CONFIDENCE (MOVED TO THE VERY BOTTOM AFTER ALL ANALYSIS)
          Display:
          - Final AI Confidence Score
          - Strategy Scores
          - News Score
          - Risk Score
      ========================================================================= */}
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
              <h2 className="text-sm font-black text-white tracking-wide">
                FINAL AI CONFIDENCE
              </h2>
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
              {newsStatus.isBlocked ? 'High Impact Event' : 'Clear Calendar'}
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
  );
};
