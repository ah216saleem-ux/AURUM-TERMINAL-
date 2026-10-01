import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Hero3DScene } from './Hero3DScene';
import { detectPerformanceTier, PerformanceTier } from './types';

interface Hero3DCanvasProps {
  isHeroVisible: boolean;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ isHeroVisible }) => {
  const [performanceTier] = useState<PerformanceTier>(() => detectPerformanceTier());
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetTilt, setTargetTilt] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 1. Pause rendering when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const isPaused = !isHeroVisible || !isTabVisible;

  // 2. Desktop Mouse Parallax & Cursor Tracking (tracks smoothly across window)
  useEffect(() => {
    if (performanceTier.isMobile || isPaused) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
      const y = -((e.clientY / (window.innerHeight || 1)) * 2 - 1);

      setMousePos({ x, y });
      setTargetTilt({ x: -y * 0.75, y: x * 0.85 });
    };

    const handleWindowMouseLeave = () => {
      setMousePos({ x: 0, y: 0 });
      setTargetTilt({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleWindowMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseleave', handleWindowMouseLeave);
    };
  }, [performanceTier.isMobile, isPaused]);

  // 3. Mobile Touch Drag Interaction
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || e.touches.length === 0) return;
    const dx = (e.touches[0].clientX - touchStartRef.current.x) / (window.innerWidth || 360);
    const dy = (e.touches[0].clientY - touchStartRef.current.y) / 400;

    setTargetTilt({
      x: Math.max(-0.8, Math.min(0.8, -dy * 1.5)),
      y: Math.max(-0.8, Math.min(0.8, dx * 1.5))
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    // Smoothly return to center
    setTargetTilt({ x: 0, y: 0 });
  }, []);

  // 4. Mobile Gyroscope Tilt with Graceful Permission Check
  useEffect(() => {
    if (!performanceTier.isMobile) return;

    let isListening = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma is left/right tilt [-90, 90]
      // beta is front/back tilt [-180, 180]
      const tiltY = Math.max(-1, Math.min(1, e.gamma / 35));
      const tiltX = Math.max(-1, Math.min(1, (e.beta - 45) / 35));

      setTargetTilt({
        x: tiltX * 0.6,
        y: tiltY * 0.6
      });
    };

    // Check if permission request is needed (iOS 13+)
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      // Permission will be triggered by first touch interaction gracefully
      const triggerPermission = async () => {
        try {
          const state = await (DeviceOrientationEvent as any).requestPermission();
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
            isListening = true;
          }
        } catch {
          // Graceful fallback: user denied or dismissed prompt
        }
        window.removeEventListener('touchstart', triggerPermission);
      };

      window.addEventListener('touchstart', triggerPermission, { once: true, passive: true });
    } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      // Standard Android / Chrome gyro
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      isListening = true;
    }

    return () => {
      if (isListening) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [performanceTier.isMobile]);

  return (
    <div
      className="w-full h-full relative select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 48 }}
        dpr={Math.min(window.devicePixelRatio || 1, performanceTier.maxDpr)}
        frameloop={isPaused ? 'never' : 'always'}
        gl={{
          antialias: !performanceTier.isLowEnd,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'auto'
        }}
      >
        <Hero3DScene
          performanceTier={performanceTier}
          targetTilt={targetTilt}
          mouseNormalized={mousePos}
        />
      </Canvas>
    </div>
  );
};

export default Hero3DCanvas;
