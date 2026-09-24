import Link from "next/link";
import { sourceIdToSlug } from "@/lib/nabda-db/slugs";
import { calculatorHref } from "@/lib/content-rendering/render-state";
import type { CalculatorRenderSource } from "@/types/content-rendering-calculator";
import type { ContentLinkMode } from "@/types/content-rendering";

type CalculatorReferencesPanelProps = {
  preview: CalculatorRenderSource;
  keepInternalQuery?: boolean;
  linkMode?: ContentLinkMode;
};

export function CalculatorReferencesPanel({
  preview,
  keepInternalQuery = false,
  linkMode = "internal",
}: CalculatorReferencesPanelProps) {
  if (preview.references.length === 0 && preview.relatedCalcIds.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm">
      <h2 className="text-body-md font-medium">Références / source</h2>
      {preview.references.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-2">
          {preview.references.map((ref, index) => (
            <li key={`${ref.label}-${index}`} className="text-body-sm">
              {ref.href ? (
                <a href={ref.href} className="text-primary underline-offset-2 hover:underline">
                  {ref.label}
                </a>
              ) : (
                <span>{ref.label}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-body-sm text-on-surface-variant">Pas de références source.</p>
      )}
      {preview.relatedCalcIds.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {preview.relatedCalcIds.map((id) => (
            <Link
              key={id}
              href={calculatorHref(sourceIdToSlug(id), linkMode, keepInternalQuery)}
              className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm"
            >
              {sourceIdToSlug(id)}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
