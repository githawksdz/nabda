import { ContentTable } from "@/components/content-detail/rich-content/ContentTable";
import type { ProtocolRenderTable } from "@/types/content-rendering-protocol";

type ProtocolTableCardsProps = {
  tables: ProtocolRenderTable[];
};

export function ProtocolTableCards({ tables }: ProtocolTableCardsProps) {
  if (tables.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-3">
      {tables.map((table, index) => (
        <ContentTable
          key={`${table.headers.join("-")}-${index}`}
          caption={table.caption ?? (tables.length > 1 ? `Tableau ${index + 1}` : undefined)}
          headers={table.headers}
          rows={table.rows}
        />
      ))}
    </div>
  );
}
