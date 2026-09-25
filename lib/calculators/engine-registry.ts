/**
 * Dynamic calculator engine registry.
 * Specialty + generated engines load via dynamic import (one chunk per slug).
 */
import { resolveCalculatorSlug } from "@/lib/calculators/calculator-slugs";
import { GENERATED_ENGINE_MANIFEST } from "@/lib/calculators/generated-engines/manifest";
import type { CalculatorEngine } from "@/lib/calculators/engine-types";

export type EngineLoader = () => Promise<{
  default?: CalculatorEngine<unknown, unknown>;
  engine?: CalculatorEngine<unknown, unknown>;
}>;

const SPECIALTY_LOADERS: Record<string, EngineLoader> = {
  "glasgow-coma-scale-score-gcs": async () => {
    const mod = await import(
      "@/lib/calculators/engines/glasgow-coma-scale-score-gcs"
    );
    return { engine: mod.glasgowComaScaleEngine as CalculatorEngine<unknown, unknown> };
  },
  glasgow: async () => {
    const mod = await import(
      "@/lib/calculators/engines/glasgow-coma-scale-score-gcs"
    );
    return { engine: mod.glasgowComaScaleEngine as CalculatorEngine<unknown, unknown> };
  },
  "creatinine-clearance-cockcroft-gault-equation": async () => {
    const mod = await import(
      "@/lib/calculators/engines/creatinine-clearance-cockcroft-gault-equation"
    );
    return { engine: mod.cockcroftGaultEngine as CalculatorEngine<unknown, unknown> };
  },
  "cockcroft-gault": async () => {
    const mod = await import(
      "@/lib/calculators/engines/creatinine-clearance-cockcroft-gault-equation"
    );
    return { engine: mod.cockcroftGaultEngine as CalculatorEngine<unknown, unknown> };
  },
  "pregnancy-due-dates-calculator": async () => {
    const mod = await import(
      "@/lib/calculators/engines/dates/pregnancy-due-dates-calculator"
    );
    return { engine: mod.pregnancyDueDatesEngine as CalculatorEngine<unknown, unknown> };
  },
  "winters-formula-metabolic-acidosis-compensation": async () => {
    const mod = await import(
      "@/lib/calculators/engines/formulas/winters-formula-metabolic-acidosis-compensation"
    );
    return { engine: mod.wintersFormulaEngine as CalculatorEngine<unknown, unknown> };
  },
};

export async function loadAdditivePointsEngine() {
  const mod = await import("@/lib/calculators/engines/additive-points");
  return mod.additivePointsEngine;
}

export function listRegisteredSpecialtySlugs(): string[] {
  return Object.keys(SPECIALTY_LOADERS);
}

export function listGeneratedEngineSlugs(): string[] {
  return Object.keys(GENERATED_ENGINE_MANIFEST);
}

export function hasSpecialtyEngine(slug: string): boolean {
  const resolved = resolveCalculatorSlug(slug);
  return Boolean(SPECIALTY_LOADERS[slug] || SPECIALTY_LOADERS[resolved]);
}

export function hasGeneratedEngine(slug: string): boolean {
  const resolved = resolveCalculatorSlug(slug);
  return Boolean(
    slug in GENERATED_ENGINE_MANIFEST || resolved in GENERATED_ENGINE_MANIFEST,
  );
}

export function hasAnyCompiledEngine(slug: string): boolean {
  return hasSpecialtyEngine(slug) || hasGeneratedEngine(slug);
}

const engineCache = new Map<string, Promise<CalculatorEngine<unknown, unknown> | null>>();

export async function loadCalculatorEngine(
  slug: string,
): Promise<CalculatorEngine<unknown, unknown> | null> {
  const resolved = resolveCalculatorSlug(slug);
  const cached = engineCache.get(resolved) ?? engineCache.get(slug);
  if (cached) {
    return cached;
  }

  const pending = (async () => {
    const loadStart = typeof performance !== "undefined" ? performance.now() : 0;
    const loader = SPECIALTY_LOADERS[slug] ?? SPECIALTY_LOADERS[resolved];
    let engine: CalculatorEngine<unknown, unknown> | null = null;
    if (loader) {
      const mod = await loader();
      engine = (mod.engine ?? mod.default ?? null) as CalculatorEngine<
        unknown,
        unknown
      > | null;
    } else {
      const entry =
        GENERATED_ENGINE_MANIFEST[resolved as keyof typeof GENERATED_ENGINE_MANIFEST] ??
        GENERATED_ENGINE_MANIFEST[slug as keyof typeof GENERATED_ENGINE_MANIFEST];
      if (!entry) return null;
      const mod = await entry.loader();
      engine = (mod.engine ?? mod.default ?? null) as CalculatorEngine<
        unknown,
        unknown
      > | null;
    }
    if (typeof performance !== "undefined") {
      const { recordCalculatorPerf } = await import("@/lib/calculators/calculator-perf");
      recordCalculatorPerf("calculator_engine_load_ms", resolved, performance.now() - loadStart);
    }
    return engine;
  })();

  engineCache.set(resolved, pending);
  return pending;
}

export function engineMetaForSlug(slug: string): {
  engine_slug: string;
  engine_version: string;
  engine_implemented: boolean;
  engine_kind: "specialty" | "generated" | "additive_shared" | "none";
} {
  const resolved = resolveCalculatorSlug(slug);
  if (hasSpecialtyEngine(resolved)) {
    return {
      engine_slug: resolved,
      engine_version: "1.0.0",
      engine_implemented: true,
      engine_kind: "specialty",
    };
  }
  if (hasGeneratedEngine(resolved)) {
    return {
      engine_slug: resolved,
      engine_version: "1.0.0",
      engine_implemented: true,
      engine_kind: "generated",
    };
  }
  return {
    engine_slug: resolved,
    engine_version: "0.0.0",
    engine_implemented: false,
    engine_kind: "none",
  };
}
