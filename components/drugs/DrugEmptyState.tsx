"use client";

import { SearchX } from "lucide-react";

type DrugEmptyStateProps = {
  onReset: () => void;
  catalogEmpty?: boolean;
};

export function DrugEmptyState({
  onReset,
  catalogEmpty = false,
}: DrugEmptyStateProps) {
  return (
    <section className="rounded-xl bg-surface-container-low px-4 py-6 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-container">
        <SearchX className="size-5 text-on-surface-variant" strokeWidth={1.75} />
      </span>
      <h2 className="mt-3 text-headline-sm">
        {catalogEmpty ? "Catalogue indisponible" : "Aucune molécule trouvée"}
      </h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {catalogEmpty
          ? "Les fiches médicaments ne sont pas disponibles pour le moment."
          : "Vérifiez l\u2019orthographe ou réinitialisez les filtres."}
      </p>
      {!catalogEmpty ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-label-md text-on-primary"
        >
          Réinitialiser la recherche
        </button>
      ) : null}
    </section>
  );
}
