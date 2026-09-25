import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalPreviewFrame } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { CatPreviewPage } from "@/components/internal/cat-preview/CatPreviewPage";
import { getCatPreviewBySlug } from "@/lib/internal/cat-preview-api";

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
  const preview = getCatPreviewBySlug(slug);
  return {
    title: preview ? `${preview.title} · aperçu interne CAT` : "Aperçu interne · CAT",
    robots: { index: false, follow: false },
  };
}

export default async function CatPreviewSlugRoute({
  params,
}: PreviewRouteProps) {
  const { slug } = await params;
  const preview = getCatPreviewBySlug(slug, false);
  if (!preview) {
    notFound();
  }

  return (
    <InternalPreviewFrame>
      <CatPreviewPage preview={preview} keepInternalQuery={false} />
    </InternalPreviewFrame>
  );
}
