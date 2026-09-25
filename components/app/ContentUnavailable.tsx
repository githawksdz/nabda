import Link from "next/link";
import { FileQuestion } from "lucide-react";

export type ContentUnavailableKind =
  | "protocol"
  | "cat"
  | "drug"
  | "calculator";

const COPY: Record<
  ContentUnavailableKind,
  { title: string; description: string; backHref: string; backLabel: string }
> = {
  protocol: {
    title: "Protocole introuvable",
    description:
      "Cette fiche n'existe pas ou n'est pas encore disponible dans Nabda.",
    backHref: "/protocols",
    backLabel: "Voir les protocoles",
  },
  cat: {
    title: "CAT introuvable",
    description:
      "Cette conduite à tenir n'existe pas ou n'est pas encore disponible.",
    backHref: "/cat",
    backLabel: "Voir les CAT",
  },
  drug: {
    title: "Médicament introuvable",
    description: "Cette fiche n'existe pas encore dans le référentiel Nabda.",
    backHref: "/drugs",
    backLabel: "Voir les médicaments",
  },
  calculator: {
    title: "Calculateur introuvable",
    description: "Cet outil n'existe pas encore dans Nabda.",
    backHref: "/calculators",
    backLabel: "Voir les scores",
  },
};

type ContentUnavailableProps = {
  kind: ContentUnavailableKind;
};

export function ContentUnavailable({ kind }: ContentUnavailableProps) {
  const copy = COPY[kind];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-background px-4 pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-[calc(24px+env(safe-area-inset-top,0px))] text-on-surface">
      <div className="flex flex-1 flex-col justify-center gap-5 py-10">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant">
          <FileQuestion className="size-6" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-headline-md">{copy.title}</h1>
          <p className="text-body-md text-on-surface-variant">{copy.description}</p>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={copy.backHref}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-label-md text-on-primary"
          >
            {copy.backLabel}
          </Link>
          <Link
            href="/search"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-surface-container-low px-4 text-label-md text-on-surface"
          >
            Rechercher dans Nabda
          </Link>
        </div>
      </div>
    </div>
  );
}
