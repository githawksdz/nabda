import type { Metadata } from "next";
import { DrugsIndexPage } from "@/components/drugs/DrugsIndexPage";
import { getDrugs } from "@/features/content/api";
import { catalogFromDbDrugs } from "@/lib/drugs/drug-mappers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Médicaments · Nabda",
  description: "Référentiel thérapeutique & pharmacologie",
};

export default async function DrugsPage() {
  const rows = await getDrugs();
  const drugs = catalogFromDbDrugs(rows);
  return <DrugsIndexPage drugs={drugs} />;
}
