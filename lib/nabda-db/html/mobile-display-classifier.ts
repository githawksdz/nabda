import type {
  NabdaProtocolMobileTab,
  NabdaProtocolSectionDisplay,
  NabdaProtocolSectionKind,
  NabdaProtocolSectionPriority,
  NabdaProtocolShiftGroup,
} from "@/types/nabda-protocol-sections";

const SHORT_TEXT = 500;
const MEDIUM_TEXT = 900;
const LONG_READ_TEXT = 700;

export type DisplaySignals = {
  kind: NabdaProtocolSectionKind;
  textLength: number;
  containsTable: boolean;
  containsEmergencySignal: boolean;
  sourceHeading: string;
};

export function classifyProtocolPriority(input: DisplaySignals): NabdaProtocolSectionPriority {
  if (input.kind === "red_flags" || input.kind === "management") {
    return "urgent";
  }
  if (input.kind === "orientation") {
    return "urgent";
  }
  if (
    input.containsEmergencySignal &&
    input.kind !== "references" &&
    input.kind !== "source" &&
    input.kind !== "disease_overview" &&
    input.kind !== "advice"
  ) {
    return "urgent";
  }
  if (input.kind === "objectives") {
    const heading = input.sourceHeading.toLowerCase();
    if (heading.includes("quels patients")) {
      return "urgent";
    }
  }
  if (
    input.kind === "diagnosis" ||
    input.kind === "workup" ||
    input.kind === "treatment" ||
    input.kind === "dosage" ||
    input.kind === "monitoring" ||
    input.kind === "special_population" ||
    input.kind === "objectives"
  ) {
    return "normal";
  }
  return "background";
}

export function classifyProtocolDisplay(input: DisplaySignals): NabdaProtocolSectionDisplay {
  if (
    input.kind === "red_flags" ||
    (input.containsEmergencySignal && (input.kind === "orientation" || input.kind === "diagnosis"))
  ) {
    return "alert_card";
  }
  if (input.kind === "references" || input.kind === "source") {
    return "source_drawer";
  }
  if (input.kind === "medications_cited") {
    return "linked_chips";
  }
  if (input.containsTable && (input.kind === "treatment" || input.kind === "dosage" || input.kind === "workup")) {
    return "table_cards";
  }
  if (input.kind === "summary" || input.kind === "objectives") {
    return input.textLength <= SHORT_TEXT ? "hero_summary" : "quick_card";
  }
  if (input.kind === "disease_overview" || input.kind === "advice") {
    return input.textLength >= LONG_READ_TEXT ? "long_read" : "collapsible";
  }
  if (input.kind === "management" || input.kind === "treatment" || input.kind === "dosage") {
    if (input.containsTable) {
      return "table_cards";
    }
    return input.textLength <= MEDIUM_TEXT ? "quick_card" : "collapsible";
  }
  if (input.kind === "diagnosis" || input.kind === "workup") {
    return input.textLength <= MEDIUM_TEXT ? "quick_card" : "collapsible";
  }
  return "collapsible";
}

export function mobileTabForKind(kind: NabdaProtocolSectionKind): NabdaProtocolMobileTab {
  switch (kind) {
    case "diagnosis":
    case "red_flags":
    case "workup":
      return "Diagnostic";
    case "management":
    case "orientation":
    case "monitoring":
      return "Prise en charge";
    case "treatment":
    case "dosage":
      return "Traitements";
    case "medications_cited":
      return "Médicaments";
    case "references":
    case "source":
      return "Sources";
    default:
      return "Aperçu";
  }
}

export function shiftGroupForKind(
  kind: NabdaProtocolSectionKind,
  containsCalculatorMention: boolean,
): NabdaProtocolShiftGroup {
  if (kind === "red_flags") {
    return "Gravité";
  }
  if (kind === "references" || kind === "source") {
    return "Sources";
  }
  if (kind === "treatment" || kind === "dosage" || kind === "medications_cited") {
    return "Traitements";
  }
  if (containsCalculatorMention && (kind === "diagnosis" || kind === "workup" || kind === "management")) {
    return "Outils liés";
  }
  if (kind === "management" || kind === "orientation" || kind === "objectives") {
    return "Premières étapes";
  }
  if (kind === "diagnosis" || kind === "workup") {
    return "Gravité";
  }
  return "Premières étapes";
}

export const MOBILE_TAB_ORDER: NabdaProtocolMobileTab[] = [
  "Aperçu",
  "Diagnostic",
  "Prise en charge",
  "Traitements",
  "Médicaments",
  "Sources",
];

export const SHIFT_GROUP_ORDER: NabdaProtocolShiftGroup[] = [
  "Gravité",
  "Premières étapes",
  "Traitements",
  "Outils liés",
  "Sources",
];
