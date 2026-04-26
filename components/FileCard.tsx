// components/FileCard.tsx
'use client';
import { useState, useEffect } from 'react';
import type { FileEntry, ConversionOptions } from '@/lib/types';
import { ProgressBar } from './ProgressBar';
import { ConversionControls } from './ConversionControls';

interface FileCardProps {
  entry: FileEntry;
  onRemove: (id: string) => void;
  onOptionsChange: (id: string, options: ConversionOptions) => void;
  onReconvert: (id: string) => void;
}

export function FileCard({ entry, onRemove, onOptionsChange, onReconvert }: FileCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (entry.file.type === 'image/svg+xml' || !entry.file.type.startsWith('image/')) {
      return;
    }
    // Don't try to preview HEIC — browser can't display it natively
    if (entry.file.type === 'image/heic' || entry.file.type === 'image/heif') return;
    const url = URL.createObjectURL(entry.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [entry.file]);

  const handleDownload = () => {
    if (!entry.result) return;
    const url = URL.createObjectURL(entry.result);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.file.name.replace(/\.[^.]+$/, '.webp');
    a.click();
    URL.revokeObjectURL(url);
  };

  const sizeKb = entry.result ? Math.round(entry.result.size / 1024) : null;
  const originalKb = Math.round(entry.file.size / 1024);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col gap-2">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400 uppercase">
              {entry.file.name.split('.').pop()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{entry.file.name}</p>
          <p className="text-xs text-gray-400">
            {originalKb} KB
            {sizeKb !== null && (
              <span className="ml-1 text-green-600">→ {sizeKb} KB</span>
            )}
          </p>

          {/* Animated GIF warning */}
          {entry.isAnimatedGif && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded text-xs">
              Animated GIF — only first frame will convert
            </span>
          )}

          {/* Error */}
          {entry.status === 'error' && (
            <p className="text-xs text-red-500 mt-1">{entry.error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            title="Per-file settings"
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            title="Remove file"
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {entry.status === 'converting' && (
        <ProgressBar value={entry.progress} />
      )}

      {/* Inline settings override */}
      {showSettings && (
        <div className="mt-1">
          <ConversionControls
            options={entry.options}
            onChange={(opts) => onOptionsChange(entry.id, opts)}
          />
          {entry.status === 'done' && (
            <button
              type="button"
              onClick={() => onReconvert(entry.id)}
              className="mt-2 w-full text-sm text-blue-600 hover:underline"
            >
              Re-convert with these settings
            </button>
          )}
        </div>
      )}

      {/* Download button */}
      {entry.status === 'done' && (
        <button
          type="button"
          onClick={handleDownload}
          className="w-full py-1.5 px-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Download .webp
        </button>
      )}

      {/* Retry button */}
      {entry.status === 'error' && (
        <button
          type="button"
          onClick={() => onReconvert(entry.id)}
          className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200"
        >
          Retry
        </button>
      )}
    </div>
  );
}
