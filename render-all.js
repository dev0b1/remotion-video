const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Allow overriding the songs and output directories with env vars for CI/Codespaces
// If the repo already contains `public/audio/*.mp3`, prefer that (convenient for small test runs).
const repoAudioDir = path.join(__dirname, 'public', 'audio');
const defaultDocsDir = path.join(os.homedir(), 'Documents', 'premium_songs');
let songsFolder = process.env.SONGS_FOLDER || defaultDocsDir;

// In Codespaces / CI we prefer repo `public/audio` when it exists — it's where you placed MP3s.
if (fs.existsSync(repoAudioDir)) {
  songsFolder = repoAudioDir;
  console.log(`Using repository audio folder as songs source: ${songsFolder}`);
}
// Save rendered videos inside the repository workspace so Codespaces can access/download them.
const outputFolder = path.join(__dirname, 'out');

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Pick songs folder: prefer explicit SONGS_FOLDER, otherwise require repo `public/audio`.
let songs = [];
let chosen = null;
if (process.env.SONGS_FOLDER) {
  // If user explicitly set SONGS_FOLDER, respect it.
  try {
    if (fs.existsSync(process.env.SONGS_FOLDER)) {
      const found = fs.readdirSync(process.env.SONGS_FOLDER).filter((f) => f.toLowerCase().endsWith('.mp3'));
      if (found.length > 0) {
        songs = found.sort();
        chosen = process.env.SONGS_FOLDER;
      }
    }
  } catch (e) {
    // fall through to repo audio
  }
}

if (!chosen) {
  // Require repo public/audio to exist with MP3s when SONGS_FOLDER not provided.
  if (fs.existsSync(repoAudioDir)) {
    const found = fs.readdirSync(repoAudioDir).filter((f) => f.toLowerCase().endsWith('.mp3'));
    if (found.length > 0) {
      songs = found.sort();
      chosen = repoAudioDir;
    }
  }
}

if (!chosen) {
  console.error('\nNo MP3 files found.');
  console.error('Put your .mp3 files into `public/audio` inside the repository, or set the SONGS_FOLDER environment variable to point to a folder with MP3s.');
  process.exit(1);
}

console.log(`Using songs folder: ${chosen} — ${songs.length} mp3(s) found`);

// Optional metadata CSV next to the songs folder: songs.csv
// Format: filename,hookText,bgColor,lyrics
// where `lyrics` is a JSON-encoded array of {start,text} lines.
const metaPath = path.join(songsFolder, 'songs.csv');
let metadata = {};
if (fs.existsSync(metaPath)) {
  try {
    const csv = fs.readFileSync(metaPath, 'utf8');
    const lines = csv.split(/\r?\n/).filter(Boolean);
    // optional header detection
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',');
      if (parts.length < 1) continue;
      // If there's a header row, skip rows that match header names
      if (i === 0 && /filename/i.test(parts[0]) && (parts[1] || '').toLowerCase().includes('hook')) continue;
      const filename = parts[0].trim();
      const hookText = (parts[1] || '').trim() || undefined;
      const bgColor = (parts[2] || '').trim() || undefined;
      const lyricsRaw = parts.slice(3).join(',').trim();
      let lyrics = undefined;
      if (lyricsRaw) {
        try {
          lyrics = JSON.parse(lyricsRaw);
        } catch (e) {
          // If plain text, keep as single-line lyric at 4s
          lyrics = [{ start: 4.0, text: lyricsRaw.replace(/^"|"$/g, '') }];
        }
      }
      metadata[filename] = { hookText, bgColor, lyrics };
    }
    console.log('Loaded metadata for', Object.keys(metadata).length, 'songs from songs.csv');
  } catch (err) {
    console.warn('Failed to parse songs.csv — continuing without metadata', err.message);
  }
}

// Support limiting with env var BATCH_LIMIT (useful for testing)
const limit = process.env.BATCH_LIMIT ? parseInt(process.env.BATCH_LIMIT, 10) : null;
if (limit && Number.isFinite(limit) && limit > 0) {
  songs = songs.slice(0, limit);
}

