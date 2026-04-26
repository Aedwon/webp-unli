import { zipSync } from 'fflate';

export interface ZipEntry {
  name: string;
  blob: Blob;
}

export async function buildZip(files: ZipEntry[]): Promise<Blob> {
  const entries: Record<string, Uint8Array> = {};
  for (const { name, blob } of files) {
    const buffer = await blob.arrayBuffer();
    entries[name] = new Uint8Array(buffer);
  }
  const zipped = zipSync(entries);
  return new Blob([zipped], { type: 'application/zip' });
}
