import type { HistoryItem } from "@/types/personal";

/** Latest opened protocol. Drugs and scores are tools, not a resume target. */
export function latestClinicalResume(items: HistoryItem[]): HistoryItem | null {
  for (const item of items) {
    if (item.entityType === "protocol") {
      return item;
    }
  }
  return null;
}
