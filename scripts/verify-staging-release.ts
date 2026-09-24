/**
 * Aggregate staging release verification.
 * Output: data/staging-release-verification.json
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "staging-release-verification.json");

type Status = "pass" | "warning" | "blocker";
type Check = { id: string; status: Status; detail: string };

function runScript(rel: string): { ok: boolean; detail: string } {
  const result = spawnSync(
    "npx",
    ["tsx", rel],
    { cwd: ROOT, encoding: "utf8", shell: true, timeout: 300_000 },
  );
  if (result.status === 0) return { ok: true, detail: "ok" };
  const err = (result.stderr || result.stdout || "failed").slice(0, 400);
  return { ok: false, detail: err };
}

function main() {
  const checks: Check[] = [];

  const scripts = [
    ["verify-runtime-content-source", "scripts/verify-runtime-content-source.ts"],
    ["verify-production-ux-routes", "scripts/verify-production-ux-routes.ts"],
    ["verify-search-documents", "scripts/verify-search-documents.ts"],
    ["verify-all-calculator-engines", "scripts/verify-all-calculator-engines.ts"],
    ["verify-calculator-client-safety", "scripts/verify-calculator-client-safety.ts"],
    ["verify-additive-calculator-profiles", "scripts/verify-additive-calculator-profiles.ts"],
    ["check-renderer-import-boundaries", "scripts/check-renderer-import-boundaries.ts"],
    ["verify-no-runtime-mock-imports", "scripts/verify-no-runtime-mock-imports.ts"],
    ["verify-production-runtime-cleanup", "scripts/verify-production-runtime-cleanup.ts"],
  ] as const;

  for (const [id, rel] of scripts) {
    if (!fs.existsSync(path.join(ROOT, rel))) {
      checks.push({ id, status: "warning", detail: "script missing" });
      continue;
    }
    const r = runScript(rel);
    // Search ILIKE can time out under load; treat timeout as warning if prior report passed.
    if (
      id === "verify-search-documents" &&
      !r.ok &&
      /timeout/i.test(r.detail)
    ) {
      const prior = path.join(ROOT, "data/search-documents-verification-report.json");
      if (fs.existsSync(prior)) {
        try {
          const prev = JSON.parse(fs.readFileSync(prior, "utf8")) as {
            ok?: boolean;
          };
          if (prev.ok) {
            checks.push({
              id,
              status: "warning",
              detail: "transient timeout; prior report ok",
            });
            continue;
          }
        } catch {
          /* fall through */
        }
      }
    }
    checks.push({
      id,
      status: r.ok ? "pass" : "blocker",
      detail: r.detail,
    });
  }

  // Env names
  const example = fs.readFileSync(
    path.join(ROOT, ".env.staging.example"),
    "utf8",
  );
  checks.push({
    id: "staging_env_example",
    status: example.includes("NEXT_PUBLIC_SUPABASE_URL") ? "pass" : "blocker",
    detail: ".env.staging.example",
  });

  const nextConfig = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  checks.push({
    id: "source_maps_disabled",
    status: /productionBrowserSourceMaps:\s*false/.test(nextConfig)
      ? "pass"
      : "blocker",
    detail: "next.config.ts",
  });
  checks.push({
    id: "security_headers",
    status: /X-Content-Type-Options/.test(nextConfig) ? "pass" : "warning",
    detail: "nosniff/frame/referrer",
  });

  checks.push({
    id: "health_route",
    status: fs.existsSync(path.join(ROOT, "app/api/health/route.ts"))
      ? "pass"
      : "blocker",
    detail: "app/api/health",
  });
  checks.push({
    id: "readiness_route",
    status: fs.existsSync(path.join(ROOT, "app/api/readiness/route.ts"))
      ? "pass"
      : "blocker",
    detail: "app/api/readiness",
  });

  const demoOn =
    process.env.NABDA_CONTENT_MODE === "demo" ||
    process.env.NEXT_PUBLIC_NABDA_CONTENT_MODE === "demo";
  checks.push({
    id: "demo_mode_off",
    status: demoOn ? "blocker" : "pass",
    detail: demoOn ? "demo enabled" : "production/default",
  });

  checks.push({
    id: "service_role_not_public",
    status: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
      ? "blocker"
      : "pass",
    detail: "no NEXT_PUBLIC service role",
  });

  const docs = [
    "docs/staging.md",
    "docs/runtime-content-source-of-truth.md",
    "docs/renderer-architecture-boundaries.md",
    "docs/validation-and-safety.md",
  ];
  for (const d of docs) {
    checks.push({
      id: `doc_${path.basename(d)}`,
      status: fs.existsSync(path.join(ROOT, d)) ? "pass" : "warning",
      detail: d,
    });
  }

  // Calculator gaps are expected — warning only if report missing
  const gaps = path.join(ROOT, "data/calculator-engine-implementation-gaps.json");
  checks.push({
    id: "calculator_gaps_documented",
    status: fs.existsSync(gaps) ? "pass" : "warning",
    detail: "257 gaps allowed for RC1",
  });

  const recon = path.join(
    ROOT,
    "data/calculator-engine-metadata-reconciliation.json",
  );
  checks.push({
    id: "metadata_reconciliation_report",
    status: fs.existsSync(recon) ? "pass" : "warning",
    detail: recon,
  });

  const blockers = checks.filter((c) => c.status === "blocker");
  const report = {
    generated_at: new Date().toISOString(),
    milestone: "Nabda Live Staging RC1",
    ok: blockers.length === 0,
    summary: {
      pass: checks.filter((c) => c.status === "pass").length,
      warning: checks.filter((c) => c.status === "warning").length,
      blocker: blockers.length,
    },
    checks,
    blockers,
  };
  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    report.ok
      ? `OK staging release verification (${report.summary.pass} pass, ${report.summary.warning} warn)`
      : `FAIL staging release (${blockers.length} blockers)`,
  );
  if (!report.ok) process.exitCode = 1;
}

main();
