export type PersonalEntityType = "cat" | "protocol" | "calculator" | "drug";

export type PersonalFilterId = "all" | PersonalEntityType;

export type PersonalFilterChip = {
  id: PersonalFilterId;
  label: string;
  count?: number;
};

export type FavoriteItem = {
  id: string;
  entityType: PersonalEntityType;
  entitySlug: string;
  title: string;
  subtitle: string;
  href: string;
  statusLabel?: string;
  kindLabel?: string;
  savedAt?: string;
  lastViewedAt?: string;
};

export type HistoryItem = {
  id: string;
  entityType: PersonalEntityType;
  entitySlug: string;
  title: string;
  subtitle: string;
  href: string;
  viewedAt: string;
  kindLabel?: string;
  metadata?: Record<string, unknown>;
};

export type HistoryGroupId = "today" | "week" | "older";

export type HistoryGroup = {
  id: HistoryGroupId;
  title: string;
  items: HistoryItem[];
};

export type ProfilePreferencesPersonalization = {
  specialties: string[];
  priorities: string[];
  savedAt?: string;
};

export type ProfilePreferences = {
  cat_updates_enabled?: boolean;
  offline_cache_enabled?: boolean;
  language?: string;
  appearance?: string;
  personalization?: ProfilePreferencesPersonalization;
};

export type UserProfileSummary = {
  id: string;
  fullName?: string;
  initials: string;
  /** Stored honorific only. Never infer "Dr". */
  title?: string;
  profession?: string;
  specialtyInterests: string[];
  usageMode?: string;
  experienceLevel?: string;
  institution?: string;
  region?: string;
  practiceContext?: string;
  planSlug: "freemium" | "pro_yearly" | string;
  planStatus: "active" | "trialing" | "pending" | "expired" | string;
  completionPercent: number;
  onboardingCompleted?: boolean;
  profileCompleted?: boolean;
  catUpdatesEnabled?: boolean;
  language?: string;
  appearance?: string;
};

export type ProfilePreview = "complete" | "pro";

export type PlanCardVariant = "freemium" | "pro" | "pending";

export type PlanPresentation = {
  variant: PlanCardVariant;
  title: string;
  statusLabel: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
};

export type ProfileListItem = {
  id: string;
  label: string;
  value?: string;
  href?: string;
  badge?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type PersonalizationDraft = {
  specialties: string[];
  priorities: string[];
  notificationsEnabled?: boolean;
  savedAt?: string;
};

export type PersonalizationChip = {
  id: string;
  label: string;
  aliases?: string[];
  interestSlugs?: string[];
};

export type PersonalizationSaveResult = {
  ok: boolean;
  persisted: "db" | "local";
  message?: string;
};

export type PersonalDataSource = "db" | "mock" | "empty";
