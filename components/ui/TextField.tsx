import { Search, X } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  helperText?: string;
  errorText?: string;
};

export function TextField({
  id,
  label,
  helperText,
  errorText,
  className,
  disabled,
  ...props
}: TextFieldProps) {
  const describedBy = errorText
    ? `${id}-error`
    : helperText
      ? `${id}-help`
      : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-md text-text-primary">
        {label}
      </label>
      <input
        id={id}
        disabled={disabled}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "motion-field min-h-[var(--size-input)] rounded-[var(--radius-control)] bg-surface-muted px-3.5 text-body-md text-text-primary",
          "placeholder:text-text-secondary",
          disabled && "cursor-not-allowed text-text-disabled",
          errorText && "ring-1 ring-status-danger",
          className,
        )}
        {...props}
      />
      {errorText ? (
        <p id={`${id}-error`} className="text-body-sm text-status-danger">
          {errorText}
        </p>
      ) : helperText ? (
        <p id={`${id}-help`} className="text-body-sm text-text-secondary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder: string;
  label?: string;
  name?: string;
  compact?: boolean;
  icon?: ReactNode;
  inputRef?: Ref<HTMLInputElement | null>;
  className?: string;
};

export function SearchField({
  value,
  onChange,
  onClear,
  placeholder,
  label = "Recherche",
  name,
  compact = false,
  icon,
  inputRef,
  className,
}: SearchFieldProps) {
  return (
    <div
      className={cn(
        "motion-field flex items-center gap-2 rounded-[var(--radius-control)] bg-surface-container px-3 shadow-[var(--shadow-card)] focus-within:bg-surface-elevated",
        // compact is the list-filter height (44px). Every other search control uses --size-input.
        compact ? "h-11" : "h-[var(--size-input)]",
        className,
      )}
    >
      {icon ?? (
        <Search
          className="size-4 shrink-0 text-text-secondary"
          strokeWidth={1.75}
          aria-hidden
        />
      )}
      <input
        ref={inputRef}
        type="search"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
        className="h-full min-w-0 flex-1 bg-transparent text-body-md placeholder:text-text-secondary"
      />
      {value && onClear ? (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onClick={onClear}
          className="motion-press inline-flex min-h-[var(--size-icon-button)] min-w-[var(--size-icon-button)] items-center justify-center rounded-full bg-surface-variant text-text-primary"
        >
          <X className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
