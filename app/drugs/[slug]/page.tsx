import type { Metadata } from "next";
import { ContentUnavailable } from "@/components/app/ContentUnavailable";
import { DrugDetailPage } from "@/components/drugs/DrugDetailPage";
import { firstQueryValue } from "@/lib/content-data/query-helpers";
import { getDrugRenderData } from "@/lib/content-data/drug-data";
import {
  isFavorite,
  recordContentView,
} from "@/lib/content-detail/user-content-actions";

type DrugDetailRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    tab?: string | string[];
    state?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: DrugDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const source = await getDrugRenderData(slug, { linkMode: "public" });
  return {
    title: source?.title ? `${source.title} · Nabda` : "Médicament · Nabda",
    description: "Fiche médicament Nabda.",
  };
}

export default async function DrugDetailRoute({
  params,
  searchParams,
}: DrugDetailRouteProps) {
  const { slug } = await params;
  const query = await searchParams;
  const source = await getDrugRenderData(slug, { linkMode: "public" });

  if (!source) {
    return <ContentUnavailable kind="drug" />;
  }

  await recordContentView("drug", source.slug);

  const initialBookmarked = await isFavorite("drug", source.slug);

  return (
    <DrugDetailPage
      key={slug}
      slug={slug}
      source={source}
      tab={firstQueryValue(query.tab)}
      mode="overview"
      initialBookmarked={initialBookmarked}
    />
  );
}
