import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Globe, 
  Lock, 
  Cpu, 
  Layers, 
  BarChart3, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Terminal, 
  Sliders, 
  Eye, 
  LineChart, 
  Calendar, 
  Check, 
  Menu, 
  X,
  Radio,
  ChevronRight,
  Shield,
  Search,
  BellRing
} from 'lucide-react';
import { MarketItem } from '../types';

interface InstitutionalLandingPageProps {
  onAccessTerminal: () => void;
  onOpenLogin: () => void;
  markets: MarketItem[];
}

export const InstitutionalLandingPage: React.FC<InstitutionalLandingPageProps> = ({
  onAccessTerminal,
  onOpenLogin,
  markets
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTimeUtc, setCurrentTimeUtc] = useState<string>('');
  const [activeMarketTab, setActiveMarketTab] = useState<'ALL' | 'PRECIOUS' | 'FOREX' | 'INDICES'>('ALL');

  // Real-time clock for UTC institutional feel
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeUtc(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered markets for the real-time monitoring section
  const monitoredMarkets = [
    {
      symbol: 'XAU/USD',
      name: 'Gold Spot / US Dollar',
      price: '$4,283.50',
      change: '+0.45%',
      isPositive: true,
      bias: 'Bullish',
      volatility: 'Medium',
      session: 'London',
      category: 'PRECIOUS'
    },
    {
      symbol: 'XAG/USD',
      name: 'Silver Spot / US Dollar',
      price: '$34.12',
      change: '+1.12%',
      isPositive: true,
      bias: 'Consolidating',
      volatility: 'Medium',
      session: 'London / NY',
      category: 'PRECIOUS'
    },
    {
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar',
      price: '1.0845',
      change: '-0.18%',
      isPositive: false,
      bias: 'Rangebound',
      volatility: 'Low',
      session: 'London',
      category: 'FOREX'
    },
    {
      symbol: 'S&P 500',
      name: 'E-mini S&P 500 Index',
      price: '5,892.40',
      change: '+0.62%',
      isPositive: true,
      bias: 'Bullish Expansion',
      volatility: 'Normal',
      session: 'Pre-Market NY',
      category: 'INDICES'
    },
    {
      symbol: 'NASDAQ 100',
      name: 'US Tech 100 Cash Index',
      price: '20,410.80',
      change: '+0.88%',
      isPositive: true,
      bias: 'Bullish Momentum',
      volatility: 'Elevated',
      session: 'Pre-Market NY',
      category: 'INDICES'
    }
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100 selection:bg-amber-500/20 selection:text-amber-200 font-sans relative overflow-x-hidden">
      
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-[120px] rounded-full opacity-60" />
        <div className="absolute top-[35%] right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-600/5 via-sky-500/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-100px] w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/5 to-transparent blur-[150px] rounded-full" />
        {/* Subtle grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Institutional Top Ticker Bar */}
      <div className="relative z-50 bg-[#07080c]/90 border-b border-zinc-800/80 px-4 py-1.5 text-[11px] font-mono-num flex items-center justify-between text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM OPERATIONAL
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-300">
            INTELLIGENCE DESK: <strong className="text-amber-300/90 font-normal">INSTITUTIONAL GRADE</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-zinc-400">
            MARKET DATA SYNC: <span className="text-zinc-200">REAL-TIME BIQUOTE</span>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-amber-400 font-semibold">{currentTimeUtc || 'SYNCING UTC...'}</span>
        </div>
      </div>

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#07090f]/80 backdrop-blur-xl border-b border-zinc-800/90 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#090b11] rounded-[10px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-cinzel font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 block">
                AURUM TERMINAL
              </span>
              <span className="text-[9.5px] font-mono uppercase tracking-widest text-zinc-400 block -mt-0.5">
                Market Intelligence Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-300">
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:text-amber-400 transition cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('market-intelligence')} 
              className="hover:text-amber-400 transition cursor-pointer"
            >
              Market Intelligence
            </button>
            <button 
              onClick={() => scrollToSection('news-intelligence')} 
              className="hover:text-amber-400 transition cursor-pointer"
            >
              News Intelligence
            </button>
            <button 
              onClick={() => scrollToSection('risk-system')} 
              className="hover:text-amber-400 transition cursor-pointer"
            >
              Risk System
            </button>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3.5">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 border border-zinc-700 hover:border-zinc-500 transition cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={onAccessTerminal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 shadow-md shadow-amber-500/25 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>ACCESS TERMINAL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu hamburger toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 border border-amber-500/40 bg-amber-500/10"
            >
              Login
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0d16] border-b border-zinc-800 px-5 py-4 space-y-3">
            <button 
              onClick={() => scrollToSection('features')} 
              className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('market-intelligence')} 
              className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
            >
              Market Intelligence
            </button>
            <button 
              onClick={() => scrollToSection('news-intelligence')} 
              className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
            >
              News Intelligence
            </button>
            <button 
              onClick={() => scrollToSection('risk-system')} 
              className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
            >
              Risk System
            </button>
            <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
              <button
                onClick={onOpenLogin}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-zinc-200 bg-zinc-900 border border-zinc-700"
              >
                LOGIN TO PORTAL
              </button>
              <button
                onClick={onAccessTerminal}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/20"
              >
                ACCESS LIVE TERMINAL
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 1. MAIN HERO SECTION */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono tracking-wide shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>INSTITUTIONAL MARKET INTELLIGENCE</span>
          </div>
        </div>

        {/* Hero Headings */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-cinzel font-black tracking-tight leading-tight">
            <span className="block text-zinc-100">AURUM TERMINAL</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
              AI-Powered Market Intelligence Platform
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-zinc-400 font-sans max-w-3xl mx-auto leading-relaxed pt-2">
            A next-generation market intelligence system combining real-time market monitoring, 
            intelligent analysis, economic awareness, and advanced risk intelligence in one professional terminal.
          </p>

          {/* Primary CTA + Secondary Text */}
          <div className="pt-6 flex flex-col items-center gap-3">
            <button
              onClick={onAccessTerminal}
              className="px-8 py-4 rounded-xl text-sm sm:text-base font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition duration-200 cursor-pointer flex items-center gap-2 group"
            >
              <span>ACCESS LIVE TERMINAL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono tracking-wide">
              Real-Time Market Intelligence • AI Analysis • Risk Monitoring
            </p>
          </div>
        </div>

        {/* Hero Interactive Animated Market Dashboard Preview */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl p-1 bg-gradient-to-b from-amber-500/30 via-zinc-800/50 to-zinc-900/30 shadow-2xl">
            <div className="bg-[#0b0e17]/95 rounded-[15px] p-5 sm:p-7 border border-zinc-800/90 backdrop-blur-2xl">
              
              {/* Terminal Frame Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-800/90 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-zinc-500 font-medium ml-2">
                    WORKSPACE // PREVIEW_FEED
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono-num">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE MARKET MONITOR 🟢
                  </span>
                  <span className="text-zinc-500 hidden sm:inline">•</span>
                  <span className="text-zinc-400 text-[11px] hidden sm:inline">
                    Demo Monitoring Visualization
                  </span>
                </div>
              </div>

              {/* Main Featured Market: XAU/USD */}
              <div className="mt-5 p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#121626] to-[#0c0f1c] border border-amber-500/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-black font-cinzel text-amber-300">
                        XAU/USD
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Gold Spot
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans">
                      Global Benchmark Bullion • Institutional Liquidity Desk
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono-num text-xs">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Live Price</span>
                      <span className="text-base font-bold text-amber-400 block mt-0.5">$4,283.50</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">24H Change</span>
                      <span className="text-base font-bold text-emerald-400 block mt-0.5">+0.45%</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Market Bias</span>
                      <span className="text-sm font-semibold text-zinc-200 block mt-0.5">Bullish</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Volatility</span>
                      <span className="text-sm font-semibold text-amber-300 block mt-0.5">Medium</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-zinc-500 uppercase block">Session</span>
                      <span className="text-sm font-semibold text-sky-400 block mt-0.5">London</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Market Cards (XAG/USD, EUR/USD, S&P 500, NASDAQ 100) */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono-num">
                {monitoredMarkets.slice(1).map((m) => (
                  <div 
                    key={m.symbol}
                    className="p-4 rounded-xl bg-[#0e111d] border border-zinc-800/80 hover:border-amber-500/30 transition group"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                      <span className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition">
                        {m.symbol}
                      </span>
                      <span className={`text-xs font-semibold ${m.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {m.change}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 text-[10.5px]">Live Price:</span>
                        <span className="font-bold text-zinc-200">{m.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 text-[10.5px]">Market Status:</span>
                        <span className="text-amber-300/90 text-[11px] font-semibold">{m.bias}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verification disclaimer banner */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Observational Market Monitoring • No Execution Signals Displayed on Public Portal
                </span>
                <span className="text-zinc-400">
                  Latency: ~12ms to Institutional Liquidity Hubs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION 2: MULTI-AGENT INTELLIGENCE SYSTEM */}
      <section id="features" className="py-20 bg-gradient-to-b from-[#050608] via-[#090c15] to-[#050608] border-y border-zinc-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>COLLECTIVE REASONING ENGINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-black tracking-tight text-white">
              MULTI-AGENT INTELLIGENCE SYSTEM
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              AURUM TERMINAL uses multiple intelligent analysis agents working together to understand 
              market conditions, monitor risks, and provide structured market insights.
            </p>
          </div>

          {/* 4 Multi-Agent Intelligence Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. MARKET INTELLIGENCE */}
            <div className="p-6 rounded-2xl bg-[#0c0f1b]/80 border border-zinc-800 hover:border-amber-500/40 transition duration-300 shadow-lg relative group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-300 transition">
                MARKET INTELLIGENCE
              </h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Autonomous real-time tracking of underlying price geometry and institutional structural shifts.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Price action monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Market structure analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Trend evaluation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Market condition tracking</span>
                </li>
              </ul>
            </div>

            {/* 2. NEWS INTELLIGENCE */}
            <div className="p-6 rounded-2xl bg-[#0c0f1b]/80 border border-zinc-800 hover:border-amber-500/40 transition duration-300 shadow-lg relative group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-300 transition">
                NEWS INTELLIGENCE
              </h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Systematic macro analysis evaluating economic calendar releases and global catalyst velocity.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Economic event monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Global market updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Macro risk awareness</span>
                </li>
              </ul>
            </div>

            {/* 3. RISK INTELLIGENCE */}
            <div className="p-6 rounded-2xl bg-[#0c0f1b]/80 border border-zinc-800 hover:border-amber-500/40 transition duration-300 shadow-lg relative group">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-300 transition">
                RISK INTELLIGENCE
              </h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Deterministic safeguards auditing liquidity depth, spread anomalies, and volatility spikes.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Volatility monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Risk condition analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Market safety checks</span>
                </li>
              </ul>
            </div>

            {/* 4. STRATEGY INTELLIGENCE */}
            <div className="p-6 rounded-2xl bg-[#0c0f1b]/80 border border-zinc-800 hover:border-amber-500/40 transition duration-300 shadow-lg relative group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-300 transition">
                STRATEGY INTELLIGENCE
              </h3>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Longitudinal performance logging evaluating regime suitability across multiple time horizons.
              </p>
              <ul className="space-y-2 text-xs text-zinc-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Historical market analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Performance tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Market behaviour evaluation</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SECTION 3: REAL-TIME MARKET MONITORING */}
      <section id="market-intelligence" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>CONTINUOUS DATA COVERAGE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-black tracking-tight text-white">
              REAL-TIME MARKET MONITORING
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mt-1">
              Global markets monitored continuously with millisecond WebSocket tick ingestion:
            </p>
          </div>

          {/* Quick asset pill indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            {['Gold', 'Silver', 'Forex', 'Major Indices'].map((cat) => (
              <span key={cat} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Real-time Market Table Grid */}
        <div className="rounded-2xl bg-[#0b0e17] border border-zinc-800 shadow-xl overflow-hidden font-mono-num">
          <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200">INSTITUTIONAL LIQUIDITY MONITORED ASSETS</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ALL FEEDS ACTIVE
            </span>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {monitoredMarkets.map((asset) => (
              <div 
                key={asset.symbol}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/30 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                    {asset.symbol.split('/')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{asset.symbol}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-sans">
                        {asset.category}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-sans block">{asset.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">Live Price</span>
                    <span className="font-bold text-white text-sm">{asset.price}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">24h Change</span>
                    <span className={`font-bold ${asset.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.change}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">Market Trend</span>
                    <span className="text-amber-300 font-medium">{asset.bias}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">Session / Volatility</span>
                    <span className="text-zinc-300">{asset.session} ({asset.volatility})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-neutral-950 text-center border-t border-zinc-800/80 text-[11px] text-zinc-500 font-sans">
            Continuous price updates, volatility metrics, and trading session state tracking for institutional reference.
          </div>
        </div>
      </section>

      {/* 4. SECTION 4: ECONOMIC INTELLIGENCE */}
      <section id="news-intelligence" className="py-20 bg-gradient-to-b from-[#050608] via-[#080b14] to-[#050608] border-y border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>MACRO CATALYST RADAR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-black tracking-tight text-white">
              ECONOMIC INTELLIGENCE
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Real-time monitoring of major macroeconomic releases and central bank announcements. 
              Pure objective schedule awareness without speculative forecasts.
            </p>
          </div>

          {/* Professional News Monitoring Card */}
          <div className="max-w-3xl mx-auto">
            <div className="p-1 rounded-2xl bg-gradient-to-r from-amber-500/30 via-rose-500/20 to-sky-500/30 shadow-2xl">
              <div className="p-6 sm:p-8 rounded-[15px] bg-[#0b0e17] border border-zinc-800 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                        SCHEDULED MACRO RELEASE
                      </span>
                      <h3 className="text-lg font-bold text-white font-cinzel">
                        UPCOMING MARKET EVENT
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 self-start sm:self-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    Impact: HIGH 🔴
                  </span>
                </div>

                {/* Event Name & Core Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-num">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">Event Name</span>
                    <span className="text-base font-bold text-amber-300 block mt-1">US CPI</span>
                    <span className="text-[10.5px] text-zinc-400 block mt-0.5">Consumer Price Index YoY</span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">Currency</span>
                    <span className="text-base font-bold text-sky-400 block mt-1">USD</span>
                    <span className="text-[10.5px] text-zinc-400 block mt-0.5">United States Dollar</span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">Monitoring Status</span>
                    <span className="text-base font-bold text-emerald-400 block mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      ACTIVE
                    </span>
                    <span className="text-[10.5px] text-zinc-400 block mt-0.5">Continuous Catalyst Ingestion</span>
                  </div>
                </div>

                {/* Market Areas Impacted */}
                <div className="p-4 rounded-xl bg-[#07090f] border border-zinc-800 space-y-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Market Areas Monitored:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                      Gold
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 font-medium">
                      Currency Markets
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium">
                      Indices
                    </span>
                  </div>
                </div>

                {/* Neutrality Note */}
                <div className="text-[11px] text-zinc-500 font-mono text-center pt-2">
                  Strict Institutional Neutrality: Real-time calendar alerts strictly track factual release timestamps. No trading predictions or speculative outcome forecasts are displayed.
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. SECTION 5: SMART RISK AWARENESS */}
      <section id="risk-system" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>SAFETY GOVERNANCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-black tracking-tight text-white leading-tight">
              SMART RISK AWARENESS
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Institutional operations demand rigorous capital preservation. AURUM TERMINAL operates 
              with continuous environmental risk guards, shielding decision-makers from abnormal market friction.
            </p>
            <div className="pt-2">
              <button
                onClick={onAccessTerminal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-2"
              >
                <span>EXPLORE RISK CONTROLS</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0b0e17] border border-amber-500/30 shadow-2xl space-y-4">
              <div className="pb-3 border-b border-zinc-800 text-xs font-mono text-amber-400 uppercase font-semibold">
                AURUM TERMINAL CONTINUOUSLY MONITORS:
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Market volatility',
                    desc: 'Real-time ATR and implied range audits to detect regime expansions.'
                  },
                  {
                    title: 'Economic events',
                    desc: 'High-impact macro event buffers and publication schedule tracking.'
                  },
                  {
                    title: 'Liquidity conditions',
                    desc: 'Spread widening and institutional order book depth anomalies.'
                  },
                  {
                    title: 'Market environment',
                    desc: 'Cross-asset correlation drift and risk-off capital migration.'
                  },
                  {
                    title: 'Data quality',
                    desc: 'Direct WebSocket feed validation and tick integrity verification.'
                  }
                ].map((item) => (
                  <div 
                    key={item.title}
                    className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3 hover:border-zinc-700 transition"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 font-bold" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. SECTION 6: PROFESSIONAL TERMINAL FEATURES */}
      <section className="py-20 bg-gradient-to-b from-[#050608] via-[#090c16] to-[#050608] border-t border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
              <Layers className="w-3.5 h-3.5" />
              <span>TERMINAL ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-black tracking-tight text-white">
              PROFESSIONAL TERMINAL FEATURES
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Designed specifically for institutional quantitative desks, private funds, and active market professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'Real-Time Market Dashboard',
                desc: 'Consolidated view of precious metals, foreign exchange, and benchmark equity index quotes.',
                icon: Activity,
                color: 'text-amber-400',
                border: 'border-amber-500/30'
              },
              {
                title: 'AI Market Analysis',
                desc: 'Multi-agent contextual evaluation providing structured institutional price action intelligence.',
                icon: Cpu,
                color: 'text-sky-400',
                border: 'border-sky-500/30'
              },
              {
                title: 'Economic Intelligence',
                desc: 'Continuous calendar synchronization with high-impact volatility awareness buffers.',
                icon: Calendar,
                color: 'text-rose-400',
                border: 'border-rose-500/30'
              },
              {
                title: 'Risk Monitoring',
                desc: 'Comprehensive volatility grading, spread anomaly detection, and capital protection safeguards.',
                icon: ShieldCheck,
                color: 'text-emerald-400',
                border: 'border-emerald-500/30'
              },
              {
                title: 'Historical Performance Tracking',
                desc: 'Audited simulation paper trade ledger and historical regime accuracy evaluations.',
                icon: LineChart,
                color: 'text-purple-400',
                border: 'border-purple-500/30'
              },
              {
                title: 'Secure User Access',
                desc: 'Role-based credentials, institutional tier management, and encrypted API connectivity.',
                icon: Lock,
                color: 'text-amber-400',
                border: 'border-amber-500/30'
              }
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div 
                  key={f.title}
                  className="p-6 rounded-2xl bg-[#0c0f1b] border border-zinc-800 hover:border-amber-500/40 transition duration-300 shadow-lg relative group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl bg-zinc-900 border ${f.border} ${f.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      READY
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-300 transition">
                    ✓ {f.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. SECTION 7: SECURE LOGIN CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#111524] to-[#0a0d18] border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-6">
            
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-cinzel font-black tracking-tight text-white">
                ENTER AURUM TERMINAL
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto font-sans leading-relaxed">
                Access your personalized AI market intelligence workspace through secure authentication.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm sm:text-base font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 shadow-xl shadow-amber-500/30 transition cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>LOGIN TO LIVE TERMINAL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onAccessTerminal}
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-900/90 border border-zinc-700 hover:border-zinc-500 transition cursor-pointer"
              >
                Enter as Institutional Guest
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-zinc-500 border-t border-zinc-800/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                256-Bit Encrypted
              </span>
              <span>•</span>
              <span>Zero Knowledge Access Keys</span>
              <span>•</span>
              <span>Institutional SLA 99.9%</span>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#030406] border-t border-zinc-800/90 py-12 relative z-10 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <span className="font-cinzel font-bold text-sm text-zinc-200 tracking-wider">
                  AURUM TERMINAL
                </span>
                <p className="text-[11px] text-zinc-500">
                  AI-powered market intelligence and analysis platform.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-zinc-400">
              <button onClick={() => scrollToSection('features')} className="hover:text-amber-400 transition cursor-pointer">
                Features
              </button>
              <button onClick={() => scrollToSection('market-intelligence')} className="hover:text-amber-400 transition cursor-pointer">
                Market Intelligence
              </button>
              <button onClick={() => scrollToSection('news-intelligence')} className="hover:text-amber-400 transition cursor-pointer">
                News Intelligence
              </button>
              <button onClick={() => scrollToSection('risk-system')} className="hover:text-amber-400 transition cursor-pointer">
                Risk System
              </button>
              <button onClick={onOpenLogin} className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer">
                Login
              </button>
            </div>
          </div>

          {/* Legal / Regulatory Disclaimer */}
          <div className="space-y-2 text-zinc-500 text-[11px] leading-relaxed">
            <p className="font-semibold text-zinc-400">Disclaimer:</p>
            <p>
              AURUM TERMINAL provides market analysis and intelligence tools. It does not guarantee trading results or market outcomes. 
              All data and observational insights presented are intended exclusively for professional market research and intelligence purposes. 
              Financial trading involves substantial risk of loss and is not suitable for every investor. Past market behavior does not indicate future results.
            </p>
            <p className="pt-2 text-zinc-600">
              © {new Date().getFullYear()} AURUM TERMINAL. All rights reserved. Built with advanced multi-agent market intelligence.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};
