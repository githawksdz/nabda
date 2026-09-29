import { Suspense } from "react";
import { CalculatorsIndexPage } from "@/components/calculators/CalculatorsIndexPage";
import { getCalculators } from "@/features/content/api";
import { catalogFromDbCalculators } from "@/lib/calculators/calculator-mappers";
import { loadModuleListPromotion } from "@/lib/promotions/load-module-list-promotion";
import { getVisitedContentKeys } from "@/lib/content-detail/user-content-actions";
import { InstantIndexChrome } from "@/components/app/instant-chromes";

export const dynamic = "force-dynamic";

async function CalculatorsIndexLoader() {
  const [rows, promotion, visitedKeys] = await Promise.all([
    getCalculators(),
    loadModuleListPromotion("calculators"),
    getVisitedContentKeys(),
  ]);
  const calculators = catalogFromDbCalculators(rows);
  return (
    <CalculatorsIndexPage
      calculators={calculators}
      promotion={promotion}
      visitedKeys={visitedKeys}
    />
  );
}

export default function CalculatorsPage() {
  return (
    <Suspense fallback={<InstantIndexChrome href="/calculators" />}>
      <CalculatorsIndexLoader />
    </Suspense>
  );
}
