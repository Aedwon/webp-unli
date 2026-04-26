import { describe, it, expect } from 'vitest';
import { getSupportedFormat, isAnimatedGif, SUPPORTED_MIME_TYPES } from '../format-detection';

describe('getSupportedFormat', () => {
  it('detects jpg by mime type', () => {
    expect(getSupportedFormat('image/jpeg', 'photo.jpg')).toBe('jpg');
  });

  it('detects png by mime type', () => {
    expect(getSupportedFormat('image/png', 'photo.png')).toBe('png');
  });

  it('detects gif by mime type', () => {
    expect(getSupportedFormat('image/gif', 'photo.gif')).toBe('gif');
  });

  it('detects webp by mime type', () => {
    expect(getSupportedFormat('image/webp', 'photo.webp')).toBe('webp');
  });

  it('detects avif by mime type', () => {
    expect(getSupportedFormat('image/avif', 'photo.avif')).toBe('avif');
  });

  it('detects tiff by mime type', () => {
    expect(getSupportedFormat('image/tiff', 'photo.tiff')).toBe('tiff');
  });

  it('detects bmp by mime type', () => {
    expect(getSupportedFormat('image/bmp', 'photo.bmp')).toBe('bmp');
  });

  it('detects svg by mime type', () => {
    expect(getSupportedFormat('image/svg+xml', 'photo.svg')).toBe('svg');
  });

  it('detects heic by extension when mime type is generic', () => {
    expect(getSupportedFormat('application/octet-stream', 'photo.heic')).toBe('heic');
  });

  it('detects heif by extension', () => {
    expect(getSupportedFormat('application/octet-stream', 'photo.heif')).toBe('heic');
  });

  it('returns null for unsupported formats', () => {
    expect(getSupportedFormat('application/pdf', 'doc.pdf')).toBeNull();
  });
});

describe('isAnimatedGif', () => {
  it('returns false for non-gif files', async () => {
    const buf = new ArrayBuffer(10);
    expect(await isAnimatedGif('image/png', buf)).toBe(false);
  });

  it('returns false for a static gif (one graphic control extension)', async () => {
    // GIF header + one 0x21 0xF9 block
    const bytes = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a header
      0x21, 0xF9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, // one GCE
    ]);
    expect(await isAnimatedGif('image/gif', bytes.buffer)).toBe(false);
  });

  it('returns true for animated gif (multiple graphic control extensions)', async () => {
    const bytes = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a header
      0x21, 0xF9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, // GCE 1
      0x21, 0xF9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, // GCE 2
    ]);
    expect(await isAnimatedGif('image/gif', bytes.buffer)).toBe(true);
  });
});
