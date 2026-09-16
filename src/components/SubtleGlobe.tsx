import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const SubtleGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 140;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.2;
    globeGroup.rotation.y = -0.4;
    scene.add(globeGroup);

    const GLOBE_RADIUS = 3.6;

    // Inner Dark Core
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.98, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06080d,
      transparent: true,
      opacity: 0.9
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // Dotted Sphere with Gold Gradients
    const dotCount = 1100;
    const dotPositions = new Float32Array(dotCount * 3);
    const dotColors = new Float32Array(dotCount * 3);
    const goldBright = new THREE.Color('#F3D068');
    const goldMid = new THREE.Color('#D4AF37');
    const goldDark = new THREE.Color('#6B531E');

    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;

      const x = GLOBE_RADIUS * Math.cos(theta) * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);
      const z = GLOBE_RADIUS * Math.cos(phi);

      dotPositions[i * 3] = x;
      dotPositions[i * 3 + 1] = y;
      dotPositions[i * 3 + 2] = z;

      const rand = Math.random();
      const c = rand > 0.75 ? goldBright : rand > 0.35 ? goldMid : goldDark;
      dotColors[i * 3] = c.r;
      dotColors[i * 3 + 1] = c.g;
      dotColors[i * 3 + 2] = c.b;
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const dotsMesh = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(dotsMesh);

    // Subtle Latitude Accent Rings
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x8a6e26,
      transparent: true,
      opacity: 0.25
    });

    [-35, 0, 35].forEach(lat => {
      const r = GLOBE_RADIUS * Math.cos((lat * Math.PI) / 180);
      const y = GLOBE_RADIUS * Math.sin((lat * Math.PI) / 180);
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= 48; s++) {
        const a = (s / 48) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      globeGroup.add(new THREE.Line(geom, ringMat));
    });

    // Glowing Financial Nodes
    const nodeCoords = [
      { lat: 51.5, lng: -0.1 },  // London
      { lat: 40.7, lng: -74.0 }, // New York
      { lat: 35.7, lng: 139.7 }, // Tokyo
      { lat: 25.2, lng: 55.3 },  // Dubai
      { lat: 1.3, lng: 103.8 }   // Singapore
    ];

    nodeCoords.forEach(node => {
      const phi = (90 - node.lat) * (Math.PI / 180);
      const theta = (node.lng + 180) * (Math.PI / 180);
      const x = -(GLOBE_RADIUS * 1.01 * Math.sin(phi) * Math.cos(theta));
      const z = GLOBE_RADIUS * 1.01 * Math.sin(phi) * Math.sin(theta);
      const y = GLOBE_RADIUS * 1.01 * Math.cos(phi);

      const nodeG = new THREE.SphereGeometry(0.1, 12, 12);
      const nodeM = new THREE.MeshBasicMaterial({ color: 0xffe28a });
      const m = new THREE.Mesh(nodeG, nodeM);
      m.position.set(x, y, z);
      globeGroup.add(m);

      const haloG = new THREE.RingGeometry(0.12, 0.24, 16);
      const haloM = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const halo = new THREE.Mesh(haloG, haloM);
      halo.position.set(x, y, z);
      halo.lookAt(x * 2, y * 2, z * 2);
      globeGroup.add(halo);
    });

    // Interaction & Touch handling
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotY = -0.4;
    let rotX = 0.2;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotY += dx * 0.006;
      rotX += dy * 0.006;
      rotX = Math.max(-0.6, Math.min(0.6, rotX));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
      rotY += dx * 0.006;
      rotX += dy * 0.006;
      rotX = Math.max(-0.6, Math.min(0.6, rotX));
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        rotY += 0.0022;
      }
      globeGroup.rotation.y += (rotY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (rotX - globeGroup.rotation.x) * 0.08;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto"
      title="Rotate 3D Financial Globe"
    />
  );
};
