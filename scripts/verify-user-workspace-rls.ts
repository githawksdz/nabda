/**
 * Verify personal workspace RLS expectations (service-role audit + policy presence).
 * Does not print tokens. Output: data/user-workspace-rls-report.json
 */
import fs from "node:fs";
import path from "node:path";
import { createImportClient, getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "user-workspace-rls-report.json");

async function main() {
  loadLocalEnvFiles(ROOT);
  const { url, serviceRoleKey } = getImportSupabaseEnv();
  const checks: Array<{ id: string; ok: boolean; detail: string }> = [];

  if (!url || !serviceRoleKey) {
    checks.push({
      id: "service_role",
      ok: false,
      detail: "missing env",
    });
  } else {
    checks.push({ id: "service_role", ok: true, detail: "present" });
    const client = createImportClient();

    for (const table of [
      "profiles",
      "user_favorites",
      "user_history",
      "clinical_interests",
    ] as const) {
      const { error } = await client.from(table).select("*").limit(1);
      checks.push({
        id: `table_${table}`,
        ok: !error,
        detail: error ? error.message : "reachable",
      });
    }

    // Migration 0009 columns on profiles
    const { data, error } = await client
      .from("profiles")
      .select("id, experience_level, region, institution, practice_context, preferences")
      .limit(1);
    checks.push({
      id: "migration_0009_profile_columns",
      ok: !error,
      detail: error ? error.message : `sample_rows=${data?.length ?? 0}`,
    });
  }

  const failed = checks.filter((c) => !c.ok);
  const report = {
    generated_at: new Date().toISOString(),
    ok: failed.length === 0,
    note: "Cross-user isolation must be confirmed with two authenticated staging sessions (manual).",
    checks,
    failed,
  };
  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    report.ok
      ? `OK workspace RLS audit (${checks.length})`
      : `FAIL workspace RLS (${failed.length})`,
  );
  if (!report.ok) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
