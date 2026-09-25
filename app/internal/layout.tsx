import type { Metadata } from "next";
import type { ReactNode } from "react";
import { InternalPreviewFrame, InternalPreviewLocked } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { canAccessInternalPreview } from "@/lib/internal/preview-gate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Aperçu interne",
};

export default async function InternalLayout({ children }: { children: ReactNode }) {
  const allowed = await canAccessInternalPreview();
  if (!allowed) {
    return (
      <InternalPreviewFrame>
        <InternalPreviewLocked />
      </InternalPreviewFrame>
    );
  }

  return children;
}
