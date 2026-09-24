/**
 * Server-only loader for internal CAT preview.
 * Shared disk cache lives in lib/internal/cat-local.
 */

export {
  getCatPreviewBySlug,
  getCatPreviewIndex,
  isAllowedCatPreviewMedia,
  resolveCatPreviewMediaPath,
} from "@/lib/internal/cat-local";
