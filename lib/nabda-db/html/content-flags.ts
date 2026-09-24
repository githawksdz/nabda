/**
 * Shared clinical-token detectors for protocol/CAT dry-runs.
 * Does not rewrite wording.
 */

export const DOSE_RE =
  /\b\d+([.,]\d+)?\s*(mg|µg|ug|mcg|g|ml|ui|meq)(\s*\/\s*kg)?\b|\b(mg\/kg|posologie|gouttes?|comprimés?|injection|perfusion|\d+\s*x\s*\/\s*j|\/jour|\/j)\b/i;

export const EMERGENCY_RE =
  /\b(samu|appeler le 15|\(15\)|en urgence|aux urgences|urgence vitale|détresse|detresse|état de choc|etat de choc|choc anaphylactique|instabilité hémodynamique|instabilite hemodynamique|coma|convulsion|douleur thoracique|dyspnée aiguë|dyspnee aigue|signes? de gravité|signes? de gravite)\b/i;

export const CALCULATOR_RE =
  /\b(calculateur|score de|score d'|glasgow|cockcroft|wells|cha2ds2|qsofa|imc|clairance de la créatinine|clairance de la creatinine)\b/i;

export const DRUG_CLASS_RE = /\b(class="[^"]*\b(dci|spe|lstdci|nommed)\b|nabda:[sp]\.)/i;

export const SAMU_15_RE = /\b(samu|\(15\)|appeler le 15|le 15\b)/i;

export function detectDose(html: string, text: string): boolean {
  return DOSE_RE.test(text) || DOSE_RE.test(html);
}

export function detectEmergency(text: string): boolean {
  return EMERGENCY_RE.test(text);
}

export function detectCalculator(html: string, text: string, calcIds: string[] = []): boolean {
  if (calcIds.length > 0 && /nabda:calc\./i.test(html)) {
    return true;
  }
  return CALCULATOR_RE.test(text);
}

export function detectDrugMention(
  html: string,
  linkedIds: string[],
  substanceIds: string[] = [],
): boolean {
  if (linkedIds.some((id) => id.startsWith("s.") || id.startsWith("p."))) {
    return true;
  }
  if (substanceIds.length > 0 && /nabda:[sp]\./i.test(html)) {
    return true;
  }
  return DRUG_CLASS_RE.test(html);
}

export function detectSamu15(text: string): boolean {
  return SAMU_15_RE.test(text);
}
