export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/** Whole-number percentage the result is smaller than the original. Negative when larger. */
export function savedPercent(original: number, result: number): number {
  if (original <= 0) return 0;
  return Math.round((1 - result / original) * 100);
}
