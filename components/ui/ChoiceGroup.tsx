"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/toggle-group";

type Choice = {
  id: string;
  label: string;
};

type ChoiceGroupProps = {
  label: string;
  options: Choice[];
  value: string[];
  onValueChange: (value: string[]) => void;
};

export function ChoiceGroup({
  label,
  options,
  value,
  onValueChange,
}: ChoiceGroupProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-headline-sm">{label}</h3>
      <ToggleGroup
        type="multiple"
        value={value}
        onValueChange={onValueChange}
        spacing={2}
        className="flex w-full flex-wrap gap-2"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            className="h-8 rounded-full px-3"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  );
}
