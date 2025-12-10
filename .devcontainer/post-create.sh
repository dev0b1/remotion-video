#!/usr/bin/env bash
set -euo pipefail

echo "[devcontainer] Installing system packages for node-canvas and ffmpeg..."
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev ffmpeg python3

echo "[devcontainer] Installing npm packages (may take a while)..."
npm install

echo "[devcontainer] Done. You can run: node scripts/render-single.js <your-file.mp3>"
