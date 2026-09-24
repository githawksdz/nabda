import type { Metadata } from "next";
import { ProtocolsIndexPage } from "@/components/protocols/ProtocolsIndexPage";
import { getProtocols } from "@/features/content/api";
import { catalogFromDbProtocols } from "@/lib/protocols/protocol-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recommandations · Nabda",
  description: "Synthèses et guides cliniques",
};

export default async function ProtocolsPage() {
  const rows = await getProtocols();
  const protocols = catalogFromDbProtocols(rows);
  return <ProtocolsIndexPage protocols={protocols} />;
}
