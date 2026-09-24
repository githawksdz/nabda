import type { NabdaDrugSectionKind } from "@/types/nabda-drug-sections";

const KEY_KIND: Record<string, NabdaDrugSectionKind> = {
  formes: "forms",
  composition: "composition",
  indications: "indications",
  posologie: "posology",
  contre_indications: "contraindications",
  mises_en_garde: "warnings",
  interactions: "interactions",
  grossesse: "pregnancy_lactation",
  conduite: "warnings",
  effets_indesirables: "adverse_effects",
  surdosage: "overdose",
  overdose: "overdose",
  pharmacodynamie: "pharmacology",
  pharmacocinetique: "pharmacology",
  securite_preclinique: "pharmacology",
  incompatibilites: "warnings",
  incom: "warnings",
  conservation: "storage",
  manipulation: "storage",
  dosi: "posology",
  instruc: "forms",
  prescription: "prescription_status",
};

const TITLE_BY_KEY: Record<string, string> = {
  formes: "Formes",
  composition: "Composition",
  indications: "Indications",
  posologie: "Posologie",
  contre_indications: "Contre-indications",
  mises_en_garde: "Mises en garde",
  interactions: "Interactions",
  grossesse: "Grossesse / allaitement",
  conduite: "Conduite",
  effets_indesirables: "Effets indésirables",
  surdosage: "Surdosage",
  overdose: "Overdose",
  pharmacodynamie: "Pharmacodynamie",
  pharmacocinetique: "Pharmacocinétique",
  securite_preclinique: "Sécurité préclinique",
  incompatibilites: "Incompatibilités",
  incom: "Incompatibilités",
  conservation: "Conservation",
  manipulation: "Manipulation",
  dosi: "Dosimétrie",
  instruc: "Instructions",
  prescription: "Prescription / délivrance",
};

export const DRUG_SECTION_KEY_ORDER = [
  "formes",
  "composition",
  "indications",
  "posologie",
  "contre_indications",
  "mises_en_garde",
  "interactions",
  "grossesse",
  "conduite",
  "effets_indesirables",
  "surdosage",
  "pharmacodynamie",
  "pharmacocinetique",
  "securite_preclinique",
  "incompatibilites",
  "incom",
  "conservation",
  "manipulation",
  "dosi",
  "instruc",
  "prescription",
] as const;

export const EXPECTED_DRUG_KEYS = [
  "formes",
  "composition",
  "indications",
  "posologie",
  "contre_indications",
  "mises_en_garde",
  "interactions",
  "grossesse",
  "effets_indesirables",
] as const;

export function isWordJunkKey(key: string): boolean {
  return /^(_hlk|_ftn|rcp_)/i.test(key) || key === "body";
}

export function classifyDrugSectionKind(sourceKey: string): {
  kind: NabdaDrugSectionKind;
  unresolved: boolean;
} {
  const key = sourceKey.trim().toLowerCase().replace(/-/g, "_");
  const mapped = KEY_KIND[key];
  if (mapped) {
    return { kind: mapped, unresolved: false };
  }
  if (key.includes("indication")) return { kind: "indications", unresolved: false };
  if (key.includes("posolog") || key.includes("posoadmin")) return { kind: "posology", unresolved: false };
  if (key.includes("contre") || key.includes("contraindic")) {
    return { kind: "contraindications", unresolved: false };
  }
  if (key.includes("garde") || key.includes("precaution") || key.includes("warning")) {
    return { kind: "warnings", unresolved: false };
  }
  if (key.includes("interaction")) return { kind: "interactions", unresolved: false };
  if (key.includes("grossesse") || key.includes("allait") || key.includes("lactat")) {
    return { kind: "pregnancy_lactation", unresolved: false };
  }
  if (key.includes("indesirable") || key.includes("adverse")) {
    return { kind: "adverse_effects", unresolved: false };
  }
  if (key.includes("surdosage") || key.includes("overdose")) return { kind: "overdose", unresolved: false };
  if (key.includes("pharmaco")) return { kind: "pharmacology", unresolved: false };
  if (key.includes("forme")) return { kind: "forms", unresolved: false };
  if (key.includes("compos") || key.includes("excipient")) return { kind: "composition", unresolved: false };
  if (key.includes("conserv") || key.includes("manipul")) return { kind: "storage", unresolved: false };
  if (key.includes("prescription") || key.includes("delivrance")) {
    return { kind: "prescription_status", unresolved: false };
  }
  if (key.includes("reference") || key.includes("source")) return { kind: "references", unresolved: false };
  return { kind: "other", unresolved: true };
}

export function titleForDrugKey(sourceKey: string, sourceHeading: string): string {
  const mapped = TITLE_BY_KEY[sourceKey];
  if (mapped) {
    return mapped;
  }
  if (sourceHeading) {
    return sourceHeading;
  }
  return sourceKey;
}

export function extractRcpBannerHeading(html: string): string {
  const bold = html.match(/<b>([A-ZÉÈÀÙÂÊÎÔÛÄËÏÖÜÇ /'-]{8,})<\/b>/);
  if (bold?.[1]) {
    return bold[1].replace(/\s+/g, " ").trim();
  }
  return "";
}
