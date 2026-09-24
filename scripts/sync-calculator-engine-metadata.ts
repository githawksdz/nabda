/**
 * Sync engine_slug / engine_version / engine_implemented to Supabase.
 * Only marks implemented when engine resolves from registry.
 *
 * Usage:
 *   npx tsx scripts/sync-calculator-engine-metadata.ts --dry-run
 *   CONFIRM_CALCULATOR_ENGINE_SYNC=1 npx tsx scripts/sync-calculator-engine-metadata.ts
 */
import fs from "node:fs";
import path from "node:path";
import { createImportClient, getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import {
  engineMetaForSlug,
  listGeneratedEngineSlugs,
  listRegisteredSpecialtySlugs,
} from "@/lib/calculators/engine-registry";

const CONFIRM = "CONFIRM_CALCULATOR_ENGINE_SYNC";
const ROOT = process.cwd();
const REPORT = path.join(ROOT, "data", "calculator-engine-metadata-sync-report.json");

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
  const slugs = [
    ...new Set([
      ...listRegisteredSpecialtySlugs(),
      ...listGeneratedEngineSlugs(),
    ]),
  ].filter((s) => !["glasgow", "cockcroft-gault"].includes(s) || true);

  const updates = [];
  for (const slug of slugs) {
    const meta = engineMetaForSlug(slug);
    if (!meta.engine_implemented) continue;
    updates.push({
      slug,
      engine_slug: meta.engine_slug,
      engine_version: meta.engine_version,
      engine_implemented: true,
    });
  }

  // Also mark additive-ready from inventory as implemented via shared engine marker
  const invPath = path.join(ROOT, "data", "calculator-engine-inventory.json");
  if (fs.existsSync(invPath)) {
    const inv = JSON.parse(fs.readFileSync(invPath, "utf8")) as {
      calculators: Array<{ slug: string; engine_status: string }>;
    };
    for (const c of inv.calculators) {
      if (c.engine_status !== "generic_additive_ready") continue;
      updates.push({
        slug: c.slug,
        engine_slug: "additive-points",
        engine_version: "1.0.0",
        engine_implemented: true,
      });
    }
  }

  const unique = new Map(updates.map((u) => [u.slug, u]));
  const rows = [...unique.values()];

  let updated = 0;
  if (!dryRun) {
    for (const row of rows) {
      const { error } = await client
        .from("calculators")
        .update({
          engine_slug: row.engine_slug,
          engine_version: row.engine_version,
          engine_implemented: true,
          updated_at: new Date().toISOString(),
        })
        .eq("slug", row.slug);
      if (!error) updated += 1;
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: dryRun,
    planned: rows.length,
    updated: dryRun ? 0 : updated,
    sample: rows.slice(0, 10),
  };
  fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `${dryRun ? "DRY-RUN" : "OK"} metadata sync planned=${rows.length} updated=${report.updated}`,
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
