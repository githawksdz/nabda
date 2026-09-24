"use server";

import { createClient } from "@/lib/supabase/server";
import {
  CLINICAL_CONSENT_TEXT,
  type Profession,
  type UsageMode,
} from "@/types/database";
import {
  consentSchema,
  interestsSchema,
  professionSchema,
  usageModeSchema,
} from "./schemas";

const SAVE_ERROR = "Enregistrement impossible pour le moment. Réessayez.";
const AUTH_ERROR = "Connexion impossible pour le moment. Réessayez.";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { supabase, user };
}

async function recordEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  eventName: string,
  metadata: Record<string, unknown> = {},
) {
  await supabase.from("onboarding_events").insert({
    user_id: userId,
    event_name: eventName,
    metadata,
  });
}

export async function getActiveClinicalInterests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinical_interests")
    .select("id, slug, label, sort_order, is_active, created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error("Chargement des intérêts impossible pour le moment.");
  }

  return data ?? [];
}

export async function getSelectedInterestIds(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_clinical_interests")
    .select("interest_id")
    .eq("user_id", userId);

  if (error) {
    return [];
  }

  return (data ?? []).map((row) => row.interest_id);
}

export async function updateProfession(profession: Profession) {
  const parsed = professionSchema.safeParse({ profession });
  if (!parsed.success) {
    return { ok: false as const, message: "Choisissez une profession." };
  }

  const session = await requireUser();
  if (!session) {
    return { ok: false as const, message: AUTH_ERROR };
  }

  const { error } = await session.supabase
    .from("profiles")
    .update({ profession: parsed.data.profession })
    .eq("id", session.user.id);

  if (error) {
    return { ok: false as const, message: SAVE_ERROR };
  }

  await recordEvent(session.supabase, session.user.id, "profession_selected", {
    profession: parsed.data.profession,
  });
  return { ok: true as const };
}

export async function updateUsageMode(mode: UsageMode) {
  const parsed = usageModeSchema.safeParse({ usageMode: mode });
  if (!parsed.success) {
    return { ok: false as const, message: "Choisissez un mode d’usage." };
  }

  const session = await requireUser();
  if (!session) {
    return { ok: false as const, message: AUTH_ERROR };
  }

  const { error } = await session.supabase
    .from("profiles")
    .update({ usage_mode: parsed.data.usageMode })
    .eq("id", session.user.id);

  if (error) {
    return { ok: false as const, message: SAVE_ERROR };
  }

  await recordEvent(session.supabase, session.user.id, "usage_mode_selected", {
    usage_mode: parsed.data.usageMode,
  });
  return { ok: true as const };
}

export async function updateUserInterests(interestIds: string[]) {
  const parsed = interestsSchema.safeParse({ interestIds });
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Choisissez jusqu’à 5 intérêts.",
    };
  }

  const session = await requireUser();
  if (!session) {
    return { ok: false as const, message: AUTH_ERROR };
  }

  const { error: deleteError } = await session.supabase
    .from("user_clinical_interests")
    .delete()
    .eq("user_id", session.user.id);

  if (deleteError) {
    return { ok: false as const, message: SAVE_ERROR };
  }

  const { error: insertError } = await session.supabase
    .from("user_clinical_interests")
    .insert(
      parsed.data.interestIds.map((interestId) => ({
        user_id: session.user.id,
        interest_id: interestId,
      })),
    );

  if (insertError) {
    return { ok: false as const, message: SAVE_ERROR };
  }

  await recordEvent(session.supabase, session.user.id, "interests_selected", {
    count: parsed.data.interestIds.length,
  });
  return { ok: true as const };
}

export async function acceptClinicalConsent() {
  const parsed = consentSchema.safeParse({ accepted: true });
  if (!parsed.success) {
    return { ok: false as const, message: "Le consentement clinique est requis." };
  }

  const session = await requireUser();
  if (!session) {
    return { ok: false as const, message: AUTH_ERROR };
  }

  const { error } = await session.supabase.from("clinical_consents").upsert(
    {
      user_id: session.user.id,
      consent_type: "clinical_judgment",
      consent_version: "v1",
      accepted: true,
      accepted_at: new Date().toISOString(),
      consent_text: CLINICAL_CONSENT_TEXT,
    },
    { onConflict: "user_id,consent_type,consent_version" },
  );

  if (error) {
    return { ok: false as const, message: SAVE_ERROR };
  }

  await recordEvent(session.supabase, session.user.id, "clinical_consent_accepted");
  return { ok: true as const };
}

export type CompleteOnboardingPayload = {
  profession: Profession;
  usageMode: UsageMode;
  interestIds: string[];
  accepted: true;
};

export async function completeOnboarding(payload: CompleteOnboardingPayload) {
  const consentParsed = consentSchema.safeParse({ accepted: payload.accepted });
  if (!consentParsed.success) {
    return { ok: false as const, message: "Le consentement clinique est requis." };
  }

  const professionResult = await updateProfession(payload.profession);
  if (!professionResult.ok) {
    return professionResult;
  }

  const usageResult = await updateUsageMode(payload.usageMode);
  if (!usageResult.ok) {
    return usageResult;
  }

  if (payload.interestIds.length > 0) {
    const interestsResult = await updateUserInterests(payload.interestIds);
    if (!interestsResult.ok) {
      return interestsResult;
    }
  }

  const consent = await acceptClinicalConsent();
  if (!consent.ok) {
    return consent;
  }

  const session = await requireUser();
  if (!session) {
    return { ok: false as const, message: AUTH_ERROR };
  }

  const { error } = await session.supabase
    .from("profiles")
    .update({
      profession: payload.profession,
      usage_mode: payload.usageMode,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      onboarding_skipped: false,
      profile_status: "complete",
    })
    .eq("id", session.user.id);

  if (error) {
    return { ok: false as const, message: SAVE_ERROR };
  }

  await recordEvent(session.supabase, session.user.id, "onboarding_completed");
  return { ok: true as const };
}

export async function skipOnboarding() {
  const session = await requireUser();
  if (!session) {
    return { ok: false as const, message: AUTH_ERROR };
  }

  const { data: profile } = await session.supabase
    .from("profiles")
    .select("usage_mode")
    .eq("id", session.user.id)
    .maybeSingle();

  const { error } = await session.supabase
    .from("profiles")
    .update({
      onboarding_skipped: true,
      onboarding_completed: false,
      profile_status: "incomplete",
      usage_mode: profile?.usage_mode ?? "mixed",
    })
    .eq("id", session.user.id);

  if (error) {
    return { ok: false as const, message: SAVE_ERROR };
  }

  await recordEvent(session.supabase, session.user.id, "onboarding_skipped");
  return { ok: true as const };
}

export async function logOnboardingEvent(
  eventName: string,
  metadata: Record<string, unknown> = {},
) {
  const session = await requireUser();
  if (!session) {
    return { ok: false as const, message: AUTH_ERROR };
  }

  await recordEvent(session.supabase, session.user.id, eventName, metadata);
  return { ok: true as const };
}

export const saveProfession = updateProfession;
export const saveUsageMode = updateUsageMode;
export const saveUserInterests = updateUserInterests;
