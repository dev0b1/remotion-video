const ffmpeg = require('fluent-ffmpeg');

// Returns a Promise resolving to { duration }
function loadAudioBuffer(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const format = metadata.format || {};
      resolve({ duration: Number(format.duration || 0) });
    });
  });
}

module.exports = { loadAudioBuffer };
