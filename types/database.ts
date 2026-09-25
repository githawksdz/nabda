import type {
  Calculator,
  CatBlockRow,
  CatEdgeRow,
  CatMap,
  ContentCategory,
  ContentImportMetadata,
  ContentImportMetadataInsert,
  ContentReviewEvent,
  Drug,
  HomeFeedItem,
  Json,
  Protocol,
  ProtocolLinkRow,
  ProtocolReferenceRow,
  ProtocolSectionRow,
  SubscriptionPlan,
  UserSubscription,
} from "@/types/content";

type ImportMetadataKeys = keyof ContentImportMetadata;

type InsertWithImportDefaults<T, ExtraOmit extends string = never> = Omit<
  T,
  ImportMetadataKeys | ExtraOmit
> &
  ContentImportMetadataInsert;

export const PROFESSIONS = [
  "student",
  "intern",
  "resident",
  "generalist",
  "specialist",
  "dentist",
  "pharmacist",
] as const;

export const USAGE_MODES = [
  "shift",
  "consultation",
  "learning",
  "mixed",
] as const;

export const PROFILE_STATUSES = ["incomplete", "complete"] as const;

export type Profession = (typeof PROFESSIONS)[number];
export type UsageMode = (typeof USAGE_MODES)[number];
export type ProfileStatus = (typeof PROFILE_STATUSES)[number];
export type PlanSlug = "freemium" | "pro_yearly";
export type PlanStatus = "active" | "pending" | "expired" | "cancelled";
export type StaffRole = "none" | "reviewer" | "editor" | "admin";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  profession: Profession | null;
  usage_mode: UsageMode | null;
  profile_status: ProfileStatus;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  onboarding_skipped: boolean;
  plan_slug: PlanSlug | string;
  plan_status: PlanStatus | string;
  staff_role: StaffRole | string;
  experience_level: string | null;
  region: string | null;
  institution: string | null;
  practice_context: string | null;
  preferences: Json;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClinicalInterest = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type UserClinicalInterest = {
  user_id: string;
  interest_id: string;
  created_at: string;
};

export type ClinicalConsent = {
  id: string;
  user_id: string;
  consent_type: string;
  consent_version: string;
  accepted: boolean;
  accepted_at: string;
  consent_text: string;
  created_at: string;
};

export type OnboardingEventName =
  | "onboarding_started"
  | "registration_completed"
  | "login_completed"
  | "personalization_started"
  | "profession_selected"
  | "interests_selected"
  | "usage_mode_selected"
  | "clinical_consent_accepted"
  | "onboarding_completed"
  | "onboarding_skipped";

export const CLINICAL_CONSENT_TEXT =
  "Je comprends que Nabda est une aide à la décision et ne remplace pas le jugement clinique.";

export const PROFESSION_LABELS: Record<Profession, string> = {
  student: "Étudiant",
  intern: "Interne",
  resident: "Résident",
  generalist: "Généraliste",
  specialist: "Spécialiste",
  dentist: "Dentiste",
  pharmacist: "Pharmacien",
};

