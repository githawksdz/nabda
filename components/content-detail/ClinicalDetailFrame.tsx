"use client";

import type { ReactNode } from "react";
import { READING_DOCK_CONTENT_CLASS } from "@/components/content-detail/BottomReadingDock";
import { useShellChrome } from "@/components/app/shell-chrome";

type ClinicalDetailFrameProps = {
  title: string;
  backHref: string;
  children: ReactNode;
};

export function ClinicalDetailFrame({
  backHref,
  children,
}: ClinicalDetailFrameProps) {
  useShellChrome({ backHref });

  return <div className={READING_DOCK_CONTENT_CLASS}>{children}</div>;
}
