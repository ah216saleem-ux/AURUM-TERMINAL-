import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, ArrowRight, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { Tilt3DCard } from './Tilt3DCard';
import { MagneticButton } from './MagneticButton';
import { AurumCircleConnectSection } from './AurumCircleConnectSection';

interface GatewayAccessSectionProps {
  onAccessTerminal: () => void;
  onOpenLogin: () => void;
  currentTimeUtc: string;
}

export const GatewayAccessSection: React.FC<GatewayAccessSectionProps> = ({
  onAccessTerminal,
  onOpenLogin,
  currentTimeUtc
}) => {
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false);

  return (
    <div className="space-y-12 sm:space-y-16">
      
      {/* 1. CONNECT SECTION (Join the AURUM Circle) */}
      <AurumCircleConnectSection />

      {/* 2. FLOATING GLASS GATEWAY PANEL */}
      <section id="secure-access" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tilt3DCard
          glowColor="rgba(212, 175, 55, 0.25)"
          borderColor="rgba(245, 158, 11, 0.5)"
          elevation="lg"
          className="p-6 sm:p-10 relative overflow-hidden text-center rounded-3xl"
        >
          {/* Animated Gold Aura Portal Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <div className="w-[400px] h-[400px] rounded-full border border-amber-500/30 animate-spin-slow" />
            <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-amber-400/40 animate-spin-reverse" />
          </div>

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>PROTECTED INSTITUTIONAL GATEWAY</span>
            </div>

            {/* Headline & Subtitle (Max 1 short sentence) */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight text-white leading-tight">
                ACCESS <span className="gold-shimmer-text">AURUM TERMINAL</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto leading-normal font-sans">
                Real-time AI signal consensus, market intelligence, and institutional risk controls.
              </p>
            </div>

            {/* Glowing Golden Ring Portal Button Array */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              
              {/* Main Glowing CTA with Gold Halo Ring */}
              <div className="relative group w-full sm:w-auto">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 opacity-75 blur-md group-hover:opacity-100 transition duration-300 animate-pulse-slow" />
                <MagneticButton
                  onClick={onAccessTerminal}
                  variant="primary"
                  className="relative w-full sm:w-auto min-h-[44px] px-8 py-3.5 text-xs sm:text-sm font-black font-mono tracking-wider flex items-center justify-center gap-2 text-black"
                >
                  <Terminal className="w-4 h-4" />
                  <span>ACCESS LIVE TERMINAL</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </div>

              {/* Login Secondary Button */}
              <MagneticButton
                onClick={onOpenLogin}
                variant="gold-outline"
                className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 text-xs sm:text-sm font-bold font-mono tracking-wider flex items-center justify-center gap-2 text-zinc-200 border-zinc-700 hover:border-amber-400/70"
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span>SUPERVISORY LOGIN</span>
              </MagneticButton>
            </div>

            {/* Security Protocol Chips */}
            <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10.5px] font-mono text-zinc-400">
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 ENCRYPTED</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ROLE ISOLATION</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
                <span className="text-amber-400 font-bold">&lt;12MS SYNC</span>
              </div>
            </div>

          </div>
        </Tilt3DCard>
      </section>

      {/* 3. COMPACT FOOTER */}
      <footer className="border-t border-zinc-800/80 bg-[#06080e]/95 pt-8 pb-12 text-xs text-zinc-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Compact Row of Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#090b11] rounded-[5px] flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
              <span className="font-cinzel font-bold text-white tracking-wider text-xs">
                AURUM TERMINAL
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-5 flex-wrap justify-center text-zinc-400 text-xs">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-amber-400 transition cursor-pointer min-h-[44px] py-2">
                Top
              </button>
              <button onClick={onAccessTerminal} className="hover:text-amber-400 transition cursor-pointer min-h-[44px] py-2">
                Signal Engine
              </button>
              <button onClick={onOpenLogin} className="hover:text-amber-400 transition cursor-pointer min-h-[44px] py-2">
                Portal Auth
              </button>
              <a href="https://chat.whatsapp.com/Cgn2qq7XVqI9Q0VGex44aJ?mode=gi_t" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition cursor-pointer min-h-[44px] py-2 text-emerald-400">
                Community
              </a>
            </div>

            {/* UTC Clock Indicator */}
            <div className="text-zinc-500 text-[11px]">
              UTC: <span className="text-amber-400 font-bold">{currentTimeUtc || 'SYNC'}</span>
            </div>

          </div>

          {/* Visible Risk Disclaimer */}
          <div className="pt-4 border-t border-zinc-900 text-[11px] text-zinc-400 leading-relaxed max-w-4xl mx-auto text-center font-sans">
            <p className="text-zinc-300">
              <strong className="text-amber-400">Risk Warning:</strong> Trading forex, gold, indices and other leveraged products involves a high level of risk and may not be suitable for all investors. You can lose some or all of your capital. AURUM TERMINAL provides market information and analytical tools for educational and informational purposes only. Nothing on this site is financial advice or a guarantee of profit. Past performance is not indicative of future results. Trade responsibly and only with funds you can afford to lose.
            </p>

            {disclaimerExpanded && (
              <p className="mt-2 text-zinc-400 animate-fadeIn text-[10.5px]">
                Additional Legal Notice: AURUM TERMINAL is an independent market analytics platform. All algorithmic models, signal feeds, and risk meters are derived from public data and simulated execution tests.
              </p>
            )}

            <div className="mt-3 flex items-center justify-center gap-4 font-mono text-[10.5px]">
              <button
                onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer min-h-[44px] py-1"
              >
                <span>{disclaimerExpanded ? 'Show Less' : 'Read More Legal'}</span>
                {disclaimerExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500">
                © {new Date().getFullYear()} AURUM TERMINAL. All rights reserved.
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
