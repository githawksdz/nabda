import { cache } from "react";
import { revalidatePath } from "next/cache";
import { isDemoContentMode } from "@/lib/content-data/content-source-mode";
import { isProPlanSlug } from "@/lib/authz/content-gate";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPersonalDemoFixtures } from "@/lib/demo-fixtures/load";
import {
  isPersonalEntityType,
  mapFavoriteRow,
  mapHistoryRow,
  mapDbProfileToSummary,
  type CatalogIdentity,
} from "@/lib/personal/personal-mappers";
import {
  interestIdsWithinLimit,
  interestSlugsFromDraft,
  labelsFromSpecialtyIds,
  mergeProfilePreferences,
  parsePersonalizationDraft,
  parseProfilePreferences,
  preferredInterestIdsFromDraft,
} from "@/lib/personal/profile-completion";
import type {
  FavoriteItem,
  HistoryItem,
  PersonalDataSource,
  PersonalizationDraft,
  PersonalizationSaveResult,
  ProfilePreferences,
  UserProfileSummary,
} from "@/types/personal";
import type { Json } from "@/types/content";

async function getSupabaseOrNull() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    return await createClient();
  } catch (error) {
    console.warn("personal-api supabase client", error);
    return null;
  }
}

async function getCatalogSupabase() {
  return await getSupabaseOrNull();
}

function mockFavorites(): PersonalListResult<FavoriteItem> {
  const fixtures = getPersonalDemoFixtures();
  return {
    items: fixtures?.getMockFavoriteItems() ?? [],
    source: fixtures ? "mock" : "empty",
  };
}

function emptyFavorites(): PersonalListResult<FavoriteItem> {
  return { items: [], source: "empty" };
}

function mockHistory(): PersonalListResult<HistoryItem> {
  const fixtures = getPersonalDemoFixtures();
  return {
    items: fixtures?.getMockHistoryItems() ?? [],
    source: fixtures ? "mock" : "empty",
  };
}

function emptyHistory(): PersonalListResult<HistoryItem> {
  return { items: [], source: "empty" };
}

function emptyIncompleteProfile(): UserProfileSummary {
  return {
    id: "anonymous",
    fullName: undefined,
    profession: undefined,
    specialtyInterests: [],
    usageMode: undefined,
    experienceLevel: undefined,
    institution: undefined,
    region: undefined,
    practiceContext: undefined,
    planSlug: "freemium",
    planStatus: "active",
    onboardingCompleted: false,
    profileCompleted: false,
    catUpdatesEnabled: true,
    completionPercent: 0,
    initials: "ND",
  };
}

function resolveDemoOrEmptyProfile(
  variant: "incomplete" | "complete" | "pro" = "incomplete",
): ProfileSummaryResult {
  const fixtures = getPersonalDemoFixtures();
  if (fixtures) {
    return {
      profile: fixtures.getMockProfileSummary(variant),
      source: "mock",
    };
  }
  return { profile: emptyIncompleteProfile(), source: "empty" };
}

function uniqueSlugs(
  rows: Array<{ item_type: string; item_slug: string }>,
  type: string,
) {
  return Array.from(
    new Set(
      rows
        .filter((row) => row.item_type === type && row.item_slug)
        .map((row) => row.item_slug),
    ),
  );
}

function putCatalog(
  catalog: Map<string, CatalogIdentity>,
  entityType: string,
  rows: Array<{
    slug: string;
    title?: string | null;
    display_name?: string | null;
    status?: string | null;
    review_status?: string | null;
  }>,
) {
  for (const row of rows) {
    const title = row.title || row.display_name;
    if (!row.slug || !title) {
      continue;
    }
    catalog.set(`${entityType}:${row.slug}`, {
      title,
      status: row.status,
      reviewStatus: row.review_status,
    });
  }
}

