export const SUPPORTED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/tiff': 'tiff',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
  'image/heic': 'heic',
  'image/heif': 'heic',
};

const EXTENSION_FALLBACK: Record<string, string> = {
  jpg: 'jpg', jpeg: 'jpg', png: 'png', gif: 'gif',
  webp: 'webp', avif: 'avif', tiff: 'tiff', tif: 'tiff',
  bmp: 'bmp', svg: 'svg', heic: 'heic', heif: 'heic',
};

export function getSupportedFormat(mimeType: string, fileName: string): string | null {
  if (SUPPORTED_MIME_TYPES[mimeType]) return SUPPORTED_MIME_TYPES[mimeType];
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_FALLBACK[ext] ?? null;
}

export async function isAnimatedGif(mimeType: string, buffer: ArrayBuffer): Promise<boolean> {
  if (!mimeType.includes('gif')) return false;
  const bytes = new Uint8Array(buffer);
  let count = 0;
  for (let i = 0; i < bytes.length - 1; i++) {
    if (bytes[i] === 0x21 && bytes[i + 1] === 0xF9) {
      count++;
      if (count > 1) return true;
    }
  }
  return false;
}
