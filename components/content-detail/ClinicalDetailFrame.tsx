import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { READING_DOCK_CONTENT_CLASS } from "@/components/content-detail/BottomReadingDock";

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
      pageHeading={false}
      frame="clinical"
    >
      {/* Dock owns bottom reserve. Shell does not add nav padding when nav is hidden. */}
      <div className={READING_DOCK_CONTENT_CLASS}>{children}</div>
    </AppShell>
  );
}
