import { ChevronDown } from "lucide-react";
import { StatusChip } from "@/components/content-detail/StatusChip";
import { SafeSourceHtml } from "@/components/content-renderers/shared/SafeSourceHtml";
import { extractHtmlTables } from "@/lib/content-rendering/protocol";
import { drugSectionAnchorId } from "@/lib/content-rendering/drug";
import { cn } from "@/lib/utils";
import { DrugPosologyCard } from "@/components/content-renderers/drug/DrugPosologyCard";
import { DrugSafetyCard } from "@/components/content-renderers/drug/DrugSafetyCard";
import { DrugTableRenderer } from "@/components/content-renderers/drug/DrugTableRenderer";
import type { DrugRenderSection, DrugRenderTable } from "@/types/content-rendering-drug";

type DrugSectionCardProps = {
  section: DrugRenderSection;
  tables: DrugRenderTable[];
  keepInternalQuery?: boolean;
  defaultOpen?: boolean;
};

function FlagChips({ section }: { section: DrugRenderSection }) {
  const flags = [
    section.containsDose ? "Dosage produit" : null,
    section.containsRenalHepatic ? "Rénal / hépatique" : null,
    section.containsFranceSpecificPrescription ? "France" : null,
    section.containsTable ? "Tableau" : null,
  ].filter((flag): flag is string => Boolean(flag));
  if (flags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <StatusChip
          key={flag}
          label={flag}
          variant={
            flag.startsWith("Dosage") || flag.startsWith("Rénal") || flag === "France"
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
  tables,
  keepInternalQuery,
}: {
  section: DrugRenderSection;
  tables: DrugRenderTable[];
  keepInternalQuery: boolean;
}) {
  const html = section.html
    ? extractHtmlTables(section.html).htmlWithoutTables
    : "";
  return (
    <div className="flex flex-col gap-3">
      <FlagChips section={section} />
      {section.containsDose &&
      section.kind !== "posology" &&
      section.kind !== "composition" &&
      section.display !== "availability_card" ? (
        <p className="text-label-sm text-on-surface-variant">
          Les mentions de dosage sont des étiquettes de présentation / concentration, pas une
          instruction de posologie.
        </p>
      ) : null}
      {section.kind === "composition" || section.display === "availability_card" ? (
        <p className="text-label-sm text-on-surface-variant">
          Les mentions de dosage sont des étiquettes de présentation, pas une instruction de
          posologie.
        </p>
      ) : null}
      {tables.map((table) => (
        <DrugTableRenderer key={table.id} table={table} />
      ))}
      {html.trim() ? (
        <SafeSourceHtml
          html={html}
          keepInternalQuery={keepInternalQuery}
          guidelinePreview="drug"
        />
      ) : null}
      {!html.trim() && !tables.length ? (
        <p className="whitespace-pre-wrap text-body-sm">
          {section.textPreview ?? section.text}
        </p>
      ) : null}
      {section.missingFullHtml ? (
        <p className="text-label-sm text-on-surface-variant">
          HTML source incomplet dans le JSON de dry-run. Aperçu texte uniquement.
        </p>
      ) : null}
    </div>
  );
}

export function DrugSectionCard({
  section,
  tables,
  keepInternalQuery = false,
  defaultOpen = false,
}: DrugSectionCardProps) {
  if (section.display === "safety_card") {
    const htmlWithoutTables = section.html
      ? extractHtmlTables(section.html).htmlWithoutTables
      : "";
    return (
      <div id={drugSectionAnchorId(section.id)}>
        <DrugSafetyCard
          section={{ ...section, html: htmlWithoutTables }}
          keepInternalQuery={keepInternalQuery}
        />
        {tables.length > 0 ? (
          <div className="mt-3 flex flex-col gap-3">
            {tables.map((table) => (
              <DrugTableRenderer key={table.id} table={table} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (section.display === "posology_card") {
    const htmlWithoutTables = section.html
      ? extractHtmlTables(section.html).htmlWithoutTables
      : "";
    return (
      <div id={drugSectionAnchorId(section.id)}>
        <DrugPosologyCard
          section={{ ...section, html: htmlWithoutTables }}
          tables={tables}
          keepInternalQuery={keepInternalQuery}
        />
      </div>
    );
  }

  const collapsible =
    section.display === "collapsible" ||
    section.display === "long_read" ||
    section.display === "source_drawer" ||
    section.kind === "pharmacology";
  const cardClass =
    section.display === "identity_card"
      ? "rounded-2xl bg-surface-container-lowest p-4 shadow-sm"
      : "rounded-xl bg-surface-container-lowest p-3.5 shadow-sm";

  if (collapsible) {
    return (
      <details
        id={drugSectionAnchorId(section.id)}
        open={defaultOpen}
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
        <div className="mt-3">
          <SectionBody
            section={section}
            tables={tables}
            keepInternalQuery={keepInternalQuery}
          />
        </div>
      </details>
    );
  }

  return (
    <article id={drugSectionAnchorId(section.id)} className={cardClass}>
      <h3 className="text-body-md font-medium">{section.title}</h3>
      {section.sourceHeading !== section.title ? (
        <p className="mt-1 text-label-sm text-on-surface-variant">{section.sourceHeading}</p>
      ) : null}
      <div className="mt-3">
        <SectionBody
          section={section}
          tables={tables}
          keepInternalQuery={keepInternalQuery}
        />
      </div>
    </article>
  );
}
