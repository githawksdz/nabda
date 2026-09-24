import type { Metadata } from "next";
import { InternalPreviewFrame, InternalPreviewLocked } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { CalculatorPreviewIndex } from "@/components/internal/calculator-preview/CalculatorPreviewIndex";
import {
  canAccessInternalPreview,
  firstSearchParam,
} from "@/lib/internal/preview-access";
import { getCalculatorPreviewIndex } from "@/lib/internal/calculator-preview-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Aperçu interne · Catalogue calculateurs",
  robots: { index: false, follow: false },
};

type IndexRouteProps = {
  searchParams: Promise<{ preview?: string | string[] }>;
};

export default async function CalculatorPreviewIndexRoute({
  searchParams,
}: IndexRouteProps) {
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

  const items = getCalculatorPreviewIndex();

  return (
    <InternalPreviewFrame>
      <CalculatorPreviewIndex items={items} keepInternalQuery={keepInternalQuery} />
    </InternalPreviewFrame>
  );
}
