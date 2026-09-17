import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Target, 
  Zap, 
  Send, 
  LineChart, 
  Check,
  ArrowRight
} from 'lucide-react';
import { MarketItem, SignalType } from '../types';
import { getTimeframeSetup } from '../data/timeframeSignals';
import { useMarket } from '../context/MarketContext';

interface InlineScannerProps {
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

export const InlineScanner: React.FC<InlineScannerProps> = ({
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
    { text: 'Scanning NASDAQ 100 & S&P 500 liquidity pools...', progress: 35 },
    { text: 'Auditing EUR/USD & GBP/USD London killzones...', progress: 55 },
    { text: 'Checking USD/JPY, AUD/USD & USD/CAD momentum...', progress: 75 },
    { text: 'Checking composite index supply rejection zones...', progress: 95 }
  ];

  // Run scan sequence
  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    let completionTimer: NodeJS.Timeout;

    if (isScanning) {
      setProgress(15);
      setScanStep(0);
      setBestSetup(null);

      stepInterval = setInterval(() => {
        setScanStep((prev) => {
          if (prev < SCAN_STEPS.length - 1) {
            const next = prev + 1;
            setProgress(SCAN_STEPS[next].progress);
            return next;
          }
          return prev;
        });
      }, 500);

      completionTimer = setTimeout(() => {
        clearInterval(stepInterval);
        setProgress(100);

        // Find the absolute highest confidence setup across our 9 target assets
        const targetIds = ['xau-usd', 'xag-usd', 'eur-usd', 'gbp-usd', 'usd-jpy', 'aud-usd', 'usd-cad', 'sp-500', 'nasdaq-100'];
        const targets = markets.filter(m => targetIds.includes(m.id));
        
        const candidates = (targets.length > 0 ? targets : markets).map((m) => {
          const setup = getTimeframeSetup(m.id, '1H');
          return {
            market: m,
            assetName: m.symbol,
            signal: setup.signal,
            entry: setup.entry,
            stopLoss: setup.stopLoss,
            takeProfit: setup.takeProfit,
            confidence: setup.confidence,
            reason: setup.aiReason,
            decimals: m.decimals
          };
        });

        // Sort descending by confidence, take the best
        candidates.sort((a, b) => b.confidence - a.confidence);
        setBestSetup(candidates[0]);
        setIsScanning(false);
      }, 2500);
    }

    return () => {
      clearInterval(stepInterval);
      clearTimeout(completionTimer);
    };
  }, [isScanning, markets]);

  const handleShareSetup = async () => {
    if (!bestSetup) return;
    const res = await sendSignalToTelegram(`sig-${bestSetup.market.id}-1H`);
    if (res.success) {
      setTelegramNotice('Signal broadcasted to Telegram Wire!');
      setTimeout(() => setTelegramNotice(null), 3000);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-4 font-mono-num relative overflow-hidden">
      {/* Glow accent */}
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <Radar className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-wide uppercase">
              AI Market Scanner
            </h3>
            <span className="text-[10px] text-zinc-500 font-sans block">
              Scanning 9 core assets for SMC high-probability setups
            </span>
          </div>
        </div>

        {!isScanning && (
          <button
            onClick={() => setIsScanning(true)}
            className="text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/20 transition cursor-pointer"
          >
            RE-SCAN SYSTEM
          </button>
        )}
      </div>

      {/* Active scanning sequence */}
      {isScanning ? (
        <div className="py-8 text-center space-y-5">
          {/* Radar animation */}
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-amber-500/20 border border-amber-500/40 animate-pulse" />
            <Radar className="w-6 h-6 text-amber-400" />
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between items-center text-xs text-zinc-400 px-1">
              <span className="font-sans">Analyzing Confluences...</span>
              <span className="font-extrabold text-amber-400">{progress}%</span>
            </div>

            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 h-8 font-sans leading-relaxed animate-pulse">
              {SCAN_STEPS[scanStep]?.text}
            </p>
          </div>
        </div>
      ) : (
        /* Scan results */
        bestSetup && (
          <div className="space-y-4 animate-fadeIn">
            {/* Alert banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-[11px]">
              <span className="text-zinc-300 font-sans">
                Scanner completed. Highest probability setup identified:
              </span>
              <span className="font-bold text-amber-300">
                GRADE A+
              </span>
            </div>

            {/* Asset highlight */}
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-900 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-black text-white">
                    {bestSetup.assetName}
                  </h4>
                  <div className={`text-2xl font-black mt-1 ${
                    bestSetup.signal === 'BUY' ? 'text-emerald-400' :
                    bestSetup.signal === 'SELL' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {bestSetup.signal} SETUP DETECTED
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">Confidence</span>
                  <span className="text-lg font-black text-amber-400">{bestSetup.confidence}%</span>
                </div>
              </div>

              {/* Levels grid */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Entry</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    ${bestSetup.entry.toLocaleString(undefined, { minimumFractionDigits: bestSetup.decimals })}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950 border border-rose-950/35">
                  <span className="text-[10px] text-rose-500/70 uppercase block font-semibold">Stop Loss</span>
                  <span className="text-xs font-bold text-rose-400 block mt-0.5">
                    ${bestSetup.stopLoss.toLocaleString(undefined, { minimumFractionDigits: bestSetup.decimals })}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950 border border-emerald-950/35">
                  <span className="text-[10px] text-emerald-500/70 uppercase block font-semibold">Target (TP)</span>
                  <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                    ${bestSetup.takeProfit.toLocaleString(undefined, { minimumFractionDigits: bestSetup.decimals })}
                  </span>
                </div>
              </div>

              {/* Rationale */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 text-[11px] leading-relaxed text-zinc-400 font-sans">
                <strong className="text-zinc-200 font-mono-num font-bold block mb-1">SMC Rationale:</strong>
                {bestSetup.reason}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onOpenAssetChart(bestSetup.market)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 hover:brightness-105 active:scale-[0.99] transition cursor-pointer"
              >
                <span>OPEN TRADING VIEW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleShareSetup}
                className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>WIRE</span>
              </button>
            </div>

            {telegramNotice && (
              <p className="text-[10.5px] font-bold text-sky-400 text-center">{telegramNotice}</p>
            )}
          </div>
        )
      )}
    </div>
  );
};
