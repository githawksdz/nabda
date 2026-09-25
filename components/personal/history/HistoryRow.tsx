import { PersonalContentCard } from "@/components/personal/PersonalContentCard";
import { PersonalItemOfflineHint } from "@/components/personal/PersonalItemOfflineHint";
import {
  ENTITY_TYPE_LABELS,
  formatRelativeViewedAt,
} from "@/lib/personal/personal-mappers";
import type { HistoryItem } from "@/types/personal";

type HistoryRowProps = {
  item: HistoryItem;
};

export function HistoryRow({ item }: HistoryRowProps) {
  return (
    <PersonalContentCard
      href={item.href}
      title={item.title}
      subtitle={item.subtitle}
      kindLabel={item.kindLabel ?? ENTITY_TYPE_LABELS[item.entityType]}
      entityType={item.entityType}
      meta={formatRelativeViewedAt(item.viewedAt)}
      compact
      accessory={
        <PersonalItemOfflineHint entityType={item.entityType} slug={item.entitySlug} />
      }
    />
  );
}
