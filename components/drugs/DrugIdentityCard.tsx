import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ContentCard,
} from "@/components/ui/ContentCard";
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
      <ContentCard size="sm">
        <CardHeader>
          <p className="text-label-sm text-muted-foreground">Médicament</p>
          <CardTitle className="[overflow-wrap:anywhere]">{drug.genericName}</CardTitle>
          {drug.classChip ? (
            <StatusBadge tone="outline">{drug.classChip}</StatusBadge>
          ) : null}
          <CardAction>
            <StatusBadge tone={accessLabelToTone(compactStatus)}>
              {compactStatus}
            </StatusBadge>
          </CardAction>
        </CardHeader>
      </ContentCard>
    );
  }

  return (
    <ContentCard>
      <CardHeader>
        <p className="text-label-sm text-muted-foreground">Médicament</p>
        <CardTitle className="text-clinical-title [overflow-wrap:anywhere]">
          {drug.genericName}
        </CardTitle>
        <CardDescription className="text-body-md [overflow-wrap:anywhere]">
          {drug.subtitle || drug.className}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {drug.shortClassName ? (
          <StatusBadge tone="outline">{drug.shortClassName}</StatusBadge>
        ) : null}
        <StatusBadge tone={accessLabelToTone(detailStatus)}>{detailStatus}</StatusBadge>
      </CardContent>
    </ContentCard>
  );
}
