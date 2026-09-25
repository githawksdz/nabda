"use client";

import { type FormEvent, type RefObject } from "react";
import { SearchField } from "@/components/ui/TextField";

type SearchInputBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onSubmit?: () => void;
};

export function SearchInputBar({
  value,
  onChange,
  onClear,
  placeholder,
  inputRef,
  onSubmit,
}: SearchInputBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.();
    inputRef?.current?.blur();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="min-w-0"
    >
      <SearchField
        value={value}
        onChange={onChange}
        onClear={onClear}
        placeholder={placeholder}
        inputRef={inputRef}
        className="min-w-0 bg-surface-elevated shadow-[var(--shadow-card)] focus-within:ring-2 focus-within:ring-action-primary/20"
      />
    </form>
  );
}
