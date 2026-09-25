/**
 * Anon or user-JWT Supabase client. Never the service role.
 * Prefer cookie session inside App Router; fall back to a cookieless anon client for scripts.
 */

import { createClient as createSupabaseJsClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export type RlsClient = SupabaseClient<Database>;

export async function createRlsClient(): Promise<RlsClient | null> {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  try {
    return await createClient();
  } catch {
    return createSupabaseJsClient<Database>(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}
