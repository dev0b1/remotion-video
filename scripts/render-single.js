const path = require('path');
const fs = require('fs');
const { renderVideo } = require('../src/renderVideo');

(async () => {
  const arg = process.argv[2] || 'song.mp3';
  const audioFile = arg;
  const audioPath = path.join(process.cwd(), 'public', 'audio', audioFile);
  const textPath = path.join(process.cwd(), 'public', 'text', audioFile + '.json');
  const textEvents = fs.existsSync(textPath) ? JSON.parse(fs.readFileSync(textPath, 'utf8')) : [];
  const out = path.join(process.cwd(), 'output', audioFile.replace(/\.mp3$/i, '.mp4'));

  try {
    console.log('Starting single render:', audioPath);
    await renderVideo(audioPath, textEvents, out, { preset: 'neon' });
    console.log('Done — output:', out);
  } catch (err) {
    console.error('Render error:', err);
    process.exit(1);
  }
})();
