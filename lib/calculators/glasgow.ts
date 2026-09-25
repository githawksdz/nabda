import {
  additiveScore,
  clampScore,
  formatScoreFraction,
} from "./calculator-engine";
import type {
  GlasgowAxis,
  GlasgowInterpretation,
  GlasgowOption,
  GlasgowSelection,
  LinkedCalculatorResource,
} from "@/types/calculators";

// Demo placeholder only — replace with validated source data before production.
// Local Glasgow engine; formula_json from the database is not executed here.

export const GLASGOW_MAX = 15;

export const GLASGOW_DEFAULT_SELECTION: GlasgowSelection = {
  eyes: 4,
  verbal: 5,
  motor: 6,
};

export const GLASGOW_SAFETY_NOTE =
  "Résultat à interpréter selon l'examen clinique complet et l'évolution.";

export const GLASGOW_IDENTITY = {
  headerTitle: "Score de Glasgow",
  eyebrow: "Score neurologique",
  title: "Glasgow (GCS)",
  subtitle: "Évaluation du niveau de conscience.",
} as const;

export const GLASGOW_EYE_OPTIONS: GlasgowOption[] = [
  { value: 1, label: "Nulle", ariaLabel: "1, aucune ouverture des yeux" },
  { value: 2, label: "Douleur", ariaLabel: "2, ouverture des yeux à la douleur" },
  { value: 3, label: "Bruit", ariaLabel: "3, ouverture des yeux au bruit" },
  { value: 4, label: "Spontanée", ariaLabel: "4, ouverture des yeux spontanée" },
];

export const GLASGOW_VERBAL_OPTIONS: GlasgowOption[] = [
  { value: 1, label: "Nulle", ariaLabel: "1, aucune réponse verbale" },
  { value: 2, label: "Incompr.", ariaLabel: "2, réponse verbale incompréhensible" },
  { value: 3, label: "Inapprop.", ariaLabel: "3, réponse verbale inappropriée" },
  { value: 4, label: "Confuse", ariaLabel: "4, réponse verbale confuse" },
  { value: 5, label: "Orientée", ariaLabel: "5, réponse verbale orientée" },
];

export const GLASGOW_MOTOR_OPTIONS: GlasgowOption[] = [
  { value: 1, label: "Nulle", ariaLabel: "1, aucune réponse motrice" },
  { value: 2, label: "Extens.", ariaLabel: "2, extension" },
  { value: 3, label: "Flexion", ariaLabel: "3, flexion" },
  { value: 4, label: "Évitem.", ariaLabel: "4, évitement" },
  { value: 5, label: "Localise", ariaLabel: "5, localise" },
  { value: 6, label: "Ordres", ariaLabel: "6, obéit aux ordres" },
];

export const GLASGOW_GROUPS: {
  axis: GlasgowAxis;
  formulaKey: "E" | "V" | "M";
  label: string;
  max: number;
  options: GlasgowOption[];
}[] = [
  {
    axis: "eyes",
    formulaKey: "E",
    label: "Ouverture des yeux (Y)",
    max: 4,
    options: GLASGOW_EYE_OPTIONS,
  },
  {
    axis: "verbal",
    formulaKey: "V",
    label: "Réponse verbale (V)",
    max: 5,
    options: GLASGOW_VERBAL_OPTIONS,
  },
  {
    axis: "motor",
    formulaKey: "M",
    label: "Réponse motrice (M)",
    max: 6,
    options: GLASGOW_MOTOR_OPTIONS,
  },
];

export const GLASGOW_LINKED_RESOURCES: LinkedCalculatorResource[] = [
  {
    id: "cat-coma",
    title: "CAT Coma & Glasgow < 8",
    subtitle: "Consulter la CAT liée selon le contexte clinique.",
    href: "/cat/coma-glasgow-inferieur-8",
    kind: "cat",
  },
  {
    id: "protocol-tc",
    title: "Protocole traumatisme crânien",
    subtitle: "À interpréter avec l'examen clinique complet.",
    href: "/protocols/traumatisme-cranien",
    kind: "protocol",
  },
];

export function normalizeGlasgowSelection(
  selection: GlasgowSelection,
): GlasgowSelection {
  return {
    eyes: clampScore(selection.eyes, 1, 4),
    verbal: clampScore(selection.verbal, 1, 5),
    motor: clampScore(selection.motor, 1, 6),
  };
}

export function glasgowFormula(selection: GlasgowSelection): string {
  const normalized = normalizeGlasgowSelection(selection);
  return `E${normalized.eyes} V${normalized.verbal} M${normalized.motor}`;
}

export function interpretGlasgow(
  selection: GlasgowSelection,
): GlasgowInterpretation {
  const normalized = normalizeGlasgowSelection(selection);
  const total = additiveScore([
    normalized.eyes,
    normalized.verbal,
    normalized.motor,
  ]);

  let label = "Conscience normale";
  let note = "À interpréter avec l'examen clinique complet.";
  let severity: GlasgowInterpretation["severity"] = "normal";

  if (total <= 8) {
    label = "Altération sévère";
    note = "Situation à évaluer en urgence selon le contexte clinique.";
    severity = "severe";
  } else if (total <= 12) {
    label = "Altération modérée";
    note = "Surveillance rapprochée et avis médical selon contexte.";
    severity = "moderate";
  } else if (total <= 14) {
    label = "Altération légère";
    note = "Réévaluation clinique et surveillance selon contexte.";
    severity = "mild";
  }

  return {
    total,
    max: GLASGOW_MAX,
    fraction: formatScoreFraction(total, GLASGOW_MAX),
    formula: glasgowFormula(normalized),
    label,
    note,
    safety: GLASGOW_SAFETY_NOTE,
    severity,
  };
}

export function glasgowCopyText(interpretation: GlasgowInterpretation): string {
  return [
    `Score de Glasgow: ${interpretation.fraction}`,
    `Formule: ${interpretation.formula}`,
    interpretation.label,
    interpretation.safety,
  ].join("\n");
}
