const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('ffmpeg-static'));

const folderPath = path.join(require('os').homedir(), 'Documents', 'premium_songs');
const outputFolder = path.join(require('os').homedir(), 'Documents', 'premium_videos');

// ======== HELPER: generate dynamic hook text ========
function makeHookText(filename) {
  if (filename.toLowerCase().startsWith("glowup")) {
    return `AI GLOWED ME UP`;
  }
  return `AI COOKED MY TOXIC EX`;
}

// ======== HELPER: background color per mode ========
function getBackgroundColor(filename) {
  if (filename.toLowerCase().startsWith("glowup")) {
    return "#001928";
  }
  return "#04000A";
}

// ======== HELPER: color palette based on mode ========
function getSpectrumColors(filename) {
  if (filename.toLowerCase().startsWith("glowup")) {
    return "cyan|blue";
  }
  return "violet|magenta";
}

// ======== START SCRIPT ========

console.log('Starting conversion…\n');

if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

let mp3Files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp3')).sort();

// ===== TEST WITH FIRST 5 ONLY =====
mp3Files = mp3Files.slice(0, 5);
// ===================================

let completed = 0;
let startTime = Date.now();

function processNext() {
  if (mp3Files.length === 0) {
    const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);
    console.log(`\n🔥🔥🔥 ALL ${completed} SONGS CONVERTED SUCCESSFULLY! 🔥🔥🔥`);
    console.log(`Total processing time: ${totalTime} minutes`);
    console.log('Maximum viral potential UNLOCKED! 🚀');
    return;
  }

  const file = mp3Files.shift();
  const inputPath = path.join(folderPath, file);
  const outputPath = path.join(outputFolder, file.replace('.mp3', '.mp4'));

  const hookText = makeHookText(file);
  const bgColor = getBackgroundColor(file);
  const spectrumColors = getSpectrumColors(file);

  completed++;
  
  const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
  const avgTimePerVideo = completed > 1 ? elapsedMinutes / (completed - 1) : 3;
  const estimatedRemaining = Math.round(avgTimePerVideo * (5 - completed));

  console.log(`\n[${completed}/5] Converting: ${file}`);
  console.log(`Elapsed: ${Math.round(elapsedMinutes)} min | Estimated remaining: ${estimatedRemaining} min`);

  ffmpeg(inputPath)
    .setStartTime(0)
    .setDuration(60)
    .complexFilter([

      // 1. Background auto color
      `color=c=${bgColor}:s=1080x1920:d=60[bg];` +

      // 2. Circular spectrum (REMOVED geq and vignette)
      `[0:a]showspectrum=s=1000x1000:mode=combined:color=${spectrumColors}:scale=log:fscale=log:legend=0[spectrum];` +
      
      // 3. Enhanced glow with multiple blur layers
      '[spectrum]split[spec1][spec2];' +
      '[spec2]boxblur=25:5[spec_blur1];' +
      '[spec_blur1]boxblur=15:3[spec_glow];' +

      // 4. Circle mask
      'color=c=black@0:s=1000x1000[maskbase];' +
      '[maskbase]drawbox=x=0:y=0:w=1000:h=1000:color=white@1:t=fill,format=rgba[mask];' +
      '[spec_glow][mask]alphamerge[circle_blur];' +
      '[spec1][mask]alphamerge[circle_sharp];' +

      // 5. Outer glow ring
      '[circle_blur]boxblur=20,scale=1200:-1[glowring];' +

      // 6. Layer everything: bg + glow + sharp circle
      '[bg][glowring]overlay=(W-w)/2:(H-h)/2[tmp1];' +
      '[tmp1][circle_sharp]overlay=(W-w)/2:(H-h)/2[tmp2];' +

      // 7. Inner dark circle for logo
      '[tmp2]drawbox=x=(W/2-260):y=(H/2-260):w=520:h=520:color=black@0.6:t=fill[tmp3];' +

      // 8. PULSING LOGO
      `[tmp3]drawtext=fontfile=C\\:/Windows/Fonts/arialbd.ttf:text="exroast.buzz":fontsize=96:fontcolor=#FFD700:` +
      `x=(w-text_w)/2:y=(h-text_h)/2:` +
      `shadowcolor=black:shadowx=4:shadowy=4:borderw=3:bordercolor=black[logo_static];` +

      // Pulse animation
      `[logo_static]scale='iw*(1+0.08*sin(PI*t))':'ih*(1+0.08*sin(PI*t))'[logo_pulse];` +
      `[tmp3][logo_pulse]overlay=(W-w)/2:(H-h)/2:format=auto[tmp4];` +

      // 9. Top dynamic hook text
      `[tmp4]drawtext=fontfile=C\\:/Windows/Fonts/arialbd.ttf:text='${hookText}':` +
      `fontsize=85:fontcolor=#FFFFFF:` +
      `x=(w-text_w)/2:y=120:` +
      `shadowcolor=#FF2CA8:shadowx=4:shadowy=4[tmp5];` +

      // 10. Bottom reaction text
      `[tmp5]drawtext=fontfile=C\\:/Windows/Fonts/arial.ttf:text='This AI is too petty':` +
      `fontsize=48:fontcolor=#FFFFFF:` +
      `x=(w-text_w)/2:y=1680:` +
      `shadowcolor=black:shadowx=3:shadowy=3[final]`
    ])
    .outputOptions([
      '-map', '[final]',
      '-map', '0:a',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '25',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-t', '60',
      '-threads', '2'
    ])
    .on('progress', (progress) => {
      if (progress.percent) {
        process.stdout.write(`\rProgress: ${Math.round(progress.percent)}%`);
      }
    })
    .on('end', () => {
      console.log(`\n✓ DONE: ${path.basename(outputPath)}`);
      console.log(`   Saved to: ${outputPath}`);
      processNext();
    })
    .on('error', err => {
      console.error(`\n✗ ERROR: ${err.message}`);
      processNext();
    })
    .save(outputPath);
}

processNext();
