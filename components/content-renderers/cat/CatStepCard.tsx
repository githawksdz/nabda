import { ChevronDown } from "lucide-react";
import { MentionChip } from "@/components/content-detail/rich-content/MentionChip";
import { StatusChip } from "@/components/content-detail/StatusChip";
import { ProtocolTableCards } from "@/components/content-renderers/protocol/ProtocolTableCards";
import { SafeSourceHtml } from "@/components/content-renderers/shared/SafeSourceHtml";
import { extractHtmlTables, extractLinkedChips } from "@/lib/content-rendering/protocol";
import { priorityLabel } from "@/lib/content-rendering/cat";
import { cn } from "@/lib/utils";
import type { NabdaCatStep } from "@/types/nabda-cat-steps";
import type { ContentLinkMode } from "@/types/content-rendering";

type CatStepCardProps = {
  step: NabdaCatStep;
  keepInternalQuery?: boolean;
  linkMode?: ContentLinkMode;
  defaultOpen?: boolean;
};

function FlagChips({ step }: { step: NabdaCatStep }) {
  const flags = [
    step.containsDose ? "Dose" : null,
    step.containsEmergencySignal ? "Urgence" : null,
    step.containsDrugMention ? "Médicament" : null,
    step.containsCalculatorMention || step.kind === "calculator" ? "Calculateur" : null,
    step.containsTable ? "Tableau" : null,
  ].filter((flag): flag is string => Boolean(flag));

  const showPriority =
    step.priority === "critical" || step.priority === "urgent";

  if (!showPriority && flags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {showPriority ? (
        <StatusChip
          label={priorityLabel(step.priority)}
          variant="warning"
        />
      ) : null}
      {flags.map((flag) => (
        <StatusChip
          key={flag}
          label={flag}
          variant={flag === "Dose" || flag === "Urgence" ? "warning" : "soft"}
        />
      ))}
    </div>
  );
}

function StepBody({
  step,
  keepInternalQuery,
  linkMode,
}: {
  step: NabdaCatStep;
  keepInternalQuery: boolean;
  linkMode: ContentLinkMode;
}) {
  const { tables, htmlWithoutTables } = extractHtmlTables(step.html);
  const suffix = keepInternalQuery ? "?preview=internal" : "";
  const chips = extractLinkedChips(step.html, suffix, "cat", linkMode);
  return (
    <div className="flex flex-col gap-3">
      {chips.length > 0 ? (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {chips.map((chip) => (
            <MentionChip
              key={chip.id}
              type={
                chip.kind === "calculator"
                  ? "calculator_mention"
                  : chip.kind === "protocol"
                    ? "protocol_mention"
                    : "drug_mention"
              }
              label={chip.label}
              href={chip.href}
            />
          ))}
        </div>
      ) : null}
      {tables.length > 0 ? <ProtocolTableCards tables={tables} /> : null}
      <SafeSourceHtml
        html={htmlWithoutTables}
        keepInternalQuery={keepInternalQuery}
        guidelinePreview="cat"
        linkMode={linkMode}
      />
    </div>
  );
}

export function CatStepCard({
  step,
  keepInternalQuery = false,
  linkMode = "internal",
  defaultOpen = false,
}: CatStepCardProps) {
  const display = step.display;
  const number = step.sourceOrder ?? step.order;
  const cardClass =
    display === "alert_step"
      ? "rounded-xl bg-error-container/70 p-3.5"
      : display === "treatment_step"
        ? "rounded-xl bg-surface-container-lowest p-3.5 shadow-sm ring-1 ring-outline-variant/40"
        : display === "monitoring_step"
          ? "rounded-xl bg-surface-container-low p-3.5"
          : display === "linked_tool_step"
            ? "rounded-xl bg-secondary-container/50 p-3.5"
            : "rounded-xl bg-surface-container-lowest p-3.5 shadow-sm";

  const title = (
    <div className="flex items-start gap-2">
      {display === "checklist_step" ? (
        <span
          aria-hidden="true"
          className="mt-1 size-3.5 shrink-0 rounded-sm border border-outline"
        />
      ) : (
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-label-sm">
          {number}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-body-md font-medium">{step.title}</h3>
        {display === "checklist_step" ? (
          <p className="mt-0.5 text-label-sm text-on-surface-variant">Étape {number}</p>
        ) : null}
      </div>
    </div>
  );

  if (display === "source_step") {
    return (
      <details
        id={step.id}
        open={defaultOpen}
        className={cn(cardClass, "group")}
      >
        <summary className="flex cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
          {title}
          <ChevronDown className="mt-1 size-4 shrink-0 text-outline group-open:rotate-180" />
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <FlagChips step={step} />
          <StepBody step={step} keepInternalQuery={keepInternalQuery} linkMode={linkMode} />
        </div>
      </details>
    );
  }

  return (
    <article id={step.id} className={cardClass}>
      {title}
      <div className="mt-3 flex flex-col gap-3">
        <FlagChips step={step} />
        <StepBody step={step} keepInternalQuery={keepInternalQuery} linkMode={linkMode} />
      </div>
    </article>
  );
}
