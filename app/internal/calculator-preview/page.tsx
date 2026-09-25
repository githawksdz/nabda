import type { Metadata } from "next";
import { InternalPreviewFrame } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { CalculatorPreviewIndex } from "@/components/internal/calculator-preview/CalculatorPreviewIndex";
import { getCalculatorPreviewIndex } from "@/lib/internal/calculator-preview-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Aperçu interne · Catalogue calculateurs",
  robots: { index: false, follow: false },
};

export default async function CalculatorPreviewIndexRoute() {
  const items = getCalculatorPreviewIndex();

  return (
    <InternalPreviewFrame>
      <CalculatorPreviewIndex items={items} keepInternalQuery={false} />
    </InternalPreviewFrame>
  );
}
