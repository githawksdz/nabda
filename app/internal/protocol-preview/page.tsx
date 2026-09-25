import type { Metadata } from "next";
import { InternalPreviewFrame } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { ProtocolPreviewIndex } from "@/components/internal/protocol-preview/ProtocolPreviewIndex";
import { getProtocolPreviewIndex } from "@/lib/internal/protocol-preview-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Aperçu interne · Recommandations",
  robots: { index: false, follow: false },
};

export default async function ProtocolPreviewIndexRoute() {
  const items = getProtocolPreviewIndex();

  return (
    <InternalPreviewFrame>
      <ProtocolPreviewIndex items={items} keepInternalQuery={false} />
    </InternalPreviewFrame>
  );
}
