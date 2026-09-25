import { StatusChip } from "@/components/content-detail/StatusChip";
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
      <section className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-headline-sm">{drug.genericName}</h1>
            {drug.classChip ? (
              <div className="mt-2">
                <StatusChip label={drug.classChip} variant="outline" />
              </div>
            ) : null}
          </div>
          <StatusChip label={compactStatus} />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <p className="text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
        Médicament
      </p>
      <h1 className="mt-1 text-headline-md">{drug.genericName}</h1>
      {drug.subtitle ? (
        <p className="mt-2 text-body-md text-on-surface-variant">{drug.subtitle}</p>
      ) : (
        <p className="mt-2 text-body-md text-on-surface-variant">{drug.className}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {drug.shortClassName ? (
          <StatusChip label={drug.shortClassName} variant="outline" />
        ) : null}
        <StatusChip label={detailStatus} />
      </div>
    </section>
  );
}
