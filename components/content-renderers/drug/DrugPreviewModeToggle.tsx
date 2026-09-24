"use client";

import { cn } from "@/lib/utils";
import type { DrugRenderMode } from "@/types/content-rendering-drug";

type DrugPreviewModeToggleProps = {
  value: DrugRenderMode;
  onChange: (value: DrugRenderMode) => void;
};

const OPTIONS: Array<{ id: DrugRenderMode; label: string }> = [
  { id: "standard", label: "Standard" },
  { id: "pharmacien", label: "Pharmacien" },
];

export function DrugPreviewModeToggle({
  value,
  onChange,
}: DrugPreviewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Mode d'affichage"
      className="grid grid-cols-2 rounded-full bg-surface-container-low p-1"
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
              "h-9 rounded-full text-label-md",
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
