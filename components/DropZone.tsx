'use client';
import { useRef, useState } from 'react';
import { PlusIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { getSupportedFormat } from '@/lib/format-detection';

const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.avif,.tiff,.tif,.bmp,.svg,.heic,.heif,.webp';

export function pickSupported(list: FileList | File[] | null): File[] {
  if (!list) return [];
  return Array.from(list).filter((f) => getSupportedFormat(f.type, f.name) !== null);
}

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  /** hero: the empty-state target. tile: the compact add button in the filmstrip. */
  variant?: 'hero' | 'tile';
}

export function DropZone({ onFiles, disabled, variant = 'hero' }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    const valid = pickSupported(list);
    if (valid.length > 0) onFiles(valid);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      multiple
      accept={ACCEPTED_EXTENSIONS}
      className="hidden"
      onChange={(e) => {
        handleFiles(e.target.files);
        e.target.value = '';
      }}
    />
  );

  if (variant === 'tile') {
    return (
      <button
        type="button"
        onClick={open}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        disabled={disabled}
        aria-label="Add images"
        className="flex shrink-0 flex-col gap-2 text-left"
      >
        <span
          className={[
            'flex size-24 items-center justify-center rounded-lg border-[1.5px] border-dashed text-ink-2 transition-colors',
            isDragging ? 'border-accent bg-accent-soft text-ink' : 'border-line-strong bg-surface/60 hover:border-accent hover:text-ink',
          ].join(' ')}
        >
          <PlusIcon size={24} aria-hidden="true" />
        </span>
        <span className="px-0.5 text-xs leading-4 font-medium text-ink-2">Add images</span>
        {input}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      disabled={disabled}
      aria-label="Drop images here or click to browse"
      className={[
        'group flex w-full flex-col items-center gap-6 rounded-xl border-[1.5px] border-dashed px-6 py-20 text-center shadow-raised',
        'transition-[transform,background-color,border-color] duration-[240ms] ease-(--ease)',
        isDragging
          ? 'scale-[1.01] border-solid border-accent bg-surface'
          : 'border-line-strong bg-surface/70 hover:border-accent hover:bg-surface',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'flex size-16 items-center justify-center rounded-full bg-accent text-on-accent',
          isDragging ? '' : 'anim-float',
        ].join(' ')}
      >
        <UploadSimpleIcon size={28} weight="bold" aria-hidden="true" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-xl leading-7 font-semibold tracking-[-0.01em] text-ink">
          {isDragging ? 'Release to add' : 'Drop images to convert'}
        </span>
        <span className="text-sm leading-5 text-ink-2">
          or <span className="font-medium text-ink underline underline-offset-4">browse</span>. Paste works too.
        </span>
      </span>
      <span className="text-xs leading-4 text-ink-3">JPG, PNG, GIF, AVIF, TIFF, BMP, SVG, HEIC</span>
      {input}
    </button>
  );
}
