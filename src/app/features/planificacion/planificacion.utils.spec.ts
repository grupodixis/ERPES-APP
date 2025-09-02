import { clampRangeToWorkHours, clampToWorkHours, formatDateOnly, formatLocalDateTime, roundTo15 } from './planificacion.utils';

describe('planificacion.utils', () => {
  const opts = { workStartHour: 7, workEndHour: 17, minMinutes: 60 };

  it('formatLocalDateTime returns yyyy-MM-ddTHH:mm:ss', () => {
    const d = new Date(2025, 0, 2, 3, 4, 5);
    expect(formatLocalDateTime(d)).toBe('2025-01-02T03:04:05');
  });

  it('formatDateOnly returns yyyy-MM-dd', () => {
    const d = new Date(2025, 10, 9, 22, 33, 44);
    expect(formatDateOnly(d)).toBe('2025-11-09');
  });

  it('roundTo15 rounds to closest quarter', () => {
    const d = new Date(2025, 0, 1, 10, 7, 0);
    const r = roundTo15(d);
    expect(r.getHours()).toBe(10);
    expect(r.getMinutes() % 15).toBe(0);
  });

  it('clampToWorkHours clamps outside range', () => {
    const early = new Date(2025, 0, 1, 5, 0, 0);
    const late = new Date(2025, 0, 1, 19, 0, 0);
    const ce = clampToWorkHours(early, opts);
    const cl = clampToWorkHours(late, opts);
    expect(ce.getHours()).toBe(7);
    expect(cl.getHours()).toBe(17);
  });

  it('clampRangeToWorkHours enforces min duration and day end', () => {
    const s = new Date(2025, 0, 1, 16, 45, 0);
    const e = new Date(2025, 0, 1, 16, 50, 0);
    const res = clampRangeToWorkHours(s, e, opts);
    expect(res.end.getHours()).toBeLessThanOrEqual(17);
    expect(res.end.getTime() - res.start.getTime()).toBeGreaterThanOrEqual((opts.minMinutes as number) * 60 * 1000);
  });
});


