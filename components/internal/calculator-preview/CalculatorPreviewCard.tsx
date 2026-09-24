import Link from "next/link";
import { StatusChip } from "@/components/content-detail/StatusChip";
import {
  formulaTypeLabel,
  kindLabel,
  uxPatternLabel,
} from "@/lib/internal/calculator-preview-ui";
import { internalCalculatorPreviewHref } from "@/lib/internal/preview-access";
import type { CalculatorRenderIndexItem } from "@/types/content-rendering-calculator";

type CalculatorPreviewCardProps = {
  item: CalculatorRenderIndexItem;
  keepInternalQuery?: boolean;
};

export function CalculatorPreviewCard({
  item,
  keepInternalQuery = false,
}: CalculatorPreviewCardProps) {
  return (
    <Link
      href={internalCalculatorPreviewHref(item.slug, keepInternalQuery)}
      className="block rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
    >
      <span className="block text-body-md font-medium">{item.title}</span>
      <span className="mt-1 block text-label-sm text-on-surface-variant">
        {kindLabel(item.kind)} · {item.inputCount} champs
      </span>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusChip label={uxPatternLabel(item.uxPattern)} />
        <StatusChip
          label={item.risk === "high" ? "Risque élevé" : `Risque ${item.risk}`}
          variant={item.risk === "high" ? "warning" : "soft"}
        />
        <StatusChip
          label={item.hasRawJs ? "JS source" : formulaTypeLabel(item.formulaType)}
          variant={item.hasRawJs ? "outline" : "soft"}
        />
        {item.locked ? <StatusChip label="Verrouillé" variant="warning" /> : null}
        {item.alreadyHasLocalDemoEngine ? (
          <StatusChip label="Démo publique" variant="dark" />
        ) : null}
        {item.warningCount > 0 ? (
          <StatusChip label={`${item.warningCount} alertes`} variant="outline" />
        ) : null}
      </div>
    </Link>
  );
}
