import { PersonalContentCard } from "@/components/personal/PersonalContentCard";
import { ENTITY_TYPE_LABELS } from "@/lib/personal/personal-mappers";
import type { FavoriteItem } from "@/types/personal";

type FavoriteCardProps = {
  item: FavoriteItem;
};

export function FavoriteCard({ item }: FavoriteCardProps) {
  return (
    <PersonalContentCard
      href={item.href}
      title={item.title}
      subtitle={item.subtitle}
      kindLabel={item.kindLabel ?? ENTITY_TYPE_LABELS[item.entityType]}
      entityType={item.entityType}
      statusLabel={item.statusLabel}
    />
  );
}
