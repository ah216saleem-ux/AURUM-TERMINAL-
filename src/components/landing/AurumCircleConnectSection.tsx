import React from 'react';
import { TrendingUp, BellRing, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import { Tilt3DCard } from './Tilt3DCard';

export const AurumCircleConnectSection: React.FC = () => {
  return (
    <section id="community" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
      <Tilt3DCard
        glowColor="rgba(16, 185, 129, 0.22)"
        borderColor="rgba(245, 158, 11, 0.45)"
        elevation="lg"
        className="p-6 sm:p-8 relative overflow-hidden text-center sm:text-left rounded-3xl"
      >
        {/* Ambient Soft Emerald Glow */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Top Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono tracking-wider self-center sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PRIVATE COMMUNITY</span>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-mono text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN-MODERATED DESK</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cinzel font-black tracking-tight text-white">
              Join the <span className="gold-shimmer-text">AURUM Circle</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans max-w-2xl">
              Market insights, session updates and trader discussion, shared directly with our community.
            </p>
          </div>

          {/* 3 Compact Perk Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-zinc-300 font-sans leading-tight">
                Daily market insights and key level updates
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-zinc-300 font-sans leading-tight">
                High-impact news alerts before major events
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-zinc-300 font-sans leading-tight">
                Telegram Signal Bot access, available on request. Message us on WhatsApp to get started.
              </span>
            </div>
          </div>

          {/* Primary CTA Button & Trust Line */}
          <div className="pt-2 flex flex-col items-center justify-center gap-2">
            <a
              href="https://chat.whatsapp.com/Cgn2qq7XVqI9Q0VGex44aJ?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[44px] px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2.5 font-mono uppercase tracking-wider group active:scale-95 border border-emerald-400/30"
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>JOIN ON WHATSAPP</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </a>

            <span className="text-[11px] font-mono text-zinc-400">
              Free to join. Admin-moderated. No spam.
            </span>
          </div>

        </div>
      </Tilt3DCard>
    </section>
  );
};
