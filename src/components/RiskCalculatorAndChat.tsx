import React, { useState } from 'react';
import { 
  Calculator, 
  Bot, 
  Sparkles, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const RiskCalculatorAndChat: React.FC = () => {
  const { 
    selectedSignal, 
    selectedMarket,
    signals,
    setSelectedSignalId
  } = useMarket();

  // Position Sizing State
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [customSlPrice, setCustomSlPrice] = useState<number>(selectedSignal.stopLoss);
  const [customEntryPrice, setCustomEntryPrice] = useState<number>(selectedSignal.entryPrice);

  // Sync entry and sl with active signal
  React.useEffect(() => {
    setCustomEntryPrice(selectedSignal.entryPrice);
    setCustomSlPrice(selectedSignal.stopLoss);
  }, [selectedSignal]);

  // Calculations
  const riskAmount = (accountBalance * riskPercent) / 100;
  const slDistance = Math.abs(customEntryPrice - customSlPrice);
  const isZeroDistance = slDistance <= 0;

  // Approximate lot sizing:
  // For Gold: 1 lot = 100 oz ($1 move = $100 per lot)
  // For Silver: 1 lot = 5000 oz ($1 move = $5000 per lot)
  // For Indices: $1 move = $20 per point standard contract
  // For Crude Oil: 1 lot = 1000 barrels ($1 move = $1000 per lot)
  let contractMultiplier = 100;
  if (selectedSignal.marketId === 'xag-usd') contractMultiplier = 5000;
  if (selectedSignal.marketId === 'nasdaq-100' || selectedSignal.marketId === 'sp-500') contractMultiplier = 20;
  if (selectedSignal.marketId === 'crude-oil') contractMultiplier = 1000;

  const lotSize = !isZeroDistance 
    ? +(riskAmount / (slDistance * contractMultiplier)).toFixed(2)
    : 0;

  const potentialProfit1 = !isZeroDistance 
    ? Math.abs(selectedSignal.takeProfit - customEntryPrice) * contractMultiplier * lotSize
    : 0;

  // AI Assistant Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      sender: 'assistant',
      text: `Hello! I am the Aurum AI Trade Assistant. I'm currently tracking high-probability Smart Money setups for ${selectedSignal.symbol}, Silver, NASDAQ 100, S&P 500, and Oil. Ask me anything about entry zones, invalidation, or order blocks.`,
      time: 'Just now'
    }
  ]);

  const quickPrompts = [
    `Should I enter ${selectedSignal.symbol} now?`,
    `Explain the SMC setup on ${selectedSignal.symbol}`,
    `Where is the invalidation stop loss?`,
    `What is the risk-to-reward ratio?`
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: query, time };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('enter') || q.includes('buy') || q.includes('sell') || q.includes('now')) {
        reply = `For **${selectedSignal.symbol}**, the AI signal is **${selectedSignal.type}**. Optimal execution zone is between **$${selectedSignal.entryZone.min.toLocaleString()} and $${selectedSignal.entryZone.max.toLocaleString()}** (Optimal fill: $${selectedSignal.entryPrice.toLocaleString()}). Current live price is $${selectedMarket.price.toLocaleString()}. ${selectedSignal.radar.entryTiming}.`;
      } else if (q.includes('smc') || q.includes('order block') || q.includes('structure') || q.includes('liquidity')) {
        reply = `**SMC Analysis for ${selectedSignal.symbol}**:\n• **Structure**: ${selectedSignal.smc.structure}\n• **Order Block**: ${selectedSignal.smc.bullishOrderBlock.label}\n• **Liquidity Status**: ${selectedSignal.smc.liquiditySweep.occurred ? selectedSignal.smc.liquiditySweep.description : 'Liquidity pools active at BSL & SSL.'}\n• **Multi-Timeframe**: ${selectedSignal.multiTimeframe.verdict}.`;
      } else if (q.includes('stop loss') || q.includes('sl') || q.includes('invalidation') || q.includes('risk')) {
        reply = `**Risk & Invalidation for ${selectedSignal.symbol}**:\nStop Loss is locked at **$${selectedSignal.stopLoss.toLocaleString()}**. Invalidation Trigger: ${selectedSignal.bullishBearishReasoning.invalidationTrigger}. Recommended risk is 1.0%–1.5% of account balance.`;
      } else if (q.includes('tp') || q.includes('target') || q.includes('profit') || q.includes('reward')) {
        reply = `**Targets for ${selectedSignal.symbol}**:\n• **TP1**: $${selectedSignal.takeProfit.toLocaleString()}\n• **TP2**: $${selectedSignal.takeProfit2.toLocaleString()}\n• **Risk/Reward**: ${selectedSignal.riskReward} asymmetry with ${selectedSignal.confidenceScore}% AI model confidence.`;
      } else {
        reply = `**${selectedSignal.symbol} Intelligence**: ${selectedSignal.marketReason} Macro factors and institutional Smart Money order flow indicate high probability continuation toward $${selectedSignal.takeProfit.toLocaleString()}.`;
      }

      setMessages(prev => [...prev, { sender: 'assistant', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsThinking(false);
    }, 700);
  };

  return (
    <section id="risk-assistant-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-num text-amber-400 font-semibold tracking-wider uppercase mb-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL RISK & ASSISTANT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-syne tracking-tight">
            Risk Management & AI Trade Assistant
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Calculate exact lot sizing and risk parameters, or consult the interactive AI neural assistant.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Card: Position Size & Risk Management Calculator */}
        <div className="rounded-2xl bg-glass-card border border-amber-500/25 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white font-syne">
                Position Size Calculator
              </h3>
            </div>
            <span className="text-xs font-mono-num px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-300">
              {selectedSignal.symbol}
            </span>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-num">
            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Account Balance ($)</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(Math.max(100, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Risk Percentage (%)</label>
              <div className="relative">
                <Percent className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Math.max(0.1, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Entry Price ($)</label>
              <input
                type="number"
                step="any"
                value={customEntryPrice}
                onChange={(e) => setCustomEntryPrice(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Stop Loss Price ($)</label>
              <input
                type="number"
                step="any"
                value={customSlPrice}
                onChange={(e) => setCustomSlPrice(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none font-bold"
              />
            </div>
          </div>

          {/* Sizing Output Grid */}
          <div className="p-4 rounded-xl bg-neutral-950/90 border border-amber-500/30 space-y-3">
            <div className="text-xs font-mono-num font-bold text-amber-300 uppercase tracking-wider">
              Optimal Risk Execution Output
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono-num">
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">Max Risk ($)</span>
                <span className="text-rose-400 font-bold text-sm">${riskAmount.toFixed(2)}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block">SL Distance</span>
                <span className="text-zinc-200 font-bold text-sm">${slDistance.toFixed(2)}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/35">
                <span className="text-amber-400 text-[10px] font-bold block">Recommended Lots</span>
                <span className="text-amber-300 font-bold text-base">{lotSize} Lots</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs font-mono-num text-zinc-400">
              <span>Potential Gain @ TP1:</span>
              <span className="text-emerald-400 font-bold">+${potentialProfit1.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Card: AI Trade Assistant Chat */}
        <div className="rounded-2xl bg-glass-card border border-amber-500/25 p-6 sm:p-8 space-y-4 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white font-syne">
                  Aurum AI Assistant
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-mono-num text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Ready
              </span>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 pt-3">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-300 text-[11px] font-mono-num transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chat Log Stream */}
            <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs ${
                    m.sender === 'assistant'
                      ? 'bg-neutral-950/80 border border-zinc-800 text-zinc-200'
                      : 'bg-amber-500/15 border border-amber-500/30 text-amber-100 ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] font-mono-num text-zinc-500">
                    <span className="font-semibold text-amber-400">
                      {m.sender === 'assistant' ? '🤖 AURUM NEURAL ENGINE' : '👤 TRADER'}
                    </span>
                    <span>{m.time}</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed font-light">{m.text}</p>
                </div>
              ))}

              {isThinking && (
                <div className="p-3 rounded-xl bg-neutral-950/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 font-mono-num">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>Synthesizing multi-timeframe SMC order book...</span>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-3 border-t border-zinc-800"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Ask about ${selectedSignal.symbol}, SMC levels, or risk...`}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none font-mono-num placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isThinking}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-bold text-xs font-mono-num flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
