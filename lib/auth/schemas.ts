import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ajoutez votre nom."),
  email: z
    .string()
    .trim()
    .email("Adresse email invalide."),
  password: z
    .string()
    .min(1, "Ajoutez votre mot de passe.")
    .min(8, "Utilisez au moins 8 caractères."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Adresse email invalide."),
  password: z.string().min(1, "Ajoutez votre mot de passe."),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Adresse email invalide."),
});

export const forgotPasswordSchema = resetPasswordSchema;

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Ajoutez votre mot de passe.")
    .min(8, "Utilisez au moins 8 caractères."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
