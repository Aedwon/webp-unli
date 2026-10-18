'use client';
import { CheckIcon, WarningIcon, XIcon } from '@phosphor-icons/react';
import type { FileEntry } from '@/lib/types';
import { useObjectUrl } from '@/lib/use-object-url';
import { DropZone } from './DropZone';

interface FilmstripProps {
  files: FileEntry[];
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onFiles: (files: File[]) => void;
}

const NOT_DISPLAYABLE = /\.(heic|heif)$/i;

export function Filmstrip({ files, selectedId, disabled, onSelect, onFiles }: FilmstripProps) {
  return (
    <section aria-label="Files" className="-mx-2 flex gap-4 overflow-x-auto px-2 py-3">
      {files.map((entry, i) => (
        <Tile
          key={entry.id}
          entry={entry}
          index={i}
          selected={entry.id === selectedId}
          onSelect={() => onSelect(entry.id)}
        />
      ))}
      <DropZone variant="tile" onFiles={onFiles} disabled={disabled} />
    </section>
  );
}

function Tile({
  entry,
  index,
  selected,
  onSelect,
}: {
  entry: FileEntry;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const displayable = !NOT_DISPLAYABLE.test(entry.file.name) && entry.file.type !== 'image/heic';
  const url = useObjectUrl(displayable ? entry.file : null);
  const caption =
    entry.status === 'converting'
      ? `${Math.round(entry.progress)}%`
      : entry.status === 'error'
        ? 'Failed'
        : entry.isAnimatedGif
          ? 'First frame only'
          : '';
  const captionColor = entry.status === 'error' ? 'text-danger' : entry.isAnimatedGif ? 'text-warn' : 'text-ink-2';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${entry.file.name}, ${entry.status === 'done' ? 'converted' : entry.status}`}
      className="anim-tile flex w-24 shrink-0 flex-col gap-2 text-left hover:-translate-y-0.5"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <span
        className={[
          'relative block size-24 overflow-hidden rounded-lg bg-control transition-shadow duration-[180ms]',
          selected ? 'shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--accent)]' : '',
        ].join(' ')}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" draggable={false} className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-xs font-semibold text-ink-3 uppercase">
            {entry.file.name.split('.').pop()}
          </span>
        )}

        {entry.status === 'converting' && (
          <>
            <span className="absolute inset-0 bg-surface/50" />
            <span className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-surface/80">
              <span
                className="progress-live block h-full rounded-full bg-accent transition-[width] duration-300 ease-(--ease)"
                style={{ width: `${entry.progress}%` }}
              />
            </span>
          </>
        )}

        {entry.status === 'done' && (
          <span
            key={entry.result?.size}
            aria-hidden="true"
            className="anim-pop absolute right-1.5 bottom-1.5 flex size-5 items-center justify-center rounded-full bg-white text-black shadow-raised"
          >
            <CheckIcon size={12} weight="bold" />
          </span>
        )}

        {(entry.status === 'error' || entry.isAnimatedGif) && entry.status !== 'done' && (
          <span
            aria-hidden="true"
            className={[
              'absolute right-1.5 bottom-1.5 flex size-5 items-center justify-center rounded-full text-white shadow-raised',
              entry.status === 'error' ? 'bg-danger' : 'bg-warn',
            ].join(' ')}
          >
            {entry.status === 'error' ? <XIcon size={12} weight="bold" /> : <WarningIcon size={12} weight="fill" />}
          </span>
        )}
      </span>
      <span className="min-w-0 px-0.5">
        <span className="block truncate text-xs leading-4 font-medium">{entry.file.name}</span>
        {caption && <span className={`block text-xs leading-4 ${captionColor}`}>{caption}</span>}
      </span>
    </button>
  );
}
