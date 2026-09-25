import { isDemoContentMode } from "@/lib/content-data/content-source-mode";
import { getPersonalDemoFixtures } from "@/lib/demo-fixtures/load";
import { HISTORY_GROUP_TITLES } from "@/lib/personal/personal-ui-config";
import { canReadContent, type ViewerAccess } from "@/lib/authz/content-gate";
import { doctorCatalogStatusLabel } from "@/lib/content-detail/doctor-facing-status";
import { isPlaceholderRecord } from "@/lib/content-source/readiness";
import type {
  FavoriteItem,
  HistoryGroup,
  HistoryItem,
  PersonalEntityType,
  PersonalFilterChip,
  PersonalFilterId,
  PlanPresentation,
  ProfilePreview,
  UserProfileSummary,
} from "@/types/personal";
import { withComputedCompletion } from "@/lib/personal/profile-completion";
import {
  PROFESSION_LABELS,
  USAGE_MODE_LABELS,
  type Profession,
  type UsageMode,
} from "@/types/database";

export const PERSONAL_ENTITY_TYPES = [
  "cat",
  "protocol",
  "calculator",
  "drug",
] as const satisfies readonly PersonalEntityType[];

export const ENTITY_TYPE_LABELS: Record<PersonalEntityType, string> = {
  cat: "CAT",
  protocol: "Protocole",
  calculator: "Score",
  drug: "Médicament",
};

export const ENTITY_SUBTITLES: Record<PersonalEntityType, { saved: string; viewed: string }> =
  {
    cat: {
      saved: "Arbre décisionnel sauvegardé",
      viewed: "Arbre décisionnel",
    },
    protocol: {
      saved: "Synthèse clinique sauvegardée",
      viewed: "Synthèse clinique",
    },
    calculator: {
      saved: "Aide au calcul",
      viewed: "Aide au calcul",
    },
    drug: {
      saved: "Fiche médicament sauvegardée",
      viewed: "Fiche médicament",
    },
  };

export function isPersonalEntityType(value: string): value is PersonalEntityType {
  return (PERSONAL_ENTITY_TYPES as readonly string[]).includes(value);
}

export function resumeHref(
  entityType: PersonalEntityType,
  slug: string,
  metadata?: Record<string, unknown>,
): string {
  const base = personalHref(entityType, slug, "history");
  const section =
    typeof metadata?.section === "string" ? metadata.section.trim() : "";
  const tab = typeof metadata?.tab === "string" ? metadata.tab.trim() : "";
  if (entityType === "protocol" && section) {
    return `${base}?section=${encodeURIComponent(section)}`;
  }
  if (entityType === "cat" && tab) {
    return `${base}?tab=${encodeURIComponent(tab)}`;
  }
  return base;
}

export function personalHref(
  entityType: PersonalEntityType,
  slug: string,
  variant: "favorite" | "history" = "history",
): string {
  switch (entityType) {
    case "cat":
      return variant === "favorite" ? `/cat/${slug}?tab=carte` : `/cat/${slug}`;
    case "protocol":
      return `/protocols/${slug}`;
    case "calculator":
      return `/calculators/${slug}`;
    case "drug":
      return `/drugs/${slug}`;
  }
}

export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function catalogKey(entityType: PersonalEntityType, slug: string): string {
  return `${entityType}:${slug}`;
}

export type CatalogIdentity = {
  title: string;
  status?: string | null;
  reviewStatus?: string | null;
  visibility?: string | null;
};

export function isCatalogReadable(
  catalog: CatalogIdentity | undefined,
  viewer: ViewerAccess,
): boolean {
  if (!catalog) {
    return false;
  }
  return canReadContent(
    {
      status: catalog.status,
      visibility: catalog.visibility,
      reviewStatus: catalog.reviewStatus,
    },
    viewer,
  );
}

export function personalStatusLabel(
  publicationStatus?: string | null,
  reviewStatus?: string | null,
  visibility?: string | null,
): string | undefined {
  if (
    isPlaceholderRecord(publicationStatus, reviewStatus) ||
    publicationStatus === "draft" ||
    publicationStatus === "seed_placeholder"
  ) {
    return "Contenu en préparation";
  }
  return doctorCatalogStatusLabel({
    publicationStatus,
    visibility,
  });
}

