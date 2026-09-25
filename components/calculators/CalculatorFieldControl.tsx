"use client";

import { cn } from "@/lib/utils";
import { resolveCalculatorControl } from "@/lib/calculators/input-control";

type Option = { label: string; value: string };

type CalculatorFieldControlProps = {
  name: string;
  label: string;
  type: string;
  yesNo?: boolean;
  unit?: string | null;
  optional?: boolean;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  /** Comma-separated values for multi_select. */
  multiValue?: string[];
  onMultiChange?: (values: string[]) => void;
};

const controlClass =
  "min-h-11 rounded-[var(--radius-control)] bg-surface-muted px-3 text-body-md text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary";

export function CalculatorFieldControl({
  name,
  label,
  type,
  yesNo,
  unit,
  optional,
  options,
  value,
  onChange,
  multiValue = [],
  onMultiChange,
}: CalculatorFieldControlProps) {
  const kind = resolveCalculatorControl({ type, yesNo, options });
  const groupLabel = optional ? `${label} (facultatif)` : label;

  if (kind === "yes_no" || kind === "segmented") {
    const stack = kind === "segmented" && options.some((option) => option.label.length > 18);
    return (
      <fieldset className="min-w-0">
        <legend className="text-body-md font-medium text-text-primary [overflow-wrap:anywhere]">
          {groupLabel}
          {unit ? <span className="font-normal text-text-secondary"> ({unit})</span> : null}
        </legend>
        <div
          role="radiogroup"
          aria-label={groupLabel}
          className={cn("mt-2 grid gap-1.5", stack ? "grid-cols-1" : "grid-cols-2")}
        >
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <button
                key={`${name}-${option.value}`}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(option.value)}
                className={cn(
                  "motion-color min-h-11 rounded-[var(--radius-control)] px-3 py-2 text-left text-body-sm",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary",
                  selected
                    ? "bg-action-primary font-semibold text-text-inverse"
                    : "bg-surface-muted text-text-secondary",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (kind === "checkbox_group") {
    return (
      <fieldset className="min-w-0">
        <legend className="text-body-md font-medium text-text-primary">{groupLabel}</legend>
        <div className="mt-2 flex flex-col gap-1.5">
          {options.map((option) => {
            const checked = multiValue.includes(option.value);
            return (
              <label
                key={`${name}-${option.value}`}
                className="flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-surface-muted px-3 text-body-sm text-text-primary"
              >
                <input
                  type="checkbox"
                  name={name}
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? multiValue.filter((item) => item !== option.value)
                      : [...multiValue, option.value];
                    onMultiChange?.(next);
                  }}
                  className="size-4"
                />
                <span className="[overflow-wrap:anywhere]">{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (kind === "select") {
    return (
      <label className="flex min-w-0 flex-col gap-1.5" htmlFor={name}>
        <span className="text-body-md font-medium text-text-primary">{groupLabel}</span>
        <select
          id={name}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass}
        >
          <option value="">Choisir</option>
          {options.map((option) => (
            <option key={`${name}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (kind === "date") {
    return (
      <label className="flex min-w-0 flex-col gap-1.5" htmlFor={name}>
        <span className="text-body-md font-medium text-text-primary">{groupLabel}</span>
        <input
          id={name}
          name={name}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass}
        />
      </label>
    );
  }

  return (
    <label className="flex min-w-0 flex-col gap-1.5" htmlFor={name}>
      <span className="text-body-md font-medium text-text-primary">
        {groupLabel}
        {unit ? <span className="font-normal text-text-secondary"> · {unit}</span> : null}
      </span>
      <input
        id={name}
        name={name}
        type={kind === "number" ? "text" : "text"}
        inputMode={kind === "number" ? "decimal" : "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
        autoComplete="off"
      />
    </label>
  );
}
