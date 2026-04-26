// app/page.tsx
'use client';
import { useState, useCallback, useId, useRef, useEffect } from 'react';
import type { FileEntry, ConversionOptions } from '@/lib/types';
import { DEFAULT_OPTIONS } from '@/lib/types';
import { isAnimatedGif } from '@/lib/format-detection';
import { useVips } from '@/lib/use-vips';
import { useBeforeUnload } from '@/lib/use-before-unload';
import { LoadingScreen } from '@/components/LoadingScreen';
import { UnsupportedBrowser } from '@/components/UnsupportedBrowser';
import { DropZone } from '@/components/DropZone';
import { FileQueue } from '@/components/FileQueue';
import { ConversionControls } from '@/components/ConversionControls';
import { DownloadAllButton } from '@/components/DownloadAllButton';

// Detect WebAssembly support synchronously before rendering
const wasmSupported = typeof WebAssembly !== 'undefined';

export default function Page() {
  const { ready, error: vipsError, convert } = useVips();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [globalOptions, setGlobalOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);
  const [converting, setConverting] = useState(false);
  const idPrefix = useId();
  const filesRef = useRef<FileEntry[]>([]);
  const convertingCountRef = useRef(0);

  useEffect(() => { filesRef.current = files; }, [files]);

  const hasPending = files.some((f) => f.status === 'idle' || f.status === 'converting');
  const hasDone = files.some((f) => f.status === 'done');
  useBeforeUnload(hasPending || hasDone);

  const addFiles = useCallback(async (incoming: File[]) => {
    const newEntries: FileEntry[] = await Promise.all(
      incoming.map(async (file, i) => {
        const buffer = await file.arrayBuffer();
        const animated = await isAnimatedGif(file.type, buffer);
        return {
          id: `${idPrefix}-${Date.now()}-${i}`,
          file,
          status: 'idle' as const,
          options: { ...globalOptions, resize: { ...globalOptions.resize } },
          isAnimatedGif: animated,
          progress: 0,
        };
      })
    );
    setFiles((prev) => [...prev, ...newEntries]);
  }, [globalOptions, idPrefix]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateOptions = useCallback((id: string, options: ConversionOptions) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, options } : f));
  }, []);

  const runConversion = useCallback(async (ids: string[]) => {
    convertingCountRef.current++;
    setConverting(true);
    await Promise.all(
      ids.map(async (id) => {
        setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status: 'converting', progress: 0 } : f));
        try {
          const entry = filesRef.current.find((f) => f.id === id);
          if (!entry) return;
          const buffer = await convert(
            id,
            entry.file,
            entry.options,
            (value) => setFiles((prev) => prev.map((f) => f.id === id ? { ...f, progress: value } : f))
          );
          const blob = new Blob([buffer], { type: 'image/webp' });
          setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status: 'done', result: blob, progress: 100 } : f));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Conversion failed';
          setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status: 'error', error: message } : f));
        }
      })
    );
    if (--convertingCountRef.current === 0) setConverting(false);
  }, [convert]);

  const handleConvertAll = useCallback(() => {
    const idleIds = files.filter((f) => f.status === 'idle').map((f) => f.id);
    runConversion(idleIds);
  }, [files, runConversion]);

  const handleReconvert = useCallback((id: string) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status: 'idle', result: undefined, error: undefined, progress: 0 } : f));
    runConversion([id]);
  }, [runConversion]);

  if (!wasmSupported) return <UnsupportedBrowser />;
  if (vipsError) return (
    <div className="fixed inset-0 flex items-center justify-center p-8 text-center">
      <p className="text-red-600">Could not load converter. Please refresh and try again.</p>
    </div>
  );
  if (!ready) return <LoadingScreen />;

  const idleCount = files.filter((f) => f.status === 'idle').length;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Image → WebP</h1>
          <p className="text-gray-500 mt-1">Convert images to WebP. Free, private, no uploads.</p>
        </div>

        <DropZone onFiles={addFiles} disabled={converting} />

        {files.length > 0 && (
          <ConversionControls options={globalOptions} onChange={setGlobalOptions} />
        )}

        {idleCount > 0 && (
          <button
            type="button"
            onClick={handleConvertAll}
            disabled={converting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
          >
            {converting ? 'Converting...' : `Convert${idleCount > 1 ? ` All (${idleCount})` : ''}`}
          </button>
        )}

        <FileQueue
          files={files}
          onRemove={removeFile}
          onOptionsChange={updateOptions}
          onReconvert={handleReconvert}
          disabled={converting}
        />

        <DownloadAllButton files={files} />
      </div>
    </main>
  );
}
