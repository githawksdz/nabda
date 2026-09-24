import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalPreviewFrame, InternalPreviewLocked } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { DrugPreviewPage } from "@/components/internal/drug-preview/DrugPreviewPage";
import {
  canAccessInternalPreview,
  firstSearchParam,
} from "@/lib/internal/preview-access";
import { getDrugPreviewBySlug } from "@/lib/internal/drug-preview-api";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const runtime = "nodejs";

type PreviewRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string | string[] }>;
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
  searchParams,
}: PreviewRouteProps) {
  const { slug } = await params;
  const query = await searchParams;
  const keepInternalQuery = process.env.NODE_ENV === "production";
  const allowed = canAccessInternalPreview(firstSearchParam(query.preview));

  if (!allowed) {
    return (
      <InternalPreviewFrame>
        <InternalPreviewLocked />
      </InternalPreviewFrame>
    );
  }

  const preview = getDrugPreviewBySlug(slug, keepInternalQuery);
  if (!preview) {
    notFound();
  }

  return (
    <InternalPreviewFrame>
      <DrugPreviewPage preview={preview} keepInternalQuery={keepInternalQuery} />
    </InternalPreviewFrame>
  );
}
