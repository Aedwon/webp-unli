// components/FileQueue.tsx
import type { FileEntry, ConversionOptions } from '@/lib/types';
import { FileCard } from './FileCard';

interface FileQueueProps {
  files: FileEntry[];
  onRemove: (id: string) => void;
  onOptionsChange: (id: string, options: ConversionOptions) => void;
  onReconvert: (id: string) => void;
  disabled?: boolean;
}

export function FileQueue({ files, onRemove, onOptionsChange, onReconvert, disabled }: FileQueueProps) {
  if (files.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((entry) => (
        <FileCard
          key={entry.id}
          entry={entry}
          onRemove={onRemove}
          onOptionsChange={onOptionsChange}
          onReconvert={onReconvert}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
