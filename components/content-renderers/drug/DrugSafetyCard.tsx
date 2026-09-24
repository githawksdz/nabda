import { StatusChip } from "@/components/content-detail/StatusChip";
import { SafeSourceHtml } from "@/components/content-renderers/shared/SafeSourceHtml";
import type { DrugRenderSection } from "@/types/content-rendering-drug";

type DrugSafetyCardProps = {
  section: DrugRenderSection;
  keepInternalQuery?: boolean;
};

export function DrugSafetyCard({
  section,
  keepInternalQuery = false,
}: DrugSafetyCardProps) {
  return (
    <article className="rounded-xl bg-error-container/70 p-3.5">
      <h3 className="text-body-md font-medium">{section.title}</h3>
      {section.sourceHeading !== section.title ? (
        <p className="mt-1 text-label-sm text-on-surface-variant">{section.sourceHeading}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusChip label="Sécurité" variant="warning" />
        {section.containsPregnancyLactation ? (
          <StatusChip label="Grossesse / allaitement" variant="warning" />
        ) : null}
        {section.containsContraindication ? (
          <StatusChip label="Contre-indication" variant="warning" />
        ) : null}
      </div>
      <div className="mt-3">
        {section.html ? (
          <SafeSourceHtml
            html={section.html}
            keepInternalQuery={keepInternalQuery}
            guidelinePreview="drug"
          />
        ) : (
          <p className="whitespace-pre-wrap text-body-sm">{section.textPreview ?? section.text}</p>
        )}
      </div>
    </article>
  );
}
