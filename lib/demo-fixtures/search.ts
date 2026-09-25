// Demo-mode fixture only. Do not import from production runtime providers.

import type {
  MedicationSearchResult,
  RecentConsultation,
  SearchResult,
  SearchResultGroup,
} from "@/types/search";


export const RECENT_CONSULTATIONS: RecentConsultation[] = [
  {
    id: "recent-cat",
    title: "Douleur thoracique",
    meta: "CAT · Urgences · il y a 2h",
    href: "/cat/douleur-thoracique",
    icon: "git-branch",
  },
  {
    id: "recent-gcs",
    title: "Glasgow (GCS)",
    meta: "Score · Neurologie · hier",
    href: "/calculators/glasgow",
    icon: "calculator",
  },
  {
    id: "recent-para",
    title: "Paracétamol",
    meta: "Médicament · Fiche à vérifier · il y a 2j",
    href: "/drugs/paracetamol",
    icon: "pill",
  },
];

export const DOULEUR_GROUPS: SearchResultGroup[] = [
  {
    id: "cat",
    title: "Conduite à Tenir (2)",
    subtitle: "Algorithmes d'urgence",
    count: 2,
    dotClassName: "bg-primary",
    results: [
      {
        id: "cat-thorax",
        type: "cat",
        slug: "douleur-thoracique",
        title: "Douleur thoracique aiguë",
        statusLabel: "Contenu en préparation",
        extraLabel: "2 min",
        description:
          "Tri sélectif SCA ST+ / non ST+, embolie pulmonaire, dissection aortique.",
        footer: "Urgences · Cardiologie",
        href: "/cat/douleur-thoracique",
      },
      {
        id: "cat-abdomen",
        type: "cat",
        slug: "douleur-abdominale-adulte",
        title: "Douleur abdominale de l'adulte",
        statusLabel: "Urgent",
        extraLabel: "Fosse iliaque & péritonite",
        description:
          "Arbre décisionnel chirurgical vs médical, imagerie en coupe & bilans.",
        footer: "Chirurgie viscérale · Scanner injecté",
        href: "/cat/douleur-abdominale-adulte",
      },
    ],
  },
  {
    id: "scores",
    title: "Scores & Calculateurs (2)",
    subtitle: "Outils au lit du patient",
    count: 2,
    dotClassName: "bg-secondary",
    results: [
      {
        id: "score-wells",
        type: "calculator",
        slug: "wells-ep",
        title: "Score de Wells (Embolie Pulmonaire)",
        statusLabel: "Interactif",
        extraLabel: "Probabilité clinique",
        description:
          "Stratification du risque pré-test et indication des D-Dimères.",
        href: "/calculators/wells-ep",
      },
      {
        id: "score-eva",
        type: "calculator",
        slug: "eva-dn4",
        title: "Échelle EVA / DN4",
        statusLabel: "Questionnaire 10 items",
        extraLabel: "Douleur neuropathique",
        description:
          "Différenciation nociceptive vs neuropathique & suivi d'efficacité.",
        href: "/calculators/eva-dn4",
      },
    ],
  },
  {
    id: "drugs",
    title: "Médicaments & Antalgiques (6)",
    subtitle: "Voir les 6",
    count: 6,
    seeAllHref: "/search?q=douleur&type=drugs",
    seeAllLabel: "Voir les 6",
    dotClassName: "bg-outline",
    results: [
      {
        id: "drug-para",
        type: "drug",
        slug: "paracetamol",
        title: "Paracétamol (Acétaminophène)",
        statusLabel: "Contenu en préparation",
        extraLabel: "Perfalgan • Doliprane",
        // TODO: Replace with pharmacist-reviewed drug data after validation.
        badge: "Posologies non disponibles dans cette version",
        warning: "Hépatotoxicité à vérifier selon les sources",
        href: "/drugs/paracetamol",
      },
      {
        id: "drug-morphine",
        type: "drug",
        slug: "morphine",
        title: "Morphine & dérivés opioïdes",
        statusLabel: "Fiche en préparation",
        extraLabel: "Opioïde · à confirmer après validation",
        description:
          "Posologies non disponibles dans cette version. À interpréter selon le protocole local.",
        // TODO: Replace with pharmacist-reviewed drug data after validation.
        badge: "Adaptation à valider",
        href: "/drugs/morphine",
      },
    ],
  },
  {
    id: "reco",
    title: "Protocoles (2)",
    subtitle: "Sociétés savantes · Protocoles",
    count: 2,
    dotClassName: "bg-on-surface-variant",
    results: [
      {
        id: "reco-hsa",
        type: "recommendation",
        slug: "cephalees-brutales-hsa",
        title: "Céphalées brutales et suspicion d'HSA",
        statusLabel: "Contenu en préparation",
        extraLabel: "Céphalée brutale inhabituelle",
        description:
          "Orientation diagnostique à interpréter selon le contexte clinique et le protocole local.",
        footer: "Publié",
        href: "/protocols/cephalees-brutales-hsa",
      },
    ],
  },
];

