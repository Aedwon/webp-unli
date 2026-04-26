// lib/types.ts

export type FileStatus = 'idle' | 'converting' | 'done' | 'error';

export interface ResizeOptions {
  enabled: boolean;
  width: number | null;
  height: number | null;
  lockAspectRatio: boolean;
}

export interface ConversionOptions {
  quality: number;       // 0–100
  lossless: boolean;
  stripMetadata: boolean;
  resize: ResizeOptions;
}

export interface FileEntry {
  id: string;
  file: File;
  status: FileStatus;
  options: ConversionOptions;
  result?: Blob;
  error?: string;
  isAnimatedGif?: boolean;
  progress: number;      // 0–100
}

export interface WorkerRequest {
  id: string;
  buffer: ArrayBuffer;
  mimeType: string;
  fileName: string;
  options: ConversionOptions;
}

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'progress'; id: string; value: number }
  | { type: 'done'; id: string; buffer: ArrayBuffer }
  | { type: 'error'; id: string; message: string };

export const DEFAULT_OPTIONS: ConversionOptions = {
  quality: 80,
  lossless: false,
  stripMetadata: true,
  resize: {
    enabled: false,
    width: null,
    height: null,
    lockAspectRatio: true,
  },
};
