import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type Phase3DMarketState = 
  | 'ACCUMULATION' 
  | 'MARKUP' 
  | 'DISTRIBUTION' 
  | 'MARKDOWN' 
  | 'TRANSITION' 
  | 'UNCONFIRMED' 
  | 'WAIT';

interface PhaseX3DCoreProps {
  marketState?: Phase3DMarketState;
  confidence?: number;
  isAnalyzing?: boolean;
  onAnalysisSequenceComplete?: () => void;
  className?: string;
  isPaused?: boolean;
}

interface IntelligenceNode {
  group: THREE.Group;
  mesh: THREE.Mesh;
  halo: THREE.Mesh;
  beaconLight: THREE.PointLight;
  initialPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  phaseOffset: number;
  speed: number;
  streamLine: THREE.Line;
  streamPositions: Float32Array;
  wakeTime: number; // For sequential activation
}

export const PhaseX3DCore: React.FC<PhaseX3DCoreProps> = ({
  marketState = 'WAIT',
  confidence = 75,
  isAnalyzing = false,
  onAnalysisSequenceComplete,
  className = '',
  isPaused = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [webglError, setWebglError] = useState<boolean>(false);
  const [activeStageLabel, setActiveStageLabel] = useState<string>('SYSTEM READY');

  // References to decouple render loop from React state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isVisibleRef = useRef<boolean>(true);
  const stateRef = useRef<Phase3DMarketState>(marketState);
  stateRef.current = marketState;

  const isAnalyzingRef = useRef<boolean>(isAnalyzing);
  isAnalyzingRef.current = isAnalyzing;

  const analysisStartTimeRef = useRef<number>(0);
  const analysisStageRef = useRef<number>(0); // 0=idle, 1=wake, 2=pulse, 3=converge, 4=coreProcess, 5=syncBurst, 6=completed

  // Track when isAnalyzing becomes true
  useEffect(() => {
    if (isAnalyzing) {
      analysisStartTimeRef.current = performance.now();
      analysisStageRef.current = 1;
      setActiveStageLabel('INTELLIGENCE NODES ACTIVATING');
    } else {
      if (analysisStageRef.current !== 0) {
        // Returned to idle or completed
        analysisStageRef.current = 0;
        setActiveStageLabel(
          marketState === 'ACCUMULATION' || marketState === 'MARKUP'
            ? 'BULLISH ALIGNMENT ACTIVE'
            : marketState === 'DISTRIBUTION' || marketState === 'MARKDOWN'
              ? 'BEARISH ALIGNMENT ACTIVE'
              : 'AUTONOMOUS SURVEILLANCE'
        );
      }
    }
  }, [isAnalyzing, marketState]);

  useEffect(() => {
    const isMobileDevice = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 280;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0, 9.2);

    // 3. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobileDevice,
        powerPreference: 'high-performance',
        precision: isMobileDevice ? 'mediump' : 'highp'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileDevice ? 1.2 : 1.5));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('[PhaseX3DCore] WebGL initialization failed:', e);
      setWebglError(true);
      return;
    }

    // 4. Lighting System (Institutional Gold & Metallic Highlights)
    const ambientLight = new THREE.AmbientLight(0x10121a, 2.0);
    scene.add(ambientLight);

    const goldCoreLight = new THREE.PointLight(0xd4af37, 3.2, 22);
    goldCoreLight.position.set(0, 0, 0); // Positioned inside central core
    scene.add(goldCoreLight);

    const topKeyLight = new THREE.DirectionalLight(0xfff1c5, 1.8);
    topKeyLight.position.set(5, 8, 6);
    scene.add(topKeyLight);

    const rimLight = new THREE.PointLight(0x405580, 1.6, 20);
    rimLight.position.set(-6, -5, -4);
    scene.add(rimLight);

    // 5. Central AI Intelligence Core Group
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    const centralCoreGroup = new THREE.Group();
    networkGroup.add(centralCoreGroup);

    // 5a. Central Core Outer Hull: Multi-faceted dark crystalline polyhedron (Icosahedron/Dodecahedron dual)
    const hullGeometry = new THREE.IcosahedronGeometry(1.4, isMobileDevice ? 1 : 2);
    const hullMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x08090f,
      metalness: 0.94,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      reflectivity: 0.98,
      wireframe: false
    });
    const coreHull = new THREE.Mesh(hullGeometry, hullMaterial);
    centralCoreGroup.add(coreHull);

    // 5b. Core Structural Gold Lattice Edges
    const latticeMaterial = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      wireframe: true,
      transparent: true,
      opacity: 0.42
    });
    const coreLattice = new THREE.Mesh(hullGeometry, latticeMaterial);
    centralCoreGroup.add(coreLattice);

    // 5c. Inner Glowing Crystalline Nucleus (Nested Octahedron)
    const nucleusGeometry = new THREE.OctahedronGeometry(0.82, 0);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0x221a05,
      emissive: 0xd4af37,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8
    });
    const innerNucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    centralCoreGroup.add(innerNucleus);

    // 5d. Synchronized Energy Pulse Wave Ring (Triggered on analysis completion)
    const shockwaveGeometry = new THREE.RingGeometry(0.2, 0.28, 48);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdf78,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwaveMesh.rotation.x = Math.PI / 2;
    centralCoreGroup.add(shockwaveMesh);

    // 6. Floating Abstract Intelligence Nodes (Surrounding the core in 3D)
    // IMPORTANT: No strategy names, only abstract futuristic geometric shapes & data beacons
    const nodeCount = isMobileDevice ? 4 : 7;
    const intelligenceNodes: IntelligenceNode[] = [];

    // Pre-calculated harmonious coordinates distributed around central core
    const baseNodePositions = [
      new THREE.Vector3(2.6, 1.3, 0.8),
      new THREE.Vector3(-2.4, 1.5, -0.7),
      new THREE.Vector3(-2.8, -1.2, 0.9),
      new THREE.Vector3(2.5, -1.4, -0.6),
      new THREE.Vector3(0.4, 2.7, -1.2),
      new THREE.Vector3(-0.6, -2.6, 1.1),
      new THREE.Vector3(1.1, -1.8, 2.2)
    ].slice(0, nodeCount);

    const nodeGeometry = new THREE.OctahedronGeometry(0.24, 0);
    const haloGeometry = new THREE.RingGeometry(0.36, 0.42, 24);

    baseNodePositions.forEach((pos, idx) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);
      networkGroup.add(nodeGroup);

      // Node Crystalline Core
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x0a0c14,
        emissive: 0xd4af37,
        emissiveIntensity: 0.4,
        metalness: 0.9,
        roughness: 0.2
      });
      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMat);
      nodeGroup.add(nodeMesh);

      // Node Abstract Data Halo Ring
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
      });
      const nodeHalo = new THREE.Mesh(haloGeometry, haloMat);
      nodeHalo.rotation.x = Math.PI / 3;
      nodeGroup.add(nodeHalo);

      // Subtle localized point light per node
      const nodeLight = new THREE.PointLight(0xd4af37, 0.6, 5);
      nodeGroup.add(nodeLight);

      // Luminous Data Stream Line connecting Node to Central Core
      const linePositions = new Float32Array(6); // 2 points (x,y,z)
      linePositions[0] = pos.x;
      linePositions[1] = pos.y;
      linePositions[2] = pos.z;
      linePositions[3] = 0;
      linePositions[4] = 0;
      linePositions[5] = 0;

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.2
      });
      const streamLine = new THREE.Line(lineGeo, lineMat);
      networkGroup.add(streamLine);

      intelligenceNodes.push({
        group: nodeGroup,
        mesh: nodeMesh,
        halo: nodeHalo,
        beaconLight: nodeLight,
        initialPos: pos.clone(),
        currentPos: pos.clone(),
        phaseOffset: (idx * Math.PI * 2) / nodeCount,
        speed: 0.7 + (idx % 3) * 0.25,
        streamLine,
        streamPositions: linePositions,
        wakeTime: idx * 220 // Sequential wake delay
      });
    });

    // 7. Ambient Data Particle Network (flowing between nodes & core)
    const particleCount = isMobileDevice ? 45 : 110;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleTargets = new Int32Array(particleCount); // Node index or center (-1)

    for (let i = 0; i < particleCount; i++) {
      const targetNode = i % (nodeCount + 1) - 1; // -1 = center, 0..N = node
      particleTargets[i] = targetNode;
      const r = 1.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
      particleSpeeds[i] = 0.015 + Math.random() * 0.02;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 235, 175, 1)');
      grad.addColorStop(0.35, 'rgba(212, 175, 55, 0.75)');
      grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: isMobileDevice ? 0.18 : 0.24,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    networkGroup.add(particles);

    // 8. Interactive Parallax
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.4;
      mouseRef.current.targetY = y * 0.4;
    };
    container.addEventListener('mousemove', handlePointerMove);

    // 9. Visibility Listener
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 10. Resize Handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width || 360;
        const newH = entry.contentRect.height || 280;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 11. Animation Loop
    let clock = new THREE.Clock();
    let shockwaveScale = 0.2;
    let shockwaveActive = false;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current || isPaused) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const currentState = stateRef.current;
      const analyzingNow = isAnalyzingRef.current;

      // Mouse parallax damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      networkGroup.rotation.y = elapsed * 0.12 + mouseRef.current.x * 0.2;
      networkGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.06 + mouseRef.current.y * 0.2;

      // Rotate core elements independently
      coreHull.rotation.y += 0.008;
      coreHull.rotation.x += 0.005;
      coreLattice.rotation.y -= 0.006;
      coreLattice.rotation.z += 0.004;
      innerNucleus.rotation.y += 0.015;
      innerNucleus.rotation.z -= 0.012;

      // AI AGENT BEHAVIOR & ANALYSIS SEQUENCE
      if (analyzingNow) {
        const analysisElapsedMs = performance.now() - analysisStartTimeRef.current;

        // Stage 1: Outer nodes wake up one by one (0 - 600ms)
        // Stage 2: Each node generates a subtle energy pulse (600 - 1200ms)
        // Stage 3: Luminous data streams travel from nodes toward central core (1200 - 2000ms)
        // Stage 4: Central core becomes progressively more active (1600 - 2400ms)
        // Stage 5: Synchronized energy pulse occurs when analysis completes (2400 - 2800ms)

        let stage = 1;
        if (analysisElapsedMs > 2400) stage = 5;
        else if (analysisElapsedMs > 1700) stage = 4;
        else if (analysisElapsedMs > 1100) stage = 3;
        else if (analysisElapsedMs > 500) stage = 2;

        analysisStageRef.current = stage;

        // Core activity increases during analysis
        coreHull.rotation.y += 0.025;
        innerNucleus.rotation.y += 0.04;
        nucleusMaterial.emissiveIntensity = 1.6 + Math.sin(elapsed * 12) * 1.0;
        goldCoreLight.intensity = 4.5 + Math.sin(elapsed * 10) * 1.5;

        // Synchronized pulse trigger at stage 5
        if (stage === 5 && !shockwaveActive) {
          shockwaveActive = true;
          shockwaveScale = 0.4;
          shockwaveMaterial.opacity = 0.9;
        }

        // Animate nodes during analysis
        intelligenceNodes.forEach((node, i) => {
          const isAwake = analysisElapsedMs >= node.wakeTime;
          const nodeMat = node.mesh.material as THREE.MeshStandardMaterial;
          const haloMat = node.halo.material as THREE.MeshBasicMaterial;
          const streamMat = node.streamLine.material as THREE.LineBasicMaterial;

          if (isAwake) {
            nodeMat.emissiveIntensity = 1.2 + Math.sin(elapsed * 10 + i) * 0.6;
            node.beaconLight.intensity = 1.4;
            haloMat.opacity = 0.75;
            // Data stream illuminates brightly toward center
            streamMat.opacity = stage >= 3 ? 0.65 : 0.3;
          } else {
            nodeMat.emissiveIntensity = 0.3;
            node.beaconLight.intensity = 0.4;
            haloMat.opacity = 0.25;
            streamMat.opacity = 0.15;
          }
        });
      } else {
        // IDLE STATE: Central core slowly breathes/pulses
        const idlePulse = (Math.sin(elapsed * 1.5) + 1) * 0.5;
        nucleusMaterial.emissiveIntensity = 0.9 + idlePulse * 0.4;
        goldCoreLight.intensity = 2.4 + idlePulse * 0.6;

        intelligenceNodes.forEach((node, i) => {
          const nodeMat = node.mesh.material as THREE.MeshStandardMaterial;
          const haloMat = node.halo.material as THREE.MeshBasicMaterial;
          const streamMat = node.streamLine.material as THREE.LineBasicMaterial;

          nodeMat.emissiveIntensity = 0.45 + Math.sin(elapsed * 1.8 + node.phaseOffset) * 0.2;
          haloMat.opacity = 0.3 + Math.sin(elapsed * 2.2 + node.phaseOffset) * 0.15;
          streamMat.opacity = 0.18 + Math.sin(elapsed * 1.2 + node.phaseOffset) * 0.08;
          node.beaconLight.intensity = 0.5;
        });
      }

      // Animate shockwave pulse expansion
      if (shockwaveActive) {
        shockwaveScale += 0.12;
        shockwaveMaterial.opacity *= 0.91;
        shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
        if (shockwaveMaterial.opacity < 0.02) {
          shockwaveActive = false;
          shockwaveMaterial.opacity = 0;
        }
      }

      // Update Node Floating Harmonic Oscillation
      intelligenceNodes.forEach((node) => {
        const hoverX = Math.sin(elapsed * node.speed + node.phaseOffset) * 0.14;
        const hoverY = Math.cos(elapsed * (node.speed * 0.8) + node.phaseOffset) * 0.16;
        const hoverZ = Math.sin(elapsed * (node.speed * 1.2) + node.phaseOffset) * 0.12;

        node.currentPos.set(
          node.initialPos.x + hoverX,
          node.initialPos.y + hoverY,
          node.initialPos.z + hoverZ
        );
        node.group.position.copy(node.currentPos);
        node.halo.rotation.z += 0.015;

        // Update data stream line endpoints: from node current pos to central core (0,0,0)
        const posAttr = node.streamLine.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        arr[0] = node.currentPos.x;
        arr[1] = node.currentPos.y;
        arr[2] = node.currentPos.z;
        arr[3] = 0;
        arr[4] = 0;
        arr[5] = 0;
        posAttr.needsUpdate = true;
      });

      // Data Particles Movement & Market State Reaction:
      // Bullish: Controlled upward energy movement
      // Bearish: Controlled downward energy movement
      // WAIT / UNCONFIRMED / TRANSITION: Stable slow neutral pulse
      const posArr = particleGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        if (analyzingNow) {
          // Rapid convergence toward the core during analysis
          const px = posArr[i3];
          const py = posArr[i3 + 1];
          const pz = posArr[i3 + 2];
          const dist = Math.sqrt(px * px + py * py + pz * pz) || 1;

          if (dist > 1.2) {
            posArr[i3] -= (px / dist) * 0.05;
            posArr[i3 + 1] -= (py / dist) * 0.05;
            posArr[i3 + 2] -= (pz / dist) * 0.05;
          } else {
            // Respawn outward near a node
            const r = 3.2 + Math.random() * 0.8;
            const th = Math.random() * Math.PI * 2;
            posArr[i3] = r * Math.cos(th);
            posArr[i3 + 1] = (Math.random() - 0.5) * 2.5;
            posArr[i3 + 2] = r * Math.sin(th);
          }
        } else if (currentState === 'ACCUMULATION' || currentState === 'MARKUP') {
          // Bullish: Controlled upward smooth energy movement
          posArr[i3 + 1] += 0.018;
          // Gentle orbital swirl
          const x = posArr[i3];
          const z = posArr[i3 + 2];
          posArr[i3] = x * Math.cos(0.01) - z * Math.sin(0.01);
          posArr[i3 + 2] = x * Math.sin(0.01) + z * Math.cos(0.01);

          if (posArr[i3 + 1] > 3.4) {
            posArr[i3 + 1] = -3.4;
          }
        } else if (currentState === 'DISTRIBUTION' || currentState === 'MARKDOWN') {
          // Bearish: Controlled downward smooth energy movement
          posArr[i3 + 1] -= 0.018;
          const x = posArr[i3];
          const z = posArr[i3 + 2];
          posArr[i3] = x * Math.cos(-0.01) - z * Math.sin(-0.01);
          posArr[i3 + 2] = x * Math.sin(-0.01) + z * Math.cos(-0.01);

          if (posArr[i3 + 1] < -3.4) {
            posArr[i3 + 1] = 3.4;
          }
        } else {
          // WAIT / Neutral: Stable slow neutral pulse
          const breath = Math.sin(elapsed * 0.8 + i) * 0.003;
          posArr[i3] += breath;
          posArr[i3 + 1] += breath * 0.6;
          posArr[i3 + 2] += breath;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      container.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();

      // Clean up Three.js objects
      particles.geometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      coreHull.geometry.dispose();
      hullMaterial.dispose();
      latticeMaterial.dispose();
      nucleusGeometry.dispose();
      nucleusMaterial.dispose();
      shockwaveGeometry.dispose();
      shockwaveMaterial.dispose();

      intelligenceNodes.forEach((node) => {
        (node.mesh.material as THREE.Material).dispose();
        (node.halo.material as THREE.Material).dispose();
        (node.streamLine.material as THREE.Material).dispose();
        node.streamLine.geometry.dispose();
      });
      nodeGeometry.dispose();
      haloGeometry.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div className={`w-full h-64 sm:h-72 rounded-3xl bg-gradient-to-b from-[#0e111d] to-[#080a12] border border-amber-500/20 flex flex-col items-center justify-center p-6 text-center ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400 font-mono font-bold text-lg">
          AI
        </div>
        <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
          AI Intelligence Network Active
        </div>
        <div className="text-[11px] text-zinc-400 mt-1 max-w-xs font-mono">
          Autonomous Multi-Timeframe Core (4H Macro • 1H Phase • 30M Setup • 15M Precision)
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-64 sm:h-72 rounded-3xl bg-gradient-to-b from-[#090b14]/90 via-[#06080e]/95 to-[#05060b] border border-amber-500/25 overflow-hidden shadow-2xl ${className}`}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Autonomous Telemetry Overlay */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-amber-500/30 flex items-center gap-1.5 shadow-lg">
          <span className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-[10px] font-mono font-black tracking-widest text-amber-300 uppercase">
            {isAnalyzing ? 'AI SYNTHESIS ACTIVE' : 'AI INTELLIGENCE NETWORK'}
          </span>
        </div>
      </div>

      {/* Bottom Center Dynamic Status Overlay */}
      <div className="absolute bottom-3 inset-x-0 pointer-events-none flex justify-center">
        <div className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-amber-500/20 text-[10px] font-mono font-semibold tracking-wider text-zinc-300 shadow-xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
          <span>{activeStageLabel}</span>
          <span className="text-zinc-400">•</span>
          <span className="text-amber-400/90 font-mono font-bold">{confidence}% Confidence</span>
        </div>
      </div>
    </div>
  );
};
