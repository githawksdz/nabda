/**
 * Server-side provider verification for Supabase-first source payloads.
 *
 * Usage: npx tsx scripts/verify-source-payload-providers.ts
 */
import fs from "node:fs";
import path from "node:path";

import { getCalculatorRenderData } from "@/lib/content-data/calculator-data";
import { getCatRenderData } from "@/lib/content-data/cat-data";
import { getDrugRenderData } from "@/lib/content-data/drug-data";
import { getProtocolRenderData } from "@/lib/content-data/protocol-data";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import type { ContentPayloadSource } from "@/types/content-rendering-core";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "data", "source-payload-provider-verification.json");

type ProviderCheck = {
  route: string;
  slug: string;
  found: boolean;
  payloadSource: ContentPayloadSource | null;
  activationState: string | null;
  provenanceLabel: string;
  counts: Record<string, number>;
  htmlSanitized: boolean;
  notes: string[];
};

function hasScriptTags(value: unknown): boolean {
  if (typeof value === "string") {
    return /<script\b/i.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(hasScriptTags);
  }
  if (value && typeof value === "object") {
    return Object.values(value).some(hasScriptTags);
  }
  return false;
}

function provenanceLabel(source: ContentPayloadSource | null): string {
  if (source === "supabase") return "Supabase source payload (server-only, admin_only)";
  if (source === "local_normalized") return "Local normalized JSON fallback";
  return "No source (mock fallback in route)";
}

async function checkProtocol(slug: string): Promise<ProviderCheck> {
  const data = await getProtocolRenderData(slug, { linkMode: "public" });
  const htmlFields = data?.sections.map((section) => section.html) ?? [];
  return {
    route: "/protocols/[slug]",
    slug,
    found: Boolean(data),
    payloadSource: data?.payloadSource ?? null,
    activationState: data?.activationState ?? null,
    provenanceLabel: provenanceLabel(data?.payloadSource ?? null),
    counts: {
      sections: data?.sections.length ?? 0,
      warnings: data?.protocolWarnings.length ?? 0,
    },
    htmlSanitized: !hasScriptTags(htmlFields),
    notes: data ? [] : ["Provider returned null — route will use mock/detail API"],
  };
}

async function checkCat(slug: string): Promise<ProviderCheck> {
  const data = await getCatRenderData(slug, { linkMode: "public" });
  const htmlFields = data?.steps.map((step) => step.html) ?? [];
  return {
    route: "/cat/[slug]",
    slug,
    found: Boolean(data),
    payloadSource: data?.payloadSource ?? null,
    activationState: data?.activationState ?? null,
    provenanceLabel: provenanceLabel(data?.payloadSource ?? null),
    counts: {
      steps: data?.steps.length ?? 0,
      images: data?.images.length ?? 0,
      warnings: data?.protocolWarnings.length ?? 0,
    },
    htmlSanitized: !hasScriptTags(htmlFields),
    notes: data ? [] : ["Provider returned null — route will use mock/detail API"],
  };
}

async function checkDrug(slug: string): Promise<ProviderCheck> {
  const data = await getDrugRenderData(slug, { linkMode: "public" });
  const htmlFields = data?.sections.map((section) => section.html) ?? [];
  return {
    route: "/drugs/[slug]",
    slug,
    found: Boolean(data),
    payloadSource: data?.payloadSource ?? null,
    activationState: data?.activationState ?? null,
    provenanceLabel: provenanceLabel(data?.payloadSource ?? null),
    counts: {
      sections: data?.sections.length ?? 0,
      tables: data?.tables.length ?? 0,
      warnings: data?.protocolWarnings.length ?? 0,
    },
    htmlSanitized: !hasScriptTags(htmlFields),
    notes: data?.htmlOmitted ? ["HTML omitted — text preview / sanitized path"] : [],
  };
}

async function checkCalculator(slug: string): Promise<ProviderCheck> {
  const data = await getCalculatorRenderData(slug, { linkMode: "public" });
  return {
    route: "/calculators/[slug]",
    slug,
    found: Boolean(data),
    payloadSource: data?.payloadSource ?? null,
    activationState: data?.activationState ?? null,
    provenanceLabel: provenanceLabel(data?.payloadSource ?? null),
    counts: {
      inputs: data?.inputs.length ?? 0,
      references: data?.references.length ?? 0,
      warnings: data?.warnings.length ?? 0,
    },
    htmlSanitized: !hasScriptTags([data?.formulaPreview, data?.formulaHtml]),
    notes: data?.jsPreview ? ["Unexpected jsPreview present"] : ["No executable JS preview exposed"],
  };
}

async function main() {
  loadLocalEnvFiles(ROOT);
  const checks: ProviderCheck[] = [
    await checkProtocol("asthme-aigu-grave"),
    await checkProtocol("abces-cutanes-furoncles-anthrax"),
    await checkCat("asthme-aigu-grave"),
    await checkCat("abces-cutanes-furoncles-anthrax"),
    await checkDrug("amoxicilline-1000mg-orale-dispersible"),
    await checkDrug("paracetamol-500mg-orale-comprime"),
    await checkDrug("amoxicilline"),
    await checkDrug("ibuprofene"),
    await checkCalculator("apgar-score"),
    await checkCalculator("glasgow-coma-scale-score-gcs"),
  ];

  const report = {
    generated_at: new Date().toISOString(),
    is_demo_content: true,
    provider_order: ["supabase", "local_normalized", "mock"],
    checks,
    summary: {
      total: checks.length,
      found: checks.filter((check) => check.found).length,
      supabase: checks.filter((check) => check.payloadSource === "supabase").length,
      local_normalized: checks.filter(
        (check) => check.payloadSource === "local_normalized",
      ).length,
      missing: checks.filter((check) => !check.found).length,
    },
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  for (const check of checks) {
    const countSummary = Object.entries(check.counts)
      .map(([key, value]) => `${key}=${value}`)
      .join(" ");
    process.stdout.write(
      [
        `${check.route} ${check.slug}`,
        `found=${check.found}`,
        `payloadSource=${check.payloadSource ?? "none"}`,
        `activationState=${check.activationState ?? "none"}`,
        countSummary,
        `htmlSanitized=${check.htmlSanitized}`,
      ].join(" | ") + "\n",
    );
  }

  process.stdout.write(
    [
      `Wrote ${path.relative(ROOT, REPORT_PATH)}`,
      `supabase=${report.summary.supabase}/${report.summary.total}`,
      `local=${report.summary.local_normalized}/${report.summary.total}`,
    ].join("\n") + "\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
