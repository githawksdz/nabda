/**
 * Server-side environment validation for staging/production.
 * Never logs secret values.
 */
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";

export type ServerEnvStatus = {
  ok: boolean;
  missing: string[];
  contentMode: string;
  demoEnabled: boolean;
};

export function getContentModeLabel(): string {
  return process.env.NABDA_CONTENT_MODE?.trim().toLowerCase() || "production";
}

export function assertStagingServerEnv(): ServerEnvStatus {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) missing.push("NEXT_PUBLIC_SITE_URL");
  // Service role required for production catalog loaders
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  const contentMode = getContentModeLabel();
  const demoEnabled =
    contentMode === "demo" ||
    process.env.NEXT_PUBLIC_NABDA_CONTENT_MODE === "demo";

  return {
    ok: missing.length === 0 && !demoEnabled,
    missing,
    contentMode,
    demoEnabled,
  };
}

export function requireSupabasePublicEnv(): {
  url: string;
  anonKey: string;
} {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Configuration Supabase manquante (URL ou clé anonyme).",
    );
  }
  return env;
}

export function hasServiceRoleConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function getStagingAccessSecret(): string | null {
  const secret = process.env.STAGING_ACCESS_SECRET?.trim();
  return secret || null;
}

export { isSupabaseConfigured };
