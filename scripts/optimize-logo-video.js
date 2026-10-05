const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcVideo = path.join(__dirname, '..', 'public', 'brand', 'indi-brand-reveal.mp4');
const outDir = path.join(__dirname, '..', 'public', 'brand');

console.log('--- Optimizando video corporativo para uso como logotipo web ---');

// 1. Versión 1:1 Cuadrada (crop centrado 1080x1080 -> 320x320)
// 1920 - 1080 = 840 / 2 = 420 (offset x centrado)
const mp4Square = path.join(outDir, 'indi-logo-animated.mp4');
const webmSquare = path.join(outDir, 'indi-logo-animated.webm');

console.log('1. Generando MP4 1:1 para logo...');
execSync(`ffmpeg -y -i "${srcVideo}" -vf "crop=1080:1080:420:0,scale=320:320" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -an -movflags +faststart "${mp4Square}"`, { stdio: 'inherit' });

console.log('2. Generando WebM 1:1 VP9 para logo...');
execSync(`ffmpeg -y -i "${srcVideo}" -vf "crop=1080:1080:420:0,scale=320:320" -c:v libvpx-vp9 -b:v 0 -crf 32 -an "${webmSquare}"`, { stdio: 'inherit' });

// 3. Versión 16:9 Horizontal (para variantes alargadas o lockup si se desea)
const mp4Wide = path.join(outDir, 'indi-logo-wide-animated.mp4');
console.log('3. Generando MP4 16:9 optimizado (640x360 sin audio)...');
execSync(`ffmpeg -y -i "${srcVideo}" -vf "scale=640:360" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -an -movflags +faststart "${mp4Wide}"`, { stdio: 'inherit' });

const statMp4Square = fs.statSync(mp4Square);
const statWebmSquare = fs.statSync(webmSquare);
const statMp4Wide = fs.statSync(mp4Wide);

console.log('\n--- Resultados de Compresión de Video para Logo ---');
console.log(`- indi-logo-animated.mp4 (320x320 1:1): ${(statMp4Square.size / 1024).toFixed(1)} KB`);
console.log(`- indi-logo-animated.webm (320x320 1:1 VP9): ${(statWebmSquare.size / 1024).toFixed(1)} KB`);
console.log(`- indi-logo-wide-animated.mp4 (640x360 16:9): ${(statMp4Wide.size / 1024).toFixed(1)} KB`);
console.log('Optimización completada con éxito.');
