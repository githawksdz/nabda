import type {
  PersonalizationChip,
  PersonalizationDraft,
  ProfilePreferences,
  UserProfileSummary,
} from "@/types/personal";
import {
  PERSONALIZATION_PRIORITIES,
  PERSONALIZATION_SPECIALTIES,
} from "@/lib/personal/personalization-options";

const FALLBACK_INITIALS = "ND";

export function initialsFromName(
  name: string | null | undefined,
  fallback = FALLBACK_INITIALS,
): string {
  if (!name?.trim()) {
    return fallback;
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || fallback;
}

export function displayProfileName(profile: Pick<UserProfileSummary, "fullName" | "title">) {
  const name = profile.fullName?.trim();
  if (!name) {
    return "Profil Nabda";
  }
  const title = profile.title?.trim();
  if (title) {
    return `${title} ${name}`;
  }
  return name;
}

export type ProfileCompletionInput = {
  fullName?: string | null;
  profession?: string | null;
  specialtyInterests?: string[];
  usageMode?: string | null;
  onboardingCompleted?: boolean;
  profileCompleted?: boolean;
};

export function computeCompletionPercent(input: ProfileCompletionInput): number {
  const checks = [
    Boolean(input.fullName?.trim()),
    Boolean(input.profession?.trim()),
    (input.specialtyInterests?.length ?? 0) > 0,
    Boolean(input.usageMode?.trim()),
    Boolean(input.onboardingCompleted || input.profileCompleted),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function isProfileIncomplete(
  profile: Pick<UserProfileSummary, "profileCompleted" | "completionPercent">,
) {
  if (profile.profileCompleted) {
    return false;
  }
  return profile.completionPercent < 100;
}

export function withComputedCompletion<
  T extends Omit<UserProfileSummary, "completionPercent" | "initials"> & {
    initials?: string;
  },
>(profile: T): UserProfileSummary {
  const completionPercent = computeCompletionPercent(profile);
  const profileCompleted =
    profile.profileCompleted === true ||
    (Boolean(profile.onboardingCompleted) && completionPercent === 100);

  return {
    ...profile,
    initials: profile.initials || initialsFromName(profile.fullName),
    completionPercent,
    profileCompleted,
  };
}

export function emptyPersonalizationDraft(): PersonalizationDraft {
  return { specialties: [], priorities: [] };
}

export function parsePersonalizationDraft(
  value: unknown,
): PersonalizationDraft | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const specialties = Array.isArray(record.specialties)
    ? record.specialties.filter((item): item is string => typeof item === "string")
    : [];
  const priorities = Array.isArray(record.priorities)
    ? record.priorities.filter((item): item is string => typeof item === "string")
    : [];
  if (specialties.length === 0 && priorities.length === 0 && !record.savedAt) {
    return undefined;
  }
  return {
    specialties,
    priorities,
    notificationsEnabled:
      typeof record.notificationsEnabled === "boolean"
        ? record.notificationsEnabled
        : undefined,
    savedAt: typeof record.savedAt === "string" ? record.savedAt : undefined,
  };
}

function chipMatchesLabel(chip: PersonalizationChip, label: string) {
  const normalized = label.trim().toLowerCase();
  if (chip.label.toLowerCase() === normalized) {
    return true;
  }
  return (chip.aliases ?? []).some(
    (alias) => alias.toLowerCase() === normalized,
  );
}

export function specialtyIdsFromLabels(labels: string[]): string[] {
  return PERSONALIZATION_SPECIALTIES.filter((chip) =>
    labels.some((label) => chipMatchesLabel(chip, label)),
  ).map((chip) => chip.id);
}

export function labelsFromSpecialtyIds(ids: string[]): string[] {
  return PERSONALIZATION_SPECIALTIES.filter((chip) => ids.includes(chip.id)).map(
    (chip) => chip.label,
  );
}

export const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  cat_updates_enabled: true,
  offline_cache_enabled: false,
  language: "fr",
  appearance: "system",
  personalization: {
    specialties: [],
    priorities: [],
  },
};

const MAX_USER_CLINICAL_INTERESTS = 5;

export function parseProfilePreferences(value: unknown): ProfilePreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_PROFILE_PREFERENCES };
  }

  const record = value as Record<string, unknown>;
  const personalization = parsePersonalizationDraft(record.personalization);

  return {
    cat_updates_enabled:
      typeof record.cat_updates_enabled === "boolean"
        ? record.cat_updates_enabled
        : DEFAULT_PROFILE_PREFERENCES.cat_updates_enabled,
    offline_cache_enabled:
      typeof record.offline_cache_enabled === "boolean"
        ? record.offline_cache_enabled
        : DEFAULT_PROFILE_PREFERENCES.offline_cache_enabled,
    language:
      typeof record.language === "string" && record.language.trim()
        ? record.language
        : DEFAULT_PROFILE_PREFERENCES.language,
    appearance:
      typeof record.appearance === "string" && record.appearance.trim()
        ? record.appearance
        : DEFAULT_PROFILE_PREFERENCES.appearance,
    personalization: personalization
      ? {
          specialties: personalization.specialties,
          priorities: personalization.priorities,
          savedAt: personalization.savedAt,
        }
      : { specialties: [], priorities: [] },
  };
}

export function mergeProfilePreferences(
  current: ProfilePreferences,
  patch: Partial<ProfilePreferences>,
): ProfilePreferences {
  return {
    cat_updates_enabled:
      patch.cat_updates_enabled ?? current.cat_updates_enabled,
    offline_cache_enabled:
      patch.offline_cache_enabled ?? current.offline_cache_enabled,
    language: patch.language ?? current.language,
    appearance: patch.appearance ?? current.appearance,
    personalization: patch.personalization ?? current.personalization,
  };
}

export function selectedPersonalizationChips(draft: PersonalizationDraft) {
  return [
    ...PERSONALIZATION_SPECIALTIES.filter((chip) =>
      draft.specialties.includes(chip.id),
    ),
    ...PERSONALIZATION_PRIORITIES.filter((chip) =>
      draft.priorities.includes(chip.id),
    ),
  ];
}

export function interestSlugsFromDraft(draft: PersonalizationDraft): string[] {
  return Array.from(
    new Set(
      selectedPersonalizationChips(draft).flatMap(
        (chip) => chip.interestSlugs ?? [],
      ),
    ),
  );
}

export function preferredInterestIdsFromDraft(
  draft: PersonalizationDraft,
  rows: Array<{ id: string; slug: string }>,
): string[] {
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  const ids: string[] = [];
  for (const chip of selectedPersonalizationChips(draft)) {
    const match = (chip.interestSlugs ?? [])
      .map((slug) => bySlug.get(slug))
      .find(Boolean);
    if (match && !ids.includes(match.id)) {
      ids.push(match.id);
    }
  }
  return ids;
}

export function interestIdsWithinLimit(
  mappedIds: string[],
  existingIds: Iterable<string>,
  limit = MAX_USER_CLINICAL_INTERESTS,
): string[] {
  const existing = new Set(existingIds);
  const remaining = Math.max(0, limit - existing.size);
  return mappedIds.filter((id) => !existing.has(id)).slice(0, remaining);
}

export function draftFromProfile(
  profile: Pick<UserProfileSummary, "specialtyInterests">,
  stored?: PersonalizationDraft,
): PersonalizationDraft {
  if (stored) {
    return {
      specialties: stored.specialties,
      priorities: stored.priorities,
      notificationsEnabled: stored.notificationsEnabled,
      savedAt: stored.savedAt,
    };
  }
  return {
    specialties: specialtyIdsFromLabels(profile.specialtyInterests),
    priorities: [],
  };
}
