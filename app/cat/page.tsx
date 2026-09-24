import { Suspense } from "react";
import { CatIndexPage } from "@/components/cat/CatIndexPage";
import { getCatMaps } from "@/features/content/api";
import { catalogFromDbCatMaps } from "@/lib/cat/cat-catalog";

export const dynamic = "force-dynamic";

type CatRouteProps = {
  searchParams: Promise<{ category?: string; preview?: string }>;
};

export default async function CatRoute({ searchParams }: CatRouteProps) {
  const { category, preview } = await searchParams;
  const rows = await getCatMaps();
  const catalog = catalogFromDbCatMaps(rows);

  return (
    <Suspense>
      <CatIndexPage
        initialCategory={category}
        initialPreview={preview}
        catalog={catalog}
      />
    </Suspense>
  );
}
