/**
 * Static verification for database-gated calculator architecture.
 *
 * Usage: npx tsx scripts/verify-calculator-architecture.ts
 */
import fs from "node:fs";
import path from "node:path";

import {
  GENERATED_ENGINE_MANIFEST,
} from "@/lib/calculators/generated-engines/manifest";
import {
  hasAnyCompiledEngine,
  hasSpecialtyEngine,
  loadCalculatorEngine,
} from "@/lib/calculators/engine-registry";
import { resolveCalculatorRenderMode } from "@/lib/calculators/resolve-calculator-render-mode";
import { listDedicatedSpecialtyUiSlugs } from "@/lib/calculators/specialty-calculator-ui";
import { resolveCalculatorSlug } from "@/lib/calculators/calculator-slugs";

const ROOT = process.cwd();

type Check = { id: string; ok: boolean; detail: string };

const checks: Check[] = [];

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function walkTs(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walkTs(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(path.relative(ROOT, full).replace(/\\/g, "/"));
    }
  }
  return out;
}

// 1 — calculator route: gate before render, fail closed
{
  const route = read("app/calculators/[slug]/page.tsx");
  checks.push({
    id: "route_require_published_gate",
    ok:
      route.includes("requirePublishedDoctorContent") &&
      route.includes("getCalculators") &&
      route.includes('redirect("/home")'),
    detail: "DB row + publication gate",
  });
  checks.push({
    id: "route_resolve_render_mode",
    ok: route.includes("resolveCalculatorRenderMode"),
    detail: "unified render mode",
  });
  checks.push({
    id: "route_no_builtin_slug_branch",
    ok:
      !/slug\s*===\s*["']glasgow/.test(route) &&
      !/slug\s*===\s*["']cockcroft/.test(route) &&
      !route.includes("isGlasgowSlug") &&
      !route.includes("isCockcroftSlug") &&
      !route.includes("hasActiveCalculatorEngine"),
    detail: "no Glasgow/Cockcroft route exceptions",
  });
}

// 2 — no preparation / unavailable public calculator UI on route
{
  const route = read("app/calculators/[slug]/page.tsx");
  const detail = read("components/calculators/CalculatorDetailPage.tsx");
  checks.push({
    id: "route_no_prep_unavailable",
    ok:
      !route.includes("CalculatorPreparationState") &&
      !route.includes("ContentUnavailable") &&
      !detail.includes('mode === "unavailable"') &&
      !detail.includes('mode === "preparation"'),
    detail: "no prep/unavailable calculator states",
  });
}

// 3 — catalog index is DB-only
{
  const index = read("app/calculators/page.tsx");
  checks.push({
    id: "catalog_db_only",
    ok:
      index.includes("getCalculators") &&
      index.includes("catalogFromDbCalculators") &&
      !index.includes("MOCK_CALCULATORS") &&
      !index.includes("overlayCalculatorCatalog"),
    detail: "calculators index",
  });
}

// 4 — engine registry: specialty slugs load
for (const slug of listDedicatedSpecialtyUiSlugs()) {
  checks.push({
    id: `specialty_engine_${slug}`,
    ok: hasSpecialtyEngine(slug),
    detail: `hasSpecialtyEngine(${slug})`,
  });
  const mode = resolveCalculatorRenderMode(slug, null);
  checks.push({
    id: `specialty_mode_without_source_${slug}`,
    ok: mode === "specialty",
    detail: `resolveCalculatorRenderMode(${slug}, null)=${mode}`,
  });
}

// 5 — unknown slug fails closed (no default engine)
{
  const mode = resolveCalculatorRenderMode("not-a-real-calculator-slug", null);
  checks.push({
    id: "unknown_slug_missing_mode",
    ok: mode === "missing",
    detail: `mode=${mode}`,
  });
}

// 6 — generated manifest modules exist on disk
{
  const base = path.join(ROOT, "lib/calculators/generated-engines");
  const missing: string[] = [];
  for (const entry of Object.values(GENERATED_ENGINE_MANIFEST)) {
    const file = path.join(base, entry.path);
    if (!fs.existsSync(file)) {
      missing.push(entry.path);
    }
  }
  checks.push({
    id: "generated_engine_files_exist",
    ok: missing.length === 0,
    detail: missing.length ? missing.slice(0, 5).join(", ") : `count=${Object.keys(GENERATED_ENGINE_MANIFEST).length}`,
  });
}

// 7 — specialty UI only for engines that exist
for (const slug of listDedicatedSpecialtyUiSlugs()) {
  checks.push({
    id: `specialty_ui_engine_parity_${slug}`,
    ok: hasSpecialtyEngine(resolveCalculatorSlug(slug)),
    detail: slug,
  });
}

// 8 — no hardcoded public fallback helpers in lib/calculators (production)
{
  const slugsFile = read("lib/calculators/calculator-slugs.ts");
  checks.push({
    id: "calculator_slugs_no_builtin_helpers",
    ok:
      !slugsFile.includes("isGlasgowSlug") &&
      !slugsFile.includes("hasActiveCalculatorEngine") &&
      !slugsFile.includes("getBuiltInCalculator"),
    detail: "calculator-slugs.ts",
  });
}

// 9 — calculator client components: no per-input API fetch
{
  const calcComponents = walkTs(path.join(ROOT, "components/calculators"));
  const violations: string[] = [];
  for (const file of calcComponents) {
    const src = read(file);
    if (
      /fetch\s*\(/.test(src) &&
      !file.includes("user-content-actions") &&
      !src.includes("toggleFavorite")
    ) {
      violations.push(file);
    }
  }
  checks.push({
    id: "no_fetch_in_calculator_ui",
    ok: violations.length === 0,
    detail: violations.length ? violations.join(", ") : "none",
  });
}

// 10 — engine registry source: no publication metadata exports
{
  const registry = read("lib/calculators/engine-registry.ts");
  checks.push({
    id: "registry_no_visibility_logic",
    ok:
      !registry.includes("visibility") &&
      !registry.includes("published") &&
      !registry.includes("entitlement"),
    detail: "engine-registry.ts",
  });
}

// 11 — scan public calculator app tree for slug exceptions
{
  const violations: string[] = [];
  const patterns = [
    /isGlasgowSlug/,
    /isCockcroftSlug/,
    /hasActiveCalculatorEngine/,
    /getBuiltInCalculator/,
    /fallbackCalculatorDefinition/,
  ];
  for (const file of walkTs(path.join(ROOT, "app/calculators"))) {
    const src = read(file);
    for (const re of patterns) {
      if (re.test(src)) {
        violations.push(`${file}:${re.source}`);
      }
    }
  }
  checks.push({
    id: "app_calculators_no_fallback_helpers",
    ok: violations.length === 0,
    detail: violations.length ? violations.join(", ") : "none",
  });
}

async function main() {
// 12 — dynamic load smoke (GCS + one generated if present)
{
  const gcs = await loadCalculatorEngine("glasgow-coma-scale-score-gcs");
  checks.push({
    id: "load_gcs_engine",
    ok: Boolean(gcs?.calculate),
    detail: gcs ? "ok" : "null",
  });
  const cockcroft = await loadCalculatorEngine("creatinine-clearance-cockcroft-gault-equation");
  checks.push({
    id: "load_cockcroft_engine",
    ok: Boolean(cockcroft?.calculate),
    detail: cockcroft ? "ok" : "null",
  });
  const firstGenerated = Object.keys(GENERATED_ENGINE_MANIFEST)[0];
  if (firstGenerated) {
    const gen = await loadCalculatorEngine(firstGenerated);
    checks.push({
      id: "load_sample_generated_engine",
      ok: Boolean(gen?.calculate),
      detail: firstGenerated,
    });
  }
  const unknown = await loadCalculatorEngine("__unknown_engine_slug__");
  checks.push({
    id: "unknown_engine_returns_null",
    ok: unknown === null,
    detail: "loadCalculatorEngine fail closed",
  });
}

// 13 — formula path requires source payload
{
  const sampleSlug = Object.keys(GENERATED_ENGINE_MANIFEST)[0];
  if (sampleSlug && hasAnyCompiledEngine(sampleSlug)) {
    const without = resolveCalculatorRenderMode(sampleSlug, null);
    checks.push({
      id: "formula_requires_source_payload",
      ok: without === "missing",
      detail: `${sampleSlug} without source => ${without}`,
    });
  }
}

const failed = checks.filter((c) => !c.ok);
if (failed.length > 0) {
  console.error(`Calculator architecture verification failed (${failed.length}):`);
  for (const check of failed) {
    console.error(`  - ${check.id}: ${check.detail}`);
  }
  process.exit(1);
}

console.log(`Calculator architecture verification ok (${checks.length} checks).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
