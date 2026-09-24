import Link from "next/link";
import { ChevronRight, Info, ShieldAlert } from "lucide-react";
import { StatusChip } from "@/components/content-detail/StatusChip";
import { DrugLinkedResources } from "./DrugLinkedResources";
import {
  DRUG_INTERACTION_PLACEHOLDER,
  DRUG_POSOLOGY_COMBINED,
  DRUG_POSOLOGY_TITLE,
  drugDetailHref,
} from "@/lib/drugs/drug-ui-config";
import { DRUG_DETAIL_STATUS_LABELS } from "@/lib/drugs/status-labels";
import type { DrugDetail, DrugStructureRow } from "@/types/drugs";

type DrugOverviewProps = {
  drug: DrugDetail;
};

export function DrugFormsCard({ rows }: { rows: DrugStructureRow[] }) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <h2 className="text-headline-sm">Formes et disponibilité</h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Structure uniquement. Aucun dosage n&apos;est affiché dans cette version.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3.5 py-3"
          >
            <span className="text-body-sm">{row.label}</span>
            <StatusChip label={row.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DrugSourcesCard({ drug }: { drug: DrugDetail }) {
  return (
    <section className="rounded-2xl bg-surface-container-low p-4">
      <h2 className="text-headline-sm">Sources et relecture</h2>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        Libellés conservateurs. Aucune validation finale n&apos;est revendiquée.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        <li className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-3.5 py-3 shadow-sm">
          <span className="text-body-sm">Révision pharmacologique</span>
          <StatusChip label={DRUG_DETAIL_STATUS_LABELS.pharmacologyReview} />
        </li>
        <li className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-3.5 py-3 shadow-sm">
          <span className="text-body-sm">Sources</span>
          <StatusChip label={DRUG_DETAIL_STATUS_LABELS.sources} />
        </li>
        <li className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-3.5 py-3 shadow-sm">
          <span className="text-body-sm">Posologies</span>
          <StatusChip label={DRUG_DETAIL_STATUS_LABELS.posologyUnavailable} />
        </li>
      </ul>
      {drug.references.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {drug.references.map((reference) => (
            <li key={reference.label} className="text-body-sm text-on-surface-variant">
              {reference.href ? (
                <Link href={reference.href} className="underline-offset-2 hover:underline">
                  {reference.label}
                </Link>
              ) : (
                reference.label
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function DrugOverview({ drug }: DrugOverviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <h2 className="text-headline-sm">À retenir</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">{drug.summary}</p>
      </section>

      <section className="rounded-2xl bg-surface-container-low p-4">
        <p className="flex items-center gap-1.5 text-label-md">
          <ShieldAlert className="size-4 shrink-0" strokeWidth={1.75} />
          {DRUG_POSOLOGY_TITLE}
        </p>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {DRUG_POSOLOGY_COMBINED}
        </p>
      </section>

      <DrugFormsCard rows={drug.formStructure} />

      <section>
        <h2 className="text-headline-sm">Points de sécurité</h2>
        <div className="mt-3 flex flex-col gap-2">
          {drug.safetyPreviews.map((preview) => (
            <Link
              key={preview.id}
              href={drugDetailHref(drug.slug, "securite")}
              className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm active:scale-[0.99]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-body-md font-medium">{preview.title}</span>
                <span className="mt-1 inline-flex">
                  <StatusChip label={preview.statusLabel} />
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-outline" strokeWidth={1.75} />
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-surface-container-low p-3.5">
        <p className="flex items-center gap-1.5 text-label-md">
          <Info className="size-4 shrink-0" strokeWidth={1.75} />
          Interactions
        </p>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {DRUG_INTERACTION_PLACEHOLDER}
        </p>
      </section>

      <DrugLinkedResources
        title="Protocoles associés"
        items={drug.linkedProtocols}
      />

      <DrugSourcesCard drug={drug} />
    </div>
  );
}
