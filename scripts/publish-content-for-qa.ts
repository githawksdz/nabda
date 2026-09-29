/**
 * Publish imported / placeholder catalog rows for local & staging QA.
 * Does not change hidden or archived parents.
 *
 * Usage:
 *   CONFIRM_QA_PUBLISH=1 npx tsx scripts/publish-content-for-qa.ts
 * Optional:
 *   CONFIRM_QA_PUBLISH=1 REFRESH_SEARCH=1 npx tsx scripts/publish-content-for-qa.ts
 */
import { createImportClient, getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";

const CONFIRM_FLAG = "CONFIRM_QA_PUBLISH";
const PARENT_TABLES = ["protocols", "drugs", "calculators"] as const;

const PARENT_PUBLISH_PATCH: Record<
  (typeof PARENT_TABLES)[number],
  Record<string, string>
> = {
  protocols: { status: "published", clinical_payload_status: "unlocked" },
  drugs: { status: "published", clinical_payload_status: "unlocked" },
  calculators: { status: "published", clinical_payload_status: "unlocked" },
};
const SOURCE_PAYLOAD_TABLES = [
  "source_protocol_sections",
  "source_drug_sections",
  "source_drug_tables",
  "source_calculator_profiles",
] as const;

const QA_PUBLISH_STATUSES = [
  "imported",
  "seed_placeholder",
  "cleaned",
  "draft",
  "review_needed",
  "needs_validation",
  "validated",
  "needs_pharmacist_review",
  "reviewed",
  "draft_extracted",
  "manual_authoring",
  "ready_for_review",
  "approved",
  "needs_revision",
  "not_available",
] as const;

function requireConfirm(): void {
  if (process.env[CONFIRM_FLAG] !== "1") {
    throw new Error(`Refusing to publish catalog. Set ${CONFIRM_FLAG}=1.`);
  }
}

async function countPublished(client: ReturnType<typeof createImportClient>, table: string) {
  const { count, error } = await client
    .from(table)
    .select("slug", { count: "exact", head: true })
    .eq("status", "published")
    .eq("visibility", "public_free");
  if (error) {
    throw new Error(`${table} count failed: ${error.message}`);
  }
  return count ?? 0;
}

async function main() {
  requireConfirm();
  loadLocalEnvFiles();
  const { url, serviceRoleKey } = getImportSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const client = createImportClient();
  const now = new Date().toISOString();

  for (const table of PARENT_TABLES) {
    const patch = {
      ...PARENT_PUBLISH_PATCH[table],
      ...(table === "protocols" ? { published_at: now } : {}),
    };
    const { data, error } = await client
      .from(table)
      .update(patch)
      .in("status", [...QA_PUBLISH_STATUSES])
      .select("slug");
    if (error) {
      throw new Error(`${table} publish update failed: ${error.message}`);
    }
    process.stdout.write(`${table}: published ${data?.length ?? 0} rows\n`);

    const { data: visRows, error: visError } = await client
      .from(table)
      .update({ visibility: "public_free" })
      .eq("visibility", "admin_only")
      .neq("status", "hidden")
      .select("slug");
    if (visError) {
      throw new Error(`${table} visibility update failed: ${visError.message}`);
    }
    process.stdout.write(`${table}: public_free visibility ${visRows?.length ?? 0} rows\n`);
  }

  for (const table of SOURCE_PAYLOAD_TABLES) {
    let total = 0;
    for (;;) {
      const { data: batch, error: readError } = await client
        .from(table)
        .select("id")
        .eq("visibility", "admin_only")
        .limit(500);
      if (readError) {
        throw new Error(`${table} source select failed: ${readError.message}`);
      }
      const ids = (batch ?? []).map((row) => (row as { id: string }).id);
      if (ids.length === 0) {
        break;
      }
      const { error } = await client
        .from(table)
        .update({ visibility: "public_free", clinical_payload_status: "unlocked" })
        .in("id", ids);
      if (error) {
        throw new Error(`${table} source visibility failed: ${error.message}`);
      }
      total += ids.length;
      process.stdout.write(`${table}: unlocked ${total} rows…\n`);
    }
    process.stdout.write(`${table}: done (${total} rows)\n`);
  }

  for (const table of PARENT_TABLES) {
    const n = await countPublished(client, table);
    process.stdout.write(`${table}: ${n} published + public_free\n`);
  }

  if (process.env.REFRESH_SEARCH === "1") {
    const steps = [
      "refresh_search_documents_identities",
      "refresh_search_documents_protocols",
      "refresh_search_documents_cats",
      "refresh_search_documents_calculators",
    ] as const;
    for (const fn of steps) {
      process.stdout.write(`Calling ${fn}()…\n`);
      const { error } = await client.rpc(fn);
      if (error) {
        throw new Error(`${fn} failed: ${error.message}`);
      }
    }
    const prefixes = [..."abcdefghijklmnopqrstuvwxyz".split(""), ..."0123456789".split("")];
    for (const prefix of prefixes) {
      const { error } = await client.rpc("refresh_search_documents_drugs_batch", {
        p_prefix: prefix,
      });
      if (error) {
        throw new Error(`drugs_batch(${prefix}) failed: ${error.message}`);
      }
    }
    process.stdout.write("Search documents refreshed.\n");
  } else {
    process.stdout.write(
      "Tip: re-run with REFRESH_SEARCH=1 to rebuild search_documents.\n",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
