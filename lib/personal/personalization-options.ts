import type { PersonalizationChip } from "@/types/personal";

export const PERSONALIZATION_SPECIALTIES: PersonalizationChip[] = [
  {
    id: "urgences-samu",
    label: "Urgences & SAMU",
    aliases: ["Urgences"],
    interestSlugs: ["urgences"],
  },
  {
    id: "medecine-generale",
    label: "Médecine générale",
    aliases: ["Médecine générale"],
    interestSlugs: ["medecine_generale"],
  },
  {
    id: "pediatrie",
    label: "Pédiatrie",
    aliases: ["Pédiatrie"],
    interestSlugs: ["pediatrie"],
  },
  {
    id: "reanimation",
    label: "Réanimation",
    aliases: ["Réanimation"],
    interestSlugs: ["reanimation"],
  },
  {
    id: "cardiologie",
    label: "Cardiologie",
    aliases: ["Cardiologie"],
    interestSlugs: ["cardiologie"],
  },
  {
    id: "chirurgie",
    label: "Chirurgie",
    aliases: ["Chirurgie"],
    interestSlugs: ["chirurgie"],
  },
];

export const PERSONALIZATION_PRIORITIES: PersonalizationChip[] = [
  {
    id: "cat",
    label: "CAT décisionnels",
    aliases: ["CAT"],
    interestSlugs: ["cat_decisionnels"],
  },
  {
    id: "scores",
    label: "Scores rapides",
    aliases: ["Scores"],
    interestSlugs: ["scores_rapides", "scores"],
  },
  {
    id: "drugs",
    label: "Fiches médicaments",
    aliases: ["Médicaments"],
    interestSlugs: ["fiches_medicaments", "medicaments"],
  },
  {
    id: "protocols",
    label: "Protocoles",
    aliases: ["Protocoles", "Recommandations"],
    interestSlugs: ["recommandations"],
  },
];

export const PERSONALIZATION_REWARD_CHIPS = [
  "Glasgow",
  "Wells",
  "Cockcroft",
  "CAT urgences",
] as const;
