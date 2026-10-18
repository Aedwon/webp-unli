'use client';
import { useEffect, useState } from 'react';
import { formatBytes } from '@/lib/format';

interface SizeBarProps {
  original: number;
  result: number;
}

/**
 * The whole track is the original file. The solid bar shrinks down to the WebP size
 * and the striped remainder is what was saved.
 */
export function SizeBar({ original, result }: SizeBarProps) {
  const [settled, setSettled] = useState(false);
  const ratio = Math.min(100, Math.max(2, (result / original) * 100));
  const saved = Math.max(0, original - result);

  useEffect(() => {
    const id = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`Original ${formatBytes(original)}, WebP ${formatBytes(result)}`}
        className="relative h-3 overflow-hidden rounded-full bg-control"
      >
        <div className="saved-pattern absolute inset-0" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-[900ms] ease-(--ease)"
          style={{ width: settled ? `${ratio}%` : '100%', transitionDelay: '180ms' }}
        />
      </div>
      <div className="flex items-center justify-between text-xs leading-4 text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
          WebP {formatBytes(result)}
        </span>
        {saved > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="saved-pattern size-2 rounded-full" aria-hidden="true" />
            {formatBytes(saved)} saved
          </span>
        )}
        <span>Original {formatBytes(original)}</span>
      </div>
    </div>
  );
}
