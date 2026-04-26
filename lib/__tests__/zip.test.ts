import { describe, it, expect } from 'vitest';
import { buildZip } from '../zip';

describe('buildZip', () => {
  it('returns a Blob of type application/zip', async () => {
    const files = [
      { name: 'a.webp', blob: new Blob([new Uint8Array([1, 2, 3])]) },
      { name: 'b.webp', blob: new Blob([new Uint8Array([4, 5, 6])]) },
    ];
    const result = await buildZip(files);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('application/zip');
    expect(result.size).toBeGreaterThan(0);
  });

  it('returns an empty-ish zip when given no files', async () => {
    const result = await buildZip([]);
    expect(result).toBeInstanceOf(Blob);
    expect(result.size).toBeGreaterThan(0); // still a valid ZIP structure
  });
});
