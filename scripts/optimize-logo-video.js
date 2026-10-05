const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcVideo = path.join(__dirname, '..', 'public', 'brand', 'indi-brand-reveal.mp4');
const outDir = path.join(__dirname, '..', 'public', 'brand');

console.log('--- Optimizando video corporativo como logotipo imponente ---');

// 1. Versión Panorámica Imponente 16:9 (640x360 sin audio, faststart)
const mp4Wide = path.join(outDir, 'indi-logo-wide-animated.mp4');
const webmWide = path.join(outDir, 'indi-logo-wide-animated.webm');

console.log('1. Generando MP4 16:9 de alta definición para logo panorámico...');
execSync(`ffmpeg -y -i "${srcVideo}" -vf "scale=640:360" -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -an -movflags +faststart "${mp4Wide}"`, { stdio: 'inherit' });

console.log('2. Generando WebM 16:9 VP9 para logo panorámico...');
execSync(`ffmpeg -y -i "${srcVideo}" -vf "scale=640:360" -c:v libvpx-vp9 -b:v 0 -crf 30 -an "${webmWide}"`, { stdio: 'inherit' });

// 2. Poster instantáneo WebP de alta fidelidad desde el frame 5s (donde el logo brilla)
const posterWebp = path.join(outDir, 'indi-logo-video-poster.webp');
console.log('3. Generando poster WebP de alta definición...');
execSync(`ffmpeg -y -ss 00:00:04.5 -i "${mp4Wide}" -vframes 1 -c:v libwebp -quality 85 "${posterWebp}"`, { stdio: 'inherit' });

// 3. Versión 1:1 Cuadrada (crop centrado 1080x1080 -> 320x320)
const mp4Square = path.join(outDir, 'indi-logo-animated.mp4');
const webmSquare = path.join(outDir, 'indi-logo-animated.webm');
execSync(`ffmpeg -y -i "${srcVideo}" -vf "crop=1080:1080:420:0,scale=320:320" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -an -movflags +faststart "${mp4Square}"`, { stdio: 'inherit' });
execSync(`ffmpeg -y -i "${srcVideo}" -vf "crop=1080:1080:420:0,scale=320:320" -c:v libvpx-vp9 -b:v 0 -crf 32 -an "${webmSquare}"`, { stdio: 'inherit' });

const statMp4Wide = fs.statSync(mp4Wide);
const statWebmWide = fs.statSync(webmWide);
const statPoster = fs.statSync(posterWebp);

console.log('\n--- Benchmarks de Video de Logotipo Imponente ---');
console.log(`- indi-logo-wide-animated.mp4 (640x360 16:9): ${(statMp4Wide.size / 1024).toFixed(1)} KB`);
console.log(`- indi-logo-wide-animated.webm (640x360 16:9 VP9): ${(statWebmWide.size / 1024).toFixed(1)} KB`);
console.log(`- indi-logo-video-poster.webp (Poster 16:9): ${(statPoster.size / 1024).toFixed(1)} KB`);
