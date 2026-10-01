import React, { useRef, useState, useCallback } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'gold-outline';
  ariaLabel?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  ariaLabel
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // Soft magnetic pull constraint
    setOffset({
      x: dx * 0.22,
      y: dy * 0.22
    });
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const baseVariantStyles = {
    primary:
      'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-extrabold shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:shadow-[0_0_50px_rgba(245,158,11,0.65)] hover:brightness-105 border border-amber-200/50',
    secondary:
      'bg-[#0B0D14] text-amber-300 border border-amber-500/50 hover:border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:bg-[#121622]',
    'gold-outline':
      'bg-black/60 text-zinc-200 hover:text-amber-300 border border-zinc-700 hover:border-amber-500/60 backdrop-blur-md shadow-lg'
  }[variant];

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`
      }}
      className={`group relative min-h-[44px] rounded-xl font-mono text-xs sm:text-sm tracking-wider uppercase cursor-pointer select-none transition-transform duration-200 ease-out active:scale-95 overflow-hidden flex items-center justify-center gap-2 ${baseVariantStyles} ${className}`}
    >
      {/* Sweeping Shimmer Beam */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      {/* Button Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};
