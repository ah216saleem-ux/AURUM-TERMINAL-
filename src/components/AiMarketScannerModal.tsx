import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, 
  Sparkles, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Target, 
  Zap, 
  X, 
  Send, 
  LineChart, 
  Check,
  ArrowRight
} from 'lucide-react';
import { MarketItem, SignalType } from '../types';
import { getTimeframeSetup, DetailedTimeframeSetup } from '../data/timeframeSignals';
import { useMarket } from '../context/MarketContext';

interface AiMarketScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  markets: MarketItem[];
  onOpenAssetChart: (market: MarketItem) => void;
}

interface BestSetupResult {
  market: MarketItem;
  assetName: string;
  signal: SignalType;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  reason: string;
  decimals: number;
}

export const AiMarketScannerModal: React.FC<AiMarketScannerModalProps> = ({
  isOpen,
  onClose,
  markets,
  onOpenAssetChart
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanStep, setScanStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(10);
  const [bestSetup, setBestSetup] = useState<BestSetupResult | null>(null);
  const [telegramNotice, setTelegramNotice] = useState<string | null>(null);
  const { sendSignalToTelegram } = useMarket();

  const SCAN_STEPS = [
    { text: 'Analyzing XAU/USD Gold & Silver institutional order blocks...', progress: 15 },
    { text: 'Scanning NASDAQ 100 & S&P 500 liquidity pools & session ranges...', progress: 35 },
    { text: 'Auditing EUR/USD & GBP/USD London killzone breakouts...', progress: 55 },
    { text: 'Checking USD/JPY, AUD/USD & USD/CAD momentum divergences...', progress: 75 },
    { text: 'Evaluating BTC/USD spot & Crude Oil supply rejection zones...', progress: 95 }
  ];

  // Trigger scan sequence
  useEffect(() => {
    if (!isOpen) return;

    setIsScanning(true);
    setProgress(15);
    setScanStep(0);
    setBestSetup(null);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          const next = prev + 1;
          setProgress(SCAN_STEPS[next].progress);
          return next;
        }
        return prev;
      });
    }, 450);

    const completionTimer = setTimeout(() => {
      clearInterval(stepInterval);
      setProgress(100);

      // Analyze all 5 requested assets: XAU/USD, NASDAQ 100, S&P 500, Crude Oil, Silver
      const candidates = markets.map((m) => {
        const setup = getTimeframeSetup(m.id, '1H');
        return {
          market: m,
          assetName: m.symbol === 'XAU/USD' ? 'XAU/USD Gold' :
                     m.symbol === 'XAG/USD' ? 'Silver (XAG/USD)' :
                     m.symbol === 'Oil WTI' ? 'Crude Oil (WTI)' :
                     m.symbol,
          signal: setup.signal,
          entry: setup.entry,
          stopLoss: setup.stopLoss,
          takeProfit: setup.takeProfit,
          confidence: setup.confidence,
          reason: setup.aiReason,
          decimals: m.decimals
        };
      });

      // Filter for highest probability setup
      const top = [...candidates].sort((a, b) => b.confidence - a.confidence)[0] || candidates[0];
      setBestSetup(top);
      setIsScanning(false);
    }, 2400);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(completionTimer);
    };
  }, [isOpen, markets]);

  if (!isOpen) return null;

  const handleTelegramBroadcast = () => {
    if (bestSetup) {
      sendSignalToTelegram(`sig-${bestSetup.market.id}-01`);
      setTelegramNotice('Broadcasted to Telegram Wire!');
      setTimeout(() => setTelegramNotice(null), 2500);
    }
  };

  const handleOpenChart = () => {
    if (bestSetup) {
      onClose();
      onOpenAssetChart(bestSetup.market);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md rounded-3xl bg-[#0a0c12] border border-amber-500/40 p-5 sm:p-6 shadow-2xl space-y-5 text-zinc-100 selection:bg-amber-500/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/25">
                <Radar className={`w-4 h-4 text-black ${isScanning ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h2 className="text-base font-bold font-syne text-white tracking-wide flex items-center gap-1.5">
                  AI MARKET <span className="text-amber-400">SCANNER</span>
                </h2>
                <span className="text-[10px] font-mono-num text-zinc-400 uppercase tracking-wider">
                  Analyzing 5 Core Institutional Assets
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SCANNING STATE */}
          {isScanning ? (
            <div className="py-8 px-2 text-center space-y-5">
              {/* Radar Ping Animation */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/50 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.25)]">
                  <Radar className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              </div>

              {/* Status Message */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider block">
                  Scanning 5 Core Markets...
                </span>
                <p className="text-[11px] font-mono-num text-zinc-400 max-w-xs mx-auto min-h-[34px] flex items-center justify-center">
                  {SCAN_STEPS[scanStep]?.text || 'Synthesizing institutional liquidity...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-xs mx-auto space-y-1">
                <div className="flex justify-between text-[10px] font-mono-num text-zinc-500">
                  <span>Confluence Engine</span>
                  <span className="text-amber-400 font-bold">{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : bestSetup ? (
            /* COMPLETED: ONLY THE HIGHEST PROBABILITY SETUP */
            <div className="space-y-4">
              {/* Top Banner Tag */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/35">
                <div className="flex items-center gap-1.5 text-xs font-mono-num font-bold text-amber-300">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>HIGHEST PROBABILITY SETUP</span>
                </div>
                <span className="text-[11px] font-mono-num font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {bestSetup.confidence}% Confidence
                </span>
              </div>

              {/* Main Setup Card */}
              <div className="p-4 rounded-2xl bg-[#0e111a] border border-amber-500/25 space-y-3.5">
                {/* Asset & BUY/SELL */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono-num text-zinc-500 uppercase tracking-wider block">
                      Asset
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {bestSetup.assetName}
                    </h3>
                  </div>

                  {/* BUY / SELL Badge */}
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono-num tracking-wide border flex items-center gap-1.5 ${
                    bestSetup.signal === 'BUY'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${bestSetup.signal === 'BUY' ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
                    <span>{bestSetup.signal}</span>
                  </div>
                </div>

                {/* Entry | SL | TP Matrix */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono-num">
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-zinc-800 space-y-0.5">
                    <span className="text-[10px] text-zinc-400 block uppercase">Entry</span>
                    <span className="font-bold text-amber-300 block text-sm sm:text-base">
                      ${bestSetup.entry.toLocaleString(undefined, { minimumFractionDigits: bestSetup.decimals })}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-0.5">
                    <span className="text-[10px] text-rose-300 block uppercase flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      SL
                    </span>
                    <span className="font-bold text-rose-400 block text-sm sm:text-base">
                      ${bestSetup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: bestSetup.decimals })}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-0.5">
                    <span className="text-[10px] text-emerald-300 block uppercase flex items-center gap-1">
                      <Target className="w-3 h-3 text-emerald-400" />
                      TP
                    </span>
                    <span className="font-bold text-emerald-400 block text-sm sm:text-base">
                      ${bestSetup.takeProfit.toLocaleString(undefined, { minimumFractionDigits: bestSetup.decimals })}
                    </span>
                  </div>
                </div>

                {/* AI Reason */}
                <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-mono-num font-bold text-amber-400 uppercase tracking-wider block">
                    Reason
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {bestSetup.reason}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={handleOpenChart}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#996515] hover:brightness-110 text-black text-xs font-mono-num font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <LineChart className="w-4 h-4" />
                  <span>Open Interactive Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleTelegramBroadcast}
                  className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 text-xs font-mono-num font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Broadcast to Telegram Wire"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Wire</span>
                </button>
              </div>

              {telegramNotice && (
                <div className="text-center text-[11px] font-mono-num text-emerald-400 font-semibold">
                  ✓ {telegramNotice}
                </div>
              )}
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
