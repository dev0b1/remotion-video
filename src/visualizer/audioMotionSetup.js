const { createCanvas } = require('canvas');
let AudioMotion;
try {
  AudioMotion = require('audiomotion-analyzer');
} catch (e) {
  // audiomotion-analyzer may be an ESM-only package in some installs;
  // require will fail in that case — we'll still export a minimal stub.
  AudioMotion = null;
}

function initAudioMotion(width = 1080, height = 1080, opts = {}) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Try to initialize AudioMotion if available, otherwise provide a stub
  let audioMotion = null;
  if (AudioMotion) {
    try {
      // audiomotion-analyzer supports a constructor signature with options.
      // We pass `canvas` so it draws to our node-canvas instance.
      audioMotion = new AudioMotion(null, Object.assign({
        canvas,
        gradient: 'prism',
        mode: 10, // radial
        showScaleY: false,
        smoothing: 0.8,
        radius: 0.6,
        lineWidth: 2,
        frequencyScale: 'log',
      }, opts));
    } catch (err) {
      audioMotion = null;
    }
  }

  // Provide minimal API used by render loop
  if (!audioMotion) {
    audioMotion = {
      setTime: () => {},
      draw: () => {
        // simple fallback: draw a neutral background and a small bar
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#444';
        ctx.fillRect(Math.floor(width * 0.1), Math.floor(height * 0.45), Math.floor(width * 0.8), Math.floor(height * 0.1));
        ctx.restore();
      }
    };
  }

  return { canvas, ctx, audioMotion };
}

module.exports = { initAudioMotion };
