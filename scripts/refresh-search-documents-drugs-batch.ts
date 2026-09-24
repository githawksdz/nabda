/**
 * Letter-prefix drug search document refresh.
 *
 * Usage:
 *   npx tsx scripts/refresh-search-documents-drugs-batch.ts --prefix=a
 *   npx tsx scripts/refresh-search-documents-drugs-batch.ts --prefix=all --dry-run
 *   CONFIRM_SEARCH_DOCUMENT_GENERATION=1 npx tsx scripts/refresh-search-documents-drugs-batch.ts --prefix=all
 */
import fs from "node:fs";
import path from "node:path";

import { createImportClient, getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";

const CONFIRM_FLAG = "CONFIRM_SEARCH_DOCUMENT_GENERATION";
const ROOT = process.cwd();
const REPORT_PATH = path.join(
  ROOT,
  "data",
  "search-documents-drugs-batch-report.json",
);

const PREFIXES = [
  ..."0123456789".split(""),
  ..."abcdefghijklmnopqrstuvwxyz".split(""),
  "other",
] as const;

type Prefix = (typeof PREFIXES)[number] | "all" | "";

function parseArgs(argv: string[]) {
  let prefix: Prefix = "all";
  let dryRun = false;
  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg.startsWith("--prefix=")) {
      prefix = arg.slice("--prefix=".length).toLowerCase() as Prefix;
    }
  }
  return { prefix, dryRun };
}

function requireConfirm(dryRun: boolean): void {
  if (dryRun) return;
  if (process.env[CONFIRM_FLAG] !== "1") {
    throw new Error(
      `Refusing write. Set ${CONFIRM_FLAG}=1 or pass --dry-run.`,
    );
  }
}

function isTransient(message: string): boolean {
  return /timeout|upstream|fetch failed|ECONNRESET|503|502|504/i.test(message);
}

async function countPrefixPlan(
  client: ReturnType<typeof createImportClient>,
  prefix: string,
): Promise<{ allowedSlugs: number; sections: number; tables: number }> {
  // Approximate plan via identity + links matching prefix
  let drugQuery = client.from("drugs").select("slug", { count: "exact", head: true });
  let linkQuery = client
    .from("source_payload_entity_links")
    .select("payload_entity_slug", { count: "exact", head: true })
    .eq("identity_table", "drugs")
    .in("payload_table", ["source_drug_sections", "source_drug_tables"]);

  if (prefix === "other") {
    // PostgREST has no easy regex; approximate via not matching a-z0-9 start is hard.
    // Count all and subtract later in aggregate dry-run.
  } else if (prefix) {
    drugQuery = drugQuery.ilike("slug", `${prefix}%`);
    linkQuery = linkQuery.ilike("payload_entity_slug", `${prefix}%`);
  }

  const [{ count: drugCount }, { count: linkCount }] = await Promise.all([
    drugQuery,
    linkQuery,
  ]);

  return {
    allowedSlugs: (drugCount ?? 0) + (linkCount ?? 0),
    sections: 0,
    tables: 0,
  };
}

async function runBatch(
  client: ReturnType<typeof createImportClient>,
  prefix: string,
  retries = 2,
): Promise<Record<string, unknown>> {
  const started = Date.now();
  process.stdout.write(`[start] prefix=${prefix || "(all)"}\n`);
  let attempt = 0;
  for (;;) {
    attempt += 1;
    const { data, error } = await client.rpc("refresh_search_documents_drugs_batch", {
      p_prefix: prefix,
    });
    if (!error) {
      const elapsed = Date.now() - started;
      process.stdout.write(
        `[end] prefix=${prefix || "(all)"} ok elapsed_ms=${elapsed} ${JSON.stringify(data)}\n`,
      );
      return {
        ...(data as Record<string, unknown>),
        attempts: attempt,
        wall_elapsed_ms: elapsed,
      };
    }
    if (attempt <= retries + 1 && isTransient(error.message)) {
      process.stdout.write(
        `[retry] prefix=${prefix} attempt=${attempt} ${error.message}\n`,
      );
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(`prefix=${prefix} failed: ${error.message}`);
  }
}

async function main() {
  const { prefix, dryRun } = parseArgs(process.argv.slice(2));
  requireConfirm(dryRun);
  loadLocalEnvFiles(ROOT);

  const { url, serviceRoleKey } = getImportSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new Error("Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const client = createImportClient();
  const { count: beforeTotal } = await client
    .from("search_documents")
    .select("id", { count: "exact", head: true });
  const { count: beforeDrug } = await client
    .from("search_documents")
    .select("id", { count: "exact", head: true })
    .eq("entity_type", "drug");

  const prefixes =
    prefix === "all" ? [...PREFIXES] : prefix === "" ? [""] : [prefix];

  if (dryRun) {
    const byPrefix: Record<string, unknown> = {};
    for (const p of prefixes) {
      byPrefix[p] = await countPrefixPlan(client, p);
    }
    const report = {
      generated_at: new Date().toISOString(),
      dry_run: true,
      ok: true,
      before_total: beforeTotal,
      before_drug: beforeDrug,
      prefixes,
      by_prefix: byPrefix,
      notes: [
        "Real write uses refresh_search_documents_drugs_batch RPC (idempotent upsert).",
        "Title order: sourceHeading → title → heading/sectionTitle → kind → safe plain_text.",
        "Prefix 'other' covers slugs not starting with [0-9a-z].",
      ],
    };
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
    console.log(
      `OK drug batch dry-run → ${path.relative(ROOT, REPORT_PATH)} before_drug=${beforeDrug}`,
    );
    console.log(JSON.stringify(byPrefix, null, 2));
    return;
  }

  const results: unknown[] = [];
  const failed: Array<{ prefix: string; error: string }> = [];
  const retried: string[] = [];

  for (const p of prefixes) {
    try {
      const result = await runBatch(client, p);
      if ((result.attempts as number) > 1) retried.push(p);
      results.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failed.push({ prefix: p, error: message });
      process.stdout.write(`[fail] ${message}\n`);
    }
  }

  const { count: afterTotal } = await client
    .from("search_documents")
    .select("id", { count: "exact", head: true });
  const { count: afterDrug } = await client
    .from("search_documents")
    .select("id", { count: "exact", head: true })
    .eq("entity_type", "drug");

  // Sample title quality
  const sampleQueries = [
    "amoxicilline",
    "paracetamol",
    "ibuprofene",
    "warfarine",
    "amiodarone",
    "posologie",
    "interactions",
    "grossesse",
  ];
  const samples: Record<string, string[]> = {};
  for (const q of sampleQueries) {
    const { data } = await client
      .from("search_documents")
      .select("title,route_href")
      .eq("entity_type", "drug")
      .or(`title.ilike.%${q}%,searchable_text.ilike.%${q}%`)
      .limit(5);
    samples[q] = (data ?? []).map((row) => `${row.title} → ${row.route_href}`);
  }

  const report = {
    generated_at: new Date().toISOString(),
    dry_run: false,
    ok: failed.length === 0,
    before_total: beforeTotal,
    before_drug: beforeDrug,
    after_total: afterTotal,
    after_drug: afterDrug,
    failed,
    retried,
    results,
    samples,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    report.ok
      ? `OK drug batch refresh drug=${beforeDrug}→${afterDrug} → ${path.relative(ROOT, REPORT_PATH)}`
      : `FAIL drug batch refresh (${failed.length} failed) → ${path.relative(ROOT, REPORT_PATH)}`,
  );
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
