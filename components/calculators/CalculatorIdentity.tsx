import { StatusChip } from "@/components/content-detail/StatusChip";
import { calculatorStatusLabel } from "@/lib/calculators/calculator-ui-config";
import type { CalculatorSummary } from "@/types/calculators";

type CalculatorIdentityProps = {
  calculator: CalculatorSummary;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function CalculatorIdentity({
  calculator,
  eyebrow = "Score neurologique",
  title,
  subtitle,
}: CalculatorIdentityProps) {
  const statusLabel = calculatorStatusLabel(calculator);

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <p className="text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-headline-md">
        {title ?? calculator.listTitle ?? calculator.name}
      </h1>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        {subtitle ?? calculator.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusChip label={calculator.categoryLabel} variant="outline" />
        {calculator.estimatedTime ? (
          <StatusChip label={calculator.estimatedTime} variant="soft" />
        ) : null}
        <StatusChip label={statusLabel} />
      </div>
    </section>
  );
}
