import { CalculatorsIndexPage } from "@/components/calculators/CalculatorsIndexPage";
import { getCalculators } from "@/features/content/api";
import { catalogFromDbCalculators } from "@/lib/calculators/calculator-mappers";

export const dynamic = "force-dynamic";

export default async function CalculatorsPage() {
  const rows = await getCalculators();
  const calculators = catalogFromDbCalculators(rows);
  return <CalculatorsIndexPage calculators={calculators} />;
}
