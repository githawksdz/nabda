import type { Metadata } from "next";
import { requireRole } from "@/lib/authz/access";
import { InternalPreviewFrame } from "@/components/internal/protocol-preview/InternalPreviewLocked";
import { InternalPreviewBanner } from "@/components/internal/protocol-preview/InternalPreviewBanner";
import { OfflinePacksStaffPage } from "@/components/internal/offline-packs/OfflinePacksStaffPage";
import { loadStaffOfflineCatalog } from "@/lib/offline/staff-catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Packs hors-ligne · Staff",
  robots: { index: false, follow: false },
};

export default async function OfflinePacksStaffRoute() {
  const viewer = await requireRole("editor");
  if (!viewer) {
    return (
      <InternalPreviewFrame>
        <InternalPreviewBanner
          locked
          title="Packs hors-ligne verrouillés"
          body="Un compte éditeur ou admin est requis. Le paramètre d’URL ne donne aucun droit."
        />
        <h1 className="mt-4 text-headline-sm">Accès staff insuffisant</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Les reviewers peuvent inspecter le contenu source, mais seuls les éditeurs et admins
          gèrent les packs hors-ligne.
        </p>
      </InternalPreviewFrame>
    );
  }

  const catalog = await loadStaffOfflineCatalog();
  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <div className="relative mx-auto min-h-dvh w-full max-w-[720px] bg-background">
        <main className="px-4 pt-[calc(16px+env(safe-area-inset-top,0px))] pb-[calc(32px+env(safe-area-inset-bottom,0px))]">
          <InternalPreviewBanner
            title="Staff · Packs hors-ligne"
            body="Autorisation serveur: éditeur ou admin. Les utilisateurs publics ne voient que les packs publiés."
          />
          <div className="mt-4">
            <OfflinePacksStaffPage initial={catalog} />
          </div>
        </main>
      </div>
    </div>
  );
}
