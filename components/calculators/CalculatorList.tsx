import { CalculatorListRow } from "./CalculatorListRow";
import type { CalculatorSummary } from "@/types/calculators";

type CalculatorListProps = {
  calculators: CalculatorSummary[];
};

export function CalculatorList({ calculators }: CalculatorListProps) {
  if (calculators.length === 0) return null;

  const count = calculators.length;
  const countLabel = count > 1 ? `${count} indexés` : `${count} indexé`;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-sm">Tous les outils</h2>
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
            {countLabel}
          </span>
        </div>
        <span className="text-label-sm text-on-surface-variant">Ordre A-Z</span>
      </div>
      <div className="flex flex-col gap-2">
        {calculators.map((calculator) => (
          <CalculatorListRow key={calculator.id} calculator={calculator} />
        ))}
      </div>
    </section>
  );
}
