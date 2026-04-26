// lib/use-vips.ts
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { WorkerRequest, WorkerResponse, ConversionOptions } from './types';

interface UseVipsResult {
  ready: boolean;
  error: boolean;
  convert: (
    id: string,
    file: File,
    options: ConversionOptions,
    onProgress: (value: number) => void
  ) => Promise<ArrayBuffer>;
}

export function useVips(): UseVipsResult {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<
    Map<string, { resolve: (buf: ArrayBuffer) => void; reject: (err: Error) => void; onProgress: (v: number) => void }>
  >(new Map());

  useEffect(() => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    workerRef.current = worker;

    worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      if (msg.type === 'ready') {
        setReady(true);
        return;
      }
      const pending = pendingRef.current.get(msg.id);
      if (!pending) return;
      if (msg.type === 'progress') {
        pending.onProgress(msg.value);
      } else if (msg.type === 'done') {
        pendingRef.current.delete(msg.id);
        pending.resolve(msg.buffer);
      } else if (msg.type === 'error') {
        pendingRef.current.delete(msg.id);
        pending.reject(new Error(msg.message));
      }
    });

    worker.addEventListener('error', () => setError(true));

    return () => worker.terminate();
  }, []);

  const convert = useCallback(
    (id: string, file: File, options: ConversionOptions, onProgress: (v: number) => void) => {
      return new Promise<ArrayBuffer>(async (resolve, reject) => {
        const buffer = await file.arrayBuffer();
        pendingRef.current.set(id, { resolve, reject, onProgress });
        const req: WorkerRequest = { id, buffer, mimeType: file.type, fileName: file.name, options };
        workerRef.current?.postMessage(req, [buffer]);
      });
    },
    []
  );

  return { ready, error, convert };
}
