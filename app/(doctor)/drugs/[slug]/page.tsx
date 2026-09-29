import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DrugDetailPage } from "@/components/drugs/DrugDetailPage";
import { firstQueryValue } from "@/lib/content-data/query-helpers";
import { getDrugRenderData } from "@/lib/content-data/drug-data";
import {
  normalizeDoctorContentSlug,
  requirePublishedDoctorContent,
} from "@/lib/authz/require-published-doctor-content";
import { viewerCanReadSlug } from "@/lib/authz/access";
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
  const normalized = normalizeDoctorContentSlug(slug);
  if (!normalized || !(await viewerCanReadSlug("drug", normalized))) {
    return {
      title: "Médicament · Nabda",
      description: "Fiche médicament Nabda.",
    };
  }
  const source = await getDrugRenderData(normalized, { linkMode: "public" });
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
  const gatedSlug = await requirePublishedDoctorContent("drug", slug);
  const source = await getDrugRenderData(gatedSlug, { linkMode: "public" });

  if (!source) {
    redirect("/home");
  }

  await recordContentView("drug", source.slug);

  const initialBookmarked = await isFavorite("drug", source.slug);

  return (
    <DrugDetailPage
      key={gatedSlug}
      slug={gatedSlug}
      source={source}
      tab={firstQueryValue(query.tab)}
      mode="overview"
      initialBookmarked={initialBookmarked}
    />
  );
}
