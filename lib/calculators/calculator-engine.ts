export function additiveScore(components: number[]): number {
  return components.reduce((total, value) => total + value, 0);
}

export function formatScoreFraction(total: number, max: number): string {
  return `${total}/${max}`;
}

export function clampScore(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseNumericInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
