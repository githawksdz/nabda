/**
 * Calculator performance marks. Never logs inputs or patient values.
 */

export type CalculatorPerfSample = {
  event: "calculator_engine_load_ms" | "calculator_compute_ms";
  slug: string;
  ms: number;
};

const samples: CalculatorPerfSample[] = [];

export function recordCalculatorPerf(
  event: CalculatorPerfSample["event"],
  slug: string,
  ms: number,
) {
  const sample = { event, slug, ms };
  samples.push(sample);
  if (samples.length > 40) samples.shift();
  if (typeof performance !== "undefined" && performance.mark) {
    performance.mark(`${event}:${slug}:${Math.round(ms)}`);
  }
}

export function getCalculatorPerfSamples() {
  return [...samples];
}

export function measureSync<T>(slug: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  recordCalculatorPerf("calculator_compute_ms", slug, performance.now() - start);
  return result;
}
