/**
 * Client safety checks for calculator staging.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "calculator-client-safety-report.json");

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "nabda_db"].includes(entry.name)) continue;
      walkFiles(full, acc);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function main() {
  const checks: Array<{ id: string; ok: boolean; detail: string }> = [];
  const clientRoots = [
    path.join(ROOT, "app"),
    path.join(ROOT, "components"),
    path.join(ROOT, "lib", "calculators"),
  ];
  const files = clientRoots.flatMap((d) => walkFiles(d));

  const evalHits: string[] = [];
  const newFnHits: string[] = [];
  const serviceRoleHits: string[] = [];
  const equationHits: string[] = [];

  for (const file of files) {
    // Skip compiler (build-time only) from client eval checks for acorn usage
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    const text = fs.readFileSync(file, "utf8");
    if (/\beval\s*\(/.test(text)) evalHits.push(rel);
    if (/new\s+Function\s*\(/.test(text)) newFnHits.push(rel);
    if (
      rel.startsWith("app/") ||
      rel.startsWith("components/") ||
      (rel.startsWith("lib/") && !rel.includes("nabda-db") && !rel.includes("import-client"))
    ) {
      if (/SUPABASE_SERVICE_ROLE_KEY/.test(text) && !rel.includes("scripts/")) {
        // lib/calculators should not reference service role
        if (rel.startsWith("lib/calculators") || rel.startsWith("components/") || rel.startsWith("app/")) {
          serviceRoleHits.push(rel);
        }
      }
    }
    if (
      (rel.startsWith("components/") || rel.startsWith("app/calculators")) &&
      /equation_logic_text/.test(text)
    ) {
      equationHits.push(rel);
    }
  }

  const nextConfig = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  checks.push({
    id: "no_eval",
    ok: evalHits.length === 0,
    detail: evalHits.slice(0, 5).join(", ") || "clean",
  });
  checks.push({
    id: "no_new_Function",
    ok: newFnHits.length === 0,
    detail: newFnHits.slice(0, 5).join(", ") || "clean",
  });
  checks.push({
    id: "no_service_role_in_client_surfaces",
    ok: serviceRoleHits.length === 0,
    detail: serviceRoleHits.slice(0, 5).join(", ") || "clean",
  });
  checks.push({
    id: "production_source_maps_disabled",
    ok: /productionBrowserSourceMaps:\s*false/.test(nextConfig),
    detail: "next.config.ts",
  });
  checks.push({
    id: "dynamic_engine_loading",
    ok: fs.existsSync(
      path.join(ROOT, "lib/calculators/generated-engines/manifest.ts"),
    ),
    detail: "generated-engines/manifest.ts",
  });
  checks.push({
    id: "no_equation_logic_in_calculator_routes",
    ok: equationHits.length === 0,
    detail: equationHits.slice(0, 5).join(", ") || "clean",
  });

  // Public DTO: jsPreview should be undefined assignment in mapper
  const mapper = fs.readFileSync(
    path.join(ROOT, "lib/content-rendering/calculator.ts"),
    "utf8",
  );
  checks.push({
    id: "jsPreview_stripped_from_public_dto",
    ok: /jsPreview:\s*undefined/.test(mapper),
    detail: "mapCalculatorPreviewModel",
  });

  const failed = checks.filter((c) => !c.ok);
  const report = {
    generated_at: new Date().toISOString(),
    ok: failed.length === 0,
    checks,
    failed,
  };
  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    report.ok
      ? `OK client safety (${checks.length})`
      : `FAIL client safety (${failed.length})`,
  );
  if (!report.ok) {
    for (const f of failed) console.error(`- ${f.id}: ${f.detail}`);
    process.exitCode = 1;
  }
}

main();
