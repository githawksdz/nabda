/**
 * Verify production runtime cleanup: no unused detail blobs, no hardcoded
 * chip counts in UI config, media served without broad globs.
 *
 * Usage: npx tsx scripts/verify-production-runtime-cleanup.ts
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

type Finding = {
  id: string;
  ok: boolean;
  detail: string;
};

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

const findings: Finding[] = [];

// 1. content-detail-ui-config has no large detail blobs
{
  const file = "lib/content-detail/content-detail-ui-config.ts";
  const src = read(file);
  const banned = [
    "hsaDetail",
    "meningeDetail",
    "thoraxDetail",
    "PROTOCOL_DETAILS",
    "CAT_DETAILS",
    "placeholderSection",
  ];
  const hits = banned.filter((token) => src.includes(token));
  findings.push({
    id: "content-detail-ui-config-no-blobs",
    ok: hits.length === 0 && src.length < 12_000,
    detail:
      hits.length === 0
        ? `clean (${src.length} bytes)`
        : `still contains: ${hits.join(", ")}`,
  });
}

// 2. no direct demo-fixture imports from runtime (except load)
{
  const roots = ["app", "components", "features", "lib"];
  const violations: string[] = [];
  const skip = new Set(["lib/demo-fixtures", "scripts"]);

  function walk(dir: string, out: string[]) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(ROOT, full).replaceAll("\\", "/");
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".next" ||
          entry.name === "internal" ||
          entry.name === "demo-fixtures" ||
          entry.name === "nabda-db"
        ) {
          continue;
        }
        if ([...skip].some((prefix) => rel.startsWith(prefix))) continue;
        walk(full, out);
      } else if (/\.(ts|tsx)$/.test(entry.name) && !rel.includes("demo-fixtures")) {
        out.push(full);
      }
    }
  }

  const files: string[] = [];
  for (const root of roots) walk(path.join(ROOT, root), files);

  const directFixture =
    /from\s+["']@\/lib\/demo-fixtures\/(?!load(?:["']|$))[^"']+["']/;
  for (const file of files) {
    const rel = path.relative(ROOT, file).replaceAll("\\", "/");
    if (rel.startsWith("lib/demo-fixtures/")) continue;
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.trim().startsWith("//")) return;
      if (directFixture.test(line)) {
        violations.push(`${rel}:${i + 1}`);
      }
    });
  }

  findings.push({
    id: "no-direct-demo-fixture-imports",
    ok: violations.length === 0,
    detail:
      violations.length === 0
        ? "ok"
        : violations.slice(0, 10).join("; "),
  });
}

// 3. CAT chip counts not hardcoded in ui-config
{
  const src = read("lib/cat/cat-ui-config.ts");
  const hardcoded =
    /\(\d+\)/.test(src) ||
    /countLabel:\s*["']\d+/.test(src) ||
    /42 CAT/.test(src) ||
    /Urgences \(18\)/.test(src);
  const hasDeriver = src.includes("generalFilterChipsForCatalog");
  findings.push({
    id: "cat-chip-counts-data-driven",
    ok: !hardcoded && hasDeriver,
    detail: hardcoded
      ? "hardcoded numeric counts remain in cat-ui-config"
      : "labels without static counts; deriver present",
  });
}

// 4. Calculator chip counts not hardcoded
{
  const src = read("lib/calculators/calculator-ui-config.ts");
  const hasStaticCatalogCount =
    /CALCULATOR_CATALOG_COUNT\s*=\s*\d+/.test(src) ||
    /count:\s*\d+/.test(src);
  const hasDeriver =
    src.includes("filterChipsForCatalog") && src.includes("contextsForCatalog");
  findings.push({
    id: "calculator-chip-counts-data-driven",
    ok: !hasStaticCatalogCount && hasDeriver,
    detail: hasStaticCatalogCount
      ? "static count constants remain"
      : "counts derived via filterChipsForCatalog / contextsForCatalog",
  });
}

// 5. media route / payload loader do not broad-glob nabda_db
{
  const payload = read("lib/content-data/source-payload-supabase.ts");
  const mediaPaths = read("lib/content-data/source-media-paths.ts");
  const catRoute = read("app/content-media/cat/route.ts");
  const nextConfig = read("next.config.ts");

  const payloadTouchesFs =
    /nabda_db.*cat.*media/.test(payload) && /existsSync|readdirSync|glob/.test(payload);
  const routeUsesResolver = catRoute.includes("resolveCatSourceMediaPath");
  const tracingExcludes = nextConfig.includes("nabda_db/cat/media");
  const safeAllowlist = mediaPaths.includes("isSafeMediaFilename");

  findings.push({
    id: "media-no-broad-glob-in-payload",
    ok: !payloadTouchesFs && routeUsesResolver && safeAllowlist,
    detail: payloadTouchesFs
      ? "source-payload-supabase still probes nabda_db media on disk"
      : "payload uses filename allowlist; route resolves safely",
  });

  findings.push({
    id: "media-tracing-excludes",
    ok: tracingExcludes,
    detail: tracingExcludes
      ? "next.config excludes nabda_db media from file tracing"
      : "missing outputFileTracingExcludes for nabda_db media",
  });
}

// 6. no public route imports nabda_db filesystem paths directly
{
  const publicRoots = [
    "app/home",
    "app/search",
    "app/cat",
    "app/protocols",
    "app/drugs",
    "app/calculators",
    "app/favorites",
    "app/history",
    "app/profile",
    "components",
    "features",
  ];
  const violations: string[] = [];
  const nabdaDbFs = /from\s+["'][^"']*\/nabda_db\//;
  for (const root of publicRoots) {
    const dir = path.join(ROOT, root);
    if (!fs.existsSync(dir)) continue;
    const stack = [dir];
    while (stack.length) {
      const current = stack.pop()!;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "internal" || entry.name === "node_modules") continue;
          stack.push(full);
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
          const src = fs.readFileSync(full, "utf8");
          if (nabdaDbFs.test(src)) {
            violations.push(path.relative(ROOT, full).replaceAll("\\", "/"));
          }
        }
      }
    }
  }
  findings.push({
    id: "no-public-nabda-db-imports",
    ok: violations.length === 0,
    detail: violations.length === 0 ? "ok" : violations.slice(0, 8).join("; "),
  });
}

// 7. runtime still uses Supabase providers
{
  const providers = [
    "lib/content-data/cat-data.ts",
    "lib/content-data/protocol-data.ts",
    "lib/content-data/drug-data.ts",
    "lib/content-data/calculator-data.ts",
  ];
  const missing = providers.filter((p) => !exists(p));
  const usesSupabase = providers
    .filter((p) => exists(p))
    .every((p) => {
      const src = read(p);
      return /supabase|getCat|getProtocol|getDrug|getCalculator/i.test(src);
    });
  findings.push({
    id: "supabase-providers-present",
    ok: missing.length === 0 && usesSupabase,
    detail:
      missing.length > 0
        ? `missing: ${missing.join(", ")}`
        : "content-data providers present",
  });
}

const report = {
  generated_at: new Date().toISOString(),
  ok: findings.every((f) => f.ok),
  findings,
};

const outPath = path.join(ROOT, "data", "production-runtime-cleanup-report.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

if (!report.ok) {
  console.error("Production runtime cleanup verification failed:");
  for (const f of findings.filter((item) => !item.ok)) {
    console.error(`  ✗ [${f.id}] ${f.detail}`);
  }
  process.exit(1);
}

console.log(
  `Production runtime cleanup ok (${findings.length} checks). Report: data/production-runtime-cleanup-report.json`,
);