async function loadCatalogMap(
  rows: Array<{ item_type: string; item_slug: string }>,
): Promise<Map<string, CatalogIdentity>> {
  const catalog = new Map<string, CatalogIdentity>();
  const supabase = await getCatalogSupabase();
  if (!supabase) {
    return catalog;
  }

  const catSlugs = uniqueSlugs(rows, "cat");
  const protocolSlugs = uniqueSlugs(rows, "protocol");
  const calculatorSlugs = uniqueSlugs(rows, "calculator");
  const drugSlugs = uniqueSlugs(rows, "drug");

  try {
    const [cats, protocols, calculators, drugs] = await Promise.all([
      catSlugs.length
        ? supabase
            .from("cat_maps")
            .select("slug, title, status, review_status")
            .in("slug", catSlugs)
        : Promise.resolve({ data: [] }),
      protocolSlugs.length
        ? supabase
            .from("protocols")
            .select("slug, title, status, review_status")
            .in("slug", protocolSlugs)
        : Promise.resolve({ data: [] }),
      calculatorSlugs.length
        ? supabase
            .from("calculators")
            .select("slug, title, status, review_status")
            .in("slug", calculatorSlugs)
        : Promise.resolve({ data: [] }),
      drugSlugs.length
        ? supabase
            .from("drugs")
            .select("slug, display_name, status, review_status")
            .in("slug", drugSlugs)
        : Promise.resolve({ data: [] }),
    ]);

    putCatalog(catalog, "cat", cats.data ?? []);
    putCatalog(catalog, "protocol", protocols.data ?? []);
    putCatalog(catalog, "calculator", calculators.data ?? []);
    putCatalog(catalog, "drug", drugs.data ?? []);
  } catch (error) {
    console.warn("personal catalog lookup", error);
  }

  return catalog;
}

export type PersonalListResult<T> = {
  items: T[];
  source: PersonalDataSource;
};

export const getFavoriteItems = cache(
  async (): Promise<PersonalListResult<FavoriteItem>> => {
    const supabase = await getSupabaseOrNull();
    if (!supabase) {
      return isDemoContentMode() ? mockFavorites() : emptyFavorites();
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return isDemoContentMode() ? mockFavorites() : emptyFavorites();
      }

      const { data, error } = await supabase
        .from("user_favorites")
        .select("id, item_type, item_slug, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("getFavoriteItems", error.message);
        return isDemoContentMode() ? mockFavorites() : emptyFavorites();
      }

      const rows = data ?? [];
      if (rows.length === 0) {
        return { items: [], source: "empty" };
      }

      const catalog = await loadCatalogMap(rows);
      const items = rows
        .map((row) =>
          mapFavoriteRow({
            id: row.id,
            itemType: row.item_type,
            itemSlug: row.item_slug,
            createdAt: row.created_at,
            catalog: isPersonalEntityType(row.item_type)
              ? catalog.get(`${row.item_type}:${row.item_slug}`)
              : undefined,
          }),
        )
        .filter((item): item is FavoriteItem => item !== null);

      return { items, source: "db" };
    } catch (error) {
      console.warn("getFavoriteItems failed.", error);
      return isDemoContentMode() ? mockFavorites() : emptyFavorites();
    }
  },
);

export const getHistoryItems = cache(
  async (): Promise<PersonalListResult<HistoryItem>> => {
    const supabase = await getSupabaseOrNull();
    if (!supabase) {
      return isDemoContentMode() ? mockHistory() : emptyHistory();
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return isDemoContentMode() ? mockHistory() : emptyHistory();
      }

      const { data, error } = await supabase
        .from("user_history")
        .select("id, item_type, item_slug, viewed_at, metadata")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(80);

      if (error) {
        console.warn("getHistoryItems", error.message);
        return isDemoContentMode() ? mockHistory() : emptyHistory();
      }

      const rows = data ?? [];
      if (rows.length === 0) {
        return { items: [], source: "empty" };
      }

      const catalog = await loadCatalogMap(rows);
      const items = rows
        .map((row) =>
          mapHistoryRow({
            id: row.id,
            itemType: row.item_type,
            itemSlug: row.item_slug,
            viewedAt: row.viewed_at,
            metadata: row.metadata,
            catalog: isPersonalEntityType(row.item_type)
              ? catalog.get(`${row.item_type}:${row.item_slug}`)
              : undefined,
          }),
        )
        .filter((item): item is HistoryItem => item !== null);

      return { items, source: "db" };
    } catch (error) {
      console.warn("getHistoryItems failed.", error);
      return isDemoContentMode() ? mockHistory() : emptyHistory();
    }
  },
);

