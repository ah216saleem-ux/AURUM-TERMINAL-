import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Terminal } from 'lucide-react';

interface AurumIntroLoaderProps {
  onComplete: () => void;
}

export const AurumIntroLoader: React.FC<AurumIntroLoaderProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check if user has already seen the intro this session
    try {
      if (sessionStorage.getItem('aurum_intro_seen') === 'true') {
        setIsVisible(false);
        onComplete();
        return;
      }
    } catch {
      // ignore storage error
    }

    // Progress counter animation
    const startTime = Date.now();
    const duration = 1600; // 1.6s total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(p);

      if (p >= 100) {
        clearInterval(interval);
        handleFinish();
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // 2D Canvas Particle Convergence Effect
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const centerX = width / 2;
    const centerY = height / 2;

    // Generate converging particles
    const particleCount = width < 768 ? 60 : 120;
    const particles: {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      speed: number;
      size: number;
      color: string;
      alpha: number;
    }[] = [];

    const goldColors = ['#F59E0B', '#D4AF37', '#FDE047', '#FFFBEB', '#38BDF8'];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spawnDist = Math.max(width, height) * 0.6 + Math.random() * 200;
      const targetRadius = 60 + Math.random() * 40;

      particles.push({
        x: centerX + Math.cos(angle) * spawnDist,
        y: centerY + Math.sin(angle) * spawnDist,
        targetX: centerX + Math.cos(angle) * targetRadius,
        targetY: centerY + Math.sin(angle) * targetRadius,
        speed: 0.045 + Math.random() * 0.035,
        size: Math.random() * 2.2 + 0.8,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(5, 6, 8, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Central core glow
      const glow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 160);
      glow.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      glow.addColorStop(0.5, 'rgba(212, 175, 55, 0.08)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
      ctx.fill();

      // Draw converging particles
      particles.forEach((p) => {
        p.x += (p.targetX - p.x) * p.speed;
        p.y += (p.targetY - p.y) * p.speed;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isVisible]);

  const handleFinish = () => {
    try {
      sessionStorage.setItem('aurum_intro_seen', 'true');
    } catch {}
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 450);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-[100] bg-[#050608] flex flex-col items-center justify-center select-none transition-all duration-500 cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-105 filter blur-md pointer-events-none' : 'opacity-100 scale-100 filter blur-0'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Central Brand Identity Reveal */}
      <div className="relative z-10 text-center space-y-4 px-4 max-w-sm">
        {/* Glowing Logo Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-amber-500/30 to-amber-300/30 blur-lg animate-pulse" />
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_40px_rgba(245,158,11,0.5)] flex items-center justify-center relative z-10">
            <div className="w-full h-full bg-[#080b14] rounded-[14px] flex items-center justify-center">
              <Terminal className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Brand Typography */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-cinzel font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]">
            AURUM TERMINAL
          </h1>
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase text-zinc-400 mt-1">
            Autonomous Market Intelligence
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-48 mx-auto pt-2 space-y-1.5">
          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-400 rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[9.5px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              INITIALIZING
            </span>
            <span className="text-amber-300 font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Skip button in corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleFinish();
        }}
        className="absolute bottom-6 text-[10px] font-mono text-zinc-400 hover:text-amber-300 tracking-wider uppercase px-3 py-1 rounded-full border border-zinc-800/80 bg-black/40 backdrop-blur-md transition-colors"
      >
        Skip Intro &rarr;
      </button>
    </div>
  );
};
