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
  Copy,
  Wifi,
  WifiOff,
  BellRing,
  AlertCircle,
  TrendingUp,
  XCircle,
  AlertTriangle,
  Power,
  Zap
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

  const [botToken, setBotToken] = useState(telegramSettings.botToken || '');
  const [chatId, setChatId] = useState(telegramSettings.chatId || '');
  const [channelTag, setChannelTag] = useState(telegramSettings.channelTag || '@aurum_ai_signals');
  const [enabled, setEnabled] = useState(telegramSettings.enabled);
  const [isConnected, setIsConnected] = useState(telegramSettings.isConnected);
  
  const [isSaved, setIsSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);
  const [copiedUpdateSample, setCopiedUpdateSample] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  if (!isTelegramModalOpen) return null;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenClean = botToken.trim();
    const chatClean = chatId.trim() || channelTag.trim();
    
    const nextConnected = tokenClean.length > 0 && chatClean.length > 0;
    
    updateTelegramSettings({
      botToken: tokenClean,
      chatId: chatClean,
      channelTag: chatClean.startsWith('@') ? chatClean : `@${chatClean}`,
      isConnected: nextConnected,
      enabled: enabled
    });

    setIsConnected(nextConnected);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 1500);
  };

  const handleToggleEnabled = () => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    updateTelegramSettings({ enabled: nextEnabled });
  };

  const handleTestBroadcast = async () => {
    setTestSent(true);
    setTestStatus(null);
    const goldSignal = signals.find(s => s.marketId === 'xau-usd') || signals[0];
    const res = await sendSignalToTelegram(goldSignal.id, 'NEW_SIGNAL', true);
    
    if (res.success) {
      setTestStatus('Test Signal Dispatched Successfully!');
    } else {
      setTestStatus(`Error: ${res.message}`);
    }
    setTimeout(() => {
      setTestSent(false);
      setTestStatus(null);
    }, 3000);
  };

  const handleTriggerAdvancedAlert = async (type: 'TP1_HIT' | 'SL_HIT' | 'CANCELLED') => {
    setTestSent(true);
    setTestStatus(null);
    const goldSignal = signals.find(s => s.marketId === 'xau-usd') || signals[0];
    const res = await sendSignalToTelegram(goldSignal.id, type, !enabled || !isConnected);
    
    if (res.success) {
      const label = type === 'TP1_HIT' ? 'TP1 Hit' : type === 'SL_HIT' ? 'SL Hit' : 'Cancelled';
      setTestStatus(`Advanced Alert [${label}] Dispatched Successfully!`);
    } else {
      setTestStatus(`Error: ${res.message}`);
    }
    setTimeout(() => {
      setTestSent(false);
      setTestStatus(null);
    }, 3000);
  };

  const sampleSignalMessage = `🟡 AURUM AI SIGNAL

Pair:
XAU/USD

Signal:
BUY

Entry:
$2,638.00 - $2,644.00

Stop Loss:
$2,624.00

Take Profit:
TP1: $2,685.00
TP2: $2,710.00

Timeframe:
H1

Confidence:
92%

Setup Grade:
A+`;

  const sampleUpdateMessage = `AURUM AI UPDATE

Pair:
XAU/USD

Status:
TP1 HIT / SL HIT / CANCELLED`;

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleSignalMessage);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleCopyUpdateSample = () => {
    navigator.clipboard.writeText(sampleUpdateMessage);
    setCopiedUpdateSample(true);
    setTimeout(() => setCopiedUpdateSample(false), 2000);
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
        <div className="border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono-num text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4 text-amber-400" />
            <span>XAU/USD SIGNAL GATEWAY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-syne">
            AURUM Telegram Terminal
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Configure automated professional notifications only for Gold XAU/USD trading signals.
          </p>
        </div>

        {/* Live Channel Status Banner */}
        <div className="p-4 rounded-xl bg-neutral-900/90 border border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${isConnected ? 'bg-emerald-500/20' : 'bg-zinc-800'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono-num font-bold text-white block">
                  Status: {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase font-mono-num">
                  {enabled ? 'Alerts Active' : 'Alerts Paused'}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono-num block mt-0.5">
                {isConnected 
                  ? `Active Broadcast Channel: ${chatId || channelTag}` 
                  : 'Specify Bot Token and Chat ID to connect'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Guide */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-2.5 py-1.5 rounded-lg font-mono-num text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition cursor-pointer flex items-center gap-1"
            >
              <span>{showGuide ? 'Hide Guide' : 'Show Setup Guide'}</span>
            </button>

            {/* Enable/Disable Toggle */}
            <button
              onClick={handleToggleEnabled}
              className={`px-3.5 py-1.5 rounded-lg font-mono-num font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                enabled 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{enabled ? 'Alerts Enabled' : 'Alerts Disabled'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Step-by-Step Setup Guide */}
        {showGuide && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono-num uppercase tracking-wide">
              <AlertCircle className="w-4 h-4" />
              <span>Telegram Bot Setup Guide (اردو گائیڈ)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-300 leading-relaxed">
              <div className="space-y-2 border-r border-zinc-800/80 pr-2">
                <span className="font-bold text-amber-300 block">📢 Method A: Send to Channel / Group</span>
                <p className="text-[11px]">
                  1. Apne Telegram channel/group ki settings mein jayein.<br />
                  2. <strong>@Aurumterminal_bot</strong> ko search kar k member add karein.<br />
                  3. Bot ko <strong>Administrator</strong> banayein aur &quot;Post Messages&quot; allow karein.<br />
                  4. Chat ID field mein channel ka tag likhein (e.g. <span className="text-amber-400 font-semibold">@AurumSignalsOfficial</span>).
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-amber-300 block">👤 Method B: Direct Inbox Notification</span>
                <p className="text-[11px]">
                  1. Telegram par <strong>@Aurumterminal_bot</strong> ko search karein.<br />
                  2. Bot chat open kar ke <strong>Start</strong> ya <strong>/start</strong> click karein (taake bot active ho sake).<br />
                  3. Ab Telegram par <strong>@userinfobot</strong> ya <strong>@RawDataBot</strong> search kar ke message send karein. Wo aap ko aap ki <strong>Numeric Chat ID</strong> (e.g. <span className="text-amber-400 font-semibold">153728492</span>) de ga.<br />
                  4. Website par Chat ID ke khane mein ye number enter karein.
                </p>
              </div>
            </div>

            <div className="bg-neutral-900/50 p-2.5 rounded-lg border border-zinc-800 text-[11px] text-zinc-400">
              ⚠️ <strong>Critical Rule:</strong> Bot apna khud ka message receive ya send nahi kar sakta, isliye Chat ID mein kabhi bhi bot ka username (<span className="text-rose-400">@Aurumterminal_bot</span>) mat enter karein!
            </div>
          </div>
        )}

        {/* Telegram Configuration Form */}
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono-num text-zinc-300 block mb-1 font-semibold">
                Telegram Bot Token
              </label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="e.g. 7481902456:AAHzD8..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-zinc-800 text-white text-xs font-mono-num focus:border-amber-400 focus:outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-xs font-mono-num text-zinc-300 block mb-1 font-semibold">
                Telegram Chat ID / Channel ID
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. @aurum_ai_signals or -100123456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-zinc-800 text-white text-xs font-mono-num focus:border-amber-400 focus:outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-500 font-mono-num block">
              💡 Ensure your Telegram Bot is added as an administrator to your channel/group.
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:brightness-110 text-black font-bold text-xs font-mono-num flex items-center gap-2 transition cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-black" /> : <ShieldCheck className="w-4 h-4 text-black" />}
              <span>{isSaved ? 'Connected!' : 'Connect Bot'}</span>
            </button>
          </div>
        </form>

        {/* Advanced Tester Panel */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-num font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Professional Testing & Live Simulation</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono-num">
              Bypass filters for test wires
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={handleTestBroadcast}
              disabled={testSent}
              className="px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 text-[11px] font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono-num">Send Test Signal</span>
            </button>
            <button
              onClick={async () => {
                setTestSent(true);
                setTestStatus('Dispatching Phase X Live Signal to Telegram...');
                try {
                  const res = await fetch('/api/phase-x/test-approved-signal-dispatch', { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    setTestStatus(`✓ Phase X Live Signal Delivered! (${data.setupId})`);
                  } else {
                    setTestStatus(`Error: ${data.error || 'Failed to dispatch Phase X signal'}`);
                  }
                } catch {
                  setTestStatus('Error: Failed to reach backend Phase X telegram engine');
                } finally {
                  setTimeout(() => {
                    setTestSent(false);
                  }, 4000);
                }
              }}
              disabled={testSent}
              className="px-2.5 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono-num">Phase X Live Test</span>
            </button>
            <button
              onClick={() => handleTriggerAdvancedAlert('TP1_HIT')}
              disabled={testSent}
              className="px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 text-[11px] font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono-num">Simulate TP Hit</span>
            </button>
            <button
              onClick={() => handleTriggerAdvancedAlert('SL_HIT')}
              disabled={testSent}
              className="px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 text-[11px] font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-mono-num">Simulate SL Hit</span>
            </button>
          </div>

          {testStatus && (
            <div className={`p-2.5 rounded-lg text-xs font-mono-num border ${
              testStatus.startsWith('Error') 
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            }`}>
              {testStatus}
            </div>
          )}
        </div>

        {/* Message Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Signal Template Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>🟡 Signal Message Format</span>
              </span>
              <button
                onClick={handleCopySample}
                className="text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer transition"
              >
                {copiedSample ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSample ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-neutral-900/90 border border-zinc-800 text-[10px] font-mono-num text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
              {sampleSignalMessage}
            </pre>
          </div>

          {/* Update Template Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono-num text-zinc-400">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5" />
                <span>📢 Update Message Format</span>
              </span>
              <button
                onClick={handleCopyUpdateSample}
                className="text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer transition"
              >
                {copiedUpdateSample ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUpdateSample ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-neutral-900/90 border border-zinc-800 text-[10px] font-mono-num text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
              {sampleUpdateMessage}
            </pre>
          </div>
        </div>

        {/* Telegram Dispatch Activity Log */}
        {telegramSettings.history.length > 0 && (
          <div className="space-y-2 border-t border-zinc-800 pt-4">
            <div className="text-xs font-mono-num text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recent Dispatched Signals & Updates</span>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {telegramSettings.history.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-neutral-900/60 border border-zinc-800 text-xs font-mono-num flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`w-2 h-2 rounded-full ${log.messagePreview.includes('UPDATE') ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="font-bold text-white whitespace-nowrap">{log.signalSymbol}</span>
                    <span className="text-zinc-500 text-[10px] whitespace-nowrap">{log.timestamp}</span>
                    <span className="text-zinc-400 text-[10px] truncate max-w-xs block border-l border-zinc-800 pl-2">
                      {log.messagePreview.replace(/\n+/g, ' ')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0">
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
