import type { Metadata } from "next";
import { InternalPreviewFrame, InternalPreviewLocked } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { DrugPreviewIndex } from "@/components/internal/drug-preview/DrugPreviewIndex";
import {
  canAccessInternalPreview,
  firstSearchParam,
} from "@/lib/internal/preview-access";
import { getDrugPreviewIndex } from "@/lib/internal/drug-preview-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Aperçu interne · Médicaments",
  robots: { index: false, follow: false },
};

type IndexRouteProps = {
  searchParams: Promise<{ preview?: string | string[] }>;
};

export default async function DrugPreviewIndexRoute({
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

  const items = getDrugPreviewIndex();

  return (
    <InternalPreviewFrame>
      <DrugPreviewIndex items={items} keepInternalQuery={keepInternalQuery} />
    </InternalPreviewFrame>
  );
}