export type ProfileSummaryResult = {
  profile: UserProfileSummary;
  source: PersonalDataSource;
  personalization?: PersonalizationDraft;
};

type ProfilePreferenceRow = {
  id: string;
  full_name?: string | null;
  profession?: string | null;
  usage_mode?: string | null;
  profile_status?: string | null;
  onboarding_completed?: boolean | null;
  plan_slug?: string | null;
  plan_status?: string | null;
  experience_level?: string | null;
  region?: string | null;
  institution?: string | null;
  practice_context?: string | null;
  preferences?: Json | null;
};

const PROFILE_PREFERENCE_SELECT =
  "id, email, full_name, profession, usage_mode, profile_status, onboarding_completed, experience_level, region, institution, practice_context, preferences";
const PROFILE_LEGACY_SELECT =
  "id, email, full_name, profession, usage_mode, profile_status, onboarding_completed";

function isMissingColumnError(message: string, column: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes(column.toLowerCase()) &&
    (normalized.includes("does not exist") ||
      normalized.includes("schema cache") ||
      normalized.includes("could not find"))
  );
}

function preferencesAsJson(value: ProfilePreferences): Json {
  return value as Json;
}

function draftFromPreferences(
  preferences: ProfilePreferences,
  metadataDraft?: PersonalizationDraft,
): PersonalizationDraft | undefined {
  const stored = preferences.personalization;
  if (
    stored &&
    (stored.specialties.length > 0 ||
      stored.priorities.length > 0 ||
      stored.savedAt)
  ) {
    return {
      specialties: stored.specialties,
      priorities: stored.priorities,
      notificationsEnabled: preferences.cat_updates_enabled,
      savedAt: stored.savedAt,
    };
  }
  return metadataDraft;
}

