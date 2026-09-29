import type { ProfileListItem } from "@/types/personal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ItemSeparator, ListGroup, ListRow } from "@/components/ui/ListRow";

type ProfileSectionListProps = {
  title?: string;
  items: ProfileListItem[];
  framed?: boolean;
};

export function ProfileSectionList({
  title,
  items,
  framed = true,
}: ProfileSectionListProps) {
  return (
    <ListGroup title={title} className={framed ? undefined : "bg-transparent"}>
      {items.map((item, index) => (
        <div key={item.id}>
          <ProfileSectionRow item={item} />
          {index < items.length - 1 ? <ItemSeparator className="my-0" /> : null}
        </div>
      ))}
    </ListGroup>
  );
}

export function ProfileSectionRow({ item }: { item: ProfileListItem }) {
  return (
    <ListRow
      title={item.label}
      description={item.value}
      href={item.href}
      onClick={item.onClick}
      disabled={item.disabled}
      badge={
        item.badge ? <StatusBadge tone="muted">{item.badge}</StatusBadge> : undefined
      }
    />
  );
}
