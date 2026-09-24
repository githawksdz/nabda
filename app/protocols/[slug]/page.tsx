import type { Metadata } from "next";
import { ContentUnavailable } from "@/components/app/ContentUnavailable";
import { ProtocolDetailPage } from "@/components/protocols/ProtocolDetailPage";
import { firstQueryValue } from "@/lib/content-data/query-helpers";
import { getProtocolRenderData } from "@/lib/content-data/protocol-data";
import {
  isFavorite,
  recordContentView,
} from "@/lib/content-detail/user-content-actions";

type ProtocolDetailRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    section?: string | string[];
    state?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: ProtocolDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const source = await getProtocolRenderData(slug, { linkMode: "public" });
  return {
    title: source?.title
      ? `${source.title} · Nabda`
      : "Recommandation · Nabda",
    description: "Recommandation clinique Nabda.",
  };
}

export default async function ProtocolDetailRoute({
  params,
  searchParams,
}: ProtocolDetailRouteProps) {
  const { slug } = await params;
  const query = await searchParams;
  const source = await getProtocolRenderData(slug, { linkMode: "public" });

  if (!source) {
    return <ContentUnavailable kind="protocol" />;
  }

  await recordContentView("protocol", source.slug);

  const initialBookmarked = await isFavorite("protocol", source.slug);

  return (
    <ProtocolDetailPage
      key={slug}
      source={source}
      sectionSlug={firstQueryValue(query.section)}
      viewState={firstQueryValue(query.state)}
      initialBookmarked={initialBookmarked}
    />
  );
}
