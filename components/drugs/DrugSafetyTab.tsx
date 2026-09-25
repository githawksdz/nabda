import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import type { DrugDetail } from "@/types/drugs";

type DrugSafetyTabProps = {
  drug: DrugDetail;
};

export function DrugSafetyTab({ drug }: DrugSafetyTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl bg-surface-container-low p-3.5">
        <p className="flex items-center gap-1.5 text-label-md">
          <ShieldAlert className="size-4 shrink-0" strokeWidth={1.75} />
          Vigilance
        </p>
        <p className="mt-2 text-body-sm text-on-surface-variant">{drug.safetyNote}</p>
      </section>

      <section>
        <h2 className="text-headline-sm">Contre-indications</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {drug.contraindications.map((item) => (
            <li
              key={item.id}
              className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
            >
              <p className="text-body-md font-medium">{item.label}</p>
              {item.description ? (
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-headline-sm">Précautions d&apos;emploi</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {drug.warnings.map((item) => (
            <li
              key={item.id}
              className="rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
            >
              <p className="text-body-md font-medium">{item.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <h2 className="text-headline-sm">Grossesse / allaitement</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {drug.pregnancyLactationStatus}
        </p>
      </section>

      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <h2 className="text-headline-sm">Rein / foie</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {drug.renalHepaticStatus}
        </p>
        <Link
          href="/calculators/cockcroft-gault"
          className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-label-md text-on-primary"
        >
          Ouvrir Cockcroft-Gault
        </Link>
      </section>

    </div>
  );
}
