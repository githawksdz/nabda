import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalPreviewFrame, InternalPreviewLocked } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { CatPreviewPage } from "@/components/internal/cat-preview/CatPreviewPage";
import {
  canAccessInternalPreview,
  firstSearchParam,
} from "@/lib/internal/preview-access";
import { getCatPreviewBySlug } from "@/lib/internal/cat-preview-api";

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
  const preview = getCatPreviewBySlug(slug);
  return {
    title: preview ? `${preview.title} · aperçu interne CAT` : "Aperçu interne · CAT",
    robots: { index: false, follow: false },
  };
}

export default async function CatPreviewSlugRoute({
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

  const preview = getCatPreviewBySlug(slug, keepInternalQuery);
  if (!preview) {
    notFound();
  }

  return (
    <InternalPreviewFrame>
      <CatPreviewPage preview={preview} keepInternalQuery={keepInternalQuery} />
    </InternalPreviewFrame>
  );
}
