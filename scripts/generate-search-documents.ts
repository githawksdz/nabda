/**
 * Upsert search_documents via split SQL refresh RPCs (service role).
 *
 * Requires CONFIRM_SEARCH_DOCUMENT_GENERATION=1.
 * Usage:
 *   CONFIRM_SEARCH_DOCUMENT_GENERATION=1 npx tsx scripts/generate-search-documents.ts
 */
import fs from "node:fs";
import path from "node:path";

import { createImportClient, getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";

const CONFIRM_FLAG = "CONFIRM_SEARCH_DOCUMENT_GENERATION";
const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "data", "search-documents-generation-report.json");

const CORE_STEPS = [
  "refresh_search_documents_identities",
  "refresh_search_documents_protocols",
  "refresh_search_documents_cats",
  "refresh_search_documents_calculators",
] as const;

/** Prefix batches keep each drug RPC under API gateway timeout. */
const DRUG_PREFIXES = [
  ..."abcdefghijklmnopqrstuvwxyz".split(""),
  ..."0123456789".split(""),
];

function requireConfirm(): void {
  if (process.env[CONFIRM_FLAG] !== "1") {
    throw new Error(
      `Refusing to write search_documents. Set ${CONFIRM_FLAG}=1.`,
    );
  }
}

async function main() {
  requireConfirm();
  loadLocalEnvFiles(ROOT);
  const { url, serviceRoleKey } = getImportSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Real generation requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const client = createImportClient();
  const steps: unknown[] = [];

  for (const fn of CORE_STEPS) {
    process.stdout.write(`Calling ${fn}()…\n`);
    const { data, error } = await client.rpc(fn);
    if (error) {
      throw new Error(`${fn} failed: ${error.message}`);
    }
    steps.push(data);
    process.stdout.write(`  ok ${JSON.stringify(data)}\n`);
  }

  for (const prefix of DRUG_PREFIXES) {
    process.stdout.write(`Calling refresh_search_documents_drugs_batch('${prefix}')…\n`);
    const { data, error } = await client.rpc("refresh_search_documents_drugs_batch", {
      p_prefix: prefix,
    });
    if (error) {
      throw new Error(`drugs_batch(${prefix}) failed: ${error.message}`);
    }
    steps.push(data);
    process.stdout.write(`  ok ${JSON.stringify(data)}\n`);
  }

  const { count, error: countError } = await client
    .from("search_documents")
    .select("id", { count: "exact", head: true });
  if (countError) {
    throw new Error(`count failed: ${countError.message}`);
  }

  const contentTypes = [
    "identity",
    "section",
    "step",
    "drug_section",
    "drug_table",
    "calculator_profile",
  ] as const;
  const byContent: Record<string, number> = {};
  for (const contentType of contentTypes) {
    const { count: c } = await client
      .from("search_documents")
      .select("id", { count: "exact", head: true })
      .eq("content_type", contentType);
    byContent[contentType] = c ?? 0;
  }

  const entityTypes = ["protocol", "cat", "drug", "calculator"] as const;
  const byEntityMap: Record<string, number> = {};
  for (const entityType of entityTypes) {
    const { count: c } = await client
      .from("search_documents")
      .select("id", { count: "exact", head: true })
      .eq("entity_type", entityType);
    byEntityMap[entityType] = c ?? 0;
  }

  const report = {
    generated_at: new Date().toISOString(),
    ok: true,
    mode: "sql_refresh_search_documents_split_batched",
    total_docs: count ?? 0,
    by_entity: byEntityMap,
    by_content: byContent,
    steps,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `OK search_documents refresh: total=${count} → ${path.relative(ROOT, REPORT_PATH)}`,
  );
  console.log(JSON.stringify({ by_entity: byEntityMap, by_content: byContent }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
