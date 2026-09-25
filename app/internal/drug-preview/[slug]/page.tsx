import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalPreviewFrame } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { DrugPreviewPage } from "@/components/internal/drug-preview/DrugPreviewPage";
import { getDrugPreviewBySlug } from "@/lib/internal/drug-preview-api";

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
  const preview = getDrugPreviewBySlug(slug);
  return {
    title: preview
      ? `${preview.title} · aperçu interne médicament`
      : "Aperçu interne · Médicament",
    robots: { index: false, follow: false },
  };
}

export default async function DrugPreviewSlugRoute({
  params,
}: PreviewRouteProps) {
  const { slug } = await params;
  const preview = getDrugPreviewBySlug(slug, false);
  if (!preview) {
    notFound();
  }

  return (
    <InternalPreviewFrame>
      <DrugPreviewPage preview={preview} keepInternalQuery={false} />
    </InternalPreviewFrame>
  );
}
