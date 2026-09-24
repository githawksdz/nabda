/**
 * Identity-only Nabda DB importer.
 *
 * Refuses to run unless CONFIRM_NABDA_DB_IMPORT=1.
 *
 * Usage:
 *   CONFIRM_NABDA_DB_IMPORT=1 npx tsx scripts/import-nabda-db-identities.ts
 */
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import {
  buildImportPlan,
  identityUpdatePatch,
  type PlannedRow,
} from "@/lib/nabda-db/import-plan";
import {
  createImportClient,
  fetchExistingContent,
  type ImportClient,
} from "@/lib/nabda-db/import-client";
import { loadNabdaDbIdentities } from "@/lib/nabda-db/load-identities";

const CONFIRM_FLAG = "CONFIRM_NABDA_DB_IMPORT";
const OVERWRITE_VALIDATED_FLAG = "ALLOW_NABDA_DB_OVERWRITE_VALIDATED";
const BATCH_SIZE = 80;

function requireConfirm(): void {
  if (process.env[CONFIRM_FLAG] !== "1") {
    throw new Error(
      `Refusing to import. Set ${CONFIRM_FLAG}=1 to write identity rows.`,
    );
  }
}

function stripPrivate(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith("_")) {
      continue;
    }
    out[key] = value;
  }
  return out;
}

async function batchInsert(
  client: ImportClient,
  table: string,
  rows: Record<string, unknown>[],
): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await client.from(table).insert(chunk);
    if (error) {
      throw new Error(`${table} insert failed at ${i}: ${error.message}`);
    }
    process.stdout.write(`  ${table} insert ${Math.min(i + chunk.length, rows.length)}/${rows.length}\n`);
  }
}

async function batchUpdate(
  client: ImportClient,
  table: string,
  rows: Array<{ id: string; patch: Record<string, unknown> }>,
): Promise<void> {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const { error } = await client.from(table).update(row.patch).eq("id", row.id);
    if (error) {
      throw new Error(`${table} update failed for ${row.id}: ${error.message}`);
    }
    if ((i + 1) % BATCH_SIZE === 0 || i + 1 === rows.length) {
      process.stdout.write(`  ${table} update ${i + 1}/${rows.length}\n`);
    }
  }
}

function applyOverwriteGate(rows: PlannedRow[], allowValidated: boolean): PlannedRow[] {
  if (allowValidated) {
    return rows.map((row) =>
      row.action === "skip_protected"
        ? { ...row, action: "update_identity" }
        : row,
    );
  }
  return rows;
}

async function upsertIdentityTable(
  client: ImportClient,
  table: "protocols" | "cat_maps" | "calculators" | "drugs",
  planned: PlannedRow[],
  existing: Array<{ id: string; slug: string; source_id: string | null }>,
): Promise<Map<string, string>> {
  const bySource = new Map(
    existing.filter((row) => row.source_id).map((row) => [row.source_id as string, row] as const),
  );
  const bySlug = new Map(existing.map((row) => [row.slug, row] as const));
  const ids = new Map<string, string>();
  const inserts: Record<string, unknown>[] = [];
  const updates: Array<{ id: string; patch: Record<string, unknown> }> = [];

  for (const row of planned) {
    const match = bySource.get(row.source_id) ?? bySlug.get(row.slug);
    if (row.action === "skip_protected" || row.action === "skip_duplicate") {
      if (match) {
        ids.set(row.source_id, match.id);
      }
      continue;
    }
    const payload = stripPrivate(row.payload);
    if (row.action === "update_identity" && match) {
      updates.push({ id: match.id, patch: identityUpdatePatch(payload) });
      ids.set(row.source_id, match.id);
      continue;
    }
    inserts.push(payload);
  }

  await batchInsert(client, table, inserts);
  await batchUpdate(client, table, updates);

  if (inserts.length > 0) {
    const sourceIds = planned
      .filter((row) => row.action === "insert")
      .map((row) => row.source_id);
    for (let i = 0; i < sourceIds.length; i += 200) {
      const chunk = sourceIds.slice(i, i + 200);
      const { data, error } = await client
        .from(table)
        .select("id, source_id")
        .in("source_id", chunk);
      if (error) {
        throw new Error(`${table} id lookup failed: ${error.message}`);
      }
      for (const row of data ?? []) {
        if (row.source_id) {
          ids.set(row.source_id, row.id);
        }
      }
    }
  }

  return ids;
}

