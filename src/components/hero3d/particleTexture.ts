import * as THREE from 'three';

let cachedTexture: THREE.Texture | null = null;

export function getParticleTexture(): THREE.Texture {
  if (cachedTexture) return cachedTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const center = 32;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 240, 200, 0.9)');
    gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
    gradient.addColorStop(0.8, 'rgba(217, 119, 6, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  cachedTexture = texture;
  return texture;
}
