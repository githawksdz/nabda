"use client";

import dynamic from "next/dynamic";
import type { SpecialtyCalculatorUiKind } from "@/lib/calculators/specialty-calculator-ui";
import type {
  CockcroftFormValues,
  GlasgowSelection,
} from "@/types/calculators";
import { GLASGOW_DEFAULT_SELECTION } from "@/lib/calculators/glasgow";
import { COCKCROFT_EMPTY_VALUES } from "@/lib/calculators/cockcroft-gault";

const GlasgowCalculator = dynamic(
  () => import("./glasgow/GlasgowCalculator").then((mod) => mod.GlasgowCalculator),
  { ssr: false },
);

const CockcroftCalculator = dynamic(
  () => import("./cockcroft/CockcroftCalculator").then((mod) => mod.CockcroftCalculator),
  { ssr: false },
);

type SpecialtyCalculatorShellProps = {
  uiKind: SpecialtyCalculatorUiKind;
  glasgowSelection: GlasgowSelection;
  onGlasgowChange: (selection: GlasgowSelection) => void;
  onGlasgowReset: () => void;
  cockcroftValues: CockcroftFormValues;
  onCockcroftChange: (values: CockcroftFormValues) => void;
  onCockcroftReset: () => void;
  onCockcroftCopy: () => void;
};

export function SpecialtyCalculatorShell({
  uiKind,
  glasgowSelection,
  onGlasgowChange,
  onGlasgowReset,
  cockcroftValues,
  onCockcroftChange,
  onCockcroftReset,
  onCockcroftCopy,
}: SpecialtyCalculatorShellProps) {
  if (uiKind === "glasgow") {
    return (
      <GlasgowCalculator
        selection={glasgowSelection}
        onChange={onGlasgowChange}
        onReset={onGlasgowReset}
      />
    );
  }

  return (
    <CockcroftCalculator
      values={cockcroftValues}
      onChange={onCockcroftChange}
      onReset={onCockcroftReset}
      onCopy={onCockcroftCopy}
    />
  );
}

export { GLASGOW_DEFAULT_SELECTION, COCKCROFT_EMPTY_VALUES };
