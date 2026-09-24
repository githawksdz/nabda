import { ChartNoAxesCombined } from "lucide-react";
import { proInsightHookCopy } from "@/lib/home/home-ui-config";

export function ProInsightHookCard() {
  return (
    <section className="flex gap-3 rounded-xl bg-surface-container-low p-4">
      <ChartNoAxesCombined
        className="mt-0.5 size-4 shrink-0 text-on-surface"
        strokeWidth={1.75}
      />
      <p className="text-body-sm text-on-surface-variant">{proInsightHookCopy}</p>
    </section>
  );
}
