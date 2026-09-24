import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalPreviewFrame, InternalPreviewLocked } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { CalculatorPreviewPage } from "@/components/internal/calculator-preview/CalculatorPreviewPage";
import {
  canAccessInternalPreview,
  firstSearchParam,
} from "@/lib/internal/preview-access";
import { getCalculatorPreviewBySlug } from "@/lib/internal/calculator-preview-api";

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
  const preview = getCalculatorPreviewBySlug(slug);
  return {
    title: preview
      ? `${preview.title} · aperçu interne calculateur`
      : "Aperçu interne · Calculateur",
    robots: { index: false, follow: false },
  };
}

export default async function CalculatorPreviewSlugRoute({
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

  const preview = getCalculatorPreviewBySlug(slug);
  if (!preview) {
    notFound();
  }

  return (
    <InternalPreviewFrame>
      <CalculatorPreviewPage preview={preview} keepInternalQuery={keepInternalQuery} />
    </InternalPreviewFrame>
  );
}