async function loadProfilePreferenceRow(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseOrNull>>>,
  userId: string,
): Promise<ProfilePreferenceRow | null> {
  const preferred = await supabase
    .from("profiles")
    .select(PROFILE_PREFERENCE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (!preferred.error) {
    return preferred.data as ProfilePreferenceRow | null;
  }

  console.warn("getPersonalProfileSummary profile", preferred.error.message);

  const legacy = await supabase
    .from("profiles")
    .select(PROFILE_LEGACY_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (legacy.error) {
    console.warn("getPersonalProfileSummary legacy profile", legacy.error.message);
    return null;
  }

  return legacy.data as ProfilePreferenceRow | null;
}

export const getPersonalProfileSummary = cache(
  async (): Promise<ProfileSummaryResult> => {
    const supabase = await getSupabaseOrNull();
    if (!supabase) {
      return resolveDemoOrEmptyProfile("incomplete");
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return resolveDemoOrEmptyProfile("incomplete");
      }

      const profileRow = await loadProfilePreferenceRow(supabase, user.id);

      const { data: activeSubscription } = await supabase
        .from("user_subscriptions")
        .select("plan_slug, status, ends_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("starts_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const subscriptionIsLive =
        activeSubscription?.status === "active" &&
        (activeSubscription.ends_at == null ||
          Date.parse(activeSubscription.ends_at) > Date.now());

      let pendingSubscription: { plan_slug: string; status: string } | null = null;
      if (!subscriptionIsLive) {
        const pending = await supabase
          .from("user_subscriptions")
          .select("plan_slug, status")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .order("starts_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        pendingSubscription = pending.data;
      }

      const { data: interestLinks } = await supabase
        .from("user_clinical_interests")
        .select("interest_id")
        .eq("user_id", user.id);

      const interestIds = (interestLinks ?? []).map((row) => row.interest_id);
      let specialtyInterests: string[] = [];
      if (interestIds.length > 0) {
        const { data: interests } = await supabase
          .from("clinical_interests")
          .select("id, label")
          .in("id", interestIds);
        specialtyInterests = (interests ?? []).map((row) => row.label);
      }

      const metadata = user.user_metadata ?? {};
      const storedTitle =
        typeof metadata.title === "string"
          ? metadata.title
          : typeof metadata.honorific === "string"
            ? metadata.honorific
            : null;
      const preferences = parseProfilePreferences(profileRow?.preferences);
      const metadataDraft = parsePersonalizationDraft(metadata.personalization);
      const personalization = draftFromPreferences(preferences, metadataDraft);
      const draftLabels = personalization
        ? labelsFromSpecialtyIds(personalization.specialties)
        : [];
      if (draftLabels.length > 0) {
        specialtyInterests = draftLabels;
      }

      const livePro =
        subscriptionIsLive && isProPlanSlug(activeSubscription?.plan_slug);
      const planSlug = livePro ? activeSubscription?.plan_slug ?? "freemium" : "freemium";
      const planStatus = livePro
        ? "active"
        : pendingSubscription
          ? "pending"
          : "active";
      const profileCompletedFromDraft = Boolean(personalization?.savedAt);

      if (!profileRow) {
        return {
          profile: mapDbProfileToSummary({
            id: user.id,
            fullName:
              (typeof metadata.full_name === "string" && metadata.full_name) ||
              (typeof metadata.name === "string" && metadata.name) ||
              null,
            title: storedTitle,
            specialtyInterests,
            planSlug,
            planStatus,
            profileStatus: profileCompletedFromDraft ? "complete" : undefined,
            catUpdatesEnabled: preferences.cat_updates_enabled,
            language: preferences.language,
            appearance: preferences.appearance,
          }),
          source: "db",
          personalization,
        };
      }

      return {
        profile: mapDbProfileToSummary({
          id: profileRow.id,
          fullName: profileRow.full_name,
          title: storedTitle,
          profession: profileRow.profession,
          specialtyInterests,
          usageMode: profileRow.usage_mode,
          experienceLevel: profileRow.experience_level,
          region: profileRow.region,
          institution: profileRow.institution,
          practiceContext: profileRow.practice_context,
          planSlug,
          planStatus,
          onboardingCompleted: Boolean(profileRow.onboarding_completed),
          profileStatus: profileCompletedFromDraft
            ? "complete"
            : profileRow.profile_status,
          catUpdatesEnabled: preferences.cat_updates_enabled,
          language: preferences.language,
          appearance: preferences.appearance,
        }),
        source: "db",
        personalization,
      };
    } catch (error) {
      console.warn("getPersonalProfileSummary unavailable.", error);
      return resolveDemoOrEmptyProfile("incomplete");
    }
  },
);

export const getProfileSummary = getPersonalProfileSummary;

async function syncMappedClinicalInterests(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseOrNull>>>,
  userId: string,
  draft: PersonalizationDraft,
) {
  const slugs = interestSlugsFromDraft(draft);
  if (slugs.length === 0) {
    return;
  }

  const { data: interestRows, error: interestLookupError } = await supabase
    .from("clinical_interests")
    .select("id, slug")
    .in("slug", slugs)
    .eq("is_active", true);

  if (interestLookupError) {
    console.warn(
      "completePersonalization interests lookup",
      interestLookupError.message,
    );
    return;
  }

  const { data: existingLinks } = await supabase
    .from("user_clinical_interests")
    .select("interest_id")
    .eq("user_id", userId);

  const existingIds = (existingLinks ?? []).map((row) => row.interest_id);
  const toInsert = interestIdsWithinLimit(
    preferredInterestIdsFromDraft(draft, interestRows ?? []),
    existingIds,
  ).map((interest_id) => ({
    user_id: userId,
    interest_id,
  }));

  if (toInsert.length === 0) {
    return;
  }

  const { error: interestError } = await supabase
    .from("user_clinical_interests")
    .insert(toInsert);
  if (interestError) {
    console.warn("completePersonalization interests", interestError.message);
  }
}

export async function updateProfilePreferences(
  patch: Partial<ProfilePreferences>,
): Promise<PersonalizationSaveResult> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return { ok: true, persisted: "local" };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: true, persisted: "local" };
    }

    const profileRow = await loadProfilePreferenceRow(supabase, user.id);
    const current = parseProfilePreferences(profileRow?.preferences);
    const next = mergeProfilePreferences(current, patch);

    const { error } = await supabase
      .from("profiles")
      .update({ preferences: preferencesAsJson(next) })
      .eq("id", user.id);

    if (error) {
      console.warn("updateProfilePreferences", error.message);
      return {
        ok: false,
        persisted: "local",
        message:
          "Impossible d’enregistrer cette préférence pour le moment. Réessayez.",
      };
    }

    revalidatePath("/profile");
    return { ok: true, persisted: "db" };
  } catch (error) {
    console.warn("updateProfilePreferences fallback to local.", error);
    return {
      ok: false,
      persisted: "local",
      message:
        "Impossible d’enregistrer cette préférence pour le moment. Réessayez.",
    };
  }
}

