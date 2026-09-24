"use client";

import { SearchX } from "lucide-react";

type CalculatorEmptyStateProps = {
  onReset: () => void;
};

export function CalculatorEmptyState({ onReset }: CalculatorEmptyStateProps) {
  return (
    <section className="rounded-xl bg-surface-container-low px-4 py-6 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-container">
        <SearchX className="size-5 text-on-surface-variant" strokeWidth={1.75} />
      </span>
      <h2 className="mt-3 text-headline-sm">Aucun score trouvé</h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Vérifiez l&apos;orthographe ou suggérez un nouvel outil clinique au
        comité médical.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-label-md text-on-primary"
      >
        Réinitialiser la recherche
      </button>
    </section>
  );
}
