export type ContentCardType = "protocol" | "drug" | "calculator";

export type SpecialtyCardConfig = {
  label: string;
  accent: string;
  chipClass: string;
};

function chipFrom(accent: string) {
  return `border-[color-mix(in_srgb,${accent}_28%,transparent)] bg-[color-mix(in_srgb,${accent}_12%,var(--surface-elevated))] text-[color-mix(in_srgb,${accent}_78%,var(--text-primary))]`;
}

function specialty(label: string, accent: string): SpecialtyCardConfig {
  return { label, accent, chipClass: chipFrom(accent) };
}

const NEUTRAL_SPECIALTY: SpecialtyCardConfig = specialty(
  "Clinique",
  "var(--specialty-neutral)",
);

const SPECIALTIES: Record<string, SpecialtyCardConfig> = {
  cardiologie: specialty("Cardiologie", "var(--specialty-cardiologie)"),
  pneumologie: specialty("Pneumologie", "var(--specialty-pneumologie)"),
  neurologie: specialty("Neurologie", "var(--specialty-neurologie)"),
  endocrinologie: specialty("Endocrinologie", "var(--specialty-endocrinologie)"),
  endocrino_diabetologie: specialty(
    "Diabétologie",
    "var(--specialty-endocrinologie)",
  ),
  urgences: specialty("Urgences", "var(--specialty-urgences)"),
  reanimation: specialty("Réanimation", "var(--specialty-urgences)"),
  gastro_enterologie: specialty(
    "Gastro-entérologie",
    "var(--specialty-gastro)",
  ),
  infectiologie: specialty("Infectiologie", "var(--specialty-infectiologie)"),
  pediatrie: specialty("Pédiatrie", "var(--specialty-pediatrie)"),
  nephrologie: specialty("Néphrologie", "var(--specialty-nephrologie)"),
  gyneco_obstetrique: specialty(
    "Gynéco-obstétrique",
    "var(--specialty-obstetrique)",
  ),
  obstetrique: specialty("Obstétrique", "var(--specialty-obstetrique)"),
  hematologie: specialty("Hématologie", "var(--specialty-hematologie)"),
  dermatologie: specialty("Dermatologie", "var(--specialty-dermatologie)"),
  oncologie: specialty("Oncologie", "var(--specialty-oncologie)"),
  rhumatologie: specialty("Rhumatologie", "var(--specialty-rhumatologie)"),
  ophtalmologie: specialty("Ophtalmologie", "var(--specialty-ophtalmologie)"),
  psychiatrie: specialty("Psychiatrie", "var(--specialty-psychiatrie)"),
  geriatrie: specialty("Gériatrie", "var(--specialty-geriatrie)"),
  allergologie: specialty("Allergologie", "var(--specialty-allergologie)"),
  orl: specialty("ORL", "var(--specialty-orl)"),
  urologie: specialty("Urologie", "var(--specialty-urologie)"),
  chirurgie: specialty("Chirurgie", "var(--specialty-chirurgie)"),
  anesthesie: specialty("Anesthésie", "var(--specialty-anesthesie)"),
  dietetique: specialty("Diététique", "var(--specialty-dietetique)"),
  medecine_generale: specialty("Médecine générale", "var(--specialty-neutral)"),
  prevention_suivi: specialty("Prévention / Suivi", "var(--specialty-neutral)"),
  reeducation: specialty("Rééducation", "var(--specialty-neutral)"),
  medicaments: specialty("Médicaments", "var(--specialty-neutral)"),
  scores: specialty("Scores", "var(--specialty-neutral)"),
};

const CONTENT_TYPE_LABEL: Record<ContentCardType, string> = {
  protocol: "Protocole",
  drug: "Médicament",
  calculator: "Score",
};

export function specialtyConfig(slug?: string | null): SpecialtyCardConfig | null {
  if (!slug) return null;
  return SPECIALTIES[slug] ?? {
    ...NEUTRAL_SPECIALTY,
    label: slug.replaceAll("_", " "),
  };
}

export function specialtyConfigs(slugs: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const out: SpecialtyCardConfig[] = [];
  for (const slug of slugs) {
    if (!slug || seen.has(slug)) continue;
    const config = specialtyConfig(slug);
    if (!config) continue;
    seen.add(slug);
    out.push(config);
    if (out.length >= 2) break;
  }
  return out;
}

export function contentTypeLabel(type: ContentCardType) {
  return CONTENT_TYPE_LABEL[type];
}

export { NEUTRAL_SPECIALTY };
