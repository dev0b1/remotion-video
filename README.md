# exroast-video

Minimal Remotion scaffold to turn audio files into videos with a waveform + title.

Quick start (Windows bash - `bash.exe`):

1. Install dependencies:

```bash
cd "c:/Users/ELISHA/Documents/development/exroast-video"
npm install
```

2. Add your audio file at `public/audio/sample.mp3` (or update `defaultProps` in `src/index.tsx`).

3. Preview (interactive):

```bash
npx remotion preview
```

4. Render an MP4 (example):

```bash
npx remotion render src/Video.tsx out/video.mp4 --codec h264
```

Notes & next steps:
- The waveform is currently procedural (placeholder). For accurate audio-reactive visuals, we can add WebAudio analysis (in the browser/worker) or use Remotion's audio APIs and precomputed analysis data.
- Choose TypeScript or plain JS. Current files are `.tsx` and work with Remotion's default TypeScript tooling; if you prefer plain JS I'll convert them.
- To change duration/fps/aspect, edit the `Composition` in `src/index.tsx`.
# remotion-video
