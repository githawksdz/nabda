"use client";

import { cn } from "@/lib/utils";

type PreferenceToggleRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  badge?: string;
};

export function PreferenceToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  badge,
}: PreferenceToggleRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="min-w-0 flex-1">
        <span className="block text-body-md">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-body-sm text-on-surface-variant">
            {description}
          </span>
        ) : null}
      </span>
      {badge ? (
        <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
          {badge}
        </span>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "motion-color relative h-6 w-10 shrink-0 rounded-full disabled:opacity-40",
          checked ? "bg-primary" : "bg-surface-container-high",
        )}
      >
        <span
          className={cn(
            "motion-transform absolute top-0.5 size-5 rounded-full bg-surface-container-lowest shadow-sm",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
