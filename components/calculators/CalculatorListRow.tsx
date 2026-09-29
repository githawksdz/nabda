import { CalculatorIcon } from "./calculator-icons";
import { DiscoveryListRow } from "@/components/discovery/DiscoveryListRow";
import { hasVisited } from "@/lib/ui/content-list-state";
import { calculatorStatusLabel } from "@/lib/calculators/calculator-ui-config";
import type { CalculatorSummary } from "@/types/calculators";

type CalculatorListRowProps = {
  calculator: CalculatorSummary;
  visitedKeys?: string[];
};

export function CalculatorListRow({
  calculator,
  visitedKeys = [],
}: CalculatorListRowProps) {
  const statusLabel = calculatorStatusLabel(calculator);
  const description =
    calculator.listSubtitle ?? calculator.description ?? undefined;

  return (
    <DiscoveryListRow
      href={calculator.href}
      title={calculator.listTitle ?? calculator.name}
      contentType="calculator"
      description={description}
      specialties={
        calculator.categorySlug
          ? [calculator.categorySlug]
          : calculator.categorySlugs.filter((slug) => slug !== "all")
      }
      accessTier={calculator.visibility === "premium" ? "pro" : "free"}
      isNew={calculator.isNew}
      visited={hasVisited(visitedKeys, "calculator", calculator.slug)}
      statusLabel={statusLabel}
      icon={
        <CalculatorIcon
          name={calculator.iconName}
          className="size-4 text-text-primary"
        />
      }
    />
  );
}
