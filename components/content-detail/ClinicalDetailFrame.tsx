import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";

type ClinicalDetailFrameProps = {
  title: string;
  backHref: string;
  children: ReactNode;
};

export function ClinicalDetailFrame({
  title,
  backHref,
  children,
}: ClinicalDetailFrameProps) {
  return (
    <AppShell
      title={title}
      backHref={backHref}
      showBottomNav={false}
      contentClassName="lg:max-w-[56rem]"
    >
      {children}
    </AppShell>
  );
}
