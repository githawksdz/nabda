import { DrugSectionCard } from "@/components/content-renderers/drug/DrugSectionCard";
import { DrugTableRenderer } from "@/components/content-renderers/drug/DrugTableRenderer";
import type { DrugRenderSection, DrugRenderTable } from "@/types/content-rendering-drug";

type DrugSectionRendererProps = {
  sections: DrugRenderSection[];
  tables: DrugRenderTable[];
  keepInternalQuery?: boolean;
};

export function DrugSectionRenderer({
  sections,
  tables,
  keepInternalQuery = false,
}: DrugSectionRendererProps) {
  const tablesBySection = new Map<string, DrugRenderTable[]>();
  for (const table of tables) {
    const list = tablesBySection.get(table.sectionId) ?? [];
    list.push(table);
    tablesBySection.set(table.sectionId, list);
  }
  const used = new Set(sections.map((section) => section.id));
  const orphanTables = tables.filter((table) => !used.has(table.sectionId));

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, index) => (
        <DrugSectionCard
          key={section.id}
          section={section}
          tables={tablesBySection.get(section.id) ?? []}
          keepInternalQuery={keepInternalQuery}
          defaultOpen={index < 2 && section.priority !== "background"}
        />
      ))}
      {orphanTables.map((table) => (
        <DrugTableRenderer key={table.id} table={table} />
      ))}
    </div>
  );
}
