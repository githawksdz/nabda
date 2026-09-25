/** Explicit PostgREST column lists. Never use select("*") on public content paths. */

export const PROTOCOL_CATALOG_SELECT =
  "id, slug, title, short_title, summary, category_slug, content_type, status, review_status, visibility, is_featured, published_at, source_note, created_at, updated_at";

export const CAT_CATALOG_SELECT =
  "id, protocol_id, slug, title, summary, status, review_status, visibility, is_featured, published_at, source_note, created_at, updated_at";

export const CALCULATOR_CATALOG_SELECT =
  "id, slug, title, short_title, description, category_slug, status, review_status, visibility, is_featured, usage_context, engine_slug, engine_version, engine_implemented, created_at, updated_at";

export const DRUG_CATALOG_SELECT =
  "id, slug, dci, display_name, therapeutic_class, summary, status, review_status, visibility, is_featured, source_note, created_at, updated_at";

export const HOME_FEED_SELECT =
  "id, title, description, label, category_slug, item_type, target_type, target_slug, visibility, plan_required, audience_professions, audience_interests, is_active, priority, published_at, review_status, created_at, updated_at";

export const PROTOCOL_IDENTITY_SEARCH_SELECT =
  "slug, title, short_title, category_slug, status, review_status, visibility";

export const CAT_IDENTITY_SEARCH_SELECT =
  "slug, title, status, review_status, visibility";

export const CALCULATOR_IDENTITY_SEARCH_SELECT =
  "slug, title, short_title, category_slug, status, review_status, visibility";

export const DRUG_IDENTITY_SEARCH_SELECT =
  "slug, dci, display_name, therapeutic_class, status, review_status, visibility";

export const PROTOCOL_SECTION_SELECT =
  "id, protocol_id, heading, section_type, order_index, visibility, adaptation_flags, content_json, plain_text, review_status, created_at, updated_at";

export const PROTOCOL_REFERENCE_SELECT =
  "id, protocol_id, section_id, label, url, reference_type, year, order_index, review_status, created_at, updated_at";

export const PROTOCOL_LINK_SELECT =
  "id, protocol_id, target_type, target_id, target_slug, label, relationship, order_index, created_at";

export const CAT_BLOCK_SELECT =
  "id, cat_map_id, block_key, block_type, title, text, rich_content, x, y, width, height, style, order_index, flags, linked_drug_ids, linked_calculator_ids, linked_protocol_ids, review_status, created_at, updated_at";

export const CAT_EDGE_SELECT =
  "id, cat_map_id, from_block_id, to_block_id, label, relationship, confidence, path, style, order_index, review_status, created_at, updated_at";

export const SUBSCRIPTION_PLAN_SELECT =
  "id, slug, name, description, price_dzd, billing_period, is_active, features, sort_order, created_at, updated_at";

export const PROFILE_OWN_SELECT =
  "id, email, full_name, avatar_url, profession, usage_mode, profile_status, onboarding_completed, onboarding_completed_at, onboarding_skipped, experience_level, region, institution, practice_context, preferences, last_seen_at, created_at, updated_at, staff_role";

export const SOURCE_PAYLOAD_SELECT =
  "source_id, payload_item_id, entity_type, sort_order, payload, warnings, review_status, visibility, activation_state";
