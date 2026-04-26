// lib/worker.ts

import type { WorkerRequest, WorkerResponse } from './types';

let vipsReady = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Vips: any = null;

async function initVips() {
  // Import vips-es6.js at runtime from /wasm/ instead of bundling it through webpack.
  // webpackIgnore stops webpack from including wasm-vips in the worker bundle, which
  // caused circular em-pthread dependencies and a hanging build.
  // vips-es6.js resolves its own WASM files relative to its URL (/wasm/), so no
  // locateFile override is needed.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { default: initVipsLib } = await import(/* webpackIgnore: true */ '/wasm/vips-es6.js');
  Vips = await initVipsLib();
  vipsReady = true;
  const msg: WorkerResponse = { type: 'ready' };
  self.postMessage(msg);
}

initVips().catch((err) => {
  console.error('wasm-vips failed to initialize:', err);
  throw err;
});

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  if (!vipsReady || !Vips) {
    const { id } = event.data;
    const msg: WorkerResponse = { type: 'error', id, message: 'Worker not ready' };
    self.postMessage(msg);
    return;
  }

  const { id, buffer, options } = event.data;

  try {
    const postProgress = (value: number) => {
      const msg: WorkerResponse = { type: 'progress', id, value };
      self.postMessage(msg);
    };

    postProgress(10);

    const uint8 = new Uint8Array(buffer);
    const image = Vips.Image.newFromBuffer(uint8, '');

    postProgress(40);

    let processed = image;

    try {
      if (options.resize.enabled && (options.resize.width || options.resize.height)) {
        const targetWidth = options.resize.width ?? image.width;
        const resizeOpts: Record<string, unknown> = {
          size: Vips.Size.down,
        };
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

      const msg: WorkerResponse = { type: 'done', id, buffer: outputBuffer.buffer };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (self as any).postMessage(msg, [outputBuffer.buffer]);
    } finally {
      if (processed !== image) processed.delete();
      image.delete();
    }
  } catch (err) {
    const msg: WorkerResponse = {
      type: 'error',
      id,
      message: err instanceof Error ? err.message : 'Conversion failed',
    };
    self.postMessage(msg);
  }
});
