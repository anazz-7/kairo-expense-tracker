import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple script to generate SVG and PNG icon representations for PWA manifest
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="#006948"/>
  <circle cx="256" cy="256" r="180" fill="#00855d"/>
  <path d="M160 256 H352 M256 160 V352" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="48" fill="#85f8c4"/>
</svg>`;

const publicIconsDir = path.resolve('public', 'icons');
if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

fs.writeFileSync(path.join(publicIconsDir, 'icon.svg'), iconSvg);
console.log('Generated icon.svg successfully!');