(async () => {
  console.log('🔥 Starting batch render...\n');
  const startTime = Date.now();
  
  // Filter out songs that already have an MP4 in the output folder so we can safely
  // run batches repeatedly. You can control batch size with `BATCH_SIZE` env var.
  const pending = songs.filter((s) => !fs.existsSync(path.join(outputFolder, s.replace('.mp3', '.mp4'))));
  if (pending.length === 0) {
    console.log('No pending songs to render — all MP4s already exist.');
    process.exit(0);
  }

  const batchSize = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE, 10) : null;
  let batchSongs = pending;
  if (batchSize && Number.isFinite(batchSize) && batchSize > 0) {
    batchSongs = pending.slice(0, batchSize);
    console.log(`Processing batch of ${batchSongs.length} (of ${pending.length} pending)`);
  } else {
    console.log(`Processing all ${pending.length} pending songs`);
  }

  // Ensure `public/audio` contains only the songs we will process in this run so the
  // bundler can reference them without CORS issues.
  const publicAudioDir = path.join(__dirname, 'public', 'audio');
  if (!fs.existsSync(publicAudioDir)) {
    fs.mkdirSync(publicAudioDir, { recursive: true });
  }

  for (const song of batchSongs) {
    const src = path.join(songsFolder, song);
    const dest = path.join(publicAudioDir, song);
    try {
      if (!fs.existsSync(dest) || fs.statSync(src).mtimeMs > fs.statSync(dest).mtimeMs) {
        fs.copyFileSync(src, dest);
        console.log(`  Copied ${song} -> public/audio/`);
      }
    } catch (err) {
      console.warn(`  Failed to copy ${song}: ${err.message}`);
    }
  }

  const bundled = await bundle(path.join(__dirname, './src/index.tsx'));

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    
    // Defaults based on filename
    const defaultHook = song.toLowerCase().startsWith('glowup')
      ? 'AI GLOWED ME UP ✨'
      : 'AI COOKED MY TOXIC EX 💀';
    const defaultBg = song.toLowerCase().startsWith('glowup') ? '#001928' : '#04000A';

    // Merge metadata if present
    const meta = metadata[song] || {};
    const inputProps = {
      // use public-relative path so staticFile() inside the bundle works correctly
      audioFileName: `audio/${song}`,
      hookText: meta.hookText || defaultHook,
      bgColor: meta.bgColor || defaultBg,
      lyrics: meta.lyrics || undefined,
    };

    console.log(`[${i + 1}/${songs.length}] Rendering: ${song}`);

    const composition = await selectComposition({
      serveUrl: bundled,
      id: 'ExRoastVideo',
      inputProps,
    });

    const outPath = path.join(outputFolder, song.replace('.mp3', '.mp4'));
    // If an output file already exists, remove it so we always replace/overwrite
    if (fs.existsSync(outPath)) {
      try {
        fs.unlinkSync(outPath);
        console.log(`  ⚠️ Existing output removed: ${outPath}`);
      } catch (err) {
        console.warn(`  Failed to remove existing file ${outPath}: ${err.message}`);
      }
    }

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outPath,
      inputProps,
      onProgress: ({ progress }) => {
        process.stdout.write(`\r  Progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log(`\n  ✓ Done: ${song}\n`);
  }
  const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);
  console.log(`\n🔥🔥🔥 ALL ${songs.length} VIDEOS RENDERED! 🔥🔥🔥`);
  console.log(`Total time: ${totalTime} minutes`);
  console.log(`Videos saved to: ${outputFolder}`);
  // --------------------- Optional: 720p compression + zip ---------------------
  try {
    const ffmpegStatic = require('ffmpeg-static');
    const { execSync } = require('child_process');
    const AdmZip = require('adm-zip');

    console.log('\nStarting 720p compression for all videos...');

    const originalDir = outputFolder; // where remotion saved MP4s
    const resizedDir = path.join(outputFolder, 'resized-720p');
    const zipPath = path.join(outputFolder, 'all-videos-720p.zip');

    if (!fs.existsSync(resizedDir)) fs.mkdirSync(resizedDir, { recursive: true });

    const mp4s = fs.readdirSync(originalDir).filter((f) => f.toLowerCase().endsWith('.mp4'));
    for (const file of mp4s) {
      const inputPath = path.join(originalDir, file);
      const outName = file.replace(/\.mp4$/i, '_720p.mp4');
      const outputPath = path.join(resizedDir, outName);

      const ffmpegCmd = `"${ffmpegStatic}" -i "${inputPath}" -vf "scale=-2:720" -c:v libx264 -crf 23 -preset fast -c:a aac -b:a 128k -y "${outputPath}"`;

      console.log(`Compressing: ${file} → ${outName}`);
      execSync(ffmpegCmd, { stdio: 'inherit' });
    }

    console.log('Zipping all 720p videos...');
    const zip = new AdmZip();
    fs.readdirSync(resizedDir).forEach((f) => {
      zip.addLocalFile(path.join(resizedDir, f));
    });
    zip.writeZip(zipPath);

    console.log('DONE!');
    console.log('Zip:', zipPath);
    console.log(`Total size: ${(fs.statSync(zipPath).size / (1024 * 1024)).toFixed(1)} MB`);
  } catch (err) {
    console.warn('Skipping 720p compression: ', err.message);
  }

})();
