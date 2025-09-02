// Utilidades puras para Planificación (aptas para test unitarios)

export interface WorkRangeOptions {
  workStartHour: number; // 0-23
  workEndHour: number;   // 0-23
  minMinutes?: number;   // mínimo de duración en minutos
}

export function formatLocalDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
}

export function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function roundTo15(date: Date): Date {
  const ms = 1000 * 60 * 15;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

export function clampToWorkHours(date: Date, opts: WorkRangeOptions): Date {
  const clamped = new Date(date);
  if (clamped.getHours() < opts.workStartHour) {
    clamped.setHours(opts.workStartHour, 0, 0, 0);
  }
  if (clamped.getHours() >= opts.workEndHour) {
    clamped.setHours(opts.workEndHour, 0, 0, 0);
  }
  return clamped;
}

export function clampRangeToWorkHours(start: Date, end: Date, opts: WorkRangeOptions): { start: Date; end: Date } {
  let s = clampToWorkHours(start, opts);
  let e = clampToWorkHours(end, opts);
  const minMs = (opts.minMinutes ?? 60) * 60 * 1000;
  const minEnd = new Date(s.getTime() + minMs);
  if (e < minEnd) {
    e = minEnd;
  }
  const dayEnd = new Date(s);
  dayEnd.setHours(opts.workEndHour, 0, 0, 0);
  if (e > dayEnd) {
    e = dayEnd;
  }
  return { start: s, end: e };
}


