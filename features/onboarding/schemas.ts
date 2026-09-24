import { z } from "zod";
import { PROFESSIONS, USAGE_MODES } from "@/types/database";

export const professionSchema = z.object({
  profession: z.enum(PROFESSIONS),
});

export const interestsSchema = z.object({
  interestIds: z
    .array(z.string().uuid())
    .min(1, "Choisissez au moins un intérêt.")
    .max(5, "Choisissez au plus 5 intérêts."),
});

export const usageModeSchema = z.object({
  usageMode: z.enum(USAGE_MODES),
});

export const consentSchema = z.object({
  accepted: z.literal(true),
});
