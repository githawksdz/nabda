export type Plan = "freemium" | "pro";
export type HomeProfileStatus = "incomplete" | "complete";
export type UserKind =
  | "student"
  | "intern"
  | "resident"
  | "generalist"
  | "specialist"
  | "unknown";

export type HomeMode = "incomplete" | "freemium-complete" | "pro-practitioner";

export type HomeUser = {
  id: string;
  fullName?: string;
  displayName: string;
  initials: string;
  title?: string;
  professionLabel?: string;
  specialtyLabel?: string;
  plan: Plan;
  profileStatus: HomeProfileStatus;
  verified?: boolean;
};

export type HomeUpdate = {
  id: string;
  label?: string;
  title: string;
  description?: string;
  category?: string;
  type?: "CAT" | "Protocole" | "Reco" | "Score" | "Médicament";
  meta?: string;
  timeLabel?: string;
  href: string;
  footer?: string;
};

import type { CalculatorType } from "@/types/calculators";

export type ScoreShortcut = {
  id: string;
  slug: string;
  /** Nabda parent entity for stable keys and publication checks. */
  contentType: "calculator";
  catalogType: CalculatorType;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  actionLabel?: string;
};

export type RecommendationRow = {
  id: string;
  title: string;
  specialty: string;
  typeLabel: string;
  href: string;
  icon: string;
};

export type SearchChip = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
};

export type OfflinePackMetric = {
  id: string;
  value: string;
  label: string;
};

export type HomePreviewParam = "incomplete" | "freemium" | "pro";
