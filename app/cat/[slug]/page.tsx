import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CatDetailPage } from "@/components/cat-detail/CatDetailPage";
import { firstQueryValue } from "@/lib/content-data/query-helpers";
import { getCatRenderData } from "@/lib/content-data/cat-data";
import {
  normalizeDoctorContentSlug,
  requirePublishedDoctorContent,
} from "@/lib/authz/require-published-doctor-content";
import { viewerCanReadSlug } from "@/lib/authz/access";
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
  const normalized = normalizeDoctorContentSlug(slug);
  if (!normalized || !(await viewerCanReadSlug("cat", normalized))) {
    return {
      title: "CAT · Nabda",
      description: "Carte clinique Nabda.",
    };
  }
  const source = await getCatRenderData(normalized, { linkMode: "public" });
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
  const gatedSlug = await requirePublishedDoctorContent("cat", slug);
  const source = await getCatRenderData(gatedSlug, { linkMode: "public" });

  if (!source) {
    redirect("/home");
  }

  await recordContentView("cat", source.slug);

  const initialBookmarked = await isFavorite("cat", source.slug);

  return (
    <CatDetailPage
      key={gatedSlug}
      source={source}
      tab={firstQueryValue(query.tab)}
      viewState={firstQueryValue(query.state)}
      initialBookmarked={initialBookmarked}
    />
  );
}
