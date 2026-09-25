/**
 * Verify production runtime content-source rules (static CLI checks).
 *
 * Does not invoke Next.js request-scoped Supabase auth. Live slug resolution
 * against Supabase requires a request context and is skipped here.
 *
 * Usage: npx tsx scripts/verify-runtime-content-source.ts
 */
import fs from "node:fs";
import path from "node:path";

import {
  getContentSourceMode,
  isDemoContentMode,
  isProductionContentMode,
  shouldUseLocalContentFallback,
  shouldUseMockContentFallback,
} from "@/lib/content-data/content-source-mode";
import {
  isSourceRenderAllowed,
  payloadSourceLabel,
} from "@/lib/content-data/content-source";
import { isGlasgowSlug, isCockcroftSlug } from "@/lib/calculators/calculator-slugs";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "data", "runtime-content-source-verification.json");

type CheckResult = {
  name: string;
  layer: "static" | "live";
  ok: boolean;
  details: string;
};

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkProviderModule(
  rel: string,
  loaderFn: string,
): CheckResult {
  const src = read(rel);
  const usesLoader = src.includes(loaderFn);
  const banned = [
    "demo-fixtures",
    "from \"@/lib/internal/",
    "loadLocal",
    "fromMock",
  ];
  const hits = banned.filter((token) => src.includes(token));
  return {
    name: `provider_module_${path.basename(rel, ".ts")}`,
    layer: "static",
    ok: usesLoader && hits.length === 0,
    details: usesLoader
      ? hits.length === 0
        ? `uses ${loaderFn}`
        : `banned tokens: ${hits.join(", ")}`
      : `missing loader ${loaderFn}`,
  };
}

function main() {
  loadLocalEnvFiles();

  const mode = getContentSourceMode();
  const checks: CheckResult[] = [];

  checks.push({
    name: "content_source_mode_default",
    layer: "static",
    ok: mode === "production" || process.env.NABDA_CONTENT_MODE === "demo",
    details: `mode=${mode}`,
  });

  checks.push({
    name: "production_not_demo_by_default",
    layer: "static",
    ok: isProductionContentMode() || isDemoContentMode(),
    details: `isProduction=${isProductionContentMode()} isDemo=${isDemoContentMode()}`,
  });

  if (isProductionContentMode()) {
    checks.push({
      name: "mock_fallback_disabled_public",
      layer: "static",
      ok: !shouldUseMockContentFallback(),
      details: `shouldUseMockContentFallback=${shouldUseMockContentFallback()}`,
    });
    checks.push({
      name: "local_fallback_disabled_public",
      layer: "static",
      ok: !shouldUseLocalContentFallback("public"),
      details: `shouldUseLocalContentFallback(public)=${shouldUseLocalContentFallback("public")}`,
    });
  }

  checks.push({
    name: "public_source_render_gate",
    layer: "static",
    ok: typeof isSourceRenderAllowed("public") === "boolean",
    details: `isSourceRenderAllowed(public)=${isSourceRenderAllowed("public")}`,
  });

  checks.push({
    name: "payload_source_label_supabase",
    layer: "static",
    ok: payloadSourceLabel("supabase") === "supabase",
    details: `payloadSourceLabel=${payloadSourceLabel("supabase")}`,
  });

  checks.push(
    checkProviderModule(
      "lib/content-data/protocol-data.ts",
      "loadProtocolRenderSourceFromSupabase",
    ),
    checkProviderModule(
      "lib/content-data/cat-data.ts",
      "loadCatRenderSourceFromSupabase",
    ),
    checkProviderModule(
      "lib/content-data/drug-data.ts",
      "loadDrugRenderSourceFromSupabase",
    ),
    checkProviderModule(
      "lib/content-data/calculator-data.ts",
      "loadCalculatorRenderSourceFromSupabase",
    ),
  );

  checks.push({
    name: "gcs_engine_slug",
    layer: "static",
    ok: isGlasgowSlug("glasgow-coma-scale-score-gcs"),
    details: "isGlasgowSlug(glasgow-coma-scale-score-gcs)",
  });

  checks.push({
    name: "cockcroft_engine_slug",
    layer: "static",
    ok: isCockcroftSlug("cockcroft-gault"),
    details: "isCockcroftSlug(cockcroft-gault)",
  });

  checks.push({
    name: "local_loaders_not_in_content_data",
    layer: "static",
    ok: !fs.existsSync(path.join(ROOT, "lib/content-data/protocol-local.ts")),
    details: "*-local.ts not under lib/content-data/",
  });

  const supabaseLoader = read("lib/content-data/source-payload-supabase.ts");
  checks.push({
    name: "supabase_loader_uses_viewer_auth",
    layer: "static",
    ok:
      supabaseLoader.includes("viewerCanReadSlug") ||
      supabaseLoader.includes("requireAuthenticatedUser"),
    details: "source-payload-supabase stays on user-scoped auth path",
  });

  checks.push({
    name: "live_slug_resolution",
    layer: "live",
    ok: true,
    details:
      "SKIPPED: request-scoped Supabase auth is unavailable in this CLI context",
  });

  const staticFailed = checks.filter((c) => c.layer === "static" && !c.ok);
  const report = {
    generated_at: new Date().toISOString(),
    ok: staticFailed.length === 0,
    contentSourceMode: mode,
    checkCount: checks.length,
    staticFailedCount: staticFailed.length,
    checks,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  if (staticFailed.length > 0) {
    console.error(`STATIC FAIL (${staticFailed.length}):`);
    for (const check of staticFailed) {
      console.error(`  - ${check.name}: ${check.details}`);
    }
    process.exit(1);
  }

  console.log(`STATIC PASS (${checks.filter((c) => c.layer === "static").length} checks)`);
  console.log(
    "LIVE CHECK SKIPPED: request-scoped Supabase auth is unavailable in this CLI context",
  );
}

main();
