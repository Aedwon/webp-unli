'use client';
import { useLayoutEffect, useRef } from 'react';

interface CountUpProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}

const defaultFormat = (n: number) => String(Math.round(n));

/** Eases a number from its previous value to the new one. Text is written straight to the DOM. */
export function CountUp({ value, format = defaultFormat, duration = 900 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const formatRef = useRef(format);

  useLayoutEffect(() => {
    formatRef.current = format;
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = from.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || start === value) {
      el.textContent = formatRef.current(value);
      from.current = value;
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = start + (value - start) * eased;
      el.textContent = formatRef.current(current);
      from.current = current;
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    el.textContent = formatRef.current(start);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span ref={ref}>{format(value)}</span>;
}
