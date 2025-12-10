const fs = require('fs');
const path = require('path');
const { renderVideo } = require('./renderVideo');

async function processBatch() {
  const folder = path.join(process.cwd(), 'public', 'audio');
  const textFolder = path.join(process.cwd(), 'public', 'text');
  const outDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(folder)) {
    console.error('No audio folder found at', folder);
    process.exit(1);
  }

  const files = fs.readdirSync(folder).filter((f) => f.toLowerCase().endsWith('.mp3'));
  for (const file of files) {
    const audioPath = path.join(folder, file);
    const textPath = path.join(textFolder, file + '.json');
    let textEvents = [];
    if (fs.existsSync(textPath)) {
      try { textEvents = JSON.parse(fs.readFileSync(textPath, 'utf8')); } catch (e) { console.warn('Invalid JSON for', textPath); }
    }

    const outputPath = path.join(outDir, file.replace(/\.mp3$/i, '.mp4'));
    console.log('Rendering:', file);
    try {
      await renderVideo(audioPath, textEvents, outputPath, { fps: 30, width: 1080, height: 1080 });
    } catch (err) {
      console.error('Failed to render', file, err.message);
      // continue with next file
    }
  }

  console.log('Batch complete.');
}

if (require.main === module) {
  processBatch();
}

module.exports = { processBatch };
