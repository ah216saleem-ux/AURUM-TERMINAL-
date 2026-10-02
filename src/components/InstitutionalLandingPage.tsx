import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Terminal, 
  Menu, 
  X
} from 'lucide-react';
import { MarketItem } from '../types';
import { AiCommandCenterHero } from './AiCommandCenterHero';
import { Persistent3DStoryCanvas } from './hero3d/Persistent3DStoryCanvas';
import { StorySection } from './hero3d/types';
import { AurumIntroLoader } from './landing/AurumIntroLoader';
import { MagneticButton } from './landing/MagneticButton';
import { RevealSection } from './landing/RevealSection';
import { IntelligenceOrbitSection } from './landing/IntelligenceOrbitSection';
import { IsometricWhyGrid } from './landing/IsometricWhyGrid';
import { HoloMarketCards } from './landing/HoloMarketCards';
import { MacroNewsCarousel3D } from './landing/MacroNewsCarousel3D';
import { RiskShieldHud } from './landing/RiskShieldHud';
import { GatewayAccessSection } from './landing/GatewayAccessSection';
import { LiveMarketTickerStrip } from './landing/LiveMarketTickerStrip';
import { FloatingWhatsAppButton } from './landing/FloatingWhatsAppButton';

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
  const [, setActiveStorySection] = useState<StorySection>('HERO');

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

      {/* 2. LIGHTWEIGHT SCENE OVERLAY (KEEPS 3D SCENE VISIBLE) */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] bg-black/25 transition-all duration-700 ease-in-out"
      />

      {/* 3. ANIMATED GRADIENT ACCENTS */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-amber-500/10 via-purple-900/10 to-transparent blur-[140px] rounded-full opacity-70 animate-pulse-slow" />
        <div className="absolute top-[35%] right-[-120px] w-[650px] h-[650px] bg-gradient-to-br from-purple-900/15 via-indigo-950/20 to-transparent blur-[160px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[20%] left-[-150px] w-[700px] h-[700px] bg-gradient-to-tr from-amber-500/10 via-purple-950/15 to-transparent blur-[170px] rounded-full animate-pulse-slow" style={{ animationDelay: '6s' }} />
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

        {/* Institutional Top Status Bar */}
        <div className="relative z-50 bg-[#07080c]/90 border-b border-zinc-800/80 px-4 py-1 text-[11px] font-mono flex items-center justify-between text-zinc-400">
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
              MARKET SYNC: <span className="text-emerald-400 font-semibold">100% REAL CONNECTED</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-amber-400 font-semibold font-mono">{currentTimeUtc || 'UTC SYNC...'}</span>
          </div>
        </div>

        {/* HEADER NAVIGATION */}
        <header className="sticky top-0 z-40 bg-[#07090f]/90 backdrop-blur-xl border-b border-zinc-800/90 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#090b11] rounded-[9px] flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div>
                <span className="text-base sm:text-lg font-cinzel font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 block">
                  AURUM TERMINAL
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 block -mt-0.5">
                  Market Intelligence Platform
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold text-zinc-300">
              <button 
                onClick={() => scrollToSection('ai-intelligence')} 
                className="hover:text-amber-400 transition cursor-pointer min-h-[44px] py-2"
              >
                AI Intelligence
              </button>
              <button 
                onClick={() => scrollToSection('why-aurum')} 
                className="hover:text-amber-400 transition cursor-pointer min-h-[44px] py-2"
              >
                Why AURUM
              </button>
              <button 
                onClick={() => scrollToSection('market-intelligence')} 
                className="hover:text-amber-400 transition cursor-pointer min-h-[44px] py-2"
              >
                Live Markets
              </button>
              <button 
                onClick={() => scrollToSection('news-intelligence')} 
                className="hover:text-amber-400 transition cursor-pointer min-h-[44px] py-2"
              >
                News
              </button>
              <button 
                onClick={() => scrollToSection('risk-intelligence')} 
                className="hover:text-amber-400 transition cursor-pointer min-h-[44px] py-2"
              >
                Risk Engine
              </button>
              <button 
                onClick={() => scrollToSection('community')} 
                className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1 text-emerald-400 min-h-[44px] py-2"
              >
                <span>Community</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </nav>

            {/* CTA Buttons in Header */}
            <div className="hidden sm:flex items-center gap-2.5">
              <MagneticButton
                onClick={onOpenLogin}
                variant="gold-outline"
                className="px-3.5 py-2 text-xs min-h-[44px]"
              >
                <span>Login</span>
              </MagneticButton>

              <MagneticButton
                onClick={onAccessTerminal}
                variant="primary"
                className="px-4 py-2 text-xs min-h-[44px]"
              >
                <span>ACCESS TERMINAL</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </MagneticButton>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden px-4 pt-2 pb-6 bg-[#090b11] border-b border-zinc-800 space-y-2 font-mono">
              <button 
                onClick={() => scrollToSection('ai-intelligence')} 
                className="block w-full text-left py-2.5 text-sm font-medium text-zinc-300 hover:text-amber-400 min-h-[44px]"
              >
                AI Intelligence
              </button>
              <button 
                onClick={() => scrollToSection('why-aurum')} 
                className="block w-full text-left py-2.5 text-sm font-medium text-zinc-300 hover:text-amber-400 min-h-[44px]"
              >
                Why AURUM
              </button>
              <button 
                onClick={() => scrollToSection('market-intelligence')} 
                className="block w-full text-left py-2.5 text-sm font-medium text-zinc-300 hover:text-amber-400 min-h-[44px]"
              >
                Live Markets
              </button>
              <button 
                onClick={() => scrollToSection('news-intelligence')} 
                className="block w-full text-left py-2.5 text-sm font-medium text-zinc-300 hover:text-amber-400 min-h-[44px]"
              >
                News Intelligence
              </button>
              <button 
                onClick={() => scrollToSection('risk-intelligence')} 
                className="block w-full text-left py-2.5 text-sm font-medium text-zinc-300 hover:text-amber-400 min-h-[44px]"
              >
                Risk Engine
              </button>
              <button 
                onClick={() => scrollToSection('community')} 
                className="block w-full text-left py-2.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 min-h-[44px]"
              >
                Community
              </button>
              <button 
                onClick={() => scrollToSection('secure-access')} 
                className="block w-full text-left py-2.5 text-sm font-medium text-zinc-300 hover:text-amber-400 min-h-[44px]"
              >
                Institutional Access
              </button>
              <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
                <button
                  onClick={onOpenLogin}
                  className="w-full min-h-[44px] py-2.5 rounded-xl text-xs font-bold text-zinc-200 bg-zinc-900 border border-zinc-700"
                >
                  LOGIN TO PORTAL
                </button>
                <button
                  onClick={onAccessTerminal}
                  className="w-full min-h-[44px] py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/20"
                >
                  ACCESS LIVE TERMINAL
                </button>
              </div>
            </div>
          )}
        </header>

        {/* SLIM AUTO-SCROLLING LIVE TICKER STRIP */}
        <LiveMarketTickerStrip markets={markets} onAccessTerminal={onAccessTerminal} />

        {/* 1. HERO SECTION (3D AI COMMAND CENTER) */}
        <AiCommandCenterHero 
          onAccessTerminal={onAccessTerminal}
          markets={markets}
        />

        {/* 2. SECTION 1: INSTITUTIONAL AI INTELLIGENCE */}
        <RevealSection id="ai-intelligence" className="py-8 sm:py-12 border-y border-zinc-800/60 relative">
          <IntelligenceOrbitSection />
        </RevealSection>

        {/* 3. SECTION 2: WHY AURUM TRUST & INFRASTRUCTURE */}
        <RevealSection id="why-aurum" className="py-8 sm:py-12 relative">
          <IsometricWhyGrid />
        </RevealSection>

        {/* 4. SECTION 3: LIVE MARKET DATA INTELLIGENCE */}
        <RevealSection id="market-intelligence" className="py-8 sm:py-12 border-t border-zinc-800/60 relative">
          <HoloMarketCards 
            markets={markets} 
            onAccessTerminal={onAccessTerminal} 
          />
        </RevealSection>

        {/* 5. SECTION 4: NEWS & MACRO INTELLIGENCE */}
        <RevealSection id="news-intelligence" className="py-8 sm:py-12 border-t border-zinc-800/60 relative">
          <MacroNewsCarousel3D />
        </RevealSection>

        {/* 6. SECTION 5: RISK INTELLIGENCE & PRESERVATION HUD */}
        <RevealSection id="risk-intelligence" className="py-8 sm:py-12 border-t border-zinc-800/60 relative">
          <RiskShieldHud onAccessTerminal={onAccessTerminal} />
        </RevealSection>

        {/* 7. SECTION 6 & FOOTER: SECURE GATEWAY & COMMUNITY */}
        <GatewayAccessSection 
          onAccessTerminal={onAccessTerminal}
          onOpenLogin={onOpenLogin}
          currentTimeUtc={currentTimeUtc}
        />

        {/* FLOATING ROUND WHATSAPP BUTTON */}
        <FloatingWhatsAppButton />

      </div>
    </div>
  );
};
