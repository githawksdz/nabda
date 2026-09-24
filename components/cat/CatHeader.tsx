"use client";

import { CatIcon } from "./cat-icons";

type CatHeaderProps = {
  onTune: () => void;
};

export function CatHeader({ onTune }: CatHeaderProps) {
  return (
    <button
      type="button"
      aria-label="Filtres"
      onClick={onTune}
      className="flex size-11 items-center justify-center rounded-full text-on-surface-variant"
    >
      <CatIcon name="tune" className="size-5" />
    </button>
  );
}
