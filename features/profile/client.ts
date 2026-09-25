import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export async function ensureProfileClient(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, profession, usage_mode, profile_status, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return existing as Profile;
  }

  const metadata = user.user_metadata ?? {};
  const { data: created } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
      full_name:
        (typeof metadata.full_name === "string" && metadata.full_name) ||
        (typeof metadata.name === "string" && metadata.name) ||
        null,
      avatar_url:
        (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
        (typeof metadata.picture === "string" && metadata.picture) ||
        null,
    })
    .select("id, email, full_name, avatar_url, profession, usage_mode, profile_status, onboarding_completed")
    .single();

  return created as Profile | null;
}

export async function hasClinicalConsentClient(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("clinical_consents")
    .select("id")
    .eq("user_id", userId)
    .eq("consent_type", "clinical_judgment")
    .eq("accepted", true)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

export async function resolvePostAuthPath() {
  const profile = await ensureProfileClient();
  if (!profile) {
    return "/onboarding/personalisation";
  }

  const consented = await hasClinicalConsentClient(profile.id);
  if (profile.onboarding_completed && consented) {
    return "/home";
  }

  return "/onboarding/personalisation";
}
