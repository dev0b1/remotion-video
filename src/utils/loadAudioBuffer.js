const ffmpeg = require('fluent-ffmpeg');

// Minimal helper that returns an object with audio duration (seconds).
// We keep the API shape simple so renderVideo can use `duration`.
function loadAudioBuffer(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const format = metadata.format || {};
      const duration = format.duration || 0;
      resolve({ duration: Number(duration) });
    });
  });
}

module.exports = { loadAudioBuffer };
