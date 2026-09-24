import Link from "next/link";
import { CalculatorIcon } from "./calculator-icons";
import type { CalculatorSummary } from "@/types/calculators";

type FrequentCalculatorsGridProps = {
  calculators: CalculatorSummary[];
};

export function FrequentCalculatorsGrid({
  calculators,
}: FrequentCalculatorsGridProps) {
  if (calculators.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-headline-sm">Utilisés souvent</h2>
        <span className="text-label-sm text-on-surface-variant">
          Mise à jour garde
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {calculators.map((calculator) => (
          <Link
            key={calculator.id}
            href={calculator.href}
            className="flex min-h-[132px] flex-col rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm active:scale-[0.98]"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-surface-container-low">
                <CalculatorIcon
                  name={calculator.iconName}
                  className="size-4 text-on-surface"
                />
              </span>
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
                {calculator.frequentCategoryLabel ?? calculator.categoryLabel}
              </span>
            </span>
            <span className="mt-auto pt-3">
              <span className="block text-body-md font-medium">
                {calculator.frequentTitle ?? calculator.shortName ?? calculator.name}
              </span>
              <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                {calculator.frequentSubtitle ?? calculator.description}
              </span>
              <span className="mt-1.5 block text-label-sm text-on-surface">
                {calculator.frequentMeta ?? calculator.estimatedTime}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
