import type { ClinicalInterest, Profession, UsageMode } from "@/types/database";

export type PersonalizationStep =
  | "profession"
  | "interests"
  | "usage"
  | "consent";

export type PersonalizationState = {
  profession: Profession | null;
  interestIds: string[];
  usageMode: UsageMode | null;
  accepted: boolean;
};

export type PersonalizationPageData = {
  interests: ClinicalInterest[];
  selectedInterestIds: string[];
  profession: Profession | null;
  usageMode: UsageMode | null;
  fullName: string | null;
};
