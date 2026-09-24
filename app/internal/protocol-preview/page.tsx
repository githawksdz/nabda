import type { Metadata } from "next";
import { InternalPreviewFrame, InternalPreviewLocked } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { ProtocolPreviewIndex } from "@/components/internal/protocol-preview/ProtocolPreviewIndex";
import {
  canAccessInternalPreview,
  firstSearchParam,
} from "@/lib/internal/preview-access";
import { getProtocolPreviewIndex } from "@/lib/internal/protocol-preview-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Aperçu interne · Recommandations",
  robots: { index: false, follow: false },
};

type IndexRouteProps = {
  searchParams: Promise<{ preview?: string | string[] }>;
};

export default async function ProtocolPreviewIndexRoute({
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

  const items = getProtocolPreviewIndex();

  return (
    <InternalPreviewFrame>
      <ProtocolPreviewIndex items={items} keepInternalQuery={keepInternalQuery} />
    </InternalPreviewFrame>
  );
}
