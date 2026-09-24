import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Aperçu interne",
};

export default function InternalLayout({ children }: { children: ReactNode }) {
  return children;
}