async function main() {
  loadLocalEnvFiles();
  requireConfirm();
  const allowValidated = process.env[OVERWRITE_VALIDATED_FLAG] === "1";
  const client = createImportClient();
  const loaded = loadNabdaDbIdentities();
  const existing = await fetchExistingContent(client);
  const plan = buildImportPlan(loaded, {
    existing,
    liveDb: "connected",
    dryRun: false,
  });

  plan.rows.protocols = applyOverwriteGate(plan.rows.protocols, allowValidated);
  plan.rows.cat_maps = applyOverwriteGate(plan.rows.cat_maps, allowValidated);
  plan.rows.calculators = applyOverwriteGate(plan.rows.calculators, allowValidated);
  plan.rows.drugs = applyOverwriteGate(plan.rows.drugs, allowValidated);

  process.stdout.write(
    `Identity import starting. protocols=${plan.counts.protocols} cats=${plan.counts.cat_maps} drugs=${plan.counts.drugs} calcs=${plan.counts.calculators} links=${plan.counts.protocol_links_safe}\n`,
  );

  const protocolIds = await upsertIdentityTable(
    client,
    "protocols",
    plan.rows.protocols,
    existing.protocols,
  );
  process.stdout.write(`protocols done (${protocolIds.size} ids)\n`);

  for (const row of plan.rows.cat_maps) {
    const protocolSourceId = row.payload._protocol_source_id;
    if (typeof protocolSourceId === "string") {
      row.payload.protocol_id = protocolIds.get(protocolSourceId) ?? null;
    }
  }

  const catIds = await upsertIdentityTable(
    client,
    "cat_maps",
    plan.rows.cat_maps,
    existing.cat_maps,
  );
  process.stdout.write(`cat_maps done (${catIds.size} ids)\n`);

  const drugIds = await upsertIdentityTable(
    client,
    "drugs",
    plan.rows.drugs,
    existing.drugs,
  );
  process.stdout.write(`drugs done (${drugIds.size} ids)\n`);

  const calcIds = await upsertIdentityTable(
    client,
    "calculators",
    plan.rows.calculators,
    existing.calculators,
  );
  process.stdout.write(`calculators done (${calcIds.size} ids)\n`);

  const linkInserts: Record<string, unknown>[] = [];
  const linkUpdates: Array<{ id: string; patch: Record<string, unknown> }> = [];
  const existingLinks = new Map(
    existing.protocol_links
      .filter((row) => row.source_id)
      .map((row) => [row.source_id as string, row] as const),
  );

  for (const row of plan.rows.protocol_links) {
    const payload = stripPrivate(row.payload);
    const trace = payload.source_trace as
      | { protocol_source_id?: string; target_source_id?: string }
      | undefined;
    const protocolSourceId = trace?.protocol_source_id;
    if (!protocolSourceId) {
      continue;
    }
    const protocolId = protocolIds.get(protocolSourceId);
    if (!protocolId) {
      continue;
    }
    payload.protocol_id = protocolId;
    const targetSourceId = trace.target_source_id;
    const targetType = payload.target_type;
    if (targetType === "cat" && typeof targetSourceId === "string") {
      payload.target_id = catIds.get(targetSourceId) ?? null;
    } else if (targetType === "protocol" && typeof targetSourceId === "string") {
      payload.target_id = protocolIds.get(targetSourceId) ?? null;
    } else if (targetType === "drug" && typeof targetSourceId === "string") {
      payload.target_id = drugIds.get(targetSourceId) ?? null;
    } else if (targetType === "calculator" && typeof targetSourceId === "string") {
      payload.target_id = calcIds.get(targetSourceId) ?? null;
    }
    const existingLink = existingLinks.get(row.source_id);
    if (existingLink) {
      linkUpdates.push({ id: existingLink.id, patch: identityUpdatePatch(payload) });
    } else {
      linkInserts.push(payload);
    }
  }

  await batchInsert(client, "protocol_links", linkInserts);
  await batchUpdate(client, "protocol_links", linkUpdates);
  process.stdout.write(
    `protocol_links done insert=${linkInserts.length} update=${linkUpdates.length}\nIdentity import finished. No clinical payloads written.\n`,
  );
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
