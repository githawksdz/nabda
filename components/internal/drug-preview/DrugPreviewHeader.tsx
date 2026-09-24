import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusChip } from "@/components/content-detail/StatusChip";

type DrugPreviewHeaderProps = {
  title: string;
  sourceId: string;
  backHref: string;
  localeStatus: string | null;
  sectionCount: number;
};

export function DrugPreviewHeader({
  title,
  sourceId,
  backHref,
  localeStatus,
  sectionCount,
}: DrugPreviewHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex items-start gap-2">
        <Link
          href={backHref}
          aria-label="Retour à la liste interne"
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface"
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-label-sm text-on-surface-variant">Médicament · aperçu interne</p>
          <h1 className="text-headline-sm">{title}</h1>
          <p className="mt-1 truncate text-label-sm text-on-surface-variant">{sourceId}</p>
        </div>
      </div>
      <div className="rounded-xl bg-surface-container-low p-3.5">
        <p className="text-body-sm">Identité extraite depuis nabda_db</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Les mentions en mg sont des dosages de présentation, pas une posologie.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusChip label="Importé" />
          <StatusChip label="Non Validé" variant="outline" />
          <StatusChip label={`${sectionCount} sections`} />
          {localeStatus ? <StatusChip label={localeStatus} variant="soft" /> : null}
        </div>
      </div>
    </header>
  );
}
