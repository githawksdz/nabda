/**
 * Fix identity ↔ source payload alignment flags and mapping links.
 *
 * Dry-run: npx tsx scripts/fix-source-payload-alignment.ts --dry-run
 * Real run: CONFIRM_SOURCE_PAYLOAD_ALIGNMENT=1 npx tsx scripts/fix-source-payload-alignment.ts
 */
import fs from "node:fs";
import path from "node:path";

import { createImportClient, type ImportClient } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import {
  auditSourcePayloadAlignment,
  buildAlignmentFixPlan,
  buildDrugMatches,
  DRUG_SOURCE_PAYLOAD_TYPES,
  ENTITY_LINKS_TABLE,
  loadAlignmentData,
  loadPresentationIndex,
  mappingRowFromDrugMatch,
  type DrugMatchResult,
} from "@/lib/nabda-db/source-payload-alignment";
import { SOURCE_PAYLOAD_IMPORTED_FROM } from "@/lib/nabda-db/source-payload-constants";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "data", "source-payload-alignment-fix-report.json");
const CONFIRM_FLAG = "CONFIRM_SOURCE_PAYLOAD_ALIGNMENT";
const BATCH_SIZE = 100;

function isDryRun(): boolean {
  return process.argv.includes("--dry-run");
}

function requireConfirm(): void {
  if (process.env[CONFIRM_FLAG] !== "1") {
    throw new Error(
      `Refusing to apply alignment fix. Set ${CONFIRM_FLAG}=1 or use --dry-run.`,
    );
  }
}

async function batchUpsertLinks(
  client: ImportClient,
  rows: Record<string, unknown>[],
): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await client.from(ENTITY_LINKS_TABLE).upsert(chunk, {
      onConflict: "identity_table,identity_slug,payload_table,payload_entity_slug,relationship",
    });
    if (error) {
      throw new Error(`${ENTITY_LINKS_TABLE} upsert failed at ${i}: ${error.message}`);
    }
    process.stdout.write(
      `  ${ENTITY_LINKS_TABLE} upsert ${Math.min(i + chunk.length, rows.length)}/${rows.length}\n`,
    );
  }
}

async function updateIdentityFlags(
  client: ImportClient,
  table: "protocols" | "cat_maps" | "drugs" | "calculators",
  slugs: string[],
  payloadTypes: string[],
): Promise<number> {
  let updated = 0;
  for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
    const chunk = slugs.slice(i, i + BATCH_SIZE);
    const { error } = await client
      .from(table)
      .update({
        has_source_payload: true,
        source_payload_types: payloadTypes,
      })
      .in("slug", chunk)
      .eq("imported_from", SOURCE_PAYLOAD_IMPORTED_FROM);
    if (error) {
      throw new Error(`${table} flag update failed: ${error.message}`);
    }
    updated += chunk.length;
  }
  return updated;
}

function uniqueDrugMatches(matches: DrugMatchResult[]): DrugMatchResult[] {
  const seen = new Set<string>();
  const out: DrugMatchResult[] = [];
  for (const match of matches) {
    const key = `${match.identity_slug}::${match.payload_entity_slug}::${match.relationship}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(match);
  }
  return out;
}

async function main() {
  const dryRun = isDryRun();
  if (!dryRun) {
    requireConfirm();
  }

  loadLocalEnvFiles(ROOT);
  const client = createImportClient();
  const audit = await auditSourcePayloadAlignment(client, ROOT);
  const data = await loadAlignmentData(client);
  const presentationIndex = loadPresentationIndex(ROOT);
  const drugMatches = uniqueDrugMatches(
    buildDrugMatches(data.drugBundles, data.drugs, presentationIndex),
  );
  const plan = buildAlignmentFixPlan(audit, drugMatches, dryRun);

  const mappingRows = drugMatches.map((match) => mappingRowFromDrugMatch(match));

  const drugIdentitySlugs = [
    ...new Set(
      drugMatches
        .filter((match) => match.relationship === "presentation_monograph")
        .map((match) => match.identity_slug),
    ),
  ];
  const protocolIdentitySlugs = data.protocols
    .filter((protocol) =>
      data.protocolBundles.some(
        (bundle) =>
          bundle.entity_slug === protocol.slug || bundle.source_id === protocol.source_id,
      ),
    )
    .map((protocol) => protocol.slug);
  const catIdentitySlugs = data.cats
    .filter((row) =>
      data.catBundles.some(
        (bundle) => bundle.entity_slug === row.slug || bundle.source_id === row.source_id,
      ),
    )
    .map((row) => row.slug);
  const calculatorIdentitySlugs = data.calculators
    .filter((row) =>
      data.calculatorBundles.some(
        (bundle) => bundle.entity_slug === row.slug || bundle.source_id === row.source_id,
      ),
    )
    .map((row) => row.slug);

  const report = {
    ...plan,
    applied: !dryRun && plan.safe_to_apply,
    mapping_rows: dryRun ? [] : mappingRows,
    identity_updates: {
      drugs: drugIdentitySlugs.length,
      protocols: protocolIdentitySlugs.length,
      cats: catIdentitySlugs.length,
      calculators: calculatorIdentitySlugs.length,
    },
  };

  if (!dryRun && plan.safe_to_apply) {
    await batchUpsertLinks(client, mappingRows);
    const drugUpdated = await updateIdentityFlags(
      client,
      "drugs",
      drugIdentitySlugs,
      [...DRUG_SOURCE_PAYLOAD_TYPES],
    );
    const protocolUpdated = await updateIdentityFlags(
      client,
      "protocols",
      protocolIdentitySlugs,
      ["protocol_sections"],
    );
    const catUpdated = await updateIdentityFlags(
      client,
      "cat_maps",
      catIdentitySlugs,
      ["cat_steps"],
    );
    const calculatorUpdated = await updateIdentityFlags(
      client,
      "calculators",
      calculatorIdentitySlugs,
      ["calculator_profiles"],
    );
    report.identity_updates = {
      drugs: drugUpdated,
      protocols: protocolUpdated,
      cats: catUpdated,
      calculators: calculatorUpdated,
    };
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  process.stdout.write(
    [
      `mode=${dryRun ? "dry-run" : "apply"}`,
      `safe_to_apply=${plan.safe_to_apply}`,
      `mapping_rows_planned=${plan.mapping_rows_planned}`,
      `drug_identity_flags_planned=${plan.drug_identity_flags_planned}`,
      `cat_orphans_remaining=${plan.cat_orphan_slugs.length} (${plan.cat_orphan_strategy})`,
      `drug_payload_orphans_remaining=${audit.drugs.unmatched_payloads}`,
      `ambiguous=${plan.ambiguous_drug_matches}`,
      plan.blocked_reasons.length ? `blocked=${plan.blocked_reasons.join("; ")}` : "blocked=none",
      `Wrote ${path.relative(ROOT, REPORT_PATH)}`,
    ].join("\n") + "\n",
  );

  if (!dryRun && !plan.safe_to_apply) {
    process.exit(1);
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
