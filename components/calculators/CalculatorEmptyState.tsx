"use client";

import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

type CalculatorEmptyStateProps = {
  onReset: () => void;
};

export function CalculatorEmptyState({ onReset }: CalculatorEmptyStateProps) {
  return (
    <EmptyState
      title="Aucun score trouvé"
      description="Vérifiez l'orthographe ou réinitialisez les filtres de catégorie."
      icon={<SearchX className="size-5" strokeWidth={1.75} />}
      actionLabel="Réinitialiser la recherche"
      onAction={onReset}
      className="py-6"
    />
  );
}
