'use client';
import { useRef, useState } from 'react';
import { getSupportedFormat } from '@/lib/format-detection';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.avif,.tiff,.tif,.bmp,.svg,.heic,.heif,.webp';

export function DropZone({ onFiles, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const valid = Array.from(fileList).filter(
      (f) => getSupportedFormat(f.type, f.name) !== null
    );
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

  const handleDragLeave = () => setIsDragging(false);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop images here or click to browse"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={[
        'flex flex-col items-center justify-center w-full min-h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-colors select-none',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <p className="text-gray-600 font-medium text-center px-4">
        <span className="hidden sm:inline">Drop images here or </span>
        <span className="text-blue-600 underline">browse files</span>
      </p>
      <p className="text-gray-400 text-sm mt-1">JPG, PNG, GIF, AVIF, TIFF, BMP, SVG, HEIC</p>
    </div>
  );
}
