"use server";

import { createClient } from "@/lib/supabase/server";
import { PROFILE_OWN_SELECT } from "@/lib/authz/selects";
import type { Profile } from "@/types/database";

export async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_OWN_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (data) {
    const row = data as Profile;
    return { ...row, staff_role: row.staff_role ?? "none" };
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
    .select(PROFILE_OWN_SELECT)
    .single();

  if (!created) {
    return null;
  }
  const row = created as Profile;
  return { ...row, staff_role: row.staff_role ?? "none" };
}

export async function hasClinicalConsent(userId: string) {
  const supabase = await createClient();
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
