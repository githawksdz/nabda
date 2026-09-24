import { parseNumericInput, roundTo } from "./calculator-engine";
import type {
  BiologicalSex,
  CockcroftBand,
  CockcroftFormValues,
  CockcroftResult,
  CreatinineUnit,
  LinkedCalculatorResource,
} from "@/types/calculators";

// Demo placeholder only — replace with validated source data before production.
// Local Cockcroft engine; formula_json from the database is not executed here.

export const COCKCROFT_FORMULA_TITLE = "Cockcroft & Gault";
export const COCKCROFT_FORMULA_LINE =
  "ClCr = [(140 − Âge) × Poids × k] / Créatinine";
export const COCKCROFT_FORMULA_NOTE =
  "k = 1.23 homme · 1.04 femme · créatinine en µmol/L";

export const COCKCROFT_IDENTITY = {
  headerTitle: "Cockcroft-Gault",
  eyebrow: "Formule",
  title: "Cockcroft-Gault",
  subtitle: "Estimation de la clairance de la créatinine.",
} as const;

export const COCKCROFT_K_MALE = 1.23;
export const COCKCROFT_K_FEMALE = 1.04;
export const MG_DL_TO_UMOL_L = 88.4;

export const COCKCROFT_AGE_MIN = 18;
export const COCKCROFT_AGE_MAX = 120;
export const COCKCROFT_WEIGHT_MIN = 20;
export const COCKCROFT_WEIGHT_MAX = 250;
export const COCKCROFT_CREAT_UMOL_MIN = 20;
export const COCKCROFT_CREAT_UMOL_MAX = 2000;

export const COCKCROFT_SAFETY_NOTE =
  "Résultat à interpréter selon le contexte clinique, le poids utilisé et la stabilité de la fonction rénale.";

export const COCKCROFT_DISCLAIMER =
  "Aide au calcul uniquement. Cette formule ne prescrit pas d'adaptation posologique et ne remplace pas le jugement clinique, les protocoles locaux, ni la vérification des sources validées.";

export const COCKCROFT_EMPTY_VALUES: CockcroftFormValues = {
  sex: null,
  age: "",
  weight: "",
  creatinine: "",
  unit: "umol_l",
};

export const COCKCROFT_EXAMPLES: {
  id: string;
  label: string;
  values: CockcroftFormValues;
}[] = [
  {
    id: "example-a",
    label: "Exemple A",
    values: {
      sex: "male",
      age: "65",
      weight: "70",
      creatinine: "90",
      unit: "umol_l",
    },
  },
  {
    id: "example-b",
    label: "Exemple B",
    values: {
      sex: "female",
      age: "80",
      weight: "55",
      creatinine: "110",
      unit: "umol_l",
    },
  },
];

export const COCKCROFT_LINKED_RESOURCES: LinkedCalculatorResource[] = [
  {
    id: "dosing",
    title: "Adaptation posologique",
    subtitle: "En préparation — pas de posologie automatique.",
    kind: "coming_soon",
    disabled: true,
  },
  {
    id: "cat-ir",
    title: "CAT insuffisance rénale",
    subtitle: "Consulter selon le contexte clinique.",
    href: "/cat/insuffisance-renale",
    kind: "cat",
  },
  {
    id: "ckd-epi",
    title: "Comparer avec CKD-EPI",
    subtitle: "Futur outil",
    kind: "coming_soon",
    disabled: true,
  },
];

export function kForSex(sex: BiologicalSex): number {
  return sex === "male" ? COCKCROFT_K_MALE : COCKCROFT_K_FEMALE;
}

export function creatinineToUmolL(
  value: number,
  unit: CreatinineUnit,
): number {
  return unit === "mg_dl" ? value * MG_DL_TO_UMOL_L : value;
}

export function creatinineFromUmolL(
  umolL: number,
  unit: CreatinineUnit,
): number {
  return unit === "mg_dl" ? umolL / MG_DL_TO_UMOL_L : umolL;
}

export function convertCreatinineDisplay(
  value: string,
  from: CreatinineUnit,
  to: CreatinineUnit,
): string {
  if (from === to) {
    return value;
  }
  const parsed = parseNumericInput(value);
  if (parsed == null) {
    return "";
  }
  const umolL = creatinineToUmolL(parsed, from);
  const converted = creatinineFromUmolL(umolL, to);
  if (to === "mg_dl") {
    return roundTo(converted, 2).toFixed(2);
  }
  return String(roundTo(converted, 0));
}

export function formatClearance(value: number): string {
  const rounded = roundTo(value, 1);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function cockcroftBand(clcr: number | null): CockcroftBand {
  if (clcr == null) {
    return "unknown";
  }
  if (clcr < 15) {
    return "lt15";
  }
  if (clcr < 30) {
    return "15_30";
  }
  if (clcr < 60) {
    return "30_60";
  }
  if (clcr < 90) {
    return "60_90";
  }
  return "gte90";
}

export function computeCockcroft(
  values: CockcroftFormValues,
): CockcroftResult {
  const age = parseNumericInput(values.age);
  const weight = parseNumericInput(values.weight);
  const creatinine = parseNumericInput(values.creatinine);

  if (values.sex == null || age == null || weight == null || creatinine == null) {
    return {
      valid: false,
      clcr: null,
      display: "--",
      k: values.sex ? kForSex(values.sex) : null,
      creatinineUmolL: null,
      band: "unknown",
      rangeError: false,
    };
  }

  const creatinineUmolL = creatinineToUmolL(creatinine, values.unit);
  const rangeError =
    age < COCKCROFT_AGE_MIN ||
    age > COCKCROFT_AGE_MAX ||
    weight < COCKCROFT_WEIGHT_MIN ||
    weight > COCKCROFT_WEIGHT_MAX ||
    creatinineUmolL < COCKCROFT_CREAT_UMOL_MIN ||
    creatinineUmolL > COCKCROFT_CREAT_UMOL_MAX ||
    creatinineUmolL <= 0;

  if (rangeError) {
    return {
      valid: false,
      clcr: null,
      display: "--",
      k: kForSex(values.sex),
      creatinineUmolL: roundTo(creatinineUmolL, 1),
      band: "unknown",
      rangeError: true,
    };
  }

  const k = kForSex(values.sex);
  const clcr = ((140 - age) * weight * k) / creatinineUmolL;
  const rounded = roundTo(clcr, 1);

  return {
    valid: true,
    clcr: rounded,
    display: formatClearance(rounded),
    k,
    creatinineUmolL: roundTo(creatinineUmolL, 1),
    band: cockcroftBand(rounded),
    rangeError: false,
  };
}

export function cockcroftCopyText(
  values: CockcroftFormValues,
  result: CockcroftResult,
): string {
  const sexLabel =
    values.sex === "male"
      ? "Homme"
      : values.sex === "female"
        ? "Femme"
        : "non renseigné";
  const unitLabel = values.unit === "mg_dl" ? "mg/dL" : "µmol/L";
  const creatinineLabel = values.creatinine.trim()
    ? `${values.creatinine} ${unitLabel}`
    : `-- ${unitLabel}`;

  return [
    `Clairance Cockcroft-Gault: ${result.display} mL/min`,
    `Paramètres: ${sexLabel}, ${values.age || "--"} ans, ${values.weight || "--"} kg, ${creatinineLabel}`,
    COCKCROFT_SAFETY_NOTE,
  ].join("\n");
}
