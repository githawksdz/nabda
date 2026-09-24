import { StatusChip } from "@/components/content-detail/StatusChip";
import type { CalculatorPreviewMetrics } from "@/types/internal-preview";

type CalculatorMetricsGridProps = {
  metrics: CalculatorPreviewMetrics;
};

export function CalculatorMetricsGrid({ metrics }: CalculatorMetricsGridProps) {
  const cells = [
    { label: "Total", value: metrics.total },
    { label: "Tap score", value: metrics.tapScore },
    { label: "Urgence", value: metrics.emergency },
    { label: "Formule", value: metrics.numeric },
    { label: "Verrouillés", value: metrics.locked },
    { label: "JS source", value: metrics.rawJs },
    { label: "Démos", value: metrics.demos },
    { label: "FR", value: metrics.french },
  ];

  return (
    <section aria-label="Indicateurs du catalogue">
      <div className="grid grid-cols-2 gap-2">
        {cells.map((cell) => (
          <div key={cell.label} className="rounded-xl bg-surface-container-low px-3.5 py-3">
            <p className="text-label-sm text-on-surface-variant">{cell.label}</p>
            <p className="mt-1 text-headline-sm">{cell.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusChip label={`${metrics.locked} verrouillés`} variant="warning" />
        <StatusChip label={`${metrics.rawJs} JS non exécuté`} variant="outline" />
        <StatusChip label={`${metrics.demos} démos publiques`} />
      </div>
    </section>
  );
}
