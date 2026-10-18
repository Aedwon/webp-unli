'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowsLeftRightIcon } from '@phosphor-icons/react';

interface CompareSliderProps {
  /** Null when the browser cannot display the original (HEIC). */
  originalUrl: string | null;
  resultUrl: string;
  alt: string;
  onNaturalSize?: (size: { w: number; h: number }) => void;
}

const START = 100;
const REST = 55;

/** Drag to reveal the WebP over the original. Keyboard and screen reader friendly. */
export function CompareSlider({ originalUrl, resultUrl, alt, onNaturalSize }: CompareSliderProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState(START);
  const [dragging, setDragging] = useState(false);

  // Measure the space we can fit the image into.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setAvail({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Sweep from the original to the resting position once the image is in.
  useEffect(() => {
    if (!natural) return;
    const id = requestAnimationFrame(() => setPos(originalUrl ? REST : 0));
    return () => cancelAnimationFrame(id);
  }, [natural, originalUrl]);

  const handleNatural = useCallback(
    (img: HTMLImageElement) => {
      if (!img.naturalWidth) return;
      const size = { w: img.naturalWidth, h: img.naturalHeight };
      setNatural((prev) => prev ?? size);
      onNaturalSize?.(size);
    },
    [onNaturalSize]
  );

  const fit = (() => {
    if (!natural || !avail.w || !avail.h) return null;
    const scale = Math.min(avail.w / natural.w, avail.h / natural.h, 1);
    return { w: Math.round(natural.w * scale), h: Math.round(natural.h * scale) };
  })();

  const moveTo = (clientX: number, rect: DOMRect) => {
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  };

  return (
    <div ref={areaRef} className="flex h-full w-full items-center justify-center">
      <div
        className={[
          'group relative touch-none overflow-hidden rounded-lg select-none',
          dragging ? '' : 'compare-ease',
          fit ? '' : 'invisible',
          originalUrl ? 'cursor-ew-resize' : '',
        ].join(' ')}
        style={
          {
            width: fit?.w ?? 0,
            height: fit?.h ?? 0,
            '--pos': `${pos}%`,
          } as React.CSSProperties
        }
        onPointerDown={(e) => {
          if (!originalUrl) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          moveTo(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
        onPointerMove={(e) => {
          if (dragging) moveTo(e.clientX, e.currentTarget.getBoundingClientRect());
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {originalUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={originalUrl}
            alt={`${alt}, original`}
            draggable={false}
            onLoad={(e) => handleNatural(e.currentTarget)}
            className="absolute inset-0 size-full"
          />
        )}
        <div className={originalUrl ? 'compare-clip absolute inset-0' : 'absolute inset-0'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt={`${alt}, WebP`}
            draggable={false}
            onLoad={(e) => !originalUrl && handleNatural(e.currentTarget)}
            className="absolute inset-0 size-full"
          />
        </div>

        {originalUrl && (
          <>
            <div
              aria-hidden="true"
              className="compare-line pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.15)]"
              style={{ left: 'var(--pos)' }}
            />
            <div
              aria-hidden="true"
              className={[
                'compare-line pointer-events-none absolute top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-float',
                'transition-transform duration-[180ms] ease-(--spring) group-focus-within:ring-2 group-focus-within:ring-black',
                dragging ? 'scale-110' : '',
              ].join(' ')}
              style={{ left: 'var(--pos)' }}
            >
              <ArrowsLeftRightIcon size={18} weight="bold" />
            </div>
            <span
              className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs leading-4 font-medium text-white transition-opacity duration-[180ms]"
              style={{ opacity: pos < 14 ? 0 : 1 }}
            >
              Original
            </span>
            <span
              className="pointer-events-none absolute top-3 right-3 rounded-full bg-white px-2.5 py-1 text-xs leading-4 font-semibold text-black transition-opacity duration-[180ms]"
              style={{ opacity: pos > 86 ? 0 : 1 }}
            >
              WebP
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(pos)}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-label="Compare original and WebP"
              className="pointer-events-none absolute inset-0 size-full opacity-0"
            />
          </>
        )}
      </div>
    </div>
  );
}
