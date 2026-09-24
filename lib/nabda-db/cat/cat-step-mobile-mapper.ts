import type {
  NabdaCatEtapesGroup,
  NabdaCatShiftGroup,
  NabdaCatStepDisplay,
  NabdaCatStepKind,
  NabdaCatStepPriority,
} from "@/types/nabda-cat-steps";

export type CatStepDisplayInput = {
  kind: NabdaCatStepKind;
  containsEmergencySignal: boolean;
  containsDose: boolean;
};

export function classifyCatStepDisplay(kind: NabdaCatStepKind): NabdaCatStepDisplay {
  switch (kind) {
    case "severity_check":
    case "red_flag":
      return "alert_step";
    case "diagnostic_check":
    case "workup":
      return "checklist_step";
    case "treatment":
    case "medication":
      return "treatment_step";
    case "calculator":
      return "linked_tool_step";
    case "monitoring":
      return "monitoring_step";
    case "source":
      return "source_step";
    default:
      return "step_card";
  }
}

export function classifyCatStepPriority(input: CatStepDisplayInput): NabdaCatStepPriority {
  if (input.kind === "red_flag" || input.kind === "severity_check") {
    return input.containsEmergencySignal ? "critical" : "urgent";
  }
  if (
    (input.kind === "management" ||
      input.kind === "treatment" ||
      input.kind === "orientation" ||
      input.kind === "medication") &&
    input.containsEmergencySignal
  ) {
    return "urgent";
  }
  if (input.kind === "source" || input.kind === "entry") {
    return "background";
  }
  return "normal";
}

export function etapesGroupForKind(kind: NabdaCatStepKind): NabdaCatEtapesGroup {
  switch (kind) {
    case "red_flag":
    case "severity_check":
      return "Gravité";
    case "diagnostic_check":
    case "workup":
      return "Diagnostic";
    case "treatment":
    case "medication":
      return "Traitements";
    case "monitoring":
      return "Surveillance";
    case "orientation":
      return "Orientation";
    case "calculator":
      return "Outils liés";
    case "source":
      return "Sources";
    default:
      return "Premières actions";
  }
}

export function shiftGroupForKind(
  kind: NabdaCatStepKind,
  priority: NabdaCatStepPriority,
): NabdaCatShiftGroup {
  if (priority === "critical" || kind === "red_flag" || kind === "severity_check") {
    return "Urgent maintenant";
  }
  if (kind === "diagnostic_check" || kind === "workup") {
    return "À vérifier";
  }
  if (kind === "monitoring") {
    return "À surveiller";
  }
  if (kind === "calculator" || kind === "source") {
    return "Liens utiles";
  }
  return "À faire";
}

export const ETAPES_GROUP_ORDER: NabdaCatEtapesGroup[] = [
  "Gravité",
  "Diagnostic",
  "Premières actions",
  "Traitements",
  "Surveillance",
  "Orientation",
  "Outils liés",
  "Sources",
];

export const SHIFT_GROUP_ORDER: NabdaCatShiftGroup[] = [
  "Urgent maintenant",
  "À vérifier",
  "À faire",
  "À surveiller",
  "Liens utiles",
];
