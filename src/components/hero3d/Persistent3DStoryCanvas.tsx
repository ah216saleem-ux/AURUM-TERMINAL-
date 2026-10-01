import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StoryScene } from './StoryScene';
import { Hero2DFallback } from './Hero2DFallback';
import { StorySection, detectPerformanceTier, PerformanceTier, isWebGLSupported, prefersReducedMotion } from './types';

gsap.registerPlugin(ScrollTrigger);

interface Persistent3DStoryCanvasProps {
  onSectionChange?: (section: StorySection) => void;
}

export const Persistent3DStoryCanvas: React.FC<Persistent3DStoryCanvasProps> = ({
  onSectionChange
}) => {
  const [canUse3D, setCanUse3D] = useState(false);
  const [performanceTier] = useState<PerformanceTier>(() => detectPerformanceTier());
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [adaptiveDpr, setAdaptiveDpr] = useState<number>(() => {
    const tier = detectPerformanceTier();
    return Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, tier.maxDpr);
  });

  // Story sections state
  const [currentSection, setCurrentSection] = useState<StorySection>('HERO');
  const [targetSection, setTargetSection] = useState<StorySection>('HERO');
  const [morphProgress, setMorphProgress] = useState(1);

  // Mouse & Gyro Tilt
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetTilt, setTargetTilt] = useState({ x: 0, y: 0 });

  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressObj = useRef({ value: 1 });
  const currentSectionRef = useRef<StorySection>('HERO');
  const targetSectionRef = useRef<StorySection>('HERO');

  // Check WebGL and Reduced Motion on mount
  useEffect(() => {
    const webglOk = isWebGLSupported();
    const reducedMotion = prefersReducedMotion();
    setCanUse3D(webglOk && !reducedMotion);
  }, []);

  // 1. Pause rendering when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // 2. Section Transition Controller using GSAP (1.25s easing)
  const transitionToSection = useCallback((newSection: StorySection) => {
    if (newSection === targetSectionRef.current) return;

    // Source is current target
    const prevTarget = targetSectionRef.current;
    currentSectionRef.current = prevTarget;
    targetSectionRef.current = newSection;

    setCurrentSection(prevTarget);
    setTargetSection(newSection);

    if (onSectionChange) {
      onSectionChange(newSection);
    }

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    progressObj.current.value = 0;
    setMorphProgress(0);

    // Smooth 1.25 second transition with power2.inOut easing
    tweenRef.current = gsap.to(progressObj.current, {
      value: 1,
      duration: 1.25,
      ease: 'power2.inOut',
      onUpdate: () => {
        setMorphProgress(progressObj.current.value);
      },
      onComplete: () => {
        currentSectionRef.current = newSection;
        setCurrentSection(newSection);
        setMorphProgress(1);
      }
    });
  }, [onSectionChange]);

  // 3. GSAP ScrollTrigger Integration across all landing page sections
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Small delay to ensure DOM sections are mounted
    const initTimer = setTimeout(() => {
      ScrollTrigger.refresh();

      const triggers: ScrollTrigger[] = [];

      // Section mapping definition
      const sectionsConfig: { id: string; section: StorySection }[] = [
        { id: 'ai-intelligence', section: 'AI_INTELLIGENCE' },
        { id: 'why-aurum', section: 'WHY_AURUM' },
        { id: 'market-intelligence', section: 'LIVE_MARKETS' },
        { id: 'risk-intelligence', section: 'RISK_INTELLIGENCE' },
        { id: 'secure-access', section: 'FINAL_ACCESS' }
      ];

      // Hero trigger (top of page)
      const heroTrigger = ScrollTrigger.create({
        start: 0,
        end: () => {
          const aiEl = document.getElementById('ai-intelligence');
          return aiEl ? aiEl.offsetTop - window.innerHeight * 0.4 : window.innerHeight * 0.8;
        },
        onEnter: () => transitionToSection('HERO'),
        onEnterBack: () => transitionToSection('HERO')
      });
      triggers.push(heroTrigger);

      // Section triggers
      sectionsConfig.forEach(({ id, section }) => {
        const el = document.getElementById(id);
        if (!el) return;

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top 65%',
          end: 'bottom 40%',
          onEnter: () => transitionToSection(section),
          onEnterBack: () => transitionToSection(section)
        });
        triggers.push(st);
      });

      return () => {
        triggers.forEach(t => t.kill());
      };
    }, 200);

    return () => {
      clearTimeout(initTimer);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [transitionToSection]);

  // 4. Desktop Window Mouse Tracking
  useEffect(() => {
    if (performanceTier.isMobile || !isTabVisible) return;

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
  }, [performanceTier.isMobile, isTabVisible]);

  // 5. Mobile Gyroscope Tilt with Graceful Permission Check
  useEffect(() => {
    if (!performanceTier.isMobile) return;

    let isListening = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      const tiltY = Math.max(-1, Math.min(1, e.gamma / 35));
      const tiltX = Math.max(-1, Math.min(1, (e.beta - 45) / 35));

      setTargetTilt({
        x: tiltX * 0.5,
        y: tiltY * 0.5
      });
    };

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      const triggerPermission = async () => {
        try {
          const state = await (DeviceOrientationEvent as any).requestPermission();
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
            isListening = true;
          }
        } catch {}
        window.removeEventListener('touchstart', triggerPermission);
      };

      window.addEventListener('touchstart', triggerPermission, { once: true, passive: true });
    } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      isListening = true;
    }

    return () => {
      if (isListening) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [performanceTier.isMobile]);

  // Adaptive FPS degradation callback
  const handleFpsUpdate = useCallback((_fps: number, isDegraded: boolean) => {
    if (isDegraded) {
      setAdaptiveDpr(1.0);
    }
  }, []);

  // WebGL Context Lost handler
  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault();
    console.warn('[3D Engine] WebGL Context lost. Falling back to 2D ambient background.');
    setCanUse3D(false);
  }, []);

  if (!canUse3D) {
    return (
      <div 
        className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden"
        style={{ touchAction: 'pan-y' }}
      >
        <Hero2DFallback isHeroVisible={isTabVisible} />
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none select-none overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 48 }}
        dpr={adaptiveDpr}
        frameloop={isTabVisible ? 'always' : 'never'}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
        }}
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
          pointerEvents: 'none',
          touchAction: 'pan-y'
        }}
      >
        <StoryScene
          performanceTier={performanceTier}
          currentSection={currentSection}
          targetSection={targetSection}
          morphProgress={morphProgress}
          targetTilt={targetTilt}
          mouseNormalized={mousePos}
          onFpsUpdate={handleFpsUpdate}
        />
      </Canvas>
    </div>
  );
};

export default Persistent3DStoryCanvas;
