import type {
  ContentVisibility,
  EditorialReviewStatus,
  Protocol as DbProtocol,
} from "@/types/content";
import type { CatFlowchartMap } from "@/types/cat-flowchart";

export type PublicationStatus =
  | "draft"
  | "imported"
  | "cleaned"
  | "ready_for_editorial_review"
  | "needs_medical_review"
  | "needs_local_adaptation"
  | "published"
  | "hidden"
  | "archived";

export type ReviewStatus =
  | EditorialReviewStatus
  | "pharmacist_reviewed"
  | "published";

export type VisibilityStatus = ContentVisibility | "stub";

export type LocalAdaptationStatus =
  | "pending"
  | "in_progress"
  | "to_verify"
  | "adapted";

export type ContentTypeLabel = "Recommandation" | "CAT";

export type ProtocolViewMode = "overview" | "section" | "preparation" | "missing";

export type LinkedContentType =
  | "cat"
  | "calculator"
  | "drug"
  | "protocol"
  | "reference";

export type TimelineStatus = "created" | "in_progress" | "upcoming" | "pending";

export type CalloutVariant = "clinical" | "warning";

export type MentionType =
  | "drug_mention"
  | "calculator_mention"
  | "protocol_mention"
  | "reference_mention";

/**
 * Future-facing protocol record for detail pages.
 * Extra optional fields keep this compatible with `types/content` Protocol rows.
 */
export type Protocol = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string | null;
  categories: string[];
  tags: string[];
  audiences: string[];
  urgency: string;
  status: PublicationStatus | string;
  visibility: VisibilityStatus | string;
  review_status: ReviewStatus | string;
  local_adaptation_status: LocalAdaptationStatus | string;
  has_full_recommendation: boolean;
  has_cat: boolean;
  has_drug_links: boolean;
  has_calculator_links: boolean;
  short_title?: string | null;
  category_slug?: string | null;
  content_type?: DbProtocol["content_type"];
  is_featured?: boolean;
  published_at?: string | null;
  source_note?: string | null;
  search_text?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProtocolArticle = {
  id: string;
  protocol_id: string;
  reading_time_minutes: number;
  section_count: number;
  intro?: string;
  metric?: {
    value: string;
    label: string;
    caption: string;
  };
};

export type ParagraphBlock = {
  id: string;
  type: "paragraph";
  text: string;
};

export type HeadingBlock = {
  id: string;
  type: "heading";
  level: 2 | 3 | 4;
  text: string;
};

export type BulletListBlock = {
  id: string;
  type: "bullet_list";
  items: string[];
};

export type NumberedListBlock = {
  id: string;
  type: "numbered_list";
  items: string[];
};

export type CalloutBlock = {
  id: string;
  type: "callout";
  variant: CalloutVariant;
  title?: string;
  body: string;
};

export type TableBlock = {
  id: string;
  type: "table";
  caption?: string;
  headers: string[];
  rows: string[][];
};

export type MentionBlock = {
  id: string;
  type: MentionType;
  label: string;
  href: string;
  subtitle?: string;
};

export type RichContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | BulletListBlock
  | NumberedListBlock
  | CalloutBlock
  | TableBlock
  | MentionBlock;

export type RichContentDocument = {
  blocks: RichContentBlock[];
};

export type ProtocolSection = {
  id: string;
  protocol_id: string;
  slug: string;
  title: string;
  short_title?: string;
  nav_label: string;
  summary?: string;
  order: number;
  tags?: string[];
  reading_time_minutes?: number;
  show_in_cards?: boolean;
  card_index?: string;
  content: RichContentDocument;
};

export type Reference = {
  id: string;
  title: string;
  citation?: string;
  year?: string | null;
  url?: string | null;
  note?: string;
  review_status?: string;
};

export type LinkedContentItem = {
  id: string;
  type: LinkedContentType;
  title: string;
  subtitle?: string;
  href: string;
};

export type EditorialTimelineItem = {
  id: string;
  title: string;
  status: TimelineStatus;
};

export type ProtocolKeyPoint = {
  id: string;
  text: string;
};

export type SectionNavItem = {
  slug: string | null;
  label: string;
};

export type ProtocolDetail = {
  protocol: Protocol;
  article: ProtocolArticle;
  sections: ProtocolSection[];
  key_points: ProtocolKeyPoint[];
  linked_content: LinkedContentItem[];
  references: Reference[];
  timeline: EditorialTimelineItem[];
  available_summary?: string;
};

export type CatTab = "carte" | "etapes" | "notes" | "sources";

export type CatDetailViewMode = "tabs" | "preparation" | "missing";

export type CatBlockType =
  | "start"
  | "decision"
  | "action"
  | "emergency"
  | "outcome"
  | "cluster"
  | "loop";

/**
 * Future-facing CAT map for detail pages.
 * Extra optional fields keep this compatible with `types/content` CatMap rows.
 * `blocks` / `edges` stay empty in Prompt 2; the canvas is Prompt 3.
 */
export type CatMap = {
  id: string;
  protocol_id?: string | null;
  slug: string;
  title: string;
  subtitle?: string;
  short_title?: string;
  summary?: string | null;
  status: PublicationStatus | string;
  review_status: ReviewStatus | string;
  visibility: VisibilityStatus | string;
  local_adaptation_status?: LocalAdaptationStatus | string;
  rendering_mode?:
    | "static_clinical_map"
    | "semi_static_expandable_map"
    | "table_based_cat"
    | "checklist_map"
    | string;
  safety_note?: string;
  categories: string[];
  tags?: string[];
  blocks: CatBlock[];
  edges: CatEdge[];
  tables?: CatTable[];
  map_json?: unknown;
  is_featured?: boolean;
  published_at?: string | null;
  source_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CatBlock = {
  id: string;
  type: CatBlockType | string;
  title: string;
  subtitle?: string;
  x?: number;
  y?: number;
};

export type CatEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  relationship?: "branch" | "visual_flow" | "convergence" | "loop" | "reference_link";
  variant?: "default" | "emergency" | "muted" | "dashed";
};

export type CatTable = {
  id: string;
  caption?: string;
  headers: string[];
  rows: string[][];
};

export type CatStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  chips?: string[];
  branchNote?: string;
  linkedTool?: LinkedContentItem;
};

export type CatRedFlag = {
  id: string;
  label: string;
};

export type CatDetail = {
  map: CatMap;
  steps: CatStep[];
  red_flags: CatRedFlag[];
  linked_tools: LinkedContentItem[];
  linked_protocols?: LinkedContentItem[];
  linked_drugs?: LinkedContentItem[];
  references: Reference[];
  timeline: EditorialTimelineItem[];
  /** Non-empty graph for the carte tab. Null → preparation panel. */
  flowchart?: CatFlowchartMap | null;
};