export async function completePersonalization(
  draft: PersonalizationDraft,
): Promise<PersonalizationSaveResult> {
  const payload: PersonalizationDraft = {
    specialties: draft.specialties,
    priorities: draft.priorities,
    notificationsEnabled: draft.notificationsEnabled,
    savedAt: new Date().toISOString(),
  };

  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return { ok: true, persisted: "local" };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: true, persisted: "local" };
    }

    const profileRow = await loadProfilePreferenceRow(supabase, user.id);
    const current = parseProfilePreferences(profileRow?.preferences);
    const nextPreferences = mergeProfilePreferences(current, {
      cat_updates_enabled:
        typeof payload.notificationsEnabled === "boolean"
          ? payload.notificationsEnabled
          : current.cat_updates_enabled,
      personalization: {
        specialties: payload.specialties,
        priorities: payload.priorities,
        savedAt: payload.savedAt,
      },
    });

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        profile_status: "complete",
        preferences: preferencesAsJson(nextPreferences),
      })
      .eq("id", user.id);

    if (
      profileError &&
      isMissingColumnError(profileError.message, "preferences")
    ) {
      const { error: statusError } = await supabase
        .from("profiles")
        .update({ profile_status: "complete" })
        .eq("id", user.id);
      if (statusError) {
        console.warn("completePersonalization profile status", statusError.message);
      }
    } else if (profileError) {
      console.warn("completePersonalization profile", profileError.message);
      return {
        ok: false,
        persisted: "local",
        message:
          "Impossible d’enregistrer la personnalisation pour le moment. Réessayez.",
      };
    }

    await syncMappedClinicalInterests(supabase, user.id, payload);

    const { error: metadataError } = await supabase.auth.updateUser({
      data: { personalization: payload },
    });
    if (metadataError) {
      console.warn("completePersonalization metadata", metadataError.message);
    }

    const { error: eventError } = await supabase.from("onboarding_events").insert({
      user_id: user.id,
      event_name: "personalization_pack_saved",
      metadata: {
        specialties: payload.specialties,
        priorities: payload.priorities,
      },
    });
    if (eventError) {
      console.warn("completePersonalization event", eventError.message);
    }

    revalidatePath("/profile");
    revalidatePath("/home");

    return { ok: true, persisted: profileError ? "local" : "db" };
  } catch (error) {
    console.warn("completePersonalization fallback to local.", error);
    return {
      ok: false,
      persisted: "local",
      message:
        "Impossible d’enregistrer la personnalisation pour le moment. Réessayez.",
    };
  }
}

export async function persistPersonalizationDraft(
  draft: PersonalizationDraft,
): Promise<PersonalizationSaveResult> {
  return completePersonalization(draft);
}

export async function clearUserHistory(): Promise<PersonalizationSaveResult> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return { ok: true, persisted: "local" };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: true, persisted: "local" };
    }

    const { error } = await supabase
      .from("user_history")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.warn("clearUserHistory", error.message);
      return {
        ok: false,
        persisted: "local",
        message: "Impossible d’effacer l’historique pour le moment. Réessayez.",
      };
    }

    revalidatePath("/history");
    return { ok: true, persisted: "db" };
  } catch (error) {
    console.warn("clearUserHistory fallback to local.", error);
    return {
      ok: false,
      persisted: "local",
      message: "Impossible d’effacer l’historique pour le moment. Réessayez.",
    };
  }
}
