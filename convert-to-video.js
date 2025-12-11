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

  // 1. Background
  `color=c=${bgColor}:s=1080x1920:r=30:d=60[bg];` +

  // 2. Audio → circular spectrum + insane glow
  `[0:a]showspectrum=s=1080x1080:mode=combined:color=intensity:scale=cbrt:orientation=vertical:saturation=2[spec];` +
  '[spec]split=3[spec1][spec2][spec3];' +
  '[spec2]gblur=sigma=30[spec_glow1];' +
  '[spec3]gblur=sigma=60[spec_glow2];' +
  '[spec_glow1]hue=s=2.5[spec_neon];' +

  // 3. Circular mask
  'color=c=black:s=1080x1080[maskbase];' +
  '[maskbase]drawbox=x=0:y=0:w=1080:h=1080:c=white@1:t=fill,format=alpha[mask];' +
  '[spec_neon][mask]alphamerge[spec_circle];' +
  '[spec1][mask]alphamerge=inputs=2[spec_sharp];' +

  // 4. Outer neon ring + inner dark hole
  '[bg][spec_glow2]overlay=(W-w)/2:(H-h)/2:format=auto[bg1];' +
  '[bg1][spec_circle]overlay=(W-w)/2:(H-h)/2[bg2];' +
  '[bg2][spec_sharp]overlay=(W-w)/2:(H-h)/2[bg3];' +
  '[bg3]drawbox=x=(w/2-280):y=(h/2-280):w=560:h=560:c=black@0.85:t=fill[bg4];' +

  // 5. PULSING LOGO
  `[bg4]drawtext=text='exroast.buzz':fontfile='C\\:/Windows/Fonts/impact.ttf':` +
  `fontsize=96:fontcolor=#FF00E0:x=(w-text_w)/2:y=(h-text_h)/2+sin(t*3)*10:` +
  `shadowcolor=#000:shadowx=5:shadowy=5:borderw=4:bordercolor=#00FFFF,scale='iw*(1+0.12*sin(t*PI*2))':'ih*(1+0.12*sin(t*PI*2))'[main];` +

  // 6. 0–3s HOOK EXPLOSION (massive zoom + flash)
  `[main]split=2[main][hookbase];` +
  `[hookbase]drawtext=text='${hookText}':fontfile='C\\:/Windows/Fonts/impact.ttf':fontsize=180:fontcolor=white:` +
  `x='if(lt(t,3),(w-text_w)/2,10000)':y='if(lt(t,3),h/2-text_h/2 + (sin(t*12)*80),10000)':` +
  `enable='lt(t,3.3)':shadowcolor=#FF0099:shadowx=8:shadowy=8,zoompan=z='if(lte(t,3),4+sin(t*8)*0.5,1)':d=1:s=1080x1920[hook];` +
  `[hook]drawbox=t=fill:c=white@1:enable='between(t,0.9,1.0)+between(t,2.1,2.2)':x=0:y=0:w=w:h=h[hook_flash];` +

  // 7. LYRICS (top, big, synced, with emojis)
  `[hook_flash]drawtext=text='She left me for his best friend':fontfile='C\\:/Windows/Fonts/impact.ttf':` +
  `fontsize=88:fontcolor=white:x=(w-text_w)/2:y=180:enable='gte(t,4.5)*lt(t,9)':` +
  `shadowcolor=#FF0099:shadowx=6:shadowy=6[ly1];` +
  `[ly1]drawtext=text='Now he’s broke and lonely':fontsize=88:fontcolor=white:x=(w-text_w)/2:y=180:enable='gte(t,9.2)*lt(t,14)':shadowcolor=#FF0099:shadowx=6:shadowy=6[ly2];` +
  `[ly2]drawtext=text='This AI ended him':fontsize=88:fontcolor=white:x=(w-text_w)/2:y=180:enable='gte(t,14.5)*lt(t,20)':shadowcolor=#FF0099:shadowx=6:shadowy=6[ly3];` +
  `[ly3]drawtext=text='exroast.buzz':fontsize=88:fontcolor=#00FFFF:x=(w-text_w)/2:y=180:enable='gte(t,21)'[ly_final];` +

  // 8. SAVAGE CAPTION CARD (bottom, pop-in + pulse)
  `[ly_final]drawtext=text='This AI is TOO petty':fontfile='C\\:/Windows/Fonts/impact.ttf':` +
  `fontsize=64:fontcolor=white:x=(w-text_w)/2:y=h-260:enable='gte(t,5)':` +
  `shadowcolor=#FF0099:shadowx=5:shadowy=5,format=rgba,drawbox=x=iw/2-300:y=oh-100:w=600:h=90:c=#330044@0.9:t=fill:enable='gte(t,5)',` +
  
  `scale='if(gte(t,5),iw*(1+0.08*sin(t*8)),iw)':'if(gte(t,5),ih*(1+0.08*sin(t*8)),ih)':enable='gte(t,5)'[caption1];` +

  // Rotate savage text every ~7.5s
  `[caption1]drawtext=text='He’s crying in the DMs':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=h-260:enable='gte(t,12.5)*lt(t,20)':shadowcolor=#FF0099:shadowx=5:shadowy=5[caption2];` +
  `[caption2]drawtext=text='Tag your toxic ex':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=h-260:enable='gte(t,20)*lt(t,27.5)':shadowcolor=#FF0099:shadowx=5:shadowy=5[caption3];` +
  `[caption3]drawtext=text='Karma used AI':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=h-260:enable='gte(t,27.5)'[final]`

    ])
    .outputOptions([
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '23',
      '-b:a', '128k',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-t', '60'
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
