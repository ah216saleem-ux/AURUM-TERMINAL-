import React, { useRef, useState, useCallback } from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // default gold
  borderColor?: string;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(212, 175, 55, 0.14)',
  borderColor = 'rgba(245, 158, 11, 0.35)'
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos(null);
  }, []);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    });
    setIsHovered(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Fade out touch highlight
    setTimeout(() => {
      setIsHovered(false);
      setMousePos(null);
    }, 600);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouchEnd}
      className={`relative rounded-2xl sm:rounded-3xl bg-[#080b14]/85 border border-zinc-800/80 backdrop-blur-xl overflow-hidden transition-all duration-300 group ${className}`}
    >
      {/* 1. Cursor Following Radial Glow Background */}
      {isHovered && mousePos && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100 z-0"
          style={{
            background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 75%)`
          }}
        />
      )}

      {/* 2. Cursor Following Edge Glow Border */}
      {isHovered && mousePos && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl sm:rounded-3xl transition-opacity duration-300 opacity-100 z-0"
          style={{
            background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, ${borderColor}, transparent 70%)`,
            maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px'
          }}
        />
      )}

      {/* 3. Card Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
