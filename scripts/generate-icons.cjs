const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/icon.svg'));

  // 1. 32x32 Favicon PNG
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFile(path.join(__dirname, '../public/favicon-32x32.png'));

  // 2. 180x180 Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

  // 3. 192x192 PWA Icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .toFile(path.join(__dirname, '../public/pwa-192x192.png'));

  // 4. 512x512 PWA Icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .toFile(path.join(__dirname, '../public/pwa-512x512.png'));

  // 5. 512x512 Maskable Icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .toFile(path.join(__dirname, '../public/pwa-maskable-512x512.png'));

  // 6. Open Graph 1200x630 Social Card image
  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <rect width="1200" height="630" fill="#050608" />
    <circle cx="600" cy="315" r="300" fill="#d4af37" opacity="0.08" filter="blur(80px)"/>
    <rect x="50" y="50" width="1100" height="530" rx="24" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.3"/>
    
    <!-- Gold Icon Emblem on Left -->
    <g transform="translate(140, 165) scale(0.6)">
      ${svgBuffer.toString().replace(/<\?xml.*?\?>/g, '')}
    </g>

    <!-- Text Branding on Right -->
    <text x="500" y="270" font-family="serif" font-size="64" font-weight="900" fill="#fde68a" letter-spacing="4">AURUM TERMINAL</text>
    <text x="500" y="330" font-family="sans-serif" font-size="24" font-weight="700" fill="#d4af37" letter-spacing="6">INSTITUTIONAL MARKET INTELLIGENCE</text>
    <text x="500" y="380" font-family="sans-serif" font-size="18" fill="#a1a1aa">Real-Time AI Signals · Sub-12ms Tick Feeds · Risk Engine</text>
    <rect x="500" y="420" width="220" height="40" rx="8" fill="#10b981" opacity="0.2" stroke="#10b981" stroke-width="1"/>
    <text x="610" y="445" font-family="sans-serif" font-size="14" font-weight="700" fill="#34d399" text-anchor="middle">LIVE MARKET STREAM</text>
  </svg>
  `;

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(path.join(__dirname, '../public/og-image.png'));

  console.log('[ICON GEN] All PNG and OpenGraph icons generated successfully!');
}

generate().catch(err => {
  console.error('[ICON GEN] Error generating icons:', err);
  process.exit(1);
});
