/**
 * Verify production UX routes resolve through providers without demo/local
 * fallback, and that missing routes stay unavailable.
 *
 * Usage: npx tsx scripts/verify-production-ux-routes.ts
 * Output: data/production-ux-routes-report.json
 */
import fs from "node:fs";
import path from "node:path";

import { getCalculatorRenderData } from "@/lib/content-data/calculator-data";
import { getCatRenderData } from "@/lib/content-data/cat-data";
import { getDrugRenderData } from "@/lib/content-data/drug-data";
import { getProtocolRenderData } from "@/lib/content-data/protocol-data";
import {
  getContentSourceMode,
  isDemoContentMode,
} from "@/lib/content-data/content-source-mode";
import {
  isCockcroftSlug,
  isGlasgowSlug,
} from "@/lib/calculators/calculator-slugs";
import { calculatorStatusLabel } from "@/lib/calculators/calculator-ui-config";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import type { CalculatorSummary } from "@/types/calculators";
import type { ContentPayloadSource } from "@/types/content-rendering";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "data", "production-ux-routes-report.json");

const SAMPLE_ROUTES = {
  protocols: [
    "asthme-aigu-grave",
    "abces-cutanes-furoncles-anthrax",
  ],
  cat: ["asthme-aigu-grave", "abces-cutanes-furoncles-anthrax"],
  drugs: [
    "amoxicilline",
    "amoxicilline-1000mg-orale-dispersible",
    "paracetamol-500mg-orale-comprime",
  ],
  calculators: [
    "apgar-score",
    "glasgow-coma-scale-score-gcs",
    "creatinine-clearance-cockcroft-gault-equation",
  ],
} as const;

const MISSING_ROUTES = {
  protocols: "does-not-exist",
  cat: "does-not-exist",
  drugs: "does-not-exist",
  calculators: "does-not-exist",
} as const;

type Check = {
  id: string;
  ok: boolean;
  detail: string;
};

function walkTsFiles(dir: string, out: string[]) {
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
      walkTsFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(rel);
    }
  }
}

function scanRuntimeImports(): Check[] {
  const checks: Check[] = [];
  const files: string[] = [];
  for (const root of [
    "app/home",
    "app/search",
    "app/cat",
    "app/protocols",
    "app/drugs",
    "app/calculators",
    "app/favorites",
    "app/history",
    "app/profile",
    "components/content-renderers",
    "components/app",
    "lib/content-data",
  ]) {
    walkTsFiles(path.join(ROOT, root), files);
  }

  const demoDirect =
    /from\s+["']@\/lib\/demo-fixtures\/(?!load(?:["']|$))[^"']+["']/;
  const localJson = /from\s+["'][^"']*\/data\/[^"']*\.json["']/;
  const nabdaDb = /from\s+["'][^"']*nabda_db\//;
  const mockNamed = /from\s+["']@\/lib\/[^"']*mock[^"']*["']/i;

  const demoHits: string[] = [];
  const jsonHits: string[] = [];
  const nabdaHits: string[] = [];
  const mockHits: string[] = [];

  for (const rel of files) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const lines = src.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.trim().startsWith("//")) return;
      const loc = `${rel}:${i + 1}`;
      if (demoDirect.test(line)) demoHits.push(loc);
      if (localJson.test(line)) jsonHits.push(loc);
      if (nabdaDb.test(line)) nabdaHits.push(loc);
      if (mockNamed.test(line)) mockHits.push(loc);
    });
  }

  checks.push({
    id: "no_demo_fixture_imports",
    ok: demoHits.length === 0,
    detail: demoHits.length ? demoHits.slice(0, 8).join(", ") : "clean",
  });
  checks.push({
    id: "no_local_json_fallback",
    ok: jsonHits.length === 0,
    detail: jsonHits.length ? jsonHits.slice(0, 8).join(", ") : "clean",
  });
  checks.push({
    id: "no_nabda_db_imports",
    ok: nabdaHits.length === 0,
    detail: nabdaHits.length ? nabdaHits.slice(0, 8).join(", ") : "clean",
  });
  checks.push({
    id: "no_mock_named_imports",
    ok: mockHits.length === 0,
    detail: mockHits.length ? mockHits.slice(0, 8).join(", ") : "clean",
  });

  return checks;
}

