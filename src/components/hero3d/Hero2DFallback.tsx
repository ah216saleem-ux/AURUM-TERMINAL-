import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  alpha: number;
  speed: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  color: string;
}

interface DataStreamPacket {
  progress: number;
  speed: number;
  targetIndex: number;
  length: number;
  color: string;
}

interface Hero2DFallbackProps {
  isHeroVisible: boolean;
}

export const Hero2DFallback: React.FC<Hero2DFallbackProps> = ({ isHeroVisible }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isHeroVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = width < 640 ? 40 : 80;
    const particles: Point3D[] = [];
    const colors = ['#f59e0b', '#fbbf24', '#d97706', '#fef08a', '#38bdf8', '#10b981'];

    for (let i = 0; i < particleCount; i++) {
      const radius = 70 + Math.random() * 160;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta) * 0.65,
        z: radius * Math.cos(phi),
        baseX: radius * Math.sin(phi) * Math.cos(theta),
        baseY: radius * Math.sin(phi) * Math.sin(theta) * 0.65,
        baseZ: radius * Math.cos(phi),
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
        speed: 0.002 + Math.random() * 0.004,
        orbitRadius: radius,
        orbitAngle: theta,
        orbitSpeed: (Math.random() - 0.5) * 0.015,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const packets: DataStreamPacket[] = [
      { progress: 0.1, speed: 0.009, targetIndex: 0, length: 0.25, color: '#fbbf24' },
      { progress: 0.4, speed: 0.013, targetIndex: 1, length: 0.3, color: '#f59e0b' },
      { progress: 0.7, speed: 0.010, targetIndex: 2, length: 0.2, color: '#38bdf8' }
    ];

    let angleY = 0;
    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angleY += 0.005;
      pulse += 0.02;

      const centerX = width / 2;
      const centerY = height * 0.48;

      // Golden core glow
      const coreGlow = ctx.createRadialGradient(
        centerX, centerY, 10,
        centerX, centerY, width < 768 ? 180 : 300
      );
      coreGlow.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
      coreGlow.addColorStop(0.3, 'rgba(245, 158, 11, 0.16)');
      coreGlow.addColorStop(0.7, 'rgba(14, 165, 233, 0.03)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, width < 768 ? 180 : 300, 0, Math.PI * 2);
      ctx.fill();

      // Render 2D particles
      for (const p of particles) {
        p.orbitAngle += p.orbitSpeed;
        const rx = p.orbitRadius * Math.cos(p.orbitAngle);
        const rz = p.orbitRadius * Math.sin(p.orbitAngle);

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const rotX = rx * cosY - rz * sinY;
        const rotZ = rx * sinY + rz * cosY;

        const fov = 400;
        const scale = fov / (fov + rotZ + 250);
        const projX = centerX + rotX * scale;
        const projY = centerY + p.y * scale;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, p.alpha * scale * (0.8 + Math.sin(pulse + p.orbitAngle) * 0.2));
        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(0.5, p.size * scale), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHeroVisible]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block pointer-events-none"
    />
  );
};
