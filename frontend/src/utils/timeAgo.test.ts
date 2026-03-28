import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTimeAgo } from './timeAgo';

describe('formatTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-28T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns just now for very recent times', () => {
    expect(formatTimeAgo(new Date('2026-03-28T11:59:50Z'))).toBe('just now');
  });

  it('returns minutes ago', () => {
    expect(formatTimeAgo(new Date('2026-03-28T11:55:00Z'))).toBe('5 minutes ago');
  });

  it('formats older dates', () => {
    const d = new Date('2026-03-01T12:00:00Z');
    expect(formatTimeAgo(d)).toMatch(/\d/);
  });
});
