"use client";

import { cn } from "@/lib/utils";
import type { ProtocolRenderMode } from "@/types/content-rendering-protocol";

type ProtocolShiftModeToggleProps = {
  value: ProtocolRenderMode;
  onChange: (value: ProtocolRenderMode) => void;
};

const OPTIONS: Array<{ id: ProtocolRenderMode; label: string }> = [
  { id: "lecture", label: "Lecture" },
  { id: "garde", label: "Garde" },
];

export function ProtocolShiftModeToggle({
  value,
  onChange,
}: ProtocolShiftModeToggleProps) {
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
