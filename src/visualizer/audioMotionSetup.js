let createCanvas = null;
let AudioMotion = null;
try {
  // lazy-require canvas (may not be installed on Windows without build tools)
  ({ createCanvas } = require('canvas'));
} catch (err) {
  createCanvas = null;
}

try {
  AudioMotion = require('audiomotion-analyzer');
} catch (err) {
  AudioMotion = null;
}

function _createCanvasAndCtx(width = 1080, height = 1080) {
  if (!createCanvas) {
    return { canvas: null, ctx: null };
  }
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

function _fallbackDrawNeonRing(ctx, width, height, t) {
  // simple CPU-friendly neon ring approximation
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const baseR = Math.min(width, height) * 0.28;
  const bars = 64;

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const amp = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i * 0.3));
    const r1 = baseR;
    const r2 = baseR + amp * (Math.min(width, height) * 0.18);

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.strokeStyle = `rgba(${Math.floor(200 + 55 * Math.sin(i))},${Math.floor(50 + 200 * Math.abs(Math.cos(i)))},${Math.floor(200 + 55 * Math.cos(i))},0.95)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function _fallbackDrawGlowBars(ctx, width, height, t) {
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const bars = 48;
  const radius = Math.min(width, height) * 0.35;

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const amp = 0.3 + 0.7 * Math.abs(Math.sin(t * 3 + i * 0.25));
    const w = Math.max(2, Math.floor((Math.sin(i) + 1.5) * 2));
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * (radius - amp * 40), cy + Math.sin(angle) * (radius - amp * 40));
    ctx.lineTo(cx + Math.cos(angle) * (radius + amp * 100), cy + Math.sin(angle) * (radius + amp * 100));
    ctx.strokeStyle = `rgba(${Math.floor(255 * amp)},${Math.floor(120 * (1 - amp))},${Math.floor(200 * (amp))},0.9)`;
    ctx.lineWidth = w;
    ctx.stroke();
  }
  ctx.restore();
}

function _fallbackDrawPulseAura(ctx, width, height, t) {
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.4;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);

  // glow circle
  const grd = ctx.createRadialGradient(cx, cy, maxR * 0.1, cx, cy, maxR);
  grd.addColorStop(0, `rgba(0,255,255,${0.12 * pulse})`);
  grd.addColorStop(0.5, `rgba(138,43,226,${0.08 * pulse})`);
  grd.addColorStop(1, `rgba(255,0,225,0)`);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * (0.6 + 0.4 * pulse), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function initAudioMotionPreset(presetName = 'neon', width = 1080, height = 1080, opts = {}) {
  const { canvas, ctx } = _createCanvasAndCtx(width, height);

  let audioMotion = null;
  if (AudioMotion) {
    try {
      const common = {
        canvas,
        showScaleY: false,
        frequencyScale: 'log',
      };

      if (presetName === 'neon') {
        audioMotion = new AudioMotion(null, Object.assign(common, {
          mode: 10,
          smoothing: 0.7,
          radius: 0.6,
          lineWidth: 2,
          gradient: 'prism'
        }, opts));
      } else if (presetName === 'glow') {
        audioMotion = new AudioMotion(null, Object.assign(common, {
          mode: 4,
          smoothing: 0.65,
          radius: 0.45,
          lineWidth: 4,
          fillAlpha: 0.8,
          gradient: 'rainbow'
        }, opts));
      } else if (presetName === 'pulse') {
        audioMotion = new AudioMotion(null, Object.assign(common, {
          mode: 2,
          smoothing: 0.45,
          radius: 0.4,
          lineWidth: 2,
          gradient: 'prism'
        }, opts));
      }
    } catch (e) {
      audioMotion = null;
    }
  }

  // Provide fallback draw function when AudioMotion isn't available
  if (!audioMotion) {
    audioMotion = {
      setTime: (t) => { audioMotion._t = t; },
      draw: () => {
        const t = audioMotion._t || 0;
        if (presetName === 'neon') _fallbackDrawNeonRing(ctx, width, height, t);
        else if (presetName === 'glow') _fallbackDrawGlowBars(ctx, width, height, t);
        else _fallbackDrawPulseAura(ctx, width, height, t);
      }
    };
  }

  return { canvas, ctx, audioMotion };
}

module.exports = { initAudioMotionPreset };