export function storedHistoryCaption(
  metadata?: Record<string, unknown>,
): string | undefined {
  if (!metadata) {
    return undefined;
  }
  const keys = ["resultLabel", "result_label", "resumeLabel", "caption"];
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

export function resolvePersonalCopy(
  entityType: PersonalEntityType,
  slug: string,
  catalog?: CatalogIdentity,
): {
  title: string;
  kindLabel: string;
  favoriteSubtitle: string;
  historySubtitle: string;
  statusLabel?: string;
} {
  const mock = isDemoContentMode()
    ? getPersonalDemoFixtures()?.MOCK_PERSONAL_CATALOG[catalogKey(entityType, slug)]
    : undefined;
  const title =
    catalog?.title ||
    mock?.title ||
    (catalog === undefined && !isDemoContentMode()
      ? "Contenu indisponible"
      : titleFromSlug(slug));
  const kindLabel =
    mock?.kindLabel ?? ENTITY_TYPE_LABELS[entityType];
  const statusLabel =
    catalog === undefined && !isDemoContentMode()
      ? "Plus disponible dans Nabda"
      : personalStatusLabel(catalog?.status, catalog?.reviewStatus);

  return {
    title,
    kindLabel,
    favoriteSubtitle:
      entityType === "calculator"
        ? (mock?.subtitle ?? ENTITY_SUBTITLES.calculator.saved)
        : ENTITY_SUBTITLES[entityType].saved,
    historySubtitle: mock?.subtitle ?? ENTITY_SUBTITLES[entityType].viewed,
    statusLabel,
  };
}

export function mapFavoriteRow(
  input: {
    id: string;
    itemType: string;
    itemSlug: string;
    createdAt?: string;
    catalog?: CatalogIdentity;
  },
  viewer?: ViewerAccess,
): FavoriteItem | null {
  if (!isPersonalEntityType(input.itemType) || !input.itemSlug) {
    return null;
  }
  if (!isDemoContentMode() && viewer && !isCatalogReadable(input.catalog, viewer)) {
    return null;
  }

  const copy = resolvePersonalCopy(
    input.itemType,
    input.itemSlug,
    input.catalog,
  );

  return {
    id: input.id,
    entityType: input.itemType,
    entitySlug: input.itemSlug,
    title: copy.title,
    subtitle:
      copy.favoriteSubtitle || ENTITY_SUBTITLES[input.itemType].saved,
    href: personalHref(input.itemType, input.itemSlug, "favorite"),
    statusLabel: copy.statusLabel,
    kindLabel: copy.kindLabel,
    savedAt: input.createdAt,
  };
}

export function asMetadata(
  value: unknown,
): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

export function mapHistoryRow(
  input: {
    id: string;
    itemType: string;
    itemSlug: string;
    viewedAt: string;
    metadata?: unknown;
    catalog?: CatalogIdentity;
  },
  viewer?: ViewerAccess,
): HistoryItem | null {
  if (!isPersonalEntityType(input.itemType) || !input.itemSlug) {
    return null;
  }
  if (!isDemoContentMode() && viewer && !isCatalogReadable(input.catalog, viewer)) {
    return null;
  }

  const metadata = asMetadata(input.metadata);
  const copy = resolvePersonalCopy(
    input.itemType,
    input.itemSlug,
    input.catalog,
  );
  const storedCaption = storedHistoryCaption(metadata);

  return {
    id: input.id,
    entityType: input.itemType,
    entitySlug: input.itemSlug,
    title: copy.title,
    subtitle: storedCaption ?? copy.historySubtitle,
    href: resumeHref(input.itemType, input.itemSlug, metadata),
    viewedAt: input.viewedAt,
    kindLabel: copy.kindLabel,
    metadata,
  };
}

export function filterPersonalItems<T extends { entityType: PersonalEntityType }>(
  items: T[],
  filter: PersonalFilterId,
): T[] {
  if (filter === "all") {
    return items;
  }
  return items.filter((item) => item.entityType === filter);
}

export function chipsWithCounts(
  chips: PersonalFilterChip[],
  items: Array<{ entityType: PersonalEntityType }>,
): PersonalFilterChip[] {
  const counts: Record<PersonalFilterId, number> = {
    all: items.length,
    cat: 0,
    protocol: 0,
    calculator: 0,
    drug: 0,
  };
  for (const item of items) {
    counts[item.entityType] += 1;
  }
  return chips.map((chip) => ({
    ...chip,
    count: counts[chip.id],
  }));
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfLocalWeek(date: Date): Date {
  const start = startOfLocalDay(date);
  const weekday = start.getDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  start.setDate(start.getDate() - daysFromMonday);
  return start;
}

export function groupHistoryItems(
  items: HistoryItem[],
  now = new Date(),
): HistoryGroup[] {
  const todayStart = startOfLocalDay(now);
  const weekStart = startOfLocalWeek(now);
  const groups: Record<HistoryGroup["id"], HistoryItem[]> = {
    today: [],
    week: [],
    older: [],
  };

  const sorted = [...items].sort(
    (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime(),
  );

  for (const item of sorted) {
    const viewed = new Date(item.viewedAt);
    if (Number.isNaN(viewed.getTime()) || viewed >= todayStart) {
      groups.today.push(item);
    } else if (viewed >= weekStart) {
      groups.week.push(item);
    } else {
      groups.older.push(item);
    }
  }

  return (["today", "week", "older"] as const)
    .filter((id) => groups[id].length > 0)
    .map((id) => ({
      id,
      title: HISTORY_GROUP_TITLES[id],
      items: groups[id],
    }));
}

export function formatRelativeViewedAt(
  iso: string,
  now = new Date(),
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) {
    return "À l’instant";
  }
  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24 && date >= startOfLocalDay(now)) {
    return `Il y a ${diffHours} h`;
  }

  const yesterday = startOfLocalDay(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date >= yesterday) {
    return "Hier";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function isEmptyPreview(preview?: string | null): boolean {
  return preview === "empty";
}

export function parseProfilePreview(
  value?: string | null,
): ProfilePreview | null {
  if (value === "complete") {
    return "complete";
  }
  if (value === "pro") {
    return "pro";
  }
  return null;
}

export function mapPlanPresentation(
  planSlug: string,
  planStatus: string,
): PlanPresentation {
  if (planStatus === "pending") {
    return {
      variant: "pending",
      title: "Paiement en vérification",
      statusLabel: "Reçu en examen",
      body: "Votre reçu sera examiné manuellement.",
    };
  }

  const isPro =
    (planSlug === "pro_yearly" || planSlug.startsWith("pro")) &&
    (planStatus === "active" || planStatus === "trialing");

  if (isPro) {
    return {
      variant: "pro",
      title: "Praticien Pro",
      statusLabel: "Plan actif",
      body: "Accès Pro aux modules disponibles.",
    };
  }

  return {
    variant: "freemium",
    title: "Plan Découverte",
    statusLabel: "Freemium actif",
    body: "Accès standard aux modules disponibles.",
    actionLabel: "Voir Praticien Pro",
    actionHref: "/offline",
  };
}

export function applyProfilePreview(
  profile: UserProfileSummary,
  preview?: string | null,
): UserProfileSummary {
  const parsed = parseProfilePreview(preview);
  const fixtures = isDemoContentMode() ? getPersonalDemoFixtures() : null;
  if (parsed === "pro") {
    const demo = fixtures?.getMockProfileSummary("pro");
    return withComputedCompletion({
      ...profile,
      planSlug: "pro_yearly",
      planStatus: "active",
      onboardingCompleted: true,
      profileCompleted: true,
      fullName: profile.fullName || demo?.fullName || profile.fullName,
      profession: profile.profession || demo?.profession || profile.profession,
      specialtyInterests:
        profile.specialtyInterests.length > 0
          ? profile.specialtyInterests
          : (demo?.specialtyInterests ?? profile.specialtyInterests),
      usageMode: profile.usageMode || demo?.usageMode || profile.usageMode,
    });
  }
  if (parsed === "complete") {
    const demo = fixtures?.getMockProfileSummary("complete");
    return withComputedCompletion({
      ...profile,
      onboardingCompleted: true,
      profileCompleted: true,
      planSlug: profile.planSlug === "pro_yearly" ? profile.planSlug : "freemium",
      fullName: profile.fullName || demo?.fullName || profile.fullName,
      profession: profile.profession || demo?.profession || profile.profession,
      specialtyInterests:
        profile.specialtyInterests.length > 0
          ? profile.specialtyInterests
          : (demo?.specialtyInterests ?? profile.specialtyInterests),
      usageMode: profile.usageMode || demo?.usageMode || profile.usageMode,
    });
  }
  return profile;
}

const LANGUAGE_LABELS: Record<string, string> = {
  fr: "Français",
  ar: "Arabe",
  en: "English",
};

const APPEARANCE_LABELS: Record<string, string> = {
  system: "Automatique",
  light: "Clair",
  dark: "Sombre",
};

export function displayLanguageLabel(value?: string | null): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  return LANGUAGE_LABELS[value] ?? value;
}

export function displayAppearanceLabel(value?: string | null): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  return APPEARANCE_LABELS[value] ?? value;
}

export function mapDbProfileToSummary(input: {
  id: string;
  fullName?: string | null;
  title?: string | null;
  profession?: string | null;
  specialtyInterests: string[];
  usageMode?: string | null;
  experienceLevel?: string | null;
  institution?: string | null;
  region?: string | null;
  practiceContext?: string | null;
  planSlug?: string | null;
  planStatus?: string | null;
  onboardingCompleted?: boolean;
  profileStatus?: string | null;
  catUpdatesEnabled?: boolean;
  language?: string | null;
  appearance?: string | null;
}): UserProfileSummary {
  const professionLabel = professionDisplayLabel(input.profession);
  const usageLabel = usageModeDisplayLabel(input.usageMode);

  return withComputedCompletion({
    id: input.id,
    fullName: input.fullName?.trim() || undefined,
    title: input.title?.trim() || undefined,
    profession: professionLabel,
    specialtyInterests: input.specialtyInterests,
    usageMode: usageLabel,
    experienceLevel: input.experienceLevel?.trim() || undefined,
    institution: input.institution?.trim() || undefined,
    region: input.region?.trim() || undefined,
    practiceContext: input.practiceContext?.trim() || undefined,
    planSlug: input.planSlug || "freemium",
    planStatus: input.planStatus || "active",
    onboardingCompleted: Boolean(input.onboardingCompleted),
    profileCompleted: input.profileStatus === "complete",
    catUpdatesEnabled: input.catUpdatesEnabled,
    language: displayLanguageLabel(input.language),
    appearance: displayAppearanceLabel(input.appearance),
  });
}

function professionDisplayLabel(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  if (value in PROFESSION_LABELS) {
    return PROFESSION_LABELS[value as Profession];
  }
  return value;
}

function usageModeDisplayLabel(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  if (value in USAGE_MODE_LABELS) {
    return USAGE_MODE_LABELS[value as UsageMode];
  }
  return value;
}
