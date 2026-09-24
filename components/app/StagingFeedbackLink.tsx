"use client";

import { usePathname } from "next/navigation";

/**
 * Lightweight beta feedback entry — opens external form with route context.
 * No clinical payload / secrets. Replace FORM_URL when product provides one.
 */
const FORM_URL =
  process.env.NEXT_PUBLIC_STAGING_FEEDBACK_URL ||
  "mailto:feedback@nabda.app?subject=Nabda%20staging%20feedback";

export function StagingFeedbackLink() {
  const pathname = usePathname() || "/";
  const href =
    FORM_URL.startsWith("mailto:")
      ? `${FORM_URL}%20${encodeURIComponent(pathname)}`
      : `${FORM_URL}${FORM_URL.includes("?") ? "&" : "?"}route=${encodeURIComponent(pathname)}`;

  return (
    <a
      href={href}
      className="text-label-md text-on-surface-variant underline-offset-2 hover:underline"
      target={FORM_URL.startsWith("mailto:") ? undefined : "_blank"}
      rel={FORM_URL.startsWith("mailto:") ? undefined : "noreferrer"}
    >
      Signaler un problème
    </a>
  );
}
