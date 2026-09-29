import type { DrugSummary } from "@/types/drugs";

const PLACEHOLDER_CLASS_LABELS = new Set([
  "classe à compléter",
  "uncategorized",
]);

export function classLabelKey(label: string) {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function splitDrugClassLabels(className?: string | null): string[] {
  if (!className) return [];
  const parts = className
    .split(/\s*[·|,;/]\s*/)
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false;
      return !PLACEHOLDER_CLASS_LABELS.has(part.toLowerCase());
    });
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const key = classLabelKey(part);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(part);
  }
  return out;
}

export function drugClassLabels(
  item: Pick<DrugSummary, "className" | "classLabels">,
): string[] {
  if (item.classLabels && item.classLabels.length > 0) {
    return item.classLabels;
  }
  return splitDrugClassLabels(item.className);
}
