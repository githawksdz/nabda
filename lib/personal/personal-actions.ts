"use server";

import { clearUserHistory, completePersonalization } from "@/lib/personal/personal-api";
import type {
  PersonalizationDraft,
  PersonalizationSaveResult,
} from "@/types/personal";

export async function savePersonalizationDraft(
  draft: PersonalizationDraft,
): Promise<PersonalizationSaveResult> {
  return completePersonalization(draft);
}

export async function clearOwnHistory(): Promise<PersonalizationSaveResult> {
  return clearUserHistory();
}
