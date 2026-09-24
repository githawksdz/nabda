"use server";

import {
  clearUserHistory,
  completePersonalization,
  updateProfilePreferences,
} from "@/lib/personal/personal-api";
import type {
  PersonalizationDraft,
  PersonalizationSaveResult,
} from "@/types/personal";

export async function savePersonalizationDraft(
  draft: PersonalizationDraft,
): Promise<PersonalizationSaveResult> {
  return completePersonalization(draft);
}

export async function saveCatUpdatesPreference(
  enabled: boolean,
): Promise<PersonalizationSaveResult> {
  return updateProfilePreferences({ cat_updates_enabled: enabled });
}

export async function clearOwnHistory(): Promise<PersonalizationSaveResult> {
  return clearUserHistory();
}
