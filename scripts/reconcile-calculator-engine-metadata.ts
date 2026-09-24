/**
 * Reconcile calculator engine_implemented metadata vs registry.
 *
 * Usage:
 *   npx tsx scripts/reconcile-calculator-engine-metadata.ts --dry-run
 *   CONFIRM_CALCULATOR_ENGINE_SYNC=1 npx tsx scripts/reconcile-calculator-engine-metadata.ts
 */
import fs from "node:fs";
import path from "node:path";
import { createImportClient, getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import {
  engineMetaForSlug,
  hasAnyCompiledEngine,
  listGeneratedEngineSlugs,
  listRegisteredSpecialtySlugs,
  loadCalculatorEngine,
} from "@/lib/calculators/engine-registry";
import { resolveCalculatorSlug } from "@/lib/calculators/calculator-slugs";

const CONFIRM = "CONFIRM_CALCULATOR_ENGINE_SYNC";
const ROOT = process.cwd();
const INV = path.join(ROOT, "data", "calculator-engine-inventory.json");
const OUT = path.join(ROOT, "data", "calculator-engine-metadata-reconciliation.json");

const ALIAS_SLUGS = new Set(["glasgow", "cockcroft-gault"]);

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (!dryRun && process.env[CONFIRM] !== "1") {
    throw new Error(`Refusing write. Set ${CONFIRM}=1 or pass --dry-run.`);
  }
  loadLocalEnvFiles(ROOT);
  const { url, serviceRoleKey } = getImportSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new Error("Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const client = createImportClient();
  const inv = JSON.parse(fs.readFileSync(INV, "utf8")) as {
    calculators: Array<{
      slug: string;
      engine_status: string;
      source_id: string;
    }>;
  };

  // Unique live set from inventory + registry (canonical only)
  const liveCanonical = new Set<string>();
  for (const c of inv.calculators) {
    if (c.engine_status === "generic_additive_ready") {
      liveCanonical.add(resolveCalculatorSlug(c.slug));
      continue;
    }
    if (c.engine_status === "implemented" || hasAnyCompiledEngine(c.slug)) {
      liveCanonical.add(resolveCalculatorSlug(c.slug));
    }
  }
  for (const slug of listGeneratedEngineSlugs()) {
    liveCanonical.add(resolveCalculatorSlug(slug));
  }
  for (const slug of listRegisteredSpecialtySlugs()) {
    if (ALIAS_SLUGS.has(slug)) continue;
    liveCanonical.add(resolveCalculatorSlug(slug));
  }

  const { data: dbRows, error } = await client
    .from("calculators")
    .select("slug, engine_slug, engine_version, engine_implemented");
  if (error) throw new Error(error.message);

  const incorrectlyImplemented: Array<Record<string, unknown>> = [];
  const missingMetadata: Array<Record<string, unknown>> = [];
  const aliasRows: Array<Record<string, unknown>> = [];
  const smokeFailures: Array<Record<string, unknown>> = [];

  const toClear: string[] = [];
  const toSet: Array<{
    slug: string;
    engine_slug: string;
    engine_version: string;
  }> = [];

  for (const row of dbRows ?? []) {
    const canonical = resolveCalculatorSlug(row.slug);
    const isAlias = ALIAS_SLUGS.has(row.slug) || row.slug !== canonical;
    if (isAlias && row.engine_implemented) {
      aliasRows.push({
        slug: row.slug,
        canonical,
        note: "Alias row — does not inflate unique coverage",
      });
    }

    const shouldBeLive =
      liveCanonical.has(canonical) ||
      (row.engine_slug === "additive-points" &&
        inv.calculators.some(
          (c) =>
            c.slug === row.slug && c.engine_status === "generic_additive_ready",
        ));

    if (row.engine_implemented && !shouldBeLive && !hasAnyCompiledEngine(row.slug)) {
      // additive marked via sync
      const invRow = inv.calculators.find((c) => c.slug === row.slug);
      if (invRow?.engine_status === "generic_additive_ready") {
        // ok
      } else if (row.engine_slug === "additive-points") {
        // ok if inventory says additive
      } else {
        incorrectlyImplemented.push({
          slug: row.slug,
          engine_slug: row.engine_slug,
          reason: "DB implemented but no resolvable engine",
        });
        toClear.push(row.slug);
      }
    }

    if (shouldBeLive && !row.engine_implemented) {
      const meta = engineMetaForSlug(canonical);
      const invRow = inv.calculators.find((c) => c.slug === row.slug);
      toSet.push({
        slug: row.slug,
        engine_slug:
          invRow?.engine_status === "generic_additive_ready"
            ? "additive-points"
            : meta.engine_slug,
        engine_version: "1.0.0",
      });
      missingMetadata.push({ slug: row.slug, canonical });
    }
  }

  // Smoke: specialty + sample generated
  for (const slug of [
    "glasgow-coma-scale-score-gcs",
    "creatinine-clearance-cockcroft-gault-equation",
    "pregnancy-due-dates-calculator",
    "winters-formula-metabolic-acidosis-compensation",
    ...listGeneratedEngineSlugs().slice(0, 5),
  ]) {
    const eng = await loadCalculatorEngine(slug);
    if (!eng) {
      smokeFailures.push({ slug, reason: "load_failed" });
      continue;
    }
    if (!eng.version) smokeFailures.push({ slug, reason: "missing_version" });
  }

  const implementedDb = (dbRows ?? []).filter((r) => r.engine_implemented);
  const uniqueImplementedCanonical = new Set(
    implementedDb.map((r) => resolveCalculatorSlug(r.slug)),
  );

  // Explain 623 vs 621: sync included alias slugs glasgow + cockcroft-gault
  const explanation = {
    live_unique_canonical: liveCanonical.size,
    db_implemented_rows: implementedDb.length,
    db_unique_canonical: uniqueImplementedCanonical.size,
    likely_623_reason:
      "Metadata sync counted alias rows (e.g. glasgow, cockcroft-gault) plus canonical slugs, inflating row updates vs unique live engines.",
    alias_rows_implemented: aliasRows.length,
  };

  if (!dryRun) {
    for (const slug of toClear) {
      await client
        .from("calculators")
        .update({
          engine_implemented: false,
          engine_slug: null,
          engine_version: null,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", slug);
    }
    for (const row of toSet) {
      await client
        .from("calculators")
        .update({
          engine_implemented: true,
          engine_slug: row.engine_slug,
          engine_version: row.engine_version,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", row.slug);
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: dryRun,
    explanation,
    live_canonical_count: liveCanonical.size,
    live_canonical_sample: [...liveCanonical].slice(0, 20),
    incorrectly_implemented: incorrectlyImplemented,
    missing_metadata: missingMetadata,
    alias_rows: aliasRows,
    smoke_failures: smokeFailures,
    planned_clear: toClear,
    planned_set: toSet.length,
    ok: smokeFailures.length === 0,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `${dryRun ? "DRY-RUN" : "OK"} reconcile live=${liveCanonical.size} db_impl_rows≈${implementedDb.length} clear=${toClear.length} set=${toSet.length}`,
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
