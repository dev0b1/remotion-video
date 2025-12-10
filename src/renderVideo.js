const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
// Note: we use `initAudioMotionPreset` directly below from the visualizer module.
const { drawPopupText } = require('./visualizer/textOverlay');
const { loadAudioBuffer } = require('./utils/loadAudioBuffer');

async function renderVideo(audioPath, textEvents = [], outputPath, opts = {}) {
  const fps = opts.fps || 30;
  const width = opts.width || 1080;
  const height = opts.height || 1080;

  if (!fs.existsSync(audioPath)) throw new Error('Audio file not found: ' + audioPath);

  console.log(`Rendering ${path.basename(audioPath)} → ${outputPath} (${width}x${height}@${fps}fps)`);

  const preset = (opts.preset || 'neon');
  const { canvas, ctx, audioMotion } = require('./visualizer/audioMotionSetup').initAudioMotionPreset(preset, width, height, opts.presetOptions || {});
  const audioBuffer = await loadAudioBuffer(audioPath);
  const duration = audioBuffer.duration || 0;
  const totalFrames = Math.max(1, Math.floor(duration * fps));

  // Ensure canvas/context exist — this project requires `canvas` and `audiomotion-analyzer`.
  if (!canvas || !ctx) {
    throw new Error('node-canvas is not available. Install native dependencies and run `npm install` (see README).');
  }

  // spawn ffmpeg to accept raw frames from stdin
  const ffmpegArgs = [
    '-y',
    '-f', 'rawvideo',
    '-pix_fmt', 'rgba',
    '-s', `${width}x${height}`,
    '-r', String(fps),
    '-i', 'pipe:0',
    '-i', audioPath,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-shortest',
    outputPath,
  ];

  const ff = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  ff.on('error', (err) => {
    console.error('ffmpeg spawn error:', err);
  });

  try {
    for (let f = 0; f < totalFrames; f++) {
      const t = f / fps;
      // update AudioMotion / visualizer time
      try { if (audioMotion && typeof audioMotion.setTime === 'function') audioMotion.setTime(t); } catch (e) {}

      // clear frame
      ctx.clearRect(0, 0, width, height);

      // draw visualizer
      try { if (audioMotion && typeof audioMotion.draw === 'function') audioMotion.draw(); } catch (e) {}

      // CPU-safe glow: shadow + color cycling
      try {
        const glowColors = opts.glowColors || ['#ff00ff', '#00ffff', '#8a2be2', '#ff0080'];
        const colorIndex = Math.floor((t * 1.5) % glowColors.length);
        ctx.shadowBlur = opts.shadowBlur || 30;
        ctx.shadowColor = glowColors[colorIndex];
      } catch (e) {}

      // draw popup text
      try { drawPopupText(ctx, textEvents, t, { width, height }); } catch (e) {}

      // write raw RGBA buffer
      const buffer = canvas.toBuffer('raw');
      ff.stdin.write(buffer);

      if (f % Math.max(1, Math.floor(totalFrames / 10)) === 0) {
        process.stdout.write(`\rRendering ${Math.round((f / totalFrames) * 100)}%`);
      }
    }

    // close stdin to let ffmpeg finish
    ff.stdin.end();

    await new Promise((resolve, reject) => {
      ff.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('ffmpeg exited with code ' + code));
      });
    });

    console.log('\nRender complete:', outputPath);
  } catch (err) {
    console.error('Render failed:', err);
    try { ff.stdin.end(); } catch (e) {}
    throw err;
  }
}

module.exports = { renderVideo };
