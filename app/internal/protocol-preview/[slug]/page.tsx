import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalPreviewFrame } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { ProtocolPreviewPage } from "@/components/internal/protocol-preview/ProtocolPreviewPage";
import { getProtocolPreviewBySlug } from "@/lib/internal/protocol-preview-api";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const runtime = "nodejs";

type PreviewRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PreviewRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const preview = getProtocolPreviewBySlug(slug);
  return {
    title: preview
      ? `${preview.title} · aperçu interne`
      : "Aperçu interne · Recommandation",
    robots: { index: false, follow: false },
  };
}

export default async function ProtocolPreviewSlugRoute({
  params,
}: PreviewRouteProps) {
  const { slug } = await params;
  const preview = getProtocolPreviewBySlug(slug);
  if (!preview) {
    notFound();
  }

  return (
    <InternalPreviewFrame>
      <ProtocolPreviewPage preview={preview} keepInternalQuery={false} />
    </InternalPreviewFrame>
  );
}
