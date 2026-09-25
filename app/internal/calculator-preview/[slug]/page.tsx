import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalPreviewFrame } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { CalculatorPreviewPage } from "@/components/internal/calculator-preview/CalculatorPreviewPage";
import { getCalculatorPreviewBySlug } from "@/lib/internal/calculator-preview-api";

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
}: PreviewRouteProps) {
  const { slug } = await params;
  const preview = getCalculatorPreviewBySlug(slug);
  if (!preview) {
    notFound();
  }

  return (
    <InternalPreviewFrame>
      <CalculatorPreviewPage preview={preview} keepInternalQuery={false} />
    </InternalPreviewFrame>
  );
}
