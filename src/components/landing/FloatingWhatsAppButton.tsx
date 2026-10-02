import React, { useState, useEffect } from 'react';

export const FloatingWhatsAppButton: React.FC = () => {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <a
      href="https://chat.whatsapp.com/Cgn2qq7XVqI9Q0VGex44aJ?mode=gi_t"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join AURUM WhatsApp Community"
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        right: '12px'
      }}
      className={`fixed z-50 group flex items-center gap-2 p-0 rounded-full transition-all duration-300 ${
        isScrolling ? 'opacity-60 scale-95' : 'opacity-100 scale-100 hover:scale-105'
      }`}
    >
      {/* 48px Round WhatsApp Button with Soft Pulse Ring */}
      <div className="relative flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.4)] active:scale-95 transition-transform shrink-0">
        {/* Soft Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping opacity-75 pointer-events-none" />
        
        {/* WhatsApp Icon */}
        <svg className="w-5 h-5 fill-current text-white relative z-10" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </div>

      {/* Hover Desktop Label */}
      <span className="hidden md:inline-block max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap bg-zinc-900/90 text-zinc-100 border border-emerald-500/40 text-xs font-mono font-bold px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md">
        Join Community
      </span>
    </a>
  );
};
