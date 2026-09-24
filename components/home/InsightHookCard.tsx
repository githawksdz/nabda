import { Lightbulb } from "lucide-react";
import { insightHookCopy } from "@/lib/home/home-ui-config";

export function InsightHookCard() {
  return (
    <section className="flex gap-3 rounded-xl bg-surface-container-low p-4">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-on-surface" strokeWidth={1.75} />
      <div>
        <p className="text-label-md">{insightHookCopy.label}</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          {insightHookCopy.body}
        </p>
      </div>
    </section>
  );
}
