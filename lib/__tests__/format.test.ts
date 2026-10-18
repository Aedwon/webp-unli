import { describe, it, expect } from 'vitest';
import { formatBytes, savedPercent } from '../format';

describe('formatBytes', () => {
  it('formats bytes, kilobytes and megabytes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(318 * 1024)).toBe('318 KB');
    expect(formatBytes(4.2 * 1024 * 1024)).toBe('4.2 MB');
    expect(formatBytes(48 * 1024 * 1024)).toBe('48 MB');
  });
});

describe('savedPercent', () => {
  it('returns how much smaller the result is', () => {
    expect(savedPercent(1000, 100)).toBe(90);
    expect(savedPercent(1000, 1000)).toBe(0);
  });
  it('is negative when the result is larger', () => {
    expect(savedPercent(1000, 1500)).toBe(-50);
  });
  it('guards against an empty original', () => {
    expect(savedPercent(0, 10)).toBe(0);
  });
});
