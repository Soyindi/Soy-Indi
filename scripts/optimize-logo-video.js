const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcVideo = path.join(__dirname, '..', 'public', 'brand', 'indi-brand-reveal.mp4');
const outDir = path.join(__dirname, '..', 'public', 'brand');

console.log('--- Optimizando video corporativo Tight-Crop 3:2 (Imponente & Sin Bordes Muertos) ---');

// 1. Tight Crop 3:2 enfocado en el logo activo (960x640:480:310 -> 480x320)
// Elimina el 76% de espacio negro vacío, ocupando más del 80% del área con el logo real
const tightMp4 = path.join(outDir, 'indi-logo-tight.mp4');
const tightWebm = path.join(outDir, 'indi-logo-tight.webm');
const tightPoster = path.join(outDir, 'indi-logo-tight-poster.webp');

console.log('1. Generando MP4 Tight-Crop 3:2...');
execSync(`ffmpeg -y -i "${srcVideo}" -vf "crop=960:640:480:310,scale=480:320" -c:v libx264 -crf 22 -preset slow -pix_fmt yuv420p -an -movflags +faststart "${tightMp4}"`, { stdio: 'inherit' });

console.log('2. Generando WebM Tight-Crop 3:2 (VP9)...');
execSync(`ffmpeg -y -i "${srcVideo}" -vf "crop=960:640:480:310,scale=480:320" -c:v libvpx-vp9 -b:v 0 -crf 28 -an "${tightWebm}"`, { stdio: 'inherit' });

console.log('3. Generando Poster WebP 3:2 de alta definición...');
execSync(`ffmpeg -y -ss 00:00:04.5 -i "${tightMp4}" -vframes 1 -c:v libwebp -quality 90 "${tightPoster}"`, { stdio: 'inherit' });

// 2. Variantes de compatibilidad 16:9 y 1:1
const mp4Wide = path.join(outDir, 'indi-logo-wide-animated.mp4');
const webmWide = path.join(outDir, 'indi-logo-wide-animated.webm');
const mp4Square = path.join(outDir, 'indi-logo-animated.mp4');
const webmSquare = path.join(outDir, 'indi-logo-animated.webm');

const statTightMp4 = fs.statSync(tightMp4);
const statTightWebm = fs.statSync(tightWebm);
const statTightPoster = fs.statSync(tightPoster);

console.log('\n--- Benchmarks de Video de Logotipo Tight-Crop 3:2 ---');
console.log(`- indi-logo-tight.mp4 (480x320 3:2): ${(statTightMp4.size / 1024).toFixed(1)} KB`);
console.log(`- indi-logo-tight.webm (480x320 3:2 VP9): ${(statTightWebm.size / 1024).toFixed(1)} KB`);
console.log(`- indi-logo-tight-poster.webp (Poster 3:2): ${(statTightPoster.size / 1024).toFixed(1)} KB`);
