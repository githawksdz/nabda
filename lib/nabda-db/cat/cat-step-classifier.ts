import type { NabdaCatStepKind } from "@/types/nabda-cat-steps";

export function normalizeStepHeading(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const RULES: Array<{ test: (key: string) => boolean; kind: NabdaCatStepKind }> = [
  {
    test: (key) =>
      key.includes("signes de gravite") ||
      key.includes("samu") ||
      key.includes("appeler le 15") ||
      key.includes("detresse") ||
      key.includes("etat de choc") ||
      key.includes("choc anaphylactique"),
    kind: "red_flag",
  },
  {
    test: (key) =>
      key.includes("examen") ||
      key.includes("bilan") ||
      key.includes("imagerie") ||
      key.includes("biologie"),
    kind: "workup",
  },
  {
    test: (key) =>
      key.includes("diagnostic") ||
      key.includes("confirmer") ||
      key.includes("eliminer"),
    kind: "diagnostic_check",
  },
  {
    test: (key) =>
      key.includes("score") ||
      key.includes("calculateur") ||
      key.includes("glasgow") ||
      key.includes("cockcroft") ||
      key.includes("wells") ||
      key.includes("clairance") ||
      /\bimc\b/.test(key),
    kind: "calculator",
  },
  {
    test: (key) =>
      key.includes("orientation") ||
      key.includes("hospitalisation") ||
      key.includes("avis specialise") ||
      key.includes("transfert") ||
      key.includes("adresser") ||
      key.includes("retour a domicile"),
    kind: "orientation",
  },
  {
    test: (key) =>
      key.includes("surveillance") ||
      key.includes("suivi") ||
      key.includes("controle") ||
      key.includes("evaluation de l efficacite") ||
      key.includes("evaluation de l'efficacite"),
    kind: "monitoring",
  },
  {
    test: (key) =>
      key.includes("enfant") ||
      key.includes("grossesse") ||
      key.includes("insuffisance renale") ||
      key.includes("sujet age") ||
      key.includes("personne agee") ||
      key.includes("cas particulier"),
    kind: "special_population",
  },
  {
    test: (key) =>
      key.includes("posologie") ||
      key.includes("antibiotherapie") ||
      key.includes("traitement medicamenteux") ||
      key.includes("medicament"),
    kind: "medication",
  },
  {
    test: (key) => key.includes("traitement") || key.includes("therapeutique"),
    kind: "treatment",
  },
  {
    test: (key) =>
      key.includes("prise en charge") ||
      key.includes("conduite a tenir") ||
      key.includes("premieres mesures"),
    kind: "management",
  },
  {
    test: (key) =>
      key.includes("urgence") ||
      key.includes("severite") ||
      key.includes("triage") ||
      key.includes("recherche de signes"),
    kind: "severity_check",
  },
  {
    test: (key) =>
      key.includes("entree") ||
      key.includes("contexte") ||
      key.includes("patient concerne") ||
      key.includes("quels patients") ||
      key.includes("evaluation initiale"),
    kind: "entry",
  },
  {
    test: (key) => key.includes("reference") || key.includes("source"),
    kind: "source",
  },
];

export function classifyCatStepKind(input: {
  title: string;
  text: string;
}): { kind: NabdaCatStepKind; unresolved: boolean } {
  const key = normalizeStepHeading(`${input.title} ${input.text.slice(0, 280)}`);
  for (const rule of RULES) {
    if (rule.test(key)) {
      return { kind: rule.kind, unresolved: false };
    }
  }
  return { kind: "other", unresolved: true };
}
