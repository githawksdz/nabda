"use client";

import { cn } from "@/lib/utils";
import type { CatRenderMode } from "@/types/content-rendering-cat";

type CatPreviewModeToggleProps = {
  value: CatRenderMode;
  onChange: (value: CatRenderMode) => void;
};

const OPTIONS: Array<{ id: CatRenderMode; label: string }> = [
  { id: "etapes", label: "Étapes" },
  { id: "garde", label: "Garde" },
  { id: "image", label: "Image" },
];

export function CatPreviewModeToggle({ value, onChange }: CatPreviewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Mode d'affichage"
      className="grid grid-cols-3 rounded-full bg-surface-container-low p-1"
    >
      {OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "motion-color h-9 rounded-full text-label-md",
              active
                ? "bg-primary font-semibold text-on-primary"
                : "text-on-surface-variant",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
