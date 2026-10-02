import React, { useRef, useState, useCallback, useEffect } from 'react';

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderColor?: string;
  maxTilt?: number;
  hudBrackets?: boolean;
  elevation?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(212, 175, 55, 0.14)',
  borderColor = 'rgba(245, 158, 11, 0.35)',
  maxTilt = 8,
  hudBrackets = true,
  elevation = 'md',
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized [-1, 1]
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    setRotate({
      x: -normY * maxTilt,
      y: normX * maxTilt
    });
    setMousePos({ x, y });
    setIsHovered(true);
  }, [maxTilt, reducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setMousePos(null);
  }, []);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current || e.touches.length === 0) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    setRotate({
      x: -normY * (maxTilt * 0.5),
      y: normX * (maxTilt * 0.5)
    });
    setMousePos({ x, y });
    setIsHovered(true);
  }, [maxTilt, reducedMotion]);

  const handleTouchEnd = useCallback(() => {
    setTimeout(() => {
      setIsHovered(false);
      setRotate({ x: 0, y: 0 });
      setMousePos(null);
    }, 400);
  }, []);

  const elevationShadow = 
    elevation === 'lg'
      ? 'shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.08)]'
      : elevation === 'md'
        ? 'shadow-[0_12px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(212,175,55,0.05)]'
        : 'shadow-[0_6px_20px_rgba(0,0,0,0.4)]';

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full h-full"
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: reducedMotion 
            ? 'none' 
            : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(${isHovered ? '8px' : '0px'})`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className={`relative rounded-2xl sm:rounded-3xl bg-[#080a12]/80 border border-zinc-800/80 backdrop-blur-md overflow-hidden ${elevationShadow} transition-colors group ${className}`}
      >
        {/* HUD Corner Brackets */}
        {hudBrackets && (
          <>
            <div className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-amber-400/40 z-20 group-hover:border-amber-400 transition-colors" />
            <div className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-amber-400/40 z-20 group-hover:border-amber-400 transition-colors" />
            <div className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-amber-400/40 z-20 group-hover:border-amber-400 transition-colors" />
            <div className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-amber-400/40 z-20 group-hover:border-amber-400 transition-colors" />
          </>
        )}

        {/* Cursor Radial Glow */}
        {isHovered && mousePos && (
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100 z-0"
            style={{
              background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 75%)`
            }}
          />
        )}

        {/* Cursor-Following Edge Border */}
        {isHovered && mousePos && (
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl sm:rounded-3xl transition-opacity duration-300 opacity-100 z-0"
            style={{
              background: `radial-gradient(240px circle at ${mousePos.x}px ${mousePos.y}px, ${borderColor}, transparent 70%)`,
              maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
              WebkitMaskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '1px'
            }}
          />
        )}

        {/* Subtle Scanline Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.03] z-[1]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
};
