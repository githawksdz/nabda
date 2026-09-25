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
      contentClassName={cnDetailFrame()}
    >
      <div className={READING_DOCK_CONTENT_CLASS}>{children}</div>
    </AppShell>
  );
}

function cnDetailFrame() {
  return "lg:max-w-[56rem]";
}
