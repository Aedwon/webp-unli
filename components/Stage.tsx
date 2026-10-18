'use client';
import { useState } from 'react';
import {
  ArrowsClockwiseIcon,
  DownloadSimpleIcon,
  FileImageIcon,
  WarningCircleIcon,
  WarningIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { FileEntry } from '@/lib/types';
import { formatBytes, savedPercent } from '@/lib/format';
import { useObjectUrl } from '@/lib/use-object-url';
import { CompareSlider } from './CompareSlider';
import { CountUp } from './CountUp';
import { SizeBar } from './SizeBar';

interface StageProps {
  entry: FileEntry;
  /** Settings changed since this file was converted. */
  stale: boolean;
  disabled?: boolean;
  onRemove: (id: string) => void;
  onReconvert: (id: string) => void;
}

const NOT_DISPLAYABLE = ['image/heic', 'image/heif'];

export function Stage({ entry, stale, disabled, onRemove, onReconvert }: StageProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const displayable = !NOT_DISPLAYABLE.includes(entry.file.type) && !/\.(heic|heif)$/i.test(entry.file.name);
  const originalUrl = useObjectUrl(displayable ? entry.file : null);
  const resultUrl = useObjectUrl(entry.result);

  const done = entry.status === 'done' && entry.result && resultUrl;
  const percent = entry.result ? savedPercent(entry.file.size, entry.result.size) : 0;
  const smaller = percent > 0;

  const handleDownload = () => {
    if (!entry.result) return;
    const url = URL.createObjectURL(entry.result);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.file.name.replace(/\.[^.]+$/, '.webp');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      key={entry.id}
      aria-label="Preview"
      className="anim-stage flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 shadow-raised"
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="truncate text-[17px] leading-6 font-semibold tracking-[-0.01em]">{entry.file.name}</h2>
          <p className="text-[13px] leading-[18px] text-ink-2">
            {size ? `${size.w} × ${size.h}` : entry.file.type.replace('image/', '').toUpperCase() || 'Image'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          aria-label={`Remove ${entry.file.name}`}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-control text-ink-2 hover:text-ink"
        >
          <XIcon size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex h-[clamp(240px,50vh,520px)] items-center justify-center overflow-hidden rounded-lg bg-control p-2">
        {done ? (
          <CompareSlider
            key={`${entry.id}-${resultUrl}`}
            originalUrl={originalUrl}
            resultUrl={resultUrl}
            alt={entry.file.name}
            onNaturalSize={setSize}
          />
        ) : entry.status === 'error' ? (
          <div className="flex max-w-xs flex-col items-center gap-3 text-center">
            <WarningCircleIcon size={40} weight="duotone" className="text-danger" aria-hidden="true" />
            <p className="text-sm leading-5 text-ink-2">{entry.error ?? 'This file could not be converted.'}</p>
          </div>
        ) : originalUrl ? (
          <div className="relative flex size-full items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt={entry.file.name}
              onLoad={(e) =>
                setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
              }
              className={[
                'max-h-full max-w-full rounded-lg object-contain transition-[filter,opacity] duration-[240ms]',
                entry.status === 'converting' ? 'opacity-60 saturate-50' : '',
              ].join(' ')}
            />
            {entry.status === 'converting' && (
              <div className="anim-overlay absolute inset-x-6 bottom-6 flex flex-col gap-2 rounded-lg bg-surface/90 p-3 shadow-float backdrop-blur">
                <div className="flex items-center justify-between text-xs leading-4 font-medium">
                  <span>Converting</span>
                  <span>
                    <CountUp value={entry.progress} duration={300} />%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-control">
                  <div
                    className="progress-live h-full rounded-full bg-accent transition-[width] duration-300 ease-(--ease)"
                    style={{ width: `${entry.progress}%` }}
                    role="progressbar"
                    aria-valuenow={entry.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Conversion progress"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center text-ink-2">
            <FileImageIcon size={40} weight="duotone" aria-hidden="true" />
            <p className="text-sm leading-5">No preview for this format. It will convert fine.</p>
          </div>
        )}
      </div>

      {entry.isAnimatedGif && (
        <p className="flex items-center gap-2 rounded-lg bg-amber-soft px-3 py-2 text-[13px] leading-[18px] text-ink">
          <WarningIcon size={16} weight="fill" className="shrink-0 text-warn" aria-hidden="true" />
          Animated GIF. Only the first frame is converted.
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4 px-1 pb-1">
        {done ? (
          <div className="flex min-w-[220px] flex-1 flex-col gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                {smaller ? (
                  <>
                    <span className="text-[40px] leading-[44px] font-semibold tracking-[-0.03em]">
                      <CountUp key={entry.id} value={percent} />%
                    </span>
                    <span className="text-[17px] leading-6 text-ink-2">smaller</span>
                  </>
                ) : (
                  <span className="text-[17px] leading-6 font-semibold">
                    {percent === 0 ? 'Same size' : `${Math.abs(percent)}% larger`}
                  </span>
                )}
              </div>
              {!smaller && (
                <p className="text-[13px] leading-[18px] text-ink-2">Try a lower quality to shrink it.</p>
              )}
            </div>
            <SizeBar key={`${entry.id}-${entry.result!.size}`} original={entry.file.size} result={entry.result!.size} />
          </div>
        ) : (
          <div>
            <p className="text-[17px] leading-6 font-semibold">{formatBytes(entry.file.size)}</p>
            <p className="text-[13px] leading-[18px] text-ink-2">
              {entry.status === 'converting' ? 'Converting' : entry.status === 'error' ? 'Failed' : 'Ready to convert'}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {(stale || entry.status === 'error') && (
            <button
              type="button"
              onClick={() => onReconvert(entry.id)}
              disabled={disabled}
              className="flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent hover:brightness-95 disabled:opacity-60"
            >
              <ArrowsClockwiseIcon size={18} weight="bold" aria-hidden="true" />
              {entry.status === 'error' ? 'Retry' : 'Convert again'}
            </button>
          )}
          {done && (
            <button
              type="button"
              onClick={handleDownload}
              className={[
                'flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold hover:brightness-95',
                stale ? 'bg-accent-soft text-ink' : 'bg-accent text-on-accent',
              ].join(' ')}
            >
              <DownloadSimpleIcon size={18} weight="bold" aria-hidden="true" />
              Download
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
