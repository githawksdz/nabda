import { StatusChip } from "@/components/content-detail/StatusChip";

type CalculatorPreviewHeaderProps = {
  title: string;
  sourceId: string;
  count: number;
};

export function CalculatorPreviewHeader({
  title,
  sourceId,
  count,
}: CalculatorPreviewHeaderProps) {
  return (
    <header>
      <h1 className="text-headline-sm">{title}</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {count} outils source
      </p>
      <p className="mt-1 text-label-sm text-on-surface-variant">
        Aperçu interne · Aucun moteur activé
      </p>
      {sourceId ? (
        <p className="mt-1 truncate text-label-sm text-on-surface-variant">{sourceId}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusChip label="Importé" />
        <StatusChip label="Non Validé" variant="outline" />
      </div>
    </header>
  );
}
