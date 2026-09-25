export type CatCategorySlug =
  | "all"
  | "urgences"
  | "cardiologie"
  | "pediatrie"
  | "infectiologie"
  | "pneumologie"
  | "neurologie"
  | "digestif"
  | "dermatologie";

export type CatIndexState = "general" | "urgences" | "preparation";

export type CatSubFilter = "all" | "redflags" | "sauv" | "ped";

export type CatCard = {
  id: string;
  slug: string;
  title: string;
  categoryLabel: string;
  specialtyLabel?: string;
  timeLabel?: string;
  statusLabel?: string;
  sourceLabel?: string;
  urgency?: "routine" | "priority" | "urgent" | "vital";
  iconName?: string;
  href: string;
  subFilter?: CatSubFilter;
  meta?: string;
};

export type CatUpdate = {
  id: string;
  slug: string;
  title: string;
  meta: string;
  statusLabel?: string;
  href: string;
};

export type CatContext = {
  slug: CatCategorySlug;
  label: string;
  count?: number;
  iconName: string;
  href: string;
};

export type CatFilterChip = {
  id: CatCategorySlug;
  label: string;
  count?: number;
  showPulseDot?: boolean;
};

export type CatEmergencyFilter = {
  id: CatSubFilter;
  label: string;
  alert?: boolean;
};

export type CatConnectedModule = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  iconName: string;
};

export type CatUpcomingTree = {
  id: string;
  label: string;
  iconName: string;
};
