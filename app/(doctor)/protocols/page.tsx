import type { Metadata } from "next";
import { Suspense } from "react";
import { ProtocolsIndexPage } from "@/components/protocols/ProtocolsIndexPage";
import { getProtocols } from "@/features/content/api";
import { loadModuleListPromotion } from "@/lib/promotions/load-module-list-promotion";
import { catalogFromDbProtocols } from "@/lib/protocols/protocol-catalog";
import { getVisitedContentKeys } from "@/lib/content-detail/user-content-actions";
import { InstantIndexChrome } from "@/components/app/instant-chromes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Protocoles · Nabda",
  description: "Synthèses et guides cliniques",
};

async function ProtocolsIndexLoader() {
  const [rows, promotion, visitedKeys] = await Promise.all([
    getProtocols(),
    loadModuleListPromotion("protocols"),
    getVisitedContentKeys(),
  ]);
  const protocols = catalogFromDbProtocols(rows);
  return (
    <ProtocolsIndexPage
      protocols={protocols}
      promotion={promotion}
      visitedKeys={visitedKeys}
    />
  );
}

export default function ProtocolsPage() {
  return (
    <Suspense fallback={<InstantIndexChrome href="/protocols" />}>
      <ProtocolsIndexLoader />
    </Suspense>
  );
}