export const USAGE_MODE_LABELS: Record<UsageMode, string> = {
  shift: "Garde",
  consultation: "Consultation",
  learning: "Apprentissage",
  mixed: "Mixte",
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          profession?: Profession | null;
          usage_mode?: UsageMode | null;
          profile_status?: ProfileStatus;
          onboarding_completed?: boolean;
          onboarding_completed_at?: string | null;
          onboarding_skipped?: boolean;
          plan_slug?: string;
          plan_status?: string;
          staff_role?: StaffRole | string;
          experience_level?: string | null;
          region?: string | null;
          institution?: string | null;
          practice_context?: string | null;
          preferences?: Json;
          last_seen_at?: string | null;
        };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      clinical_interests: {
        Row: ClinicalInterest;
        Insert: Omit<ClinicalInterest, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ClinicalInterest, "id">>;
        Relationships: [];
      };
      user_clinical_interests: {
        Row: UserClinicalInterest;
        Insert: {
          user_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: Partial<UserClinicalInterest>;
        Relationships: [];
      };
      clinical_consents: {
        Row: ClinicalConsent;
        Insert: Omit<ClinicalConsent, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ClinicalConsent, "id">>;
        Relationships: [];
      };
      onboarding_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          event_name: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          event_name?: string;
          metadata?: Record<string, unknown>;
        };
        Relationships: [];
      };
      subscription_plans: {
        Row: SubscriptionPlan;
        Insert: Omit<SubscriptionPlan, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<SubscriptionPlan, "id">>;
        Relationships: [];
      };
      user_subscriptions: {
        Row: UserSubscription;
        Insert: Omit<UserSubscription, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserSubscription, "id" | "user_id">>;
        Relationships: [];
      };
      content_categories: {
        Row: ContentCategory;
        Insert: Omit<ContentCategory, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ContentCategory, "id">>;
        Relationships: [];
      };
      protocols: {
        Row: Protocol;
        Insert: InsertWithImportDefaults<
          Protocol,
          "id" | "created_at" | "updated_at" | "search_text"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Protocol, "id" | "search_text">>;
        Relationships: [];
      };
      cat_maps: {
        Row: CatMap;
        Insert: InsertWithImportDefaults<CatMap, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CatMap, "id">>;
        Relationships: [];
      };
      calculators: {
        Row: Calculator;
        Insert: InsertWithImportDefaults<
          Calculator,
          "id" | "created_at" | "updated_at" | "search_text"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Calculator, "id" | "search_text">>;
        Relationships: [];
      };
      drugs: {
        Row: Drug;
        Insert: InsertWithImportDefaults<
          Drug,
          "id" | "created_at" | "updated_at" | "search_text"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Drug, "id" | "search_text">>;
        Relationships: [];
      };
      home_feed_items: {
        Row: HomeFeedItem;
        Insert: InsertWithImportDefaults<
          HomeFeedItem,
          "id" | "created_at" | "updated_at" | "review_status"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          review_status?: string;
        };
        Update: Partial<Omit<HomeFeedItem, "id">>;
        Relationships: [];
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          item_type: string;
          item_slug: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          item_type: string;
          item_slug: string;
          created_at?: string;
        };
        Update: {
          item_type?: string;
          item_slug?: string;
        };
        Relationships: [];
      };
      user_history: {
        Row: {
          id: string;
          user_id: string;
          item_type: string;
          item_slug: string;
          viewed_at: string;
          metadata: Json;
        };
        Insert: {
          user_id: string;
          item_type: string;
          item_slug: string;
          viewed_at?: string;
          metadata?: Json;
        };
        Update: {
          metadata?: Json;
        };
        Relationships: [];
      };
      protocol_sections: {
        Row: ProtocolSectionRow;
        Insert: InsertWithImportDefaults<
          ProtocolSectionRow,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProtocolSectionRow, "id">>;
        Relationships: [];
      };
      protocol_references: {
        Row: ProtocolReferenceRow;
        Insert: InsertWithImportDefaults<
          ProtocolReferenceRow,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProtocolReferenceRow, "id">>;
        Relationships: [];
      };
      protocol_links: {
        Row: ProtocolLinkRow;
        Insert: InsertWithImportDefaults<ProtocolLinkRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ProtocolLinkRow, "id">>;
        Relationships: [];
      };
      cat_blocks: {
        Row: CatBlockRow;
        Insert: InsertWithImportDefaults<
          CatBlockRow,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CatBlockRow, "id">>;
        Relationships: [];
      };
      cat_edges: {
        Row: CatEdgeRow;
        Insert: InsertWithImportDefaults<
          CatEdgeRow,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CatEdgeRow, "id">>;
        Relationships: [];
      };
      content_review_events: {
        Row: ContentReviewEvent;
        Insert: Omit<ContentReviewEvent, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ContentReviewEvent, "id">>;
        Relationships: [];
      };
      search_documents: {
        Row: {
          id: string;
          entity_type: string;
          entity_slug: string;
          entity_source_id: string | null;
          content_type: string;
          content_id: string;
          content_order: number;
          title: string;
          subtitle: string | null;
          snippet: string | null;
          searchable_text: string;
          route_href: string;
          section_anchor: string | null;
          category_slug: string | null;
          tags: string[];
          priority: number;
          visibility: string;
          review_status: string;
          activation_state: string;
          imported_from: string;
          source_trace: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_slug: string;
          entity_source_id?: string | null;
          content_type: string;
          content_id: string;
          content_order?: number;
          title: string;
          subtitle?: string | null;
          snippet?: string | null;
          searchable_text: string;
          route_href: string;
          section_anchor?: string | null;
          category_slug?: string | null;
          tags?: string[];
          priority?: number;
          visibility?: string;
          review_status?: string;
          activation_state?: string;
          imported_from?: string;
          source_trace?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          subtitle?: string | null;
          snippet?: string | null;
          searchable_text?: string;
          route_href?: string;
          section_anchor?: string | null;
          category_slug?: string | null;
          tags?: string[];
          priority?: number;
          visibility?: string;
          review_status?: string;
          activation_state?: string;
          source_trace?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_packs: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          version: number;
          visibility: string;
          status: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          version?: number;
          visibility?: string;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          title?: string;
          description?: string | null;
          version?: number;
          visibility?: string;
          status?: string;
          published_at?: string | null;
        };
        Relationships: [];
      };
      content_pack_items: {
        Row: {
          pack_id: string;
          content_type: string;
          content_slug: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          pack_id: string;
          content_type: string;
          content_slug: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "content_pack_items_pack_id_fkey";
            columns: ["pack_id"];
            isOneToOne: false;
            referencedRelation: "content_packs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      catalog_protocols: { Row: Record<string, unknown>; Relationships: [] };
      catalog_cat_maps: { Row: Record<string, unknown>; Relationships: [] };
      catalog_calculators: { Row: Record<string, unknown>; Relationships: [] };
      catalog_drugs: { Row: Record<string, unknown>; Relationships: [] };
      public_source_protocol_sections: { Row: Record<string, unknown>; Relationships: [] };
      public_source_cat_steps: { Row: Record<string, unknown>; Relationships: [] };
      public_source_drug_sections: { Row: Record<string, unknown>; Relationships: [] };
      public_source_drug_tables: { Row: Record<string, unknown>; Relationships: [] };
      public_source_calculator_profiles: { Row: Record<string, unknown>; Relationships: [] };
    };
    Functions: {
      has_active_pro: { Args: Record<string, never>; Returns: boolean };
      has_staff_access: { Args: Record<string, never>; Returns: boolean };
      parent_is_published: {
        Args: { p_entity_type: string; p_entity_slug: string };
        Returns: boolean;
      };
      parent_is_publicly_readable: {
        Args: { p_entity_type: string; p_entity_slug: string };
        Returns: boolean;
      };
      content_row_visible: {
        Args: { p_visibility: string; p_status: string; p_review_status?: string };
        Returns: boolean;
      };
      set_user_entitlement: {
        Args: {
          p_user_id: string;
          p_plan_slug: string;
          p_status?: string;
          p_ends_at?: string | null;
          p_source?: string;
        };
        Returns: string;
      };
      set_staff_role: {
        Args: { p_user_id: string; p_staff_role: string };
        Returns: undefined;
      };
      set_offline_available: {
        Args: { p_content_type: string; p_content_slug: string; p_available: boolean };
        Returns: undefined;
      };
      has_staff_editor: { Args: Record<string, never>; Returns: boolean };
      staff_set_offline_available: {
        Args: { p_content_type: string; p_content_slug: string; p_available: boolean };
        Returns: undefined;
      };
      staff_upsert_content_pack: {
        Args: {
          p_id: string | null;
          p_slug: string;
          p_title: string;
          p_description: string | null;
          p_visibility: string;
          p_version: number;
        };
        Returns: string;
      };
      staff_replace_pack_items: {
        Args: { p_pack_id: string; p_items: Json };
        Returns: undefined;
      };
      staff_set_pack_status: {
        Args: { p_pack_id: string; p_status: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
