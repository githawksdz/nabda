import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
import {
  drugDetailStatusLabel,
  drugIndexStatusLabel,
} from "@/lib/drugs/status-labels";
import type { DrugDetail } from "@/types/drugs";

type DrugIdentityCardProps = {
  drug: DrugDetail;
  variant?: "full" | "compact";
};

export function DrugIdentityCard({
  drug,
  variant = "full",
}: DrugIdentityCardProps) {
  const compactStatus = drugIndexStatusLabel(drug);
  const detailStatus = drugDetailStatusLabel(drug);

  if (variant === "compact") {
    return (
      <Surface variant="elevated" className="flex items-start justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="text-label-sm text-text-secondary">Médicament</p>
          <h1 className="mt-1 text-headline-sm text-text-primary [overflow-wrap:anywhere]">
            {drug.genericName}
          </h1>
          {drug.classChip ? (
            <div className="mt-2">
              <StatusBadge tone="outline">{drug.classChip}</StatusBadge>
            </div>
          ) : null}
        </div>
        <StatusBadge tone={accessLabelToTone(compactStatus)}>{compactStatus}</StatusBadge>
      </Surface>
    );
  }

  return (
    <Surface variant="elevated" className="flex flex-col gap-2">
      <p className="text-label-sm text-text-secondary">Médicament</p>
      <h1 className="text-headline-md text-text-primary [overflow-wrap:anywhere]">
        {drug.genericName}
      </h1>
      <p className="text-body-md text-text-secondary [overflow-wrap:anywhere]">
        {drug.subtitle || drug.className}
      </p>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {drug.shortClassName ? (
          <StatusBadge tone="outline">{drug.shortClassName}</StatusBadge>
        ) : null}
        <StatusBadge tone={accessLabelToTone(detailStatus)}>{detailStatus}</StatusBadge>
      </div>
    </Surface>
  );
}
