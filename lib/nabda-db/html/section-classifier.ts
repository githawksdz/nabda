import type { NabdaProtocolSectionKind } from "@/types/nabda-protocol-sections";

export function normalizeHeading(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const HEADING_KIND: Array<{ test: (key: string) => boolean; kind: NabdaProtocolSectionKind }> = [
  {
    test: (key) =>
      key.includes("signes de gravite") ||
      key === "urgence" ||
      key.includes("samu") ||
      key.includes("appeler le 15"),
    kind: "red_flags",
  },
  {
    test: (key) =>
      key.includes("objectifs") ||
      key.includes("quels patients traiter"),
    kind: "objectives",
  },
  {
    test: (key) =>
      key.includes("medicaments cites") ||
      key.includes("medicaments non cites"),
    kind: "medications_cited",
  },
  {
    test: (key) =>
      key.includes("examens complementaires") ||
      key === "examens" ||
      key.includes("bilan complementaire"),
    kind: "workup",
  },
  {
    test: (key) => key.includes("diagnostic"),
    kind: "diagnosis",
  },
  {
    test: (key) =>
      key.includes("orientation") ||
      key.includes("adresser") ||
      key.includes("hospitalisation") ||
      key.includes("transfert"),
    kind: "orientation",
  },
  {
    test: (key) =>
      key.includes("posologie") ||
      key.startsWith("dose ") ||
      key === "doses" ||
      key.includes("schema posologique"),
    kind: "dosage",
  },
  {
    test: (key) => key === "traitements" || key.startsWith("traitements "),
    kind: "treatment",
  },
  {
    test: (key) => key.includes("prise en charge"),
    kind: "management",
  },
  {
    test: (key) =>
      key.includes("suivi") ||
      key.includes("surveillance") ||
      key.includes("adaptation du traitement"),
    kind: "monitoring",
  },
  {
    test: (key) => key.includes("cas particuliers"),
    kind: "special_population",
  },
  {
    test: (key) => key.includes("conseils"),
    kind: "advice",
  },
  {
    test: (key) => key.includes("references") || key.includes("sources"),
    kind: "references",
  },
  {
    test: (key) =>
      key === "la maladie" ||
      key.includes("physiopathologie") ||
      key.includes("epidemiologie"),
    kind: "disease_overview",
  },
  {
    test: (key) =>
      key === "a savoir" ||
      key === "contexte" ||
      key === "introduction" ||
      key === "generalites" ||
      key.startsWith("annexe"),
    kind: "summary",
  },
  {
    test: (key) => key.includes("complication"),
    kind: "diagnosis",
  },
];

const CLASS_KIND: Record<string, NabdaProtocolSectionKind> = {
  maladie: "disease_overview",
  intro: "summary",
  physio: "disease_overview",
  epidemio: "disease_overview",
  complic: "diagnosis",
  diagnos: "diagnosis",
  patient: "objectives",
  objectif: "objectives",
  pcharge: "management",
  caspart: "special_population",
  surv: "monitoring",
  conseil: "advice",
  trait: "treatment",
  medcite: "medications_cited",
  medncite: "medications_cited",
  sources: "references",
};

const PROMOTED_CLASSES = new Set([
  "maladie",
  "physio",
  "epidemio",
  "complic",
  "diagnos",
  "patient",
  "objectif",
  "pcharge",
  "caspart",
  "surv",
  "conseil",
  "trait",
  "medcite",
  "medncite",
  "sources",
]);

const NESTED_CHIP_CLASSES = new Set([
  "classmed",
  "cas",
  "sclass",
  "desmed",
  "lstmed",
  "lstdci",
  "spe",
  "protocoles",
  "protocole",
]);

export function isPromotedSectionClass(className: string): boolean {
  return PROMOTED_CLASSES.has(className);
}

export function isNestedChipClass(className: string): boolean {
  return NESTED_CHIP_CLASSES.has(className);
}

export function classifyProtocolSectionKind(input: {
  title: string;
  className: string;
}): { kind: NabdaProtocolSectionKind; unresolved: boolean } {
  const key = normalizeHeading(input.title);
  for (const rule of HEADING_KIND) {
    if (rule.test(key)) {
      return { kind: rule.kind, unresolved: false };
    }
  }
  const fromClass = CLASS_KIND[input.className];
  if (fromClass) {
    return { kind: fromClass, unresolved: !key };
  }
  return { kind: "other", unresolved: true };
}
