"use client";

import { Delete } from "lucide-react";

type ZeroResultCanvasProps = {
  query: string;
  onClear: () => void;
};

export function ZeroResultCanvas({ query: _query, onClear }: ZeroResultCanvasProps) {
  void _query;
  return (
    <section className="rounded-xl bg-surface-container-low px-6 py-8 text-center shadow-sm">
      <div className="relative mx-auto size-16 rounded-full bg-surface-container">
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 m-auto size-8 text-on-surface-variant"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5 20 20" />
        </svg>
        <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-error-container text-error">
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4.5" />
            <circle cx="12" cy="16.25" r="0.8" fill="currentColor" />
          </svg>
        </span>
      </div>
      <h2 className="mt-4 text-headline-sm">Ce contenu n’existe pas dans Nabda.</h2>
      <p className="mx-auto mt-2 max-w-[300px] text-body-sm text-on-surface-variant">
        Essayez un autre terme ou explorez les catégories disponibles.
      </p>
      <div className="mt-5 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-4 text-label-md text-on-primary"
        >
          <Delete className="size-4" strokeWidth={1.75} />
          Effacer la recherche
        </button>
      </div>
    </section>
  );
}
