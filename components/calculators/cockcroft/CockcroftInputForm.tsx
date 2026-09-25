"use client";

import type { ReactNode } from "react";

import {
  COCKCROFT_AGE_MAX,
  COCKCROFT_AGE_MIN,
  COCKCROFT_EXAMPLES,
  COCKCROFT_K_FEMALE,
  COCKCROFT_K_MALE,
  COCKCROFT_WEIGHT_MAX,
  COCKCROFT_WEIGHT_MIN,
  convertCreatinineDisplay,
} from "@/lib/calculators/cockcroft-gault";
import { cn } from "@/lib/utils";
import type {
  CockcroftFormValues,
  CreatinineUnit,
} from "@/types/calculators";

type CockcroftInputFormProps = {
  values: CockcroftFormValues;
  onChange: (values: CockcroftFormValues) => void;
};

export function CockcroftInputForm({
  values,
  onChange,
}: CockcroftInputFormProps) {
  function update<K extends keyof CockcroftFormValues>(
    key: K,
    value: CockcroftFormValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  function setUnit(unit: CreatinineUnit) {
    onChange({
      ...values,
      unit,
      creatinine: convertCreatinineDisplay(
        values.creatinine,
        values.unit,
        unit,
      ),
    });
  }

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
      <h2 className="text-headline-sm">Paramètres</h2>

      <fieldset className="mt-3">
        <legend className="text-label-md text-on-surface">
          Sexe biologique
        </legend>
        <div
          role="radiogroup"
          aria-label="Sexe biologique"
          className="mt-2 grid grid-cols-2 gap-1.5"
        >
          <SexOption
            selected={values.sex === "male"}
            label="Homme"
            meta={`k = ${COCKCROFT_K_MALE}`}
            onSelect={() => update("sex", "male")}
          />
          <SexOption
            selected={values.sex === "female"}
            label="Femme"
            meta={`k = ${COCKCROFT_K_FEMALE}`}
            onSelect={() => update("sex", "female")}
          />
        </div>
      </fieldset>

      <div className="mt-3 flex flex-col gap-2.5">
        <NumericField
          id="cockcroft-age"
          label="Âge"
          unit="ans"
          value={values.age}
          placeholder={`${COCKCROFT_AGE_MIN}–${COCKCROFT_AGE_MAX}`}
          onChange={(value) => update("age", value)}
        />
        <NumericField
          id="cockcroft-weight"
          label="Poids réel"
          unit="kg"
          value={values.weight}
          placeholder={`${COCKCROFT_WEIGHT_MIN}–${COCKCROFT_WEIGHT_MAX}`}
          onChange={(value) => update("weight", value)}
        />
        <NumericField
          id="cockcroft-creatinine"
          label="Créatininémie"
          value={values.creatinine}
          placeholder={values.unit === "mg_dl" ? "ex. 1.02" : "ex. 90"}
          onChange={(value) => update("creatinine", value)}
          trailing={
            <div
              role="radiogroup"
              aria-label="Unité de créatinine"
              className="flex rounded-lg bg-surface-container p-0.5"
            >
              <UnitChip
                selected={values.unit === "umol_l"}
                label="µmol/L"
                onSelect={() => setUnit("umol_l")}
              />
              <UnitChip
                selected={values.unit === "mg_dl"}
                label="mg/dL"
                onSelect={() => setUnit("mg_dl")}
              />
            </div>
          }
        />
      </div>

      <div className="mt-4">
        <p className="text-label-sm text-on-surface-variant">
          Exemples rapides — non prescriptifs
        </p>
        <div className="mt-2 flex gap-1.5">
          {COCKCROFT_EXAMPLES.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => onChange(example.values)}
              className="inline-flex min-h-11 items-center rounded-full bg-surface-muted px-3 text-label-md text-text-secondary"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SexOption({
  selected,
  label,
  meta,
  onSelect,
}: {
  selected: boolean;
  label: string;
  meta: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "motion-color flex min-h-[56px] flex-col items-center justify-center rounded-xl px-2 py-2 text-center",
        selected
          ? "bg-primary text-on-primary"
          : "bg-surface-container-low text-on-surface-variant",
      )}
    >
      <span className="text-label-md font-medium">{label}</span>
      <span className="text-label-sm">{meta}</span>
    </button>
  );
}

function UnitChip({
  selected,
  label,
  onSelect,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "motion-color h-11 rounded-md px-2 text-label-sm font-semibold",
        selected
          ? "bg-primary text-on-primary"
          : "text-on-surface-variant",
      )}
    >
      {label}
    </button>
  );
}

function NumericField({
  id,
  label,
  unit,
  value,
  placeholder,
  onChange,
  trailing,
}: {
  id: string;
  label: string;
  unit?: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  trailing?: ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-label-md text-on-surface">{label}</span>
      <span className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:bg-surface-container-lowest">
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant"
        />
        {unit ? (
          <span className="text-label-sm text-on-surface-variant">{unit}</span>
        ) : null}
        {trailing}
      </span>
    </label>
  );
}
