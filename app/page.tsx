// app/page.tsx
'use client';
import { useState, useCallback, useId, useRef, useEffect } from 'react';
import { ArrowDownIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import type { FileEntry, ConversionOptions } from '@/lib/types';
import { DEFAULT_OPTIONS } from '@/lib/types';
import { isAnimatedGif } from '@/lib/format-detection';
import { formatBytes } from '@/lib/format';
import { useVips } from '@/lib/use-vips';
import { useBeforeUnload } from '@/lib/use-before-unload';
import { AboutWebp } from '@/components/AboutWebp';
import { Brand } from '@/components/Brand';
import { CountUp } from '@/components/CountUp';
import { DownloadAllButton } from '@/components/DownloadAllButton';
import { DropZone, pickSupported } from '@/components/DropZone';
import { Filmstrip } from '@/components/Filmstrip';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SettingsPanel, type Scope } from '@/components/SettingsPanel';
import { Stage } from '@/components/Stage';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UnsupportedBrowser } from '@/components/UnsupportedBrowser';

// Detect WebAssembly support synchronously before rendering
const wasmSupported = typeof WebAssembly !== 'undefined';

export default function Page() {
  const { ready, error: vipsError, convert } = useVips();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [globalOptions, setGlobalOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>('all');
  const [converting, setConverting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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
    setSelectedId((current) => current ?? newEntries[0]?.id ?? null);
  }, [globalOptions, idPrefix]);

  // Dropping or pasting anywhere on the page adds files.
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth++;
      setDragActive(true);
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragActive(false);
    };
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragActive(false);
      const valid = pickSupported(e.dataTransfer?.files ?? null);
      if (valid.length > 0) addFiles(valid);
    };
    const onPaste = (e: ClipboardEvent) => {
      const valid = pickSupported(e.clipboardData?.files ?? null);
      if (valid.length > 0) addFiles(valid);
    };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('dragover', onOver);
    window.addEventListener('drop', onDrop);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('paste', onPaste);
    };
  }, [addFiles]);

  const removeFile = useCallback((id: string) => {
    setSelectedId((current) => {
      if (current !== id) return current;
      const list = filesRef.current;
      const i = list.findIndex((f) => f.id === id);
      return list[i + 1]?.id ?? list[i - 1]?.id ?? null;
    });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateOptions = useCallback((id: string, options: ConversionOptions) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, options } : f));
  }, []);

  // Changing "all files" settings also updates files that have not been converted yet.
  const updateGlobalOptions = useCallback((options: ConversionOptions) => {
    setGlobalOptions(options);
    setFiles((prev) => prev.map((f) =>
      f.status === 'idle' ? { ...f, options: { ...options, resize: { ...options.resize } } } : f
    ));
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
          const usedOptions = entry.options;
          const buffer = await convert(
            id,
            entry.file,
            usedOptions,
            (value) => setFiles((prev) => prev.map((f) => f.id === id ? { ...f, progress: value } : f))
          );
          const blob = new Blob([buffer], { type: 'image/webp' });
          setFiles((prev) => prev.map((f) => f.id === id
            ? { ...f, status: 'done', result: blob, convertedWith: usedOptions, progress: 100 }
            : f));
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
    <div className="fixed inset-0 flex items-center justify-center p-8 text-center text-sm text-danger">
      <p>Could not load the converter. Refresh to try again.</p>
    </div>
  );
  if (!ready) return <LoadingScreen />;

  const idleCount = files.filter((f) => f.status === 'idle').length;
  const selected = files.find((f) => f.id === selectedId) ?? null;
  const activeScope: Scope = selected ? scope : 'all';
  const settingsOptions = activeScope === 'file' && selected ? selected.options : globalOptions;
  const stale =
    !!selected &&
    selected.status === 'done' &&
    !!selected.convertedWith &&
    JSON.stringify(selected.options) !== JSON.stringify(selected.convertedWith);
  const bytesSaved = files.reduce(
    (sum, f) => (f.status === 'done' && f.result ? sum + Math.max(0, f.file.size - f.result.size) : sum),
    0
  );

  return (
    <main className="relative min-h-dvh">
      {dragActive && (
        <div className="anim-overlay pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-canvas/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl border-[1.5px] border-dashed border-accent bg-surface px-16 py-14 shadow-float">
            <UploadSimpleIcon size={32} weight="bold" className="anim-float" aria-hidden="true" />
            <p className="text-xl leading-7 font-semibold">Release to add</p>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Brand />
          <div className="flex items-center gap-2">
            {bytesSaved > 0 && (
              <p className="anim-stage flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-soft px-4 text-[13px] font-medium text-ink">
                <ArrowDownIcon size={14} weight="bold" aria-hidden="true" />
                <span>
                  Saved <CountUp value={bytesSaved} format={formatBytes} />
                </span>
              </p>
            )}
            <DownloadAllButton files={files} />
            <ThemeToggle />
          </div>
        </header>

        {files.length === 0 ? (
          <div className="anim-stage mx-auto flex w-full max-w-3xl flex-col gap-6 pt-[6vh]">
            <DropZone onFiles={addFiles} disabled={converting} />
            <AboutWebp layout="row" />
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
              {selected && (
                <Stage
                  entry={selected}
                  stale={stale}
                  disabled={converting}
                  onRemove={removeFile}
                  onReconvert={handleReconvert}
                />
              )}
              <Filmstrip
                files={files}
                selectedId={selectedId}
                disabled={converting}
                onSelect={setSelectedId}
                onFiles={addFiles}
              />
            </div>
            <div className="flex w-full flex-[1_1_320px] flex-col gap-4 lg:max-w-[340px]">
              <SettingsPanel
                options={settingsOptions}
                onChange={(o) => (activeScope === 'file' && selected ? updateOptions(selected.id, o) : updateGlobalOptions(o))}
                canScope={!!selected}
                scope={activeScope}
                onScopeChange={setScope}
                idleCount={idleCount}
                converting={converting}
                onConvert={handleConvertAll}
              />
              <AboutWebp />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
