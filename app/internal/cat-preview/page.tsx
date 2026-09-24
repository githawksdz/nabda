import type { Metadata } from "next";
import { InternalPreviewFrame, InternalPreviewLocked } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { CatPreviewIndex } from "@/components/internal/cat-preview/CatPreviewIndex";
import {
  canAccessInternalPreview,
  firstSearchParam,
} from "@/lib/internal/preview-access";
import { getCatPreviewIndex } from "@/lib/internal/cat-preview-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Aperçu interne · CAT",
  robots: { index: false, follow: false },
};

type IndexRouteProps = {
  searchParams: Promise<{ preview?: string | string[] }>;
};

export default async function CatPreviewIndexRoute({
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

  const items = getCatPreviewIndex();

  return (
    <InternalPreviewFrame>
      <CatPreviewIndex items={items} keepInternalQuery={keepInternalQuery} />
    </InternalPreviewFrame>
  );
}
