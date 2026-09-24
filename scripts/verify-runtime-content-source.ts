/**
 * Verify production runtime uses Supabase-only content providers.
 *
 * Usage: npx tsx scripts/verify-runtime-content-source.ts
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
import { isGlasgowSlug, isCockcroftSlug } from "@/lib/calculators/calculator-slugs";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "data", "runtime-content-source-verification.json");

const EXISTING_SLUGS = {
  protocol: "asthme-aigu-grave",
  cat: "asthme-aigu-grave",
  drugDci: "amoxicilline",
  drugPresentation: "amoxicilline-1000mg-orale-dispersible",
  calculator: "apgar-score",
  calculatorGcs: "glasgow-coma-scale-score-gcs",
} as const;

const MISSING_SLUGS = {
  protocol: "does-not-exist",
  cat: "does-not-exist",
  drug: "does-not-exist",
  calculator: "does-not-exist",
} as const;

type CheckResult = {
  name: string;
  ok: boolean;
  details: string;
};

function hasEvalOrScript(value: unknown): boolean {
  if (typeof value === "string") {
    return /\beval\s*\(/i.test(value) || /<script\b/i.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(hasEvalOrScript);
  }
  if (value && typeof value === "object") {
    return Object.values(value).some(hasEvalOrScript);
  }
  return false;
}

async function providerCheck(
  label: string,
  slug: string,
  loader: (slug: string) => Promise<unknown | null>,
  expectFound: boolean,
): Promise<CheckResult> {
  const data = await loader(slug);
  const found = Boolean(data);
  const ok = found === expectFound;
  const payloadSource =
    data && typeof data === "object" && "payloadSource" in data
      ? String((data as { payloadSource?: string }).payloadSource)
      : null;

  return {
    name: label,
    ok,
    details: expectFound
      ? `found=${found} payloadSource=${payloadSource ?? "n/a"}`
      : `found=${found} (expected null/not_found)`,
  };
}

async function main() {
  loadLocalEnvFiles();

  const mode = getContentSourceMode();
  const checks: CheckResult[] = [];

  checks.push({
    name: "content_source_mode_default",
    ok: mode === "production" || process.env.NABDA_CONTENT_MODE === "demo",
    details: `mode=${mode}`,
  });

  checks.push({
    name: "production_not_demo",
    ok: !isDemoContentMode() || process.env.NABDA_CONTENT_MODE === "demo",
    details: `isDemo=${isDemoContentMode()}`,
  });

  const existing = await Promise.all([
    providerCheck(
      "protocol_existing",
      EXISTING_SLUGS.protocol,
      (slug) => getProtocolRenderData(slug, { linkMode: "public" }),
      true,
    ),
    providerCheck(
      "cat_existing",
      EXISTING_SLUGS.cat,
      (slug) => getCatRenderData(slug, { linkMode: "public" }),
      true,
    ),
    providerCheck(
      "drug_dci_existing",
      EXISTING_SLUGS.drugDci,
      (slug) => getDrugRenderData(slug, { linkMode: "public" }),
      true,
    ),
    providerCheck(
      "drug_presentation_existing",
      EXISTING_SLUGS.drugPresentation,
      (slug) => getDrugRenderData(slug, { linkMode: "public" }),
      true,
    ),
    providerCheck(
      "calculator_existing",
      EXISTING_SLUGS.calculator,
      (slug) => getCalculatorRenderData(slug, { linkMode: "public" }),
      true,
    ),
  ]);
  checks.push(...existing);

  const missing = await Promise.all([
    providerCheck(
      "protocol_missing",
      MISSING_SLUGS.protocol,
      (slug) => getProtocolRenderData(slug, { linkMode: "public" }),
      false,
    ),
    providerCheck(
      "cat_missing",
      MISSING_SLUGS.cat,
      (slug) => getCatRenderData(slug, { linkMode: "public" }),
      false,
    ),
    providerCheck(
      "drug_missing",
      MISSING_SLUGS.drug,
      (slug) => getDrugRenderData(slug, { linkMode: "public" }),
      false,
    ),
    providerCheck(
      "calculator_missing",
      MISSING_SLUGS.calculator,
      (slug) => getCalculatorRenderData(slug, { linkMode: "public" }),
      false,
    ),
  ]);
  checks.push(...missing);

  checks.push({
    name: "gcs_engine_slug",
    ok: isGlasgowSlug(EXISTING_SLUGS.calculatorGcs),
    details: `isGlasgowSlug(${EXISTING_SLUGS.calculatorGcs})`,
  });

  checks.push({
    name: "cockcroft_engine_slug",
    ok: isCockcroftSlug("cockcroft-gault"),
    details: "isCockcroftSlug(cockcroft-gault)",
  });

  const protocol = await getProtocolRenderData(EXISTING_SLUGS.protocol, {
    linkMode: "public",
  });
  const cat = await getCatRenderData(EXISTING_SLUGS.cat, { linkMode: "public" });
  const drug = await getDrugRenderData(EXISTING_SLUGS.drugDci, {
    linkMode: "public",
  });
  const calculator = await getCalculatorRenderData(EXISTING_SLUGS.calculator, {
    linkMode: "public",
  });

  checks.push({
    name: "no_script_or_eval_in_payloads",
    ok: !hasEvalOrScript([protocol, cat, drug, calculator]),
    details: "sample payloads scanned for <script> and eval()",
  });

  if (protocol) {
    checks.push({
      name: "protocol_supabase_only",
      ok: protocol.payloadSource === "supabase",
      details: `payloadSource=${protocol.payloadSource}`,
    });
  }

  checks.push({
    name: "local_loaders_not_in_content_data",
    ok: !fs.existsSync(path.join(ROOT, "lib/content-data/protocol-local.ts")),
    details: "*-local.ts moved under lib/internal/",
  });

  const failed = checks.filter((check) => !check.ok);
  const report = {
    generated_at: new Date().toISOString(),
    ok: failed.length === 0,
    contentSourceMode: mode,
    existingSlugs: EXISTING_SLUGS,
    missingSlugs: MISSING_SLUGS,
    checkCount: checks.length,
    failedCount: failed.length,
    checks,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  if (failed.length > 0) {
    console.error(`Runtime content source verification failed (${failed.length}):`);
    for (const check of failed) {
      console.error(`  - ${check.name}: ${check.details}`);
    }
    process.exit(1);
  }

  console.log(`Runtime content source verification ok (${checks.length} checks).`);
}

void main();
