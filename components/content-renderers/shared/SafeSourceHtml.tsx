/**
 * SafeSourceHtml accepts only already-normalized protocol HTML from the dry-run
 * pipeline (`cleanProtocolHtml` + this component's second sanitizer).
 * Do not pass raw nabda_db body_html.
 */
import { sanitizePreviewHtml } from "@/lib/content-rendering/protocol";
import type { ContentLinkMode } from "@/types/content-rendering";

type SafeSourceHtmlProps = {
  html: string;
  keepInternalQuery?: boolean;
  guidelinePreview?: "protocol" | "cat" | "drug" | "calculator";
  linkMode?: ContentLinkMode;
  className?: string;
};

export function SafeSourceHtml({
  html,
  keepInternalQuery = false,
  guidelinePreview = "protocol",
  linkMode = "internal",
  className,
}: SafeSourceHtmlProps) {
  const sanitized = sanitizePreviewHtml(
    html,
    keepInternalQuery,
    guidelinePreview,
    linkMode,
  );
  if (!sanitized.trim()) {
    return (
      <p className={className ?? "text-body-sm text-on-surface-variant"}>
        Contenu indisponible pour cette section.
      </p>
    );
  }
  return (
    <div
      className={className ?? "source-html text-body-sm text-on-surface"}
      // Sanitized dry-run HTML only. Scripts, handlers, and javascript: URLs stripped.
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
