import type { Metadata } from "next";
import { Suspense } from "react";
import { FavoritesPage } from "@/components/personal/favorites/FavoritesPage";
import { getFavoriteItems } from "@/lib/personal/personal-api";
import { isEmptyPreview } from "@/lib/personal/personal-mappers";
import { InstantIndexChrome } from "@/components/app/instant-chromes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoris · Nabda",
  description: "Vos références sauvegardées",
};

type FavoritesRouteProps = {
  searchParams: Promise<{ preview?: string }>;
};

async function FavoritesLoader({ searchParams }: FavoritesRouteProps) {
  const { preview } = await searchParams;

  if (isEmptyPreview(preview)) {
    return <FavoritesPage items={[]} />;
  }

  const { items } = await getFavoriteItems();
  return <FavoritesPage items={items} />;
}

export default function FavoritesRoute({ searchParams }: FavoritesRouteProps) {
  return (
    <Suspense fallback={<InstantIndexChrome href="/favorites" />}>
      <FavoritesLoader searchParams={searchParams} />
    </Suspense>
  );
}
