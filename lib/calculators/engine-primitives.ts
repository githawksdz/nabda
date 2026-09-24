/**
 * Safe typed calculation primitives. No string evaluation.
 */

export function add(...values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0);
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(...values: number[]): number {
  return values.reduce((product, v) => product * v, 1);
}

export function divide(a: number, b: number): number | null {
  if (b === 0 || !Number.isFinite(a) || !Number.isFinite(b)) return null;
  return a / b;
}

export function min(...values: number[]): number {
  return Math.min(...values);
}

export function max(...values: number[]): number {
  return Math.max(...values);
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function floor(value: number): number {
  return Math.floor(value);
}

export function ceil(value: number): number {
  return Math.ceil(value);
}

export function abs(value: number): number {
  return Math.abs(value);
}

export function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

export function percentage(part: number, whole: number): number | null {
  if (whole === 0) return null;
  return (part / whole) * 100;
}

export function dateDifferenceDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function weightedPoints(
  items: Array<{ points: number; weight?: number }>,
): number {
  return items.reduce((sum, item) => sum + item.points * (item.weight ?? 1), 0);
}

export function lookupTable<T extends string | number>(
  table: Record<string, number>,
  key: T,
): number | null {
  const value = table[String(key)];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Common clinical unit helpers — explicit only, no free-form conversion DSL. */
export function creatinineToMgDl(
  value: number,
  unit: "mg/dL" | "µmol/L" | "umol/L",
): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  if (unit === "mg/dL") return value;
  return value / 88.4;
}

export function interpretRange(
  value: number,
  bands: Array<{ max: number; label: string }>,
): string | null {
  for (const band of bands) {
    if (value <= band.max) return band.label;
  }
  return bands.length ? bands[bands.length - 1]!.label : null;
}

export function branch<T>(
  condition: boolean,
  whenTrue: () => T,
  whenFalse: () => T,
): T {
  return condition ? whenTrue() : whenFalse();
}
