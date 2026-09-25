import { CalculatorIcon } from "./calculator-icons";
import { DiscoveryListRow } from "@/components/discovery/DiscoveryListRow";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
import { calculatorStatusLabel } from "@/lib/calculators/calculator-ui-config";
import type { CalculatorSummary } from "@/types/calculators";

type CalculatorListRowProps = {
  calculator: CalculatorSummary;
};

export function CalculatorListRow({ calculator }: CalculatorListRowProps) {
  const statusLabel = calculatorStatusLabel(calculator);
  const subtitle =
    calculator.listSubtitle ??
    [calculator.description, calculator.categoryLabel].filter(Boolean).join(" · ");

  return (
    <DiscoveryListRow
      href={calculator.href}
      title={calculator.listTitle ?? calculator.name}
      typeLabel="Score"
      subtitle={subtitle}
      statusLabel={statusLabel}
      statusTone={accessLabelToTone(statusLabel)}
      icon={
        <CalculatorIcon
          name={calculator.iconName}
          className="size-4 text-text-primary"
        />
      }
    />
  );
}
