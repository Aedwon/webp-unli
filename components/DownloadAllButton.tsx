'use client';
import { useState } from 'react';
import { CircleNotchIcon, FileZipIcon } from '@phosphor-icons/react';
import type { FileEntry } from '@/lib/types';
import { buildZip } from '@/lib/zip';

interface DownloadAllButtonProps {
  files: FileEntry[];
}

export function DownloadAllButton({ files }: DownloadAllButtonProps) {
  const [loading, setLoading] = useState(false);
  const done = files.filter((f) => f.status === 'done' && f.result);

  if (done.length < 2) return null;

  const handleDownloadAll = async () => {
    setLoading(true);
    try {
      const entries = done.map((f) => ({
        name: f.file.name.replace(/\.[^.]+$/, '.webp'),
        blob: f.result!,
      }));
      const zip = await buildZip(entries);
      const url = URL.createObjectURL(zip);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted-images.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownloadAll}
      disabled={loading}
      className="anim-stage flex h-10 items-center gap-2 rounded-full bg-accent px-5 whitespace-nowrap text-sm font-semibold text-on-accent hover:brightness-95 disabled:opacity-70"
    >
      {loading ? (
        <CircleNotchIcon size={18} weight="bold" className="animate-[spin_700ms_linear_infinite]" aria-hidden="true" />
      ) : (
        <FileZipIcon size={18} weight="bold" aria-hidden="true" />
      )}
      {loading ? 'Preparing' : 'Download all'}
      <span className="font-medium opacity-70">{done.length}</span>
    </button>
  );
}