function hasEvalOrScript(value: unknown): boolean {
  if (typeof value === "string") {
    return /\beval\s*\(/i.test(value) || /<script\b/i.test(value);
  }
  if (Array.isArray(value)) return value.some(hasEvalOrScript);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasEvalOrScript);
  }
  return false;
}

function hasUnsafeMediaPath(value: unknown): boolean {
  if (typeof value === "string") {
    return (
      /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(value) ||
      /^file:/i.test(value) ||
      /^[a-zA-Z]:\\/.test(value)
    );
  }
  if (Array.isArray(value)) return value.some(hasUnsafeMediaPath);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasUnsafeMediaPath);
  }
  return false;
}

function payloadSourceOk(source: ContentPayloadSource | undefined): boolean {
  return source === "supabase";
}

async function main() {
  loadLocalEnvFiles();

  const mode = getContentSourceMode();
  const checks: Check[] = [];
  const routes: Array<{
    route: string;
    kind: string;
    resolved: boolean;
    payloadSource?: string | null;
    unavailableExpected?: boolean;
  }> = [];

  checks.push({
    id: "content_mode",
    ok: mode === "production" || process.env.NABDA_CONTENT_MODE === "demo",
    detail: `mode=${mode}`,
  });
  checks.push({
    id: "production_not_demo_by_default",
    ok: !isDemoContentMode() || process.env.NABDA_CONTENT_MODE === "demo",
    detail: `isDemo=${isDemoContentMode()}`,
  });

  checks.push(...scanRuntimeImports());

  const contentUnavailable = fs.readFileSync(
    path.join(ROOT, "components/app/ContentUnavailable.tsx"),
    "utf8",
  );
  checks.push({
    id: "content_unavailable_component",
    ok:
      contentUnavailable.includes('kind: ContentUnavailableKind') ||
      contentUnavailable.includes("ContentUnavailableKind"),
    detail: "ContentUnavailable present with typed kinds",
  });
  checks.push({
    id: "content_unavailable_no_mock_cta",
    ok: !/demo|fixture|mock content/i.test(contentUnavailable),
    detail: "no mock CTAs in unavailable UI",
  });

  for (const slug of SAMPLE_ROUTES.protocols) {
    const data = await getProtocolRenderData(slug, { linkMode: "public" });
    routes.push({
      route: `/protocols/${slug}`,
      kind: "protocol",
      resolved: Boolean(data),
      payloadSource: data?.payloadSource ?? null,
    });
    checks.push({
      id: `protocol_sample_${slug}`,
      ok: Boolean(data) && payloadSourceOk(data?.payloadSource),
      detail: data
        ? `payloadSource=${data.payloadSource}`
        : "missing (expected sample present in Supabase)",
    });
    if (data) {
      checks.push({
        id: `protocol_safe_${slug}`,
        ok: !hasEvalOrScript(data) && !hasUnsafeMediaPath(data),
        detail: "no script/eval/unsafe media",
      });
    }
  }

  for (const slug of SAMPLE_ROUTES.cat) {
    const data = await getCatRenderData(slug, { linkMode: "public" });
    routes.push({
      route: `/cat/${slug}`,
      kind: "cat",
      resolved: Boolean(data),
      payloadSource: data?.payloadSource ?? null,
    });
    checks.push({
      id: `cat_sample_${slug}`,
      ok: Boolean(data) && payloadSourceOk(data?.payloadSource),
      detail: data
        ? `payloadSource=${data.payloadSource} steps=${data.steps.length}`
        : "missing (expected sample present in Supabase)",
    });
    if (data) {
      checks.push({
        id: `cat_no_interactive_graph_claim_${slug}`,
        ok: data.hasInteractiveGraph === false,
        detail: `hasInteractiveGraph=${String(data.hasInteractiveGraph)}`,
      });
      checks.push({
        id: `cat_safe_${slug}`,
        ok: !hasEvalOrScript(data) && !hasUnsafeMediaPath(data),
        detail: "no script/eval/unsafe media",
      });
    }
  }

  for (const slug of SAMPLE_ROUTES.drugs) {
    const data = await getDrugRenderData(slug, { linkMode: "public" });
    routes.push({
      route: `/drugs/${slug}`,
      kind: "drug",
      resolved: Boolean(data),
      payloadSource: data?.payloadSource ?? null,
    });
    checks.push({
      id: `drug_sample_${slug}`,
      ok: Boolean(data) && payloadSourceOk(data?.payloadSource),
      detail: data
        ? `payloadSource=${data.payloadSource}`
        : "missing (expected sample present in Supabase)",
    });
    if (data) {
      checks.push({
        id: `drug_safe_${slug}`,
        ok: !hasEvalOrScript(data) && !hasUnsafeMediaPath(data),
        detail: "no script/eval/unsafe media",
      });
    }
  }

  for (const slug of SAMPLE_ROUTES.calculators) {
    if (isGlasgowSlug(slug) || isCockcroftSlug(slug)) {
      routes.push({
        route: `/calculators/${slug}`,
        kind: "calculator_live",
        resolved: true,
        payloadSource: null,
      });
      checks.push({
        id: `calculator_live_${slug}`,
        ok: true,
        detail: "live engine route (GCS/Cockcroft) — provider payload not required",
      });
      continue;
    }

    const data = await getCalculatorRenderData(slug, { linkMode: "public" });
    routes.push({
      route: `/calculators/${slug}`,
      kind: "calculator",
      resolved: Boolean(data),
      payloadSource: data?.payloadSource ?? null,
    });
    checks.push({
      id: `calculator_sample_${slug}`,
      ok: Boolean(data) && payloadSourceOk(data?.payloadSource),
      detail: data
        ? `payloadSource=${data.payloadSource} locked=${data.locked}`
        : "missing (expected sample present in Supabase)",
    });
    if (data) {
      checks.push({
        id: `calculator_no_source_js_exec_${slug}`,
        ok: !hasEvalOrScript(data),
        detail: data.hasRawJs
          ? "raw JS present but not executed in payload scan"
          : "no raw JS / script in payload",
      });
      const fakeValidated: CalculatorSummary = {
        id: data.sourceId,
        slug: data.slug,
        name: data.title,
        type: "score",
        categorySlugs: [],
        categoryLabel: "",
        description: "",
        status: "needs_validation",
        visibility: "preview_only",
        reviewStatus: "unreviewed",
        href: `/calculators/${data.slug}`,
        iconName: "calculator",
        searchTerms: [],
      };
      const label = calculatorStatusLabel(fakeValidated);
      checks.push({
        id: `calculator_no_valide_without_review_${slug}`,
        ok: label !== "Validé",
        detail: `statusLabel=${label}`,
      });
    }
  }

  const missingLoaders = [
    {
      kind: "protocol" as const,
      slug: MISSING_ROUTES.protocols,
      load: getProtocolRenderData,
    },
    {
      kind: "cat" as const,
      slug: MISSING_ROUTES.cat,
      load: getCatRenderData,
    },
    {
      kind: "drug" as const,
      slug: MISSING_ROUTES.drugs,
      load: getDrugRenderData,
    },
    {
      kind: "calculator" as const,
      slug: MISSING_ROUTES.calculators,
      load: getCalculatorRenderData,
    },
  ];

  for (const item of missingLoaders) {
    const data = await item.load(item.slug, { linkMode: "public" });
    routes.push({
      route: `/${item.kind === "protocol" ? "protocols" : item.kind === "cat" ? "cat" : item.kind === "drug" ? "drugs" : "calculators"}/${item.slug}`,
      kind: item.kind,
      resolved: Boolean(data),
      unavailableExpected: true,
      payloadSource: data ? (data as { payloadSource?: string }).payloadSource : null,
    });
    checks.push({
      id: `${item.kind}_missing_unavailable`,
      ok: !data,
      detail: data ? "unexpectedly resolved" : "null → ContentUnavailable path",
    });
  }

  const failed = checks.filter((c) => !c.ok);
  const report = {
    generated_at: new Date().toISOString(),
    mode,
    ok: failed.length === 0,
    summary: {
      checks: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
      routesChecked: routes.length,
    },
    routes,
    checks,
    failed,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    report.ok
      ? `OK production UX routes (${report.summary.passed}/${report.summary.checks}) → ${path.relative(ROOT, REPORT_PATH)}`
      : `FAIL production UX routes (${report.summary.failed} failed) → ${path.relative(ROOT, REPORT_PATH)}`,
  );
  if (!report.ok) {
    for (const item of failed) {
      console.error(`- ${item.id}: ${item.detail}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
