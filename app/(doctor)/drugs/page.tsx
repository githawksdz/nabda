import type { Metadata } from "next";
import { Suspense } from "react";
import { DrugsIndexPage } from "@/components/drugs/DrugsIndexPage";
import { getDrugs } from "@/features/content/api";
import { catalogFromDbDrugs } from "@/lib/drugs/drug-mappers";
import { loadModuleListPromotion } from "@/lib/promotions/load-module-list-promotion";
import { getVisitedContentKeys } from "@/lib/content-detail/user-content-actions";
import { InstantIndexChrome } from "@/components/app/instant-chromes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Médicaments · Nabda",
  description: "Référentiel thérapeutique & pharmacologie",
};

async function DrugsIndexLoader() {
  const [rows, promotion, visitedKeys] = await Promise.all([
    getDrugs(),
    loadModuleListPromotion("drugs"),
    getVisitedContentKeys(),
  ]);
  const drugs = catalogFromDbDrugs(rows);
  return (
    <DrugsIndexPage drugs={drugs} promotion={promotion} visitedKeys={visitedKeys} />
  );
}

export default function DrugsPage() {
  return (
    <Suspense fallback={<InstantIndexChrome href="/drugs" />}>
      <DrugsIndexLoader />
    </Suspense>
  );
}
