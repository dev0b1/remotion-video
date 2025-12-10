# Remotion Cloud — quick guide for this repo

This repository contains a Remotion project that renders vertical videos from audio files.
The repository includes helper scripts to create a bundle suitable for uploading to Remotion Cloud
and to generate per-song `inputProps` JSON files to speed up job creation.

Steps

1) Create the cloud bundle

```bash
# If you want to include your `public/audio` files inside the bundle (so you don't need external URLs):
INCLUDE_AUDIO=1 node scripts/bundle-and-zip.js

# Otherwise just run:
node scripts/bundle-and-zip.js
```

This creates `cloud-bundle.zip` in the repo root.

2) Generate per-song inputProps JSON files (optional but convenient)

```bash
node scripts/generate-inputprops.js
```

This writes JSON files to `scripts/inputprops/*.json`. Each file contains `inputProps` you can paste into the Remotion Cloud job creation UI.

3) Upload the bundle to Remotion Cloud

- Go to https://remotion.dev/cloud and sign in.
- Create a project and upload `cloud-bundle.zip`.
- After upload, select the `ExRoastVideo` composition and create jobs.

4) Using inputProps

- If your bundle included audio files, use `audioFileName` values like `audio/YourSong.mp3`.
- If you didn't include audio in the bundle, host the MP3s somewhere public (S3, GitHub raw URLs) and set `audioFileName` to the public URL.

Notes

- Including audio inside the bundle is simplest for small batches. If you have large audio files or many songs, prefer hosting them in S3 and reference by URL.
- Remotion Cloud is a paid product for large-scale rendering; check pricing before rendering many videos.
