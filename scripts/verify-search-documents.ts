/**
 * Verify Search Stage B search_documents table + query safety.
 *
 * Usage: npx tsx scripts/verify-search-documents.ts
 * Output: data/search-documents-verification-report.json
 */
import fs from "node:fs";
import path from "node:path";

import { createImportClient, getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import {
  assertNoSearchableTextLeak,
  fetchSearchDocumentHits,
  searchDocumentHitsToSearchResults,
} from "@/lib/search/search-documents";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "data", "search-documents-verification-report.json");

type Check = { id: string; ok: boolean; detail: string };

const SAMPLE_QUERIES = [
  "asthme",
  "abces",
  "amoxicilline",
  "paracetamol",
  "ibuprofene",
  "warfarine",
  "amiodarone",
  "posologie",
  "interactions",
  "grossesse",
  "apgar",
  "glasgow",
  "douleur",
] as const;

async function main() {
  loadLocalEnvFiles(ROOT);
  const checks: Check[] = [];
  const { url, serviceRoleKey } = getImportSupabaseEnv();

  if (!url || !serviceRoleKey) {
    const report = {
      ok: false,
      generated_at: new Date().toISOString(),
      checks: [
        {
          id: "service_role",
          ok: false,
          detail: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
        },
      ],
    };
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
    console.error("FAIL: service role missing");
    process.exitCode = 1;
    return;
  }

  const client = createImportClient();

  const { count, error: countError } = await client
    .from("search_documents")
    .select("id", { count: "exact", head: true });

  checks.push({
    id: "table_exists",
    ok: !countError,
    detail: countError ? countError.message : `rows=${count ?? 0}`,
  });
  checks.push({
    id: "row_count_positive",
    ok: !countError && (count ?? 0) > 0,
    detail: `count=${count ?? 0}`,
  });

  if (!countError) {
    const { data: sampleRows, error: sampleError } = await client
      .from("search_documents")
      .select(
        "route_href, snippet, searchable_text, title, review_status, visibility",
      )
      .limit(500);

    checks.push({
      id: "sample_select",
      ok: !sampleError,
      detail: sampleError ? sampleError.message : `scanned=${sampleRows?.length ?? 0}`,
    });

    const rows = sampleRows ?? [];
    const internal = rows.filter((r) =>
      String(r.route_href ?? "").startsWith("/internal"),
    );
    checks.push({
      id: "no_internal_routes",
      ok: internal.length === 0,
      detail: internal.length ? internal.slice(0, 3).map((r) => r.route_href).join(", ") : "clean",
    });

    const scriptHits = rows.filter(
      (r) =>
        /<\s*script/i.test(String(r.snippet ?? "")) ||
        /<\s*script/i.test(String(r.searchable_text ?? "")) ||
        /<\s*script/i.test(String(r.title ?? "")),
    );
    checks.push({
      id: "no_script_tags",
      ok: scriptHits.length === 0,
      detail: scriptHits.length ? `${scriptHits.length} hits` : "clean",
    });

    const logicHits = rows.filter(
      (r) =>
        /equation_logic_text/i.test(String(r.searchable_text ?? "")) ||
        /jsPreview/i.test(String(r.searchable_text ?? "")) ||
        /jsPreview/i.test(String(r.snippet ?? "")),
    );
    checks.push({
      id: "no_executable_fields",
      ok: logicHits.length === 0,
      detail: logicHits.length ? `${logicHits.length} hits` : "clean",
    });

    const fakeValide = rows.filter(
      (r) =>
        /\bvalid[eé]\b/i.test(String(r.snippet ?? "")) &&
        r.review_status !== "validated",
    );
    checks.push({
      id: "no_fake_valide_in_snippet",
      ok: fakeValide.length === 0,
      detail: fakeValide.length ? `${fakeValide.length} hits` : "clean",
    });

    const jargon = rows.filter((r) => {
      const snip = String(r.snippet ?? "").toLowerCase();
      return (
        snip.includes("admin_only") ||
        snip.includes("nabda_db") ||
        /\blocked\b/.test(snip)
      );
    });
    checks.push({
      id: "no_admin_jargon_in_snippet",
      ok: jargon.length === 0,
      detail: jargon.length ? `${jargon.length} hits` : "clean",
    });
  }

  const queryResults: Record<string, { count: number; hrefs: string[] }> = {};
  for (const q of SAMPLE_QUERIES) {
    const hits = await fetchSearchDocumentHits(client, q, { limit: 12 });
    const results = searchDocumentHitsToSearchResults(hits);
    const leaks = assertNoSearchableTextLeak(results);
    queryResults[q] = {
      count: results.length,
      hrefs: results.slice(0, 5).map((r) => r.href),
    };
    checks.push({
      id: `query_${q}`,
      ok: results.length > 0 && leaks.length === 0,
      detail:
        results.length > 0
          ? `hits=${results.length} leaks=${leaks.length}`
          : "zero hits",
    });
    checks.push({
      id: `query_${q}_public_hrefs`,
      ok: results.every(
        (r) => r.href.startsWith("/") && !r.href.startsWith("/internal"),
      ),
      detail: results.slice(0, 3).map((r) => r.href).join(", ") || "n/a",
    });
  }

  const nonsense = await fetchSearchDocumentHits(client, "syndrome xyz99zz", {
    limit: 8,
  });
  checks.push({
    id: "nonsense_zero",
    ok: nonsense.length === 0,
    detail: `hits=${nonsense.length}`,
  });

  const failed = checks.filter((c) => !c.ok);
  const report = {
    generated_at: new Date().toISOString(),
    ok: failed.length === 0,
    table_row_count: count ?? null,
    summary: {
      checks: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
    },
    query_results: queryResults,
    checks,
    failed,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    report.ok
      ? `OK search documents verification (${report.summary.passed}/${report.summary.checks}) → ${path.relative(ROOT, REPORT_PATH)}`
      : `FAIL search documents verification (${report.summary.failed} failed) → ${path.relative(ROOT, REPORT_PATH)}`,
  );
  if (!report.ok) {
    for (const item of failed) {
      console.error(`- ${item.id}: ${item.detail}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
