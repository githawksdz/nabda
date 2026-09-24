import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ExistingContentRow, ExistingLinkRow } from "@/lib/nabda-db/import-plan";

export type ImportClient = SupabaseClient;

export function getImportSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, serviceRoleKey, anonKey };
}

export function createImportClient(): ImportClient {
  const { url, serviceRoleKey } = getImportSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Real import requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function fetchAll<T>(
  client: ImportClient,
  table: string,
  columns: string,
): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) {
      throw new Error(`${table} select failed: ${error.message}`);
    }
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < pageSize) {
      break;
    }
  }
  return rows;
}

export async function fetchExistingContent(client: ImportClient): Promise<{
  protocols: ExistingContentRow[];
  cat_maps: ExistingContentRow[];
  calculators: ExistingContentRow[];
  drugs: ExistingContentRow[];
  protocol_links: ExistingLinkRow[];
}> {
  const contentColumns = "id, slug, source_id, status, review_status, visibility";
  const [protocols, cat_maps, calculators, drugs, protocol_links] = await Promise.all([
    fetchAll<ExistingContentRow>(client, "protocols", contentColumns),
    fetchAll<ExistingContentRow>(client, "cat_maps", `${contentColumns}, map_json`),
    fetchAll<ExistingContentRow>(
      client,
      "calculators",
      `${contentColumns}, formula_json`,
    ),
    fetchAll<ExistingContentRow>(client, "drugs", contentColumns),
    fetchAll<ExistingLinkRow>(
      client,
      "protocol_links",
      "id, source_id, protocol_id, relationship, target_slug",
    ),
  ]);
  return { protocols, cat_maps, calculators, drugs, protocol_links };
}
