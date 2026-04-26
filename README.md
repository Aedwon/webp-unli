# WebP Unli — Image to WebP Converter

Convert any image to WebP format. Free, unlimited, and entirely private — no uploads, no servers, no accounts.

## Features

- **Broad format support** — JPG, PNG, GIF, AVIF, TIFF, BMP, SVG, HEIC
- **Conversion controls** — quality slider (0–100), lossless mode, metadata stripping (EXIF, GPS, etc.)
- **Resize** — width/height inputs with aspect ratio lock
- **Per-file overrides** — each file can have its own settings independent of the global panel
- **Batch download** — download all converted files as a ZIP
- **Animated GIF warning** — flags animated GIFs (only the first frame is converted)
- **Private by design** — all processing runs in a Web Worker using WebAssembly; files never leave your device

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Conversion engine | [wasm-vips](https://github.com/kleisauke/wasm-vips) (libvips compiled to WebAssembly) |
| ZIP bundling | [fflate](https://github.com/101arrowz/fflate) |
| Unit tests | Vitest |
| E2E tests | Playwright |
| Deployment | Vercel (static hosting) |

## Getting Started

```bash
npm install
node node_modules/next/dist/bin/next dev --webpack
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The `--webpack` flag is required because wasm-vips is not yet compatible with Turbopack.

On first load, the ~10MB WebAssembly binary downloads and caches in the browser. Subsequent visits are instant.

## Running Tests

```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e
```

## Building for Production

```bash
npm run build
```

Outputs a fully static site to `out/`. Deploy by pointing any static host at that directory. On Vercel, `output: 'export'` is detected automatically.

## Project Structure

```
app/
  page.tsx          — main page: state, conversion flow, component composition
  layout.tsx        — root layout, fonts, metadata

components/
  DropZone          — drag-and-drop (desktop) + tap-to-browse (mobile)
  FileQueue         — grid of FileCard components
  FileCard          — per-file card: thumbnail, progress, settings, download
  ConversionControls — quality, lossless, resize, metadata settings
  DownloadAllButton — ZIP all completed files
  ProgressBar       — animated conversion progress indicator
  LoadingScreen     — shown while wasm-vips initializes
  UnsupportedBrowser — shown on browsers without WebAssembly

lib/
  use-vips.ts       — React hook wrapping the worker
  use-before-unload.ts — warns before leaving with unconverted files
  format-detection.ts  — MIME/extension validation, animated GIF detection
  zip.ts            — fflate wrapper for batch ZIP download
  types.ts          — shared TypeScript types

public/
  worker.js         — Web Worker: wasm-vips decode → encode → post result
  wasm/             — wasm-vips runtime (vips-es6.js + .wasm files)
```
