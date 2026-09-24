import type {
  NabdaDrugDetailTab,
  NabdaDrugLocalGroup,
  NabdaDrugPharmacistGroup,
  NabdaDrugSectionDisplay,
  NabdaDrugSectionKind,
  NabdaDrugSectionPriority,
} from "@/types/nabda-drug-sections";

export type DrugDisplayInput = {
  kind: NabdaDrugSectionKind;
  textLength: number;
  containsTable: boolean;
  containsNestedTable: boolean;
  containsRenalHepatic: boolean;
  containsFranceSpecificPrescription: boolean;
  recommendedTableDisplay?: NabdaDrugSectionDisplay;
};

export function classifyDrugPriority(kind: NabdaDrugSectionKind): NabdaDrugSectionPriority {
  if (
    kind === "contraindications" ||
    kind === "warnings" ||
    kind === "interactions" ||
    kind === "pregnancy_lactation" ||
    kind === "overdose"
  ) {
    return "critical";
  }
  if (kind === "posology" || kind === "indications" || kind === "composition" || kind === "forms") {
    return "normal";
  }
  return "background";
}

export function classifyDrugDisplay(input: DrugDisplayInput): NabdaDrugSectionDisplay {
  if (input.kind === "prescription_status" || input.containsFranceSpecificPrescription) {
    return "source_drawer";
  }
  if (input.kind === "references") {
    return "source_drawer";
  }
  if (input.kind === "contraindications" || input.kind === "warnings" || input.kind === "pregnancy_lactation" || input.kind === "overdose") {
    return "safety_card";
  }
  if (input.kind === "interactions") {
    return "interaction_table";
  }
  if (input.kind === "adverse_effects") {
    return "adverse_effect_table";
  }
  if (input.kind === "posology") {
    return "posology_card";
  }
  if (input.kind === "forms") {
    return "availability_card";
  }
  if (input.kind === "identity" || input.kind === "composition") {
    return "identity_card";
  }
  if (input.kind === "pharmacology") {
    return input.textLength > 2500 ? "long_read" : "collapsible";
  }
  if (input.kind === "storage") {
    return "collapsible";
  }
  if (input.containsTable) {
    return input.recommendedTableDisplay ?? "table_cards";
  }
  return "collapsible";
}

export function drugTabForKind(kind: NabdaDrugSectionKind): NabdaDrugDetailTab {
  switch (kind) {
    case "posology":
      return "Posologie";
    case "contraindications":
    case "warnings":
    case "pregnancy_lactation":
    case "overdose":
    case "adverse_effects":
      return "Sécurité";
    case "interactions":
      return "Interactions";
    case "forms":
    case "storage":
      return "Formes";
    case "prescription_status":
    case "references":
      return "Sources";
    default:
      return "Aperçu";
  }
}

export function pharmacistGroupForKind(kind: NabdaDrugSectionKind): NabdaDrugPharmacistGroup {
  switch (kind) {
    case "interactions":
      return "Interactions";
    case "forms":
    case "storage":
    case "composition":
      return "Formes";
    case "prescription_status":
    case "references":
    case "pharmacology":
      return "Sources";
    case "identity":
    case "indications":
      return "DCI/produits";
    default:
      return "Sécurité";
  }
}

export const DRUG_TAB_ORDER: NabdaDrugDetailTab[] = [
  "Aperçu",
  "Posologie",
  "Sécurité",
  "Interactions",
  "Formes",
  "Sources",
];

export const DRUG_LOCAL_GROUPS: NabdaDrugLocalGroup[] = [
  "Disponibilité DZ",
  "Présentations",
  "Produits",
  "Laboratoires",
];

export const DRUG_PHARMACIST_GROUPS: NabdaDrugPharmacistGroup[] = [
  "Sécurité",
  "Interactions",
  "Formes",
  "DCI/produits",
  "Sources",
];
