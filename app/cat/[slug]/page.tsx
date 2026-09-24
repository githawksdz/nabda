import type { Metadata } from "next";
import { ContentUnavailable } from "@/components/app/ContentUnavailable";
import { CatDetailPage } from "@/components/cat-detail/CatDetailPage";
import { firstQueryValue } from "@/lib/content-data/query-helpers";
import { getCatRenderData } from "@/lib/content-data/cat-data";
import {
  isFavorite,
  recordContentView,
} from "@/lib/content-detail/user-content-actions";

type CatDetailRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    tab?: string | string[];
    state?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: CatDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const source = await getCatRenderData(slug, { linkMode: "public" });
  return {
    title: source?.title ? `${source.title} · Nabda` : "CAT · Nabda",
    description: "Carte clinique Nabda.",
  };
}

export default async function CatDetailRoute({
  params,
  searchParams,
}: CatDetailRouteProps) {
  const { slug } = await params;
  const query = await searchParams;
  const source = await getCatRenderData(slug, { linkMode: "public" });

  if (!source) {
    return <ContentUnavailable kind="cat" />;
  }

  await recordContentView("cat", source.slug);

  const initialBookmarked = await isFavorite("cat", source.slug);

  return (
    <CatDetailPage
      key={slug}
      source={source}
      tab={firstQueryValue(query.tab)}
      viewState={firstQueryValue(query.state)}
      initialBookmarked={initialBookmarked}
    />
  );
}
