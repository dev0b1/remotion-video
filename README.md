
# exroast-video — Headless ffmpeg + Canvas pipeline

This repo was migrated away from Remotion to a headless Node.js pipeline that:

- Renders audio-reactive visuals using `audiomotion-analyzer` + `node-canvas`.
- Draws pop-in/pop-out text overlays on the canvas.
- Pipes raw frames into `ffmpeg` to produce MP4s with the original audio.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Place MP3s in `assets/audio/` and optional per-song text JSON in `assets/text/<song.mp3>.json`.

3. Run a batch render:

```bash
npm run render-batch
```

Files of interest

- `src/processBatch.js` — batch runner that renders `assets/audio/*.mp3` → `output/*.mp4`.
- `src/renderVideo.js` — frame-by-frame renderer that draws the visualizer and overlays.
- `src/visualizer/*` — visualization and text overlay helpers.

If you want the old Remotion files restored, tell me and I can undo the migration. Otherwise the repo is now set up for headless rendering.
