import { ChevronDown } from "lucide-react";
import { MentionChip } from "@/components/content-detail/rich-content/MentionChip";
import { StatusChip } from "@/components/content-detail/StatusChip";
import { ProtocolTableCards } from "@/components/content-renderers/protocol/ProtocolTableCards";
import { SafeSourceHtml } from "@/components/content-renderers/shared/SafeSourceHtml";
import {
  extractHtmlTables,
  extractLinkedChips,
  sectionAnchorId,
} from "@/lib/content-rendering/protocol";
import { cn } from "@/lib/utils";
import type { NabdaProtocolSection } from "@/types/nabda-protocol-sections";
import type { ContentLinkMode } from "@/types/content-rendering";

type ProtocolSectionCardProps = {
  section: NabdaProtocolSection;
  keepInternalQuery?: boolean;
  linkMode?: ContentLinkMode;
  defaultOpen?: boolean;
};

function FlagChips({ section }: { section: NabdaProtocolSection }) {
  const flags = [
    section.containsDose ? "Mention dose" : null,
    section.containsEmergencySignal ? "Signal d'urgence" : null,
    section.containsTable ? "Tableau" : null,
  ].filter((flag): flag is string => Boolean(flag));
  if (flags.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <StatusChip
          key={flag}
          label={flag}
          variant={
            flag.startsWith("Mention") || flag.startsWith("Signal")
              ? "warning"
              : "soft"
          }
        />
      ))}
    </div>
  );
}

function SectionBody({
  section,
  keepInternalQuery,
  linkMode,
}: {
  section: NabdaProtocolSection;
  keepInternalQuery: boolean;
  linkMode: ContentLinkMode;
}) {
  const { tables, htmlWithoutTables } = extractHtmlTables(section.html);
  const chips = extractLinkedChips(
    section.html,
    keepInternalQuery ? "?preview=internal" : "",
    "protocol",
    linkMode,
  );
  return (
    <div className="flex flex-col gap-3">
      {chips.length > 0 && section.display === "linked_chips" ? (
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
        linkMode={linkMode}
      />
    </div>
  );
}

export function ProtocolSectionCard({
  section,
  keepInternalQuery = false,
  linkMode = "internal",
  defaultOpen = false,
}: ProtocolSectionCardProps) {
  const display = section.display;
  const openByDefault =
    defaultOpen ||
    display === "hero_summary" ||
    display === "alert_card" ||
    display === "quick_card" ||
    display === "table_cards";
  const cardClass =
    display === "alert_card"
      ? "rounded-xl bg-error-container/70 p-3.5"
      : display === "hero_summary"
        ? "rounded-2xl bg-surface-container-lowest p-4 shadow-sm"
        : "rounded-xl bg-surface-container-lowest p-3.5 shadow-sm";

  if (display === "collapsible" || display === "long_read" || display === "source_drawer") {
    return (
      <details
        id={sectionAnchorId(section.id)}
        open={openByDefault}
        className={cn(cardClass, "group")}
      >
        <summary className="flex cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-body-md font-medium">{section.title}</span>
            <span className="mt-1 block text-label-sm text-on-surface-variant">
              {section.sourceHeading}
            </span>
          </span>
          <ChevronDown className="mt-1 size-4 shrink-0 text-outline group-open:rotate-180" />
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <FlagChips section={section} />
          <SectionBody section={section} keepInternalQuery={keepInternalQuery} linkMode={linkMode} />
        </div>
      </details>
    );
  }

  return (
    <article id={sectionAnchorId(section.id)} className={cardClass}>
      <h3 className="text-body-md font-medium">{section.title}</h3>
      {section.sourceHeading !== section.title ? (
        <p className="mt-1 text-label-sm text-on-surface-variant">{section.sourceHeading}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-3">
        <FlagChips section={section} />
        <SectionBody section={section} keepInternalQuery={keepInternalQuery} linkMode={linkMode} />
      </div>
    </article>
  );
}
