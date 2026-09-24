/**
 * Server-only loader for internal protocol preview.
 * Shared disk cache lives in lib/internal/protocol-local.
 */

export {
  getProtocolPreviewBySlug,
  getProtocolPreviewIndex,
} from "@/lib/internal/protocol-local";
