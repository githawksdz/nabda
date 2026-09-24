/**
 * Server-only Supabase admin client (service role).
 * Bypasses RLS for imported admin_only corpus reads. Never use in client components.
 */

import { createClient } from "@supabase/supabase-js";

import { getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import type { Database } from "@/types/database";

export function canUseAdminClient(): boolean {
  const { url, serviceRoleKey } = getImportSupabaseEnv();
  return Boolean(url && serviceRoleKey);
}

export function createAdminClient() {
  const { url, serviceRoleKey } = getImportSupabaseEnv();
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
