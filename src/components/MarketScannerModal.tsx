import React from 'react';
import { 
  Radar, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Target, 
  Send, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Zap,
  Layers,
  Crown
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const MarketScannerModal: React.FC = () => {
  const { 
    isScannerModalOpen, 
    setIsScannerModalOpen, 
    isScanningMarket, 
    scanProgress, 
    scanStepText, 
    highestProbabilitySignal,
    signals,
    setSelectedSignalId,
    sendSignalToTelegram,
    scanMarket
  } = useMarket();

  if (!isScannerModalOpen) return null;

  const top = highestProbabilitySignal;
  const isBuy = top.type === 'BUY';
  const isSell = top.type === 'SELL';

  const handleSelectAndClose = (signalId: string) => {
    setSelectedSignalId(signalId);
    setIsScannerModalOpen(false);
    const element = document.getElementById('ai-signals-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-neutral-950 border border-amber-500/50 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto aurum-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsScannerModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/50 text-amber-300">
            <Radar className={`w-6 h-6 ${isScanningMarket ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-syne">
                AURUM AI Market Scanner
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono-num font-bold flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                TOP SETUP FINDER
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono-num">
              Multi-asset SMC order block & institutional liquidity sweep scanner
            </p>
          </div>
        </div>

        {/* Scanning State or Result */}
        {isScanningMarket ? (
          <div className="py-8 px-4 rounded-2xl bg-neutral-900/70 border border-zinc-800 space-y-5 text-center">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/60 flex items-center justify-center">
                <Radar className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white font-mono-num uppercase tracking-wider">
                Scanning All Supported Assets...
              </h3>
              <p className="text-xs text-amber-300 font-mono-num animate-pulse">
                {scanStepText}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto space-y-1">
              <div className="flex justify-between text-[11px] font-mono-num text-zinc-400">
                <span>Analysis Progress</span>
                <span className="font-bold text-amber-400">{scanProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Top Conviction Setup Hero Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#1b1c28] to-[#0c0d14] border-2 border-amber-500 shadow-xl space-y-4 relative overflow-hidden">
              {/* Gold Crest Glow */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500 text-black">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-num uppercase tracking-widest text-amber-400 font-bold block">
                      HIGHEST PROBABILITY SETUP DETECTED
                    </span>
                    <h3 className="text-xl font-bold text-white font-syne">
                      {top.symbol} <span className="text-sm font-normal text-zinc-400">({top.name})</span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black font-mono-num border flex items-center gap-1.5 ${
                    isBuy ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  }`}>
                    {isBuy ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{top.type} ({top.direction})</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono-num font-bold">
                    Score: {top.setupStrength?.overallScore || top.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Parameters Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs font-mono-num">
                <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Optimal Entry</span>
                  <span className="text-sm font-bold text-amber-300 block">
                    ${top.entryPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-400">Zone: ${top.entryZone.min} - ${top.entryZone.max}</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Stop Loss (SL)</span>
                  <span className="text-sm font-bold text-rose-400 block">
                    ${top.stopLoss.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500">Invalidation</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Take Profit (TP)</span>
                  <span className="text-sm font-bold text-emerald-400 block">
                    ${top.takeProfit.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-400/80">TP2: ${top.takeProfit2.toLocaleString()}</span>
                </div>
              </div>

              {/* Execution Reason */}
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-zinc-800/80 text-xs space-y-1">
                <span className="text-[10px] font-mono-num font-bold text-amber-400 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Scanner Synthesis:
                </span>
                <p className="text-zinc-300 font-light leading-relaxed">
                  {top.marketReason}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => scanMarket()}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono-num transition flex items-center justify-center gap-2 cursor-pointer border border-zinc-800"
                >
                  <Radar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Re-scan Market</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sendSignalToTelegram(top.id)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 text-xs font-mono-num font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Telegram</span>
                  </button>

                  <button
                    onClick={() => handleSelectAndClose(top.id)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:brightness-110 text-black text-xs font-bold font-mono-num flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    <span>Load Setup in Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scanned Assets Ranking Summary */}
            <div className="space-y-2">
              <span className="text-xs font-mono-num text-zinc-400 font-bold uppercase tracking-wider block">
                All Scanned Markets Ranked by Probability
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {signals.map((sig, idx) => {
                  const score = sig.setupStrength?.overallScore || sig.confidenceScore;
                  const isTopRanked = sig.id === top.id;

                  return (
                    <div
                      key={sig.id}
                      onClick={() => handleSelectAndClose(sig.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                        isTopRanked
                          ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-400/30'
                          : 'bg-neutral-900/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold font-mono-num flex items-center justify-center ${
                          isTopRanked ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white text-xs font-syne block">
                            {sig.symbol}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono-num">
                            {sig.type} • {sig.timeframe}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono-num text-amber-300">
                          {score}%
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono-num ${
                          sig.direction === 'LONG' ? 'bg-emerald-500/15 text-emerald-300' : sig.direction === 'SHORT' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'
                        }`}>
                          {sig.direction}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
