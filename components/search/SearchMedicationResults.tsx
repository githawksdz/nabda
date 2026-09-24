"use client";

import { MedicationResultCard } from "./MedicationResultCard";
import type { MedicationSearchResult } from "@/types/search";

type SearchMedicationResultsProps = {
  results: MedicationSearchResult[];
  totalCount?: number;
};

export function SearchMedicationResults({
  results,
  totalCount,
}: SearchMedicationResultsProps) {
  const count = totalCount ?? results.length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-on-surface-variant">
        {count} résultat{count > 1 ? "s" : ""} · ordre alphabétique
      </p>

      <div className="flex flex-col gap-3">
        {results.map((result) => (
          <MedicationResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}
