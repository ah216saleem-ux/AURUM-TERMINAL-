import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Check, 
  Radio, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  ExternalLink,
  BellRing,
  AlertCircle,
  Copy
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const TelegramModal: React.FC = () => {
  const { 
    isTelegramModalOpen, 
    setIsTelegramModalOpen, 
    telegramSettings, 
    updateTelegramSettings,
    signals,
    sendSignalToTelegram
  } = useMarket();

  const [botToken, setBotToken] = useState(telegramSettings.botToken);
  const [channelTag, setChannelTag] = useState(telegramSettings.channelTag);
  const [autoBroadcast, setAutoBroadcast] = useState(telegramSettings.autoBroadcast);
  const [minConfidence, setMinConfidence] = useState(telegramSettings.minConfidence);
  const [isSaved, setIsSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  if (!isTelegramModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTelegramSettings({
      botToken: botToken.trim(),
      channelTag: channelTag.trim() || '@aurum_ai_signals',
      autoBroadcast,
      minConfidence,
      isConnected: true
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsTelegramModalOpen(false);
    }, 1000);
  };

  const handleTestBroadcast = async () => {
    setTestSent(true);
    await sendSignalToTelegram(signals[0].id);
    setTimeout(() => setTestSent(false), 2000);
  };

  const sampleSignal = signals[0];
  const sampleMessage = `AURUM TERMINAL SIGNAL

Asset: ${sampleSignal.symbol} (${sampleSignal.name})
Signal: ${sampleSignal.type}
Entry: $${sampleSignal.entryZone.min.toLocaleString()} - $${sampleSignal.entryZone.max.toLocaleString()} (Optimal: $${sampleSignal.entryPrice.toLocaleString()})
SL: $${sampleSignal.stopLoss.toLocaleString()}
TP: TP1 $${sampleSignal.takeProfit.toLocaleString()} | TP2 $${sampleSignal.takeProfit2.toLocaleString()}
Timeframe: ${sampleSignal.timeframe}
Confidence: ${sampleSignal.confidenceScore}%
Reason: ${sampleSignal.marketReason}`;

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleMessage);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-amber-500/35 rounded-2xl p-6 sm:p-8 shadow-2xl aurum-glow space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsTelegramModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          aria-label="Close Telegram configuration"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-num text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4 text-amber-400" />
            <span>INSTANT DISPATCH SYSTEM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-syne">
            Telegram AI Signal Integration
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Link your Telegram bot or channel to receive automated AI trading signals, take profit triggers, and stop loss updates in real-time.
          </p>
        </div>

        {/* Live Channel Status Banner */}
        <div className="p-4 rounded-xl bg-neutral-900/90 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-xs font-mono-num font-bold text-white block">
                Telegram Dispatch Engine: ACTIVE
              </span>
              <span className="text-[11px] text-zinc-400 font-mono-num">
                Connected to {telegramSettings.channelTag}
              </span>
            </div>
          </div>

          <button
            onClick={handleTestBroadcast}
            disabled={testSent}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-mono-num font-semibold border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>{testSent ? 'Dispatched!' : 'Send Test Wire'}</span>
          </button>
        </div>

        {/* Template Preview Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-num text-zinc-400">
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Standard Telegram Message Schema</span>
            </span>
            <button
              onClick={handleCopySample}
              className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedSample ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSample ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-neutral-900/90 border border-zinc-800 text-[11px] font-mono-num text-zinc-200 whitespace-pre-wrap leading-relaxed">
            {sampleMessage}
          </pre>
        </div>

        {/* Telegram Configuration Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-zinc-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono-num text-zinc-300 block mb-1">
                Telegram Bot Token (Optional)
              </label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuv..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-zinc-800 text-white text-xs font-mono-num focus:border-amber-400 focus:outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-xs font-mono-num text-zinc-300 block mb-1">
                Target Channel / Chat ID
              </label>
              <input
                type="text"
                value={channelTag}
                onChange={(e) => setChannelTag(e.target.value)}
                placeholder="@aurum_ai_signals"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-zinc-800 text-white text-xs font-mono-num focus:border-amber-400 focus:outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono-num text-white font-semibold block">
                  Autonomous Broadcast
                </span>
                <span className="text-[11px] text-zinc-400 font-mono-num">
                  Auto-send when confidence ≥ {minConfidence}%
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoBroadcast}
                onChange={(e) => setAutoBroadcast(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-zinc-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono-num">
                <span className="text-zinc-300">Min Confidence Filter</span>
                <span className="text-amber-400 font-bold">{minConfidence}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsTelegramModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono-num transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:brightness-110 text-black font-bold text-xs font-mono-num flex items-center gap-2 transition cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isSaved ? 'Settings Saved!' : 'Save & Enable Integration'}</span>
            </button>
          </div>
        </form>

        {/* Telegram Dispatch Activity Log */}
        {telegramSettings.history.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="text-xs font-mono-num text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recent Dispatched Signals</span>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {telegramSettings.history.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-neutral-900/60 border border-zinc-800 text-xs font-mono-num flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">{log.signalSymbol}</span>
                    <span className="text-amber-300 font-semibold">({log.signalType})</span>
                    <span className="text-zinc-500 text-[10px]">{log.timestamp}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
