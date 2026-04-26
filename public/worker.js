// public/worker.js
// Plain JavaScript Web Worker, served as a static asset.
// Cannot be a TypeScript file in lib/ — Turbopack emits it as a raw .ts asset
// in production, which the browser cannot parse.

let vipsReady = false;
let Vips = null;

async function initVips() {
  // Load wasm-vips at runtime from /wasm/. vips-es6.js uses import.meta.url to
  // locate sibling .wasm files, which resolves correctly to /wasm/*.wasm.
  const { default: initVipsLib } = await import('/wasm/vips-es6.js');
  Vips = await initVipsLib();
  vipsReady = true;
  self.postMessage({ type: 'ready' });
}

initVips().catch((err) => {
  console.error('wasm-vips failed to initialize:', err);
  self.postMessage({ type: 'error', id: 'init', message: err && err.message ? err.message : String(err) });
});

self.addEventListener('message', (event) => {
  if (!vipsReady || !Vips) {
    self.postMessage({ type: 'error', id: event.data && event.data.id, message: 'Worker not ready' });
    return;
  }

  const { id, buffer, options } = event.data;

  try {
    const postProgress = (value) => {
      self.postMessage({ type: 'progress', id, value });
    };

    postProgress(10);

    const uint8 = new Uint8Array(buffer);
    const image = Vips.Image.newFromBuffer(uint8, '');

    postProgress(40);

    let processed = image;

    try {
      if (options.resize.enabled && (options.resize.width || options.resize.height)) {
        const targetWidth = options.resize.width != null ? options.resize.width : image.width;
        const resizeOpts = { size: Vips.Size.down };
        if (options.resize.height) {
          resizeOpts.height = options.resize.height;
        }
        processed = image.thumbnailImage(targetWidth, resizeOpts);
      }

      postProgress(70);

      const outputBuffer = processed.writeToBuffer('.webp', {
        Q: options.quality,
        lossless: options.lossless ? 1 : 0,
        strip: options.stripMetadata ? 1 : 0,
      });

      postProgress(90);
      postProgress(100);

      self.postMessage({ type: 'done', id, buffer: outputBuffer.buffer }, [outputBuffer.buffer]);
    } finally {
      if (processed !== image) processed.delete();
      image.delete();
    }
  } catch (err) {
    self.postMessage({
      type: 'error',
      id,
      message: err instanceof Error ? err.message : 'Conversion failed',
    });
  }
});
