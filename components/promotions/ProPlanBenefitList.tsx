import { Check } from "lucide-react";

type ProPlanBenefitListProps = {
  items: string[];
  label?: string;
};

export function ProPlanBenefitList({
  items,
  label = "Inclus avec Nabda Pro",
}: ProPlanBenefitListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="promo-pro-plan-benefits" aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <span className="promo-pro-plan-benefits__mark" aria-hidden>
            <Check className="size-3" strokeWidth={2.5} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
