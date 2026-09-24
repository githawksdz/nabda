import { HistoryRow } from "./HistoryRow";
import type { HistoryGroup as HistoryGroupData } from "@/types/personal";

type HistoryGroupProps = {
  group: HistoryGroupData;
};

export function HistoryGroup({ group }: HistoryGroupProps) {
  return (
    <section>
      <h3 className="mb-2 text-headline-sm">{group.title}</h3>
      <div className="flex flex-col gap-2">
        {group.items.map((item) => (
          <HistoryRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
