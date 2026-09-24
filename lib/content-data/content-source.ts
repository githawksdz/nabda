/**
 * Shared content-source resolution helpers.
 * Rendering source-preserved content is independent of the Validé label.
 */

export {
  activationStateForLinkMode,
  isSourceRenderAllowed,
  keepInternalQueryFromOptions,
  payloadSourceLabel,
} from "@/lib/content-rendering/render-state";

export {
  getContentSourceMode,
  isDemoContentMode,
  isDemoContentModeClient,
  isInternalPreviewContentMode,
  isProductionContentMode,
  shouldUseLocalContentFallback,
  shouldUseMockContentFallback,
  type ContentSourceMode,
} from "@/lib/content-data/content-source-mode";
