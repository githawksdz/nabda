import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProtocolDetailPage } from "@/components/protocols/ProtocolDetailPage";
import { firstQueryValue } from "@/lib/content-data/query-helpers";
import { getProtocolRenderData } from "@/lib/content-data/protocol-data";
import {
  normalizeDoctorContentSlug,
  requirePublishedDoctorContent,
} from "@/lib/authz/require-published-doctor-content";
import { viewerCanReadSlug } from "@/lib/authz/access";
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
  const normalized = normalizeDoctorContentSlug(slug);
  if (!normalized || !(await viewerCanReadSlug("protocol", normalized))) {
    return {
      title: "Protocole · Nabda",
      description: "Protocole clinique Nabda.",
    };
  }
  const source = await getProtocolRenderData(normalized, { linkMode: "public" });
  return {
    title: source?.title ? `${source.title} · Nabda` : "Protocole · Nabda",
    description: "Protocole clinique Nabda.",
  };
}

export default async function ProtocolDetailRoute({
  params,
  searchParams,
}: ProtocolDetailRouteProps) {
  const { slug } = await params;
  const query = await searchParams;
  const gatedSlug = await requirePublishedDoctorContent("protocol", slug);
  const source = await getProtocolRenderData(gatedSlug, { linkMode: "public" });

  if (!source) {
    redirect("/home");
  }

  await recordContentView("protocol", source.slug);

  const initialBookmarked = await isFavorite("protocol", source.slug);

  return (
    <ProtocolDetailPage
      key={gatedSlug}
      source={source}
      sectionSlug={firstQueryValue(query.section)}
      viewState={firstQueryValue(query.state)}
      initialBookmarked={initialBookmarked}
    />
  );
}
