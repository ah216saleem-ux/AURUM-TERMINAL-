import React, { useState, useEffect, useMemo } from 'react';
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
  LineChart, 
  Calendar, 
  Check, 
  Menu, 
  X, 
  Radio, 
  ChevronRight, 
  Shield, 
  BellRing, 
  Database, 
  Key, 
  UserCheck 
} from 'lucide-react';
import { MarketItem } from '../types';
import { AiCommandCenterHero } from './AiCommandCenterHero';
import { Persistent3DStoryCanvas } from './hero3d/Persistent3DStoryCanvas';
import { StorySection } from './hero3d/types';
import { AurumIntroLoader } from './landing/AurumIntroLoader';
import { GlowCard } from './landing/GlowCard';
import { MagneticButton } from './landing/MagneticButton';
import { RevealSection } from './landing/RevealSection';

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
  const [activeMarketTab, setActiveMarketTab] = useState<'ALL' | 'COMMODITIES' | 'FOREX' | 'INDICES'>('ALL');
  const [activeStorySection, setActiveStorySection] = useState<StorySection>('HERO');

  const isTextHeavy = 
    activeStorySection === 'AI_INTELLIGENCE' ||
    activeStorySection === 'WHY_AURUM' ||
    activeStorySection === 'LIVE_MARKETS' ||
    activeStorySection === 'RISK_INTELLIGENCE';

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

  // Dynamically mapped real connected market data from props - NO STATIC/DEMO PLACEHOLDERS
  const monitoredMarkets = useMemo(() => {
    if (!markets || markets.length === 0) return [];
    
    let filtered = markets;
    if (activeMarketTab !== 'ALL') {
      filtered = markets.filter(m => m.category.toUpperCase() === activeMarketTab);
    }

    return filtered.map(m => {
      const isForex = m.category === 'forex' || m.symbol.includes('EUR') || m.symbol.includes('GBP');
      const isPos = m.changePercent >= 0;
      
      let priceStr = '';
      if (isForex) {
        priceStr = m.price.toFixed(4);
      } else if (m.price >= 1000) {
        priceStr = '$' + m.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        priceStr = '$' + m.price.toFixed(2);
      }

      let bias = 'Consolidating';
      if (m.changePercent > 0.6) bias = 'Strong Bullish';
      else if (m.changePercent > 0.1) bias = 'Bullish Bias';
      else if (m.changePercent < -0.6) bias = 'Strong Bearish';
      else if (m.changePercent < -0.1) bias = 'Bearish Bias';

      let feedSource = 'LIVE MARKET DATA';

      return {
        id: m.id,
        symbol: m.symbol,
        name: m.name,
        price: priceStr,
        change: (isPos ? '+' : '') + m.changePercent.toFixed(2) + '%',
        isPositive: isPos,
        bias,
        volatility: Math.abs(m.changePercent) > 0.8 ? 'Elevated' : 'Normal',
        session: m.isOpen ? 'ACTIVE SESSION' : 'OFF-HOURS',
        category: m.category.toUpperCase(),
        feedSource
      };
    });
  }, [markets, activeMarketTab]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100 selection:bg-amber-500/20 selection:text-amber-200 font-sans relative overflow-x-hidden">
      
      {/* 0. CINEMATIC GOLD PARTICLE LOGO INTRO LOADER */}
      <AurumIntroLoader onComplete={() => {}} />

      {/* 1. PERSISTENT FIXED 3D SCROLL STORYTELLING CANVAS */}
      <Persistent3DStoryCanvas onSectionChange={setActiveStorySection} />

      {/* 2. DYNAMIC SCENE DIMMING OVERLAY FOR MAXIMUM TEXT READABILITY */}
      <div 
        className={`fixed inset-0 pointer-events-none z-[1] transition-all duration-700 ease-in-out ${
          isTextHeavy 
            ? 'bg-black/75 backdrop-blur-[1.5px]' 
            : 'bg-black/35'
        }`}
      />

      {/* 3. ANIMATED GRADIENT ACCENTS (GOLD INTO DEEP ROYAL PURPLE/INDIGO) */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
        {/* Top Gold Volumetric Flare */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-amber-500/10 via-purple-900/10 to-transparent blur-[140px] rounded-full opacity-70 animate-pulse-slow" />
        
        {/* Mid-Right Deep Royal Purple & Indigo Ambient Orb */}
        <div className="absolute top-[35%] right-[-120px] w-[650px] h-[650px] bg-gradient-to-br from-purple-900/15 via-indigo-950/20 to-transparent blur-[160px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }} />
        
        {/* Bottom-Left Gold & Obsidian Ambiance */}
        <div className="absolute bottom-[20%] left-[-150px] w-[700px] h-[700px] bg-gradient-to-tr from-amber-500/10 via-purple-950/15 to-transparent blur-[170px] rounded-full animate-pulse-slow" style={{ animationDelay: '6s' }} />
        
        {/* Subtle Cybernetic Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.5) 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* 4. MAIN HTML CONTENT LAYER */}
      <div className="relative z-10">

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
              MARKET DATA SYNC: <span className="text-emerald-400 font-semibold">100% REAL CONNECTED</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-amber-400 font-semibold font-mono">{currentTimeUtc || 'SYNCING UTC...'}</span>
          </div>
        </div>

        {/* HEADER NAVIGATION */}
        <header className="sticky top-0 z-40 bg-[#07090f]/85 backdrop-blur-xl border-b border-zinc-800/90 transition-all">
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
                onClick={() => scrollToSection('ai-intelligence')} 
                className="hover:text-amber-400 transition cursor-pointer"
              >
                AI Intelligence
              </button>
              <button 
                onClick={() => scrollToSection('why-aurum')} 
                className="hover:text-amber-400 transition cursor-pointer"
              >
                Why AURUM
              </button>
              <button 
                onClick={() => scrollToSection('market-intelligence')} 
                className="hover:text-amber-400 transition cursor-pointer"
              >
                Live Markets
              </button>
              <button 
                onClick={() => scrollToSection('news-intelligence')} 
                className="hover:text-amber-400 transition cursor-pointer"
              >
                News
              </button>
              <button 
                onClick={() => scrollToSection('risk-intelligence')} 
                className="hover:text-amber-400 transition cursor-pointer"
              >
                Risk Engine
              </button>
              <button 
                onClick={() => scrollToSection('community')} 
                className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1 text-emerald-400"
              >
                <span>Community</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </nav>

            {/* CTA Buttons in Header */}
            <div className="hidden sm:flex items-center gap-3">
              <MagneticButton
                onClick={onOpenLogin}
                variant="gold-outline"
                className="px-4 py-2"
              >
                <span>Login</span>
              </MagneticButton>

              <MagneticButton
                onClick={onAccessTerminal}
                variant="primary"
                className="px-5 py-2.5"
              >
                <span>ACCESS TERMINAL</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </MagneticButton>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden px-4 pt-2 pb-6 bg-[#090b11] border-b border-zinc-800 space-y-3 font-mono">
              <button 
                onClick={() => scrollToSection('ai-intelligence')} 
                className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
              >
                AI Intelligence
              </button>
              <button 
                onClick={() => scrollToSection('why-aurum')} 
                className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
              >
                Why AURUM
              </button>
              <button 
                onClick={() => scrollToSection('market-intelligence')} 
                className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
              >
                Live Markets
              </button>
              <button 
                onClick={() => scrollToSection('news-intelligence')} 
                className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
              >
                News Intelligence
              </button>
              <button 
                onClick={() => scrollToSection('risk-intelligence')} 
                className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
              >
                Risk Engine
              </button>
              <button 
                onClick={() => scrollToSection('community')} 
                className="block w-full text-left py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                Community
              </button>
              <button 
                onClick={() => scrollToSection('secure-access')} 
                className="block w-full text-left py-2 text-sm font-medium text-zinc-300 hover:text-amber-400"
              >
                Institutional Access
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

        {/* 1. HERO SECTION (3D AI COMMAND CENTER) */}
        <AiCommandCenterHero 
          onAccessTerminal={onAccessTerminal}
          markets={markets}
        />

        {/* 2. SECTION 1: INSTITUTIONAL AI INTELLIGENCE */}
        <RevealSection id="ai-intelligence" className="py-16 sm:py-24 border-y border-zinc-800/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                <Cpu className="w-3.5 h-3.5" />
                <span>INSTITUTIONAL AI INTELLIGENCE</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight text-white">
                INSTITUTIONAL <span className="gold-shimmer-text">AI INTELLIGENCE</span>
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Advanced market intelligence systems analyzing market conditions, price behavior, risk factors, and financial environments.
              </p>
            </div>

            {/* 3 Core AI Intelligence Feature Columns with Cursor Glow */}
            <div className="mt-12 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. Market Structure Analysis */}
              <GlowCard className="p-6 sm:p-8 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition font-cinzel">
                  MARKET STRUCTURE ANALYSIS
                </h3>
                <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                  Parallel AI engines evaluating price action geometry, order flow imbalances, and key structural market swing levels.
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Market Structure Analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Liquidity & Momentum Evaluation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Multi-Factor Confluence Scoring</span>
                  </li>
                </ul>
              </GlowCard>

              {/* 2. Real-Time Monitoring */}
              <GlowCard className="p-6 sm:p-8 hover:-translate-y-1" glowColor="rgba(56, 189, 248, 0.14)" borderColor="rgba(56, 189, 248, 0.4)">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-105 transition-transform">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-300 transition font-cinzel">
                  REAL-TIME MONITORING
                </h3>
                <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                  Sub-12ms tick ingestion across precious metals, major FX pairs, and equity indices with zero lag.
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Real-Time Data Streams</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Spread Anomaly & Gap Detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Continuous Market Surveillance</span>
                  </li>
                </ul>
              </GlowCard>

              {/* 3. Intelligent Market Context */}
              <GlowCard className="p-6 sm:p-8 hover:-translate-y-1" glowColor="rgba(168, 85, 247, 0.14)" borderColor="rgba(168, 85, 247, 0.4)">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
                  <LineChart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition font-cinzel">
                  INTELLIGENT MARKET CONTEXT
                </h3>
                <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                  Contextual AI engine synthesizing macroeconomic drivers, cross-asset correlations, and market regime shifts.
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Intelligent Market Context</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Cross-Asset Correlation Mapping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Regime Shift Tracking</span>
                  </li>
                </ul>
              </GlowCard>

            </div>
          </div>
        </RevealSection>

        {/* WHY AURUM TERMINAL TRUST SECTION */}
        <RevealSection id="why-aurum" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>INSTITUTIONAL TRUST & INFRASTRUCTURE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight text-white">
              WHY <span className="gold-shimmer-text">AURUM TERMINAL</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Engineered for high-precision capital environments requiring continuous clarity, objective risk guards, and institutional reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Real-Time Intelligence */}
            <GlowCard className="p-6 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-cinzel mb-2 group-hover:text-amber-300 transition">
                Real-Time Intelligence
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Continuous market monitoring and intelligent analysis across live asset price streams.
              </p>
            </GlowCard>

            {/* Card 2: Risk Awareness */}
            <GlowCard className="p-6 hover:-translate-y-1" glowColor="rgba(244, 63, 94, 0.14)" borderColor="rgba(244, 63, 94, 0.4)">
              <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-cinzel mb-2 group-hover:text-rose-300 transition">
                Risk Awareness
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Advanced risk evaluation and market condition monitoring to shield capital from sudden spikes.
              </p>
            </GlowCard>

            {/* Card 3: Multi-Market Coverage */}
            <GlowCard className="p-6 hover:-translate-y-1" glowColor="rgba(56, 189, 248, 0.14)" borderColor="rgba(56, 189, 248, 0.4)">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-cinzel mb-2 group-hover:text-sky-300 transition">
                Multi-Market Coverage
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Monitor commodities, forex, and major global indices from a single unified interface.
              </p>
            </GlowCard>

            {/* Card 4: Secure Access */}
            <GlowCard className="p-6 hover:-translate-y-1" glowColor="rgba(16, 185, 129, 0.14)" borderColor="rgba(16, 185, 129, 0.4)">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-cinzel mb-2 group-hover:text-emerald-300 transition">
                Secure Access
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Protected institutional-grade platform access with strict cryptographic authentication protocols.
              </p>
            </GlowCard>
          </div>
        </RevealSection>

        {/* REAL-TIME LIVE MARKET DATA MONITORING TABLE */}
        <RevealSection id="market-intelligence" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-2">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>LIVE CONNECTED FEEDS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight text-white">
                LIVE MARKET <span className="gold-shimmer-text">INTELLIGENCE</span>
              </h2>
              <p className="text-zinc-400 text-sm max-w-xl mt-1">
                Real-time prices, 24H changes, market status, and data source indicators directly connected to live exchange feeds.
              </p>
            </div>

            {/* Asset Category Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {(['ALL', 'COMMODITIES', 'FOREX', 'INDICES'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMarketTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    activeMarketTab === tab
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Real Connected Market Table Grid wrapped in GlowCard */}
          <GlowCard className="p-0 border-zinc-800/80 shadow-2xl overflow-hidden font-mono">
            <div className="p-4 bg-zinc-900/70 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                INSTITUTIONAL LIQUIDITY MONITORED ASSETS ({monitoredMarkets.length})
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                CONNECTED TO LIVE WEBSOCKET PIPELINE
              </span>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {monitoredMarkets.map((asset) => (
                <div 
                  key={asset.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/40 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                      {asset.symbol.split('/')[0].substring(0, 4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-cinzel">{asset.symbol}</span>
                        <span className="text-[9.5px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20">
                          {asset.category}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 font-sans block mt-0.5">{asset.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">Live Price</span>
                      <span className="font-bold text-white text-sm font-mono">{asset.price}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">24h Change</span>
                      <span className={`font-bold font-mono ${asset.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {asset.change}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">LIVE MARKET DATA</span>
                      <span className="text-amber-300 font-mono text-[11px] font-semibold">{asset.feedSource}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">Market Status</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {asset.session}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-black text-center border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono flex items-center justify-between px-6">
              <span>Direct real-time market data stream</span>
              <span className="text-emerald-400 font-semibold">● 100% Connected Real Data</span>
            </div>
          </GlowCard>
        </RevealSection>

        {/* 3. SECTION 2: NEWS INTELLIGENCE */}
        <RevealSection id="news-intelligence" className="py-20 border-y border-zinc-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>MACRO & CALENDAR INTELLIGENCE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight text-white">
                NEWS <span className="gold-shimmer-text">INTELLIGENCE</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Economic calendar monitoring, high-impact release awareness, and macroeconomic sentiment tracking to protect capital during major volatility events.
              </p>
            </div>

            {/* 3 Pillar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              
              {/* Economic Calendar Monitoring */}
              <GlowCard className="p-6 space-y-3" glowColor="rgba(56, 189, 248, 0.14)" borderColor="rgba(56, 189, 248, 0.4)">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-cinzel">Economic Calendar Monitoring</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time tracking of Federal Reserve statements, ECB decisions, NFP payrolls, and CPI releases with automated countdown alerts.
                </p>
              </GlowCard>

              {/* High-Impact Event Awareness */}
              <GlowCard className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BellRing className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-cinzel">High-Impact Event Awareness</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automatic volatility warnings and liquidity blackout periods before major macroeconomic catalyst announcements.
                </p>
              </GlowCard>

              {/* Macro Intelligence */}
              <GlowCard className="p-6 space-y-3" glowColor="rgba(168, 85, 247, 0.14)" borderColor="rgba(168, 85, 247, 0.4)">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-cinzel">Macro Intelligence</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Central bank interest rate differentials, yield curve shifts, and inflation metrics aggregated into clean institutional summaries.
                </p>
              </GlowCard>

            </div>

            {/* High Impact Event Banner Preview */}
            <div className="max-w-3xl mx-auto">
              <GlowCard className="p-6 sm:p-8 space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                        MACRO CALENDAR EVENT
                      </span>
                      <h3 className="text-lg font-bold text-white font-cinzel">
                        US CONSUMER PRICE INDEX (CPI)
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 self-start sm:self-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    HIGH IMPACT 🔴
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">Release Target</span>
                    <span className="text-base font-bold text-amber-300 block mt-1">US CPI YoY</span>
                    <span className="text-[10.5px] text-zinc-400 block mt-0.5">Consumer Price Index</span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">Currency Impact</span>
                    <span className="text-base font-bold text-sky-400 block mt-1">USD / GOLD</span>
                    <span className="text-[10.5px] text-zinc-400 block mt-0.5">XAU/USD, EUR/USD</span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-sans">Monitoring Status</span>
                    <span className="text-base font-bold text-emerald-400 block mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      ACTIVE
                    </span>
                    <span className="text-[10.5px] text-zinc-400 block mt-0.5">Schedule Tracking</span>
                  </div>
                </div>

              </GlowCard>
            </div>

          </div>
        </RevealSection>

        {/* 4. SECTION 3: RISK INTELLIGENCE */}
        <RevealSection id="risk-intelligence" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                <Shield className="w-3.5 h-3.5" />
                <span>CAPITAL PRESERVATION ENGINE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight text-white leading-tight">
                RISK <span className="gold-shimmer-text">INTELLIGENCE</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Institutional operations demand strict, objective capital protection. AURUM TERMINAL operates 
                with continuous environmental risk guards, shielding decision-makers from adverse volatility spikes and illiquid markets.
              </p>
              <div className="pt-2">
                <MagneticButton
                  onClick={onAccessTerminal}
                  variant="gold-outline"
                  className="px-5 py-2.5 text-amber-400 hover:text-amber-300 border-amber-500/40"
                >
                  <span>LAUNCH RISK CONTROLS</span>
                  <ChevronRight className="w-4 h-4" />
                </MagneticButton>
              </div>
            </div>

            <div className="lg:col-span-7">
              <GlowCard className="p-6 sm:p-8 space-y-4" glowColor="rgba(244, 63, 94, 0.12)" borderColor="rgba(244, 63, 94, 0.35)">
                <div className="pb-3 border-b border-zinc-800 text-xs font-mono text-amber-400 uppercase font-semibold">
                  SYSTEMATIC RISK CONTROLS & MONITORING:
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: 'Volatility Monitoring',
                      desc: 'Real-time ATR expansion audits to identify regime volatility shifts and widen stop buffers.'
                    },
                    {
                      title: 'Risk Controls & Drawdown Guards',
                      desc: 'Mathematical position sizing calculator enforcing precise account equity risk caps.'
                    },
                    {
                      title: 'Market Condition Analysis',
                      desc: 'Liquidity depth verification, spread anomaly flagging, and gap risk mitigation.'
                    },
                    {
                      title: 'Cross-Asset Correlation Drift',
                      desc: 'Monitoring structural alignment between USD index, treasury yields, and gold spot.'
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
              </GlowCard>
            </div>

          </div>
        </RevealSection>

        {/* DEDICATED COMMUNITY SECTION */}
        <RevealSection id="community" className="py-16 sm:py-20 relative overflow-hidden border-t border-emerald-500/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <GlowCard className="p-8 sm:p-12 space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.12)]" glowColor="rgba(16, 185, 129, 0.15)" borderColor="rgba(16, 185, 129, 0.4)">
              
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-8 h-8 fill-current text-emerald-400" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight text-white uppercase">
                  JOIN <span className="gold-shimmer-text">AURUM COMMUNITY</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto font-sans leading-relaxed">
                  Stay connected with platform updates, market intelligence insights, and product announcements.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <a
                  href="https://chat.whatsapp.com/Cgn2qq7XVqI9Q0VGex44aJ?s=cl&p=i&mlu=4&ilr=4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2.5 font-mono uppercase tracking-wider group active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>JOIN COMMUNITY</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

            </GlowCard>
          </div>
        </RevealSection>

        {/* 5. SECTION 4: SECURE INSTITUTIONAL ACCESS */}
        <RevealSection id="secure-access" className="py-20 relative overflow-hidden border-t border-zinc-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>PROTECTED ACCESS GATEWAY</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-cinzel font-black tracking-tight text-white">
                SECURE <span className="gold-shimmer-text">INSTITUTIONAL ACCESS</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto font-sans leading-relaxed">
                Protected login, role-based credentials, and secure cloud infrastructure for institutional workstations.
              </p>
            </div>

            {/* 3 Infrastructure Security Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <GlowCard className="p-6 text-left space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-cinzel">Protected Login</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Zero-knowledge session authentication with encrypted session tokens and dual-factor credential verification.
                </p>
              </GlowCard>

              <GlowCard className="p-6 text-left space-y-3" glowColor="rgba(16, 185, 129, 0.14)" borderColor="rgba(16, 185, 129, 0.4)">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-cinzel">Role-Based Access</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Strict permission isolation between Administrator governance and standard Trader terminal interfaces.
                </p>
              </GlowCard>

              <GlowCard className="p-6 text-left space-y-3" glowColor="rgba(56, 189, 248, 0.14)" borderColor="rgba(56, 189, 248, 0.4)">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-cinzel">Secure Infrastructure</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  256-bit TLS encryption, sandboxed server environment, and enterprise SLA uptime guarantees.
                </p>
              </GlowCard>
            </div>

            {/* Login Callout Box */}
            <GlowCard className="p-8 sm:p-12 text-center space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
              
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-cinzel font-black tracking-tight text-white">
                  READY TO ENTER <span className="gold-shimmer-text">AURUM TERMINAL</span>?
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  Login with your credentials or explore the live platform as an institutional guest.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton
                  onClick={onOpenLogin}
                  variant="primary"
                  className="w-full sm:w-auto px-8 py-4"
                >
                  <span>PROTECTED LOGIN</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>

                <MagneticButton
                  onClick={onAccessTerminal}
                  variant="gold-outline"
                  className="w-full sm:w-auto px-6 py-4"
                >
                  <span>Enter as Guest</span>
                </MagneticButton>
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

            </GlowCard>
          </div>
        </RevealSection>

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
                    Market intelligence and analytical platform.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-zinc-400 flex-wrap">
                <button onClick={() => scrollToSection('ai-intelligence')} className="hover:text-amber-400 transition cursor-pointer">
                  AI Intelligence
                </button>
                <button onClick={() => scrollToSection('why-aurum')} className="hover:text-amber-400 transition cursor-pointer">
                  Why AURUM
                </button>
                <button onClick={() => scrollToSection('market-intelligence')} className="hover:text-amber-400 transition cursor-pointer">
                  Live Markets
                </button>
                <button onClick={() => scrollToSection('community')} className="hover:text-amber-400 transition cursor-pointer">
                  Community
                </button>
                <button onClick={onOpenLogin} className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer">
                  Login
                </button>
              </div>
            </div>

            {/* Legal / Regulatory Disclaimer */}
            <div className="space-y-2 text-zinc-500 text-[11px] leading-relaxed">
              <p className="font-semibold text-zinc-400">Disclaimer:</p>
              <p className="text-zinc-400">
                AURUM TERMINAL provides market intelligence and analytical tools for informational purposes only. It does not provide financial advice or execute trades on behalf of users.
              </p>
              <p className="pt-2 text-zinc-600 font-mono">
                © {new Date().getFullYear()} AURUM TERMINAL. All rights reserved.
              </p>
            </div>

          </div>
        </footer>

        {/* FLOATING WHATSAPP COMMUNITY BUTTON */}
        <a
          href="https://chat.whatsapp.com/Cgn2qq7XVqI9Q0VGex44aJ?s=cl&p=i&mlu=4&ilr=4"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-full bg-[#0a120d]/95 border border-emerald-500/40 text-emerald-400 backdrop-blur-xl shadow-[0_8px_32px_rgba(16,185,129,0.35)] hover:bg-[#0f1f15] hover:border-emerald-400 hover:scale-105 transition-all duration-300 group"
          aria-label="Join AURUM Community on WhatsApp"
        >
          <div className="relative">
            <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping opacity-75" />
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold relative z-10 shadow-lg shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-wider uppercase text-white pr-1">
              Join WhatsApp Community
            </span>
          </div>
        </a>

      </div>
    </div>
  );
};
