import { FavoriteCard } from "./FavoriteCard";
import type { FavoriteItem } from "@/types/personal";

type FavoritesListProps = {
  items: FavoriteItem[];
};

export function FavoritesList({ items }: FavoritesListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      {items.map((item) => (
        <FavoriteCard key={item.id} item={item} />
      ))}
    </section>
  );
}
