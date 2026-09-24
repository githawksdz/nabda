import type { Metadata } from "next";
import { FavoritesPage } from "@/components/personal/favorites/FavoritesPage";
import { getFavoriteItems } from "@/lib/personal/personal-api";
import { isEmptyPreview } from "@/lib/personal/personal-mappers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoris · Nabda",
  description: "Vos références sauvegardées",
};

type FavoritesRouteProps = {
  searchParams: Promise<{ preview?: string }>;
};

export default async function FavoritesRoute({
  searchParams,
}: FavoritesRouteProps) {
  const { preview } = await searchParams;

  if (isEmptyPreview(preview)) {
    return <FavoritesPage items={[]} />;
  }

  const { items } = await getFavoriteItems();
  return <FavoritesPage items={items} />;
}
