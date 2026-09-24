/**
 * Cross-cutting content render types.
 * Domain DTOs live in content-rendering-protocol/cat/drug/calculator.
 */

export type ContentLinkMode = "public" | "internal";

export type ContentPayloadSource = "supabase" | "local_normalized" | "mock";

export type ContentActivationState =
  | "demo_mock"
  | "imported_identity"
  | "source_preserved_locked"
  | "ux_normalized_preview"
  | "source_preserved_active"
  | "nabda_adapted_active"
  | "production_published";

export type ContentRenderOptions = {
  linkMode: ContentLinkMode;
  keepInternalQuery?: boolean;
};

export type ContentRenderProvenance = {
  payloadSource: ContentPayloadSource;
  activationState: ContentActivationState;
};
