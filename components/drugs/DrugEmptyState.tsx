"use client";

import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

type DrugEmptyStateProps = {
  onReset: () => void;
  catalogEmpty?: boolean;
};

export function DrugEmptyState({
  onReset,
  catalogEmpty = false,
}: DrugEmptyStateProps) {
  return (
    <EmptyState
      title={catalogEmpty ? "Catalogue indisponible" : "Aucune molécule trouvée"}
      description={
        catalogEmpty
          ? "Les fiches médicaments ne sont pas disponibles pour le moment."
          : "Vérifiez l’orthographe ou réinitialisez les filtres."
      }
      icon={<SearchX className="size-5" strokeWidth={1.75} />}
      actionLabel={catalogEmpty ? undefined : "Réinitialiser la recherche"}
      onAction={catalogEmpty ? undefined : onReset}
      className="py-6"
    />
  );
}
