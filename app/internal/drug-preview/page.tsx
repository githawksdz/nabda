import type { Metadata } from "next";
import { InternalPreviewFrame } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { DrugPreviewIndex } from "@/components/internal/drug-preview/DrugPreviewIndex";
import { getDrugPreviewIndex } from "@/lib/internal/drug-preview-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Aperçu interne · Médicaments",
  robots: { index: false, follow: false },
};

export default async function DrugPreviewIndexRoute() {
  const items = getDrugPreviewIndex();

  return (
    <InternalPreviewFrame>
      <DrugPreviewIndex items={items} keepInternalQuery={false} />
    </InternalPreviewFrame>
  );
}
