import type { Metadata } from "next";
import { InternalPreviewFrame } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { CatPreviewIndex } from "@/components/internal/cat-preview/CatPreviewIndex";
import { getCatPreviewIndex } from "@/lib/internal/cat-preview-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Aperçu interne · CAT",
  robots: { index: false, follow: false },
};

export default async function CatPreviewIndexRoute() {
  const items = getCatPreviewIndex();

  return (
    <InternalPreviewFrame>
      <CatPreviewIndex items={items} keepInternalQuery={false} />
    </InternalPreviewFrame>
  );
}