export const AMOX_MEDICATIONS: MedicationSearchResult[] = [
  {
    id: "amox",
    slug: "amoxicilline",
    title: "Amoxicilline",
    subtitle: "DCI · Pénicilline A (Bêta-lactamines)",
    statusChip: "Révision requise",
    infoLabel: "Posologies",
    infoMeta: "Adulte & pédiatrie",
    // TODO: Replace with pharmacist-reviewed drug data after validation.
    infoText: "Posologies non disponibles dans cette version. Selon protocole local.",
    footerText: "Formes orales & suspensions · à vérifier",
    href: "/drugs/amoxicilline",
    actions: [{ label: "Voir la fiche", href: "/drugs/amoxicilline", variant: "primary" }],
  },
  {
    id: "augmentin",
    slug: "amoxicilline-acide-clavulanique",
    title: "Amoxicilline + Ac. Clavulanique",
    subtitle: "Augmentin · Bêta-lactamine + Inhibiteur",
    warningChip: "Adaptation rénale à valider",
    infoLabel: "Ajustement rénal",
    infoMeta: "À confirmer après validation",
    // TODO: Replace with pharmacist-reviewed drug data after validation.
    infoText: "Adaptation à valider. Posologies non disponibles dans cette version.",
    footerText: "Comprimés, sachets, flacons IV · à vérifier",
    href: "/drugs/amoxicilline-acide-clavulanique",
    actions: [{ label: "Voir la fiche", href: "/drugs/amoxicilline-acide-clavulanique", variant: "primary" }],
  },
  {
    id: "cefotaxime",
    slug: "cefotaxime",
    title: "Céfotaxime",
    subtitle: "DCI · Céphalosporine 3G injectable",
    statusChip: "Fiche en préparation",
    infoLabel: "Usage hospitalier",
    infoMeta: "Contenu en préparation",
    // TODO: Replace with pharmacist-reviewed drug data after validation.
    infoText: "Posologies non disponibles dans cette version. Selon protocole local.",
    footerText: "Compatibilités à confirmer après validation",
    href: "/drugs/cefotaxime",
    actions: [{ label: "Voir la fiche", href: "/drugs/cefotaxime", variant: "primary" }],
  },
  {
    id: "azithro",
    slug: "azithromycine",
    title: "Azithromycine",
    subtitle: "DCI · Macrolide (Azalide)",
    warningChip: "QT · à vérifier",
    infoLabel: "Schéma thérapeutique",
    infoMeta: "Durée à confirmer",
    // TODO: Replace with pharmacist-reviewed drug data after validation.
    infoText: "Posologies non disponibles dans cette version. Adaptation à valider.",
    footerText: "Interactions et ECG selon le contexte clinique",
    href: "/drugs/azithromycine",
    actions: [{ label: "Voir la fiche", href: "/drugs/azithromycine", variant: "primary" }],
  },
];

export const ZERO_FALLBACK_PROTOCOLS: SearchResult[] = [
  {
    id: "sca",
    type: "cat",
    slug: "syndrome-coronarien-aigu-st-plus",
    title: "Syndrome coronarien aigu (SCA ST+)",
    footer: "Cardiologie • Mis à jour il y a 3j",
    href: "/cat/syndrome-coronarien-aigu-st-plus",
  },
  {
    id: "dra",
    type: "cat",
    slug: "detresse-respiratoire-aigue-adulte",
    title: "Détresse respiratoire aiguë adulte",
    footer: "Pneumologie / Réanimation • CAT immédiate",
    href: "/cat/detresse-respiratoire-aigue-adulte",
  },
];

export const ZERO_QUERY = "syndrome xyz99";
