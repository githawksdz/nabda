import type { ReactNode } from "react";
import { InternalPreviewBanner } from "@/components/internal/protocol-preview/InternalPreviewBanner";

export function InternalPreviewLocked() {
  return (
    <div className="flex flex-col gap-4">
      <InternalPreviewBanner locked />
      <h1 className="text-headline-sm">Aperçu interne indisponible</h1>
      <p className="text-body-sm text-on-surface-variant">
        Cette route lit les JSON de dry-run pour l&apos;inspection produit. Elle n&apos;est pas dans
        la navigation publique. En production, ajoutez <code>?preview=internal</code>.
      </p>
    </div>
  );
}

export function InternalPreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-background">
        <main className="px-4 pt-[calc(16px+env(safe-area-inset-top,0px))] pb-[calc(32px+env(safe-area-inset-bottom,0px))]">
          {children}
        </main>
      </div>
    </div>
  );
}
