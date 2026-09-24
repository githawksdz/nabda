import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CalculatorIcon } from "./calculator-icons";
import { calculatorStatusLabel } from "@/lib/calculators/calculator-ui-config";
import type { CalculatorSummary } from "@/types/calculators";

type CalculatorListRowProps = {
  calculator: CalculatorSummary;
};

export function CalculatorListRow({ calculator }: CalculatorListRowProps) {
  const statusLabel = calculatorStatusLabel(calculator);

  return (
    <Link
      href={calculator.href}
      className="group flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm active:scale-[0.99]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
        <CalculatorIcon
          name={calculator.iconName}
          className="size-5 text-on-surface"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium">
          {calculator.listTitle ?? calculator.name}
        </span>
        <span className="mt-0.5 block text-body-sm text-on-surface-variant">
          {calculator.listSubtitle ??
            `${calculator.description} • ${calculator.categoryLabel}`}
        </span>
        <span className="mt-1.5 inline-flex rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
          {statusLabel}
        </span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-outline transition-transform group-hover:translate-x-0.5"
        strokeWidth={1.75}
      />
    </Link>
  );
}
