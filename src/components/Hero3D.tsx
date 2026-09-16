import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Globe, ArrowUpRight, TrendingUp, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

interface CityNode {
  name: string;
  lat: number;
  lng: number;
  hubType: 'primary' | 'secondary';
}

const FINANCIAL_HUBS: CityNode[] = [
  { name: 'London (LSE/LBMA)', lat: 51.5074, lng: -0.1278, hubType: 'primary' },
  { name: 'New York (NYSE/CME)', lat: 40.7128, lng: -74.006, hubType: 'primary' },
  { name: 'Zurich (SIX Gold)', lat: 47.3769, lng: 8.5417, hubType: 'secondary' },
  { name: 'Dubai (DGCX)', lat: 25.2048, lng: 55.2708, hubType: 'secondary' },
  { name: 'Tokyo (TSE)', lat: 35.6762, lng: 139.6503, hubType: 'primary' },
  { name: 'Singapore (SGX)', lat: 1.3521, lng: 103.8198, hubType: 'secondary' },
  { name: 'Hong Kong (HKEX)', lat: 22.3193, lng: 114.1694, hubType: 'primary' },
  { name: 'Frankfurt (Eurex)', lat: 50.1109, lng: 8.6821, hubType: 'secondary' }
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const Hero3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const { setSelectedSignalId, setActiveNav, markets } = useMarket();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 560;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Root Globe Group
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.25;
    globeGroup.rotation.y = -0.6;
    scene.add(globeGroup);

    const GLOBE_RADIUS = 5.6;

    // 3. Inner Dark Core
    const coreGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 0.98, 48, 48);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x080a0f,
      transparent: true,
      opacity: 0.85
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    globeGroup.add(coreMesh);

    // 4. Dot Grid Sphere (Institutional dotted globe representation)
    const dotCount = 1800;
    const dotPositions = new Float32Array(dotCount * 3);
    const dotColors = new Float32Array(dotCount * 3);
    const goldBase = new THREE.Color('#d4af37');
    const darkGold = new THREE.Color('#6b531e');
    const bronze = new THREE.Color('#382e16');

    for (let i = 0; i < dotCount; i++) {
      // Fibonacci sphere distribution for uniform elegance
      const phi = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;

      const x = GLOBE_RADIUS * Math.cos(theta) * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);
      const z = GLOBE_RADIUS * Math.cos(phi);

      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;

      // Color variation
      const rand = Math.random();
      const c = rand > 0.8 ? goldBase : rand > 0.4 ? darkGold : bronze;
      dotColors[i * 3] = c.r;
      dotColors[i * 3 + 1] = c.g;
      dotColors[i * 3 + 2] = c.b;
    }

    const dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    dotGeometry.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));

    const dotMaterial = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const globePoints = new THREE.Points(dotGeometry, dotMaterial);
    globeGroup.add(globePoints);

    // 5. Latitude & Longitude Accent Rings
    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x5a481e,
      transparent: true,
      opacity: 0.35
    });

    for (let lat = -60; lat <= 60; lat += 30) {
      const ringRadius = GLOBE_RADIUS * Math.cos((lat * Math.PI) / 180);
      const ringY = GLOBE_RADIUS * Math.sin((lat * Math.PI) / 180);
      const ringGeom = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let s = 0; s <= segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * ringRadius, ringY, Math.sin(angle) * ringRadius));
      }
      ringGeom.setFromPoints(points);
      const ring = new THREE.Line(ringGeom, ringMaterial);
      globeGroup.add(ring);
    }

    // 6. Financial Center Nodes (Glowing gold markers)
    const nodePositions: THREE.Vector3[] = [];
    FINANCIAL_HUBS.forEach(hub => {
      const pos = latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS * 1.01);
      nodePositions.push(pos);

      // Node mesh
      const nodeGeo = new THREE.SphereGeometry(hub.hubType === 'primary' ? 0.12 : 0.08, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: hub.hubType === 'primary' ? 0xffdf78 : 0xd4af37
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      globeGroup.add(nodeMesh);

      // Node outer glow ring
      const haloGeo = new THREE.RingGeometry(0.12, 0.22, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(pos);
      halo.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(halo);
    });

    // 7. Moving Market Data Lines (Great Circle Arcs)
    interface ArcCurve {
      curve: THREE.QuadraticBezierCurve3;
      mesh: THREE.Line;
      packetMesh: THREE.Mesh;
      progress: number;
      speed: number;
    }

    const arcPairs: [number, number][] = [
      [0, 1], // London -> NY
      [1, 4], // NY -> Tokyo
      [0, 2], // London -> Zurich
      [0, 3], // London -> Dubai
      [3, 5], // Dubai -> Singapore
      [5, 6], // Singapore -> Hong Kong
      [6, 4], // Hong Kong -> Tokyo
      [0, 7]  // London -> Frankfurt
    ];

    const arcs: ArcCurve[] = [];
    const packetGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xfff0a0 });

    arcPairs.forEach(([idxA, idxB]) => {
      const start = nodePositions[idxA];
      const end = nodePositions[idxB];
      if (!start || !end) return;

      const mid = start.clone().lerp(end, 0.5);
      const midDist = start.distanceTo(end);
      const elevatedMid = mid.normalize().multiplyScalar(GLOBE_RADIUS + Math.min(midDist * 0.45, 1.8));

      const curve = new THREE.QuadraticBezierCurve3(start, elevatedMid, end);
      const curvePoints = curve.getPoints(40);
      const curveGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineBasicMaterial({
        color: 0x997a2b,
        transparent: true,
        opacity: 0.4
      });
      const arcLine = new THREE.Line(curveGeom, curveMat);
      globeGroup.add(arcLine);

      // Moving packet
      const packet = new THREE.Mesh(packetGeo, packetMat);
      globeGroup.add(packet);

      arcs.push({
        curve,
        mesh: arcLine,
        packetMesh: packet,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004
      });
    });

    // 8. Orbiting Ambient Gold Particle Cloud
    const particleCount = 450;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const rad = GLOBE_RADIUS * 1.15 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = rad * Math.cos(phi);

      particleSpeeds.push(0.0005 + Math.random() * 0.001);
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf5d77f,
      size: 0.065,
      transparent: true,
      opacity: 0.55
    });
    const particleField = new THREE.Points(particleGeom, particleMat);
    scene.add(particleField);

    // 9. Floating 3D Market Badge Anchors (Candlestick accents)
    const candleGroup = new THREE.Group();
    const candleColors = [0x10b981, 0xef4444, 0x10b981, 0xd4af37, 0x10b981];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const dist = GLOBE_RADIUS * 1.35;
      const cx = Math.cos(angle) * dist;
      const cy = (Math.sin(i * 1.5) * 1.4);
      const cz = Math.sin(angle) * dist;

      // Candle body
      const bodyH = 0.5 + Math.random() * 0.4;
      const bodyGeo = new THREE.BoxGeometry(0.12, bodyH, 0.12);
      const bodyMat = new THREE.MeshBasicMaterial({ color: candleColors[i], transparent: true, opacity: 0.75 });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.set(cx, cy, cz);

      // Wick
      const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, bodyH + 0.5, 6);
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.6 });
      const wickMesh = new THREE.Mesh(wickGeo, wickMat);
      wickMesh.position.set(cx, cy, cz);

      candleGroup.add(wickMesh);
      candleGroup.add(bodyMesh);
    }
    globeGroup.add(candleGroup);

    // 10. Mouse Interaction & Drag Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationY = -0.6;
    let targetRotationX = 0.25;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsInteracting(true);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;

      // Clamp X rotation to prevent flipping
      targetRotationX = Math.max(-0.8, Math.min(0.8, targetRotationX));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => setIsInteracting(false), 500);
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;
      targetRotationX = Math.max(-0.8, Math.min(0.8, targetRotationX));
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 11. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // 12. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Auto rotation when not actively dragging
      if (!isDragging) {
        targetRotationY += 0.0018;
      }

      // Smooth interpolation
      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.08;

      // Rotate ambient particles gently opposite
      particleField.rotation.y -= 0.0006;
      particleField.rotation.x = Math.sin(elapsed * 0.2) * 0.08;

      // Update data line packets along curves
      arcs.forEach(arc => {
        arc.progress = (arc.progress + arc.speed) % 1;
        const currentPos = arc.curve.getPoint(arc.progress);
        arc.packetMesh.position.copy(currentPos);
      });

      // Subtle float on floating candlesticks
      candleGroup.position.y = Math.sin(elapsed * 1.2) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const gold = markets.find(m => m.id === 'xau-usd');
  const silver = markets.find(m => m.id === 'xag-usd');
  const ndx = markets.find(m => m.id === 'nasdaq-100');
  const spx = markets.find(m => m.id === 'sp-500');
  const wti = markets.find(m => m.id === 'crude-oil');

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#06070a] via-[#090b10] to-[#07080a] border-b border-amber-500/10">
      {/* Background ambient gold radial glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-10 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-3xl" />

      {/* Grid line texture */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #d4af37 1px, transparent 1px), linear-gradient(to bottom, #d4af37 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:py-16 min-h-[620px] flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column: Terminal Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full lg:w-1/2 z-10 space-y-6"
        >
          {/* Institutional AI Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-num tracking-wide aurum-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-semibold text-zinc-200">AI SMART MONEY CONCEPTS (SMC)</span>
            <span className="text-amber-500/60">•</span>
            <span className="text-amber-300">5 MARKETS ACTIVE</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-syne leading-[1.1]">
              AURUM <span className="bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent">AI TERMINAL</span>
            </h1>
            <p className="text-lg sm:text-xl text-amber-200/80 font-cinzel tracking-widest uppercase">
              Global Markets. Live Intelligence.
            </p>
          </div>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-xl font-light">
            Autonomous institutional trading assistant powered by Smart Money Concepts. Real-time structured trade setups, multi-timeframe confluence, and automated Telegram alerts for Gold, Silver, NASDAQ 100, S&P 500, and Crude Oil.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                setActiveNav('signals');
                const el = document.getElementById('ai-signals-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#996515] text-black font-semibold text-sm sm:text-base flex items-center gap-2 hover:brightness-110 active:scale-98 transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-black" />
              Live AI Signal Center
              <ArrowUpRight className="w-4 h-4 text-black" />
            </button>

            <button
              onClick={() => {
                setActiveNav('radar');
                const el = document.getElementById('ai-radar-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 font-medium text-sm sm:text-base border border-amber-500/25 flex items-center gap-2 transition hover:border-amber-500/50 cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              SMC & Market Radar
            </button>
          </div>

          {/* AI Specs Mini Row */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80 text-xs font-mono-num max-w-lg">
            <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800/60">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Confluence Engine</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                M15–D1 Verified
              </span>
            </div>
            <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800/60">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Avg Risk:Reward</span>
              <span className="text-amber-300 font-semibold mt-0.5 block">1 : 2.3 Asymmetry</span>
            </div>
            <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800/60">
              <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">SMC Analysis</span>
              <span className="text-zinc-200 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                OB & Sweeps Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Globe Canvas Container & Floating HUD Badges */}
        <div className="relative w-full lg:w-1/2 h-[420px] sm:h-[500px] lg:h-[560px] flex items-center justify-center">
          {/* 3D Canvas Mount */}
          <div 
            ref={mountRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing"
            title="Click and drag to rotate the 3D financial globe"
          />

          {/* Floating Live Market Badges */}
          {gold && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              onClick={() => {
                setSelectedSignalId('sig-gold');
                document.getElementById('live-charts-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="absolute top-4 left-2 sm:left-4 p-2.5 sm:p-3 rounded-xl bg-glass-card border border-amber-500/40 aurum-glow cursor-pointer hover:border-amber-400 transition-all backdrop-blur-md z-20 group"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-300 font-mono-num">{gold.symbol}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-num">
                  +{gold.changePercent}%
                </span>
              </div>
              <div className="text-base font-bold font-mono-num text-white mt-0.5 group-hover:text-amber-300 transition">
                ${gold.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-zinc-400 font-mono-num">BUY • H1 Order Block</span>
            </motion.div>
          )}

          {ndx && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onClick={() => {
                setSelectedSignalId('sig-nasdaq');
                document.getElementById('live-charts-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="absolute bottom-6 right-2 sm:right-4 p-2.5 sm:p-3 rounded-xl bg-glass-card border border-amber-500/30 aurum-glow cursor-pointer hover:border-amber-400 transition-all backdrop-blur-md z-20 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-200 font-mono-num">{ndx.symbol}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-num">
                  +{ndx.changePercent}%
                </span>
              </div>
              <div className="text-base font-bold font-mono-num text-white mt-0.5 group-hover:text-amber-300 transition">
                {ndx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-zinc-400 font-mono-num">BUY • H4 BOS</span>
            </motion.div>
          )}

          {silver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              onClick={() => {
                setSelectedSignalId('sig-silver');
                document.getElementById('live-charts-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:block absolute top-10 right-4 p-2.5 rounded-lg bg-neutral-950/85 border border-amber-500/30 hover:border-amber-400 cursor-pointer backdrop-blur-md z-20 group"
            >
              <div className="text-[11px] font-mono-num text-zinc-400 flex items-center gap-1.5">
                <span className="text-amber-300 font-semibold">{silver.symbol}</span>
                <span className="text-emerald-400 font-mono-num">+{silver.changePercent}%</span>
              </div>
              <div className="text-sm font-bold font-mono-num text-white mt-0.5">
                ${silver.price.toFixed(2)}
              </div>
              <span className="text-[9px] text-zinc-500 font-mono-num">BUY • Liquidity Sweep</span>
            </motion.div>
          )}

          {wti && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              onClick={() => {
                setSelectedSignalId('sig-oil');
                document.getElementById('live-charts-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:block absolute bottom-8 left-6 p-2.5 rounded-lg bg-neutral-950/85 border border-rose-500/30 hover:border-rose-400 cursor-pointer backdrop-blur-md z-20 group"
            >
              <div className="text-[11px] font-mono-num text-zinc-400 flex items-center gap-1.5">
                <span className="text-rose-300 font-semibold">{wti.symbol}</span>
                <span className="text-rose-400 font-mono-num">{wti.changePercent}%</span>
              </div>
              <div className="text-sm font-bold font-mono-num text-white mt-0.5">
                ${wti.price.toFixed(2)}
              </div>
              <span className="text-[9px] text-zinc-500 font-mono-num">SELL • H1 Supply OB-</span>
            </motion.div>
          )}

          {/* Interactive drag hint */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[11px] font-mono-num text-zinc-500 flex items-center gap-1.5 pointer-events-none bg-neutral-950/80 px-2.5 py-1 rounded-full border border-zinc-800/80">
            <Globe className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Interactive 3D Globe • Drag to rotate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
