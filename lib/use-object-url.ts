'use client';
import { useEffect, useMemo } from 'react';

interface Entry {
  url: string;
  holders: number;
}

// Several components can show the same file. They share one URL, revoked after the last one lets go.
const entries = new Map<Blob, Entry>();

function ensure(blob: Blob): Entry {
  let entry = entries.get(blob);
  if (!entry) {
    entry = { url: URL.createObjectURL(blob), holders: 0 };
    entries.set(blob, entry);
  }
  return entry;
}

function release(blob: Blob) {
  const entry = entries.get(blob);
  if (!entry) return;
  entry.holders--;
  // Deferred so a re-mount (Strict Mode, key changes) keeps the same URL alive.
  setTimeout(() => {
    const current = entries.get(blob);
    if (current && current.holders <= 0) {
      URL.revokeObjectURL(current.url);
      entries.delete(blob);
    }
  }, 0);
}

/** Object URL for a blob, revoked when nothing is using it any more. */
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const url = useMemo(() => (blob ? ensure(blob).url : null), [blob]);

  useEffect(() => {
    if (!blob) return;
    ensure(blob).holders++;
    return () => release(blob);
  }, [blob]);

  return url;
}
