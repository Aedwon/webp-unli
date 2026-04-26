'use client';
import { useState } from 'react';
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
      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
    >
      {loading ? 'Preparing ZIP...' : `Download All (${done.length} files)`}
    </button>
  );
}
