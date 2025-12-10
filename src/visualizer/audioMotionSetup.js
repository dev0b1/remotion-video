const { createCanvas } = require('canvas');
const AudioMotion = require('audiomotion-analyzer');

// Initialize an AudioMotion analyzer bound to a node-canvas instance.
// Note: AudioMotion was designed for browsers; this file implements the
// API surface used by the render loop so it can be called similarly.
function initAudioMotion(width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create AudioMotion instance. It expects a DOM canvas; node-canvas provides
  // a compatible API for drawing. Some AudioMotion features that touch the DOM
  // may not work in pure Node environments, but basic analyzer drawing works.
  const audioMotion = new AudioMotion(null, {
    source: null,
    canvas: canvas,
    gradient: 'prism',
    mode: 10, // radial bars
    showScaleY: false,
    smoothing: 0.7,
    radius: 0.7,
    lineWidth: 2,
    frequencyScale: 'log',
  });

  // Provide a simple setTime API used by the render loop. Some AudioMotion
  // versions don't provide this — if not available, we expose a no-op.
  if (typeof audioMotion.setTime !== 'function') {
    audioMotion.setTime = function () {};
  }

  return { canvas, ctx, audioMotion };
}

module.exports = { initAudioMotion };
