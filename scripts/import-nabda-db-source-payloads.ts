/**
 * Source-preserved Nabda DB payload importer.
 *
 * Refuses to run unless CONFIRM_NABDA_DB_PAYLOAD_IMPORT=1 and service role is set.
 *
 * Usage:
 *   CONFIRM_NABDA_DB_PAYLOAD_IMPORT=1 npx tsx scripts/import-nabda-db-source-payloads.ts
 */
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import {
  createImportClient,
  fetchExistingContent,
  type ImportClient,
} from "@/lib/nabda-db/import-client";
import {
  buildSourcePayloadPlan,
  identityMapsFromExisting,
  loadSourcePayloadCandidates,
  rowToDbInsert,
  type SourcePayloadRow,
} from "@/lib/nabda-db/source-payload-plan";

const CONFIRM_FLAG = "CONFIRM_NABDA_DB_PAYLOAD_IMPORT";
const ROOT = process.cwd();
const BATCH_SIZE = 80;

function requireConfirm(): void {
  if (process.env[CONFIRM_FLAG] !== "1") {
    throw new Error(
      `Refusing to import payloads. Set ${CONFIRM_FLAG}=1.`,
    );
  }
}

async function batchUpsert(
  client: ImportClient,
  table: string,
  rows: Record<string, unknown>[],
): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await client.from(table).upsert(chunk, {
      onConflict: "source_id,payload_item_id",
    });
    if (error) {
      throw new Error(`${table} upsert failed at ${i}: ${error.message}`);
    }
    process.stdout.write(
      `  ${table} upsert ${Math.min(i + chunk.length, rows.length)}/${rows.length}\n`,
    );
  }
}

async function updateIdentityFlags(
  client: ImportClient,
  table: "protocols" | "cat_maps" | "drugs" | "calculators",
  sourceIds: string[],
  payloadType: string,
): Promise<void> {
  const unique = [...new Set(sourceIds)];
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const chunk = unique.slice(i, i + BATCH_SIZE);
    const { error } = await client
      .from(table)
      .update({
        has_source_payload: true,
        source_payload_types: [payloadType],
      })
      .in("source_id", chunk);
    if (error) {
      throw new Error(`${table} identity flag update failed: ${error.message}`);
    }
  }
}

async function main() {
  requireConfirm();
  loadLocalEnvFiles(ROOT);
  const client = createImportClient();
  const loaded = loadSourcePayloadCandidates(ROOT);
  const existing = await fetchExistingContent(client);
  const maps = identityMapsFromExisting(existing);
  const plan = buildSourcePayloadPlan({
    root: ROOT,
    loaded,
    maps,
    liveDb: "connected",
  });

  const started = Date.now();
  for (const [table, rows] of Object.entries(plan.rows_by_table)) {
    const dbRows = rows.map((row: SourcePayloadRow) => rowToDbInsert(row));
    if (dbRows.length === 0) continue;
    await batchUpsert(client, table, dbRows);
  }

  const protocolSourceIds = loaded.protocols.map((item) => item.protocolSourceId);
  const catSourceIds = loaded.cats.map((item) => item.protocolSourceId);
  const drugSourceIds = loaded.drugs.map((item) => item.drugSourceId);
  const calculatorSourceIds = loaded.calculators.map((item) => item.sourceId);

  await updateIdentityFlags(
    client,
    "protocols",
    protocolSourceIds,
    "protocol_sections",
  );
  await updateIdentityFlags(client, "cat_maps", catSourceIds, "cat_steps");
  await updateIdentityFlags(client, "drugs", drugSourceIds, "drug_sections");
  await updateIdentityFlags(
    client,
    "calculators",
    calculatorSourceIds,
    "calculator_profiles",
  );

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  process.stdout.write(
    [
      `Payload import complete in ${elapsed}s`,
      `total_rows=${plan.counts.total_rows}`,
      `protocol_sections=${plan.counts.protocol_sections}`,
      `cat_steps=${plan.counts.cat_steps}`,
      `drug_sections=${plan.counts.drug_sections}`,
      `drug_tables=${plan.counts.drug_tables}`,
      `calculator_profiles=${plan.counts.calculator_profiles}`,
    ].join("\n") + "\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
