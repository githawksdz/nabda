"use client";

import { useId } from "react";
import { Field, FieldLabel } from "@/components/shadcn/field";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/shadcn/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  isListPageSize,
  LIST_PAGE_SIZE,
  LIST_PAGE_SIZE_OPTIONS,
  pageRange,
} from "@/lib/ui/list-pagination";
import { cn } from "@/lib/utils";

type ListPaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  label?: string;
};

export function ListPagination({
  page,
  pageCount,
  total,
  pageSize = LIST_PAGE_SIZE,
  onPageChange,
  onPageSizeChange,
  label = "Pagination",
}: ListPaginationProps) {
  const selectId = useId();

  if (total <= LIST_PAGE_SIZE) return null;

  const { from, to } = pageRange(page, total, pageSize);
  const atStart = page <= 1;
  const atEnd = page >= pageCount;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor={selectId}>Par page</FieldLabel>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            const next = Number(value);
            if (isListPageSize(next)) onPageSizeChange(next);
          }}
        >
          <SelectTrigger className="w-20" id={selectId} size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {LIST_PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Pagination aria-label={label} className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              text="Précédent"
              size="sm"
              aria-label="Page précédente"
              aria-disabled={atStart || undefined}
              tabIndex={atStart ? -1 : undefined}
              className={cn(atStart && "pointer-events-none opacity-50")}
              onClick={(event) => {
                event.preventDefault();
                if (!atStart) onPageChange(page - 1);
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              text="Suivant"
              size="sm"
              aria-label="Page suivante"
              aria-disabled={atEnd || undefined}
              tabIndex={atEnd ? -1 : undefined}
              className={cn(atEnd && "pointer-events-none opacity-50")}
              onClick={(event) => {
                event.preventDefault();
                if (!atEnd) onPageChange(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="sr-only" aria-live="polite">
        {from}–{to} sur {total}. Page {page} sur {pageCount}.
      </p>
    </div>
  );
}
