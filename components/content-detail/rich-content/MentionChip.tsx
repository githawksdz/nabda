import Link from "next/link";
import { Calculator, FileText, GitBranch, Pill } from "lucide-react";
import type { MentionType } from "@/types/content-detail";

type MentionChipProps = {
  type: MentionType;
  label: string;
  href: string;
  subtitle?: string;
};

function MentionIcon({ type, href }: { type: MentionType; href: string }) {
  const className = "size-3.5 shrink-0";
  if (href.startsWith("/cat")) {
    return <GitBranch className={className} strokeWidth={1.75} />;
  }
  if (type === "calculator_mention" || href.startsWith("/calculators")) {
    return <Calculator className={className} strokeWidth={1.75} />;
  }
  if (type === "drug_mention" || href.startsWith("/drugs")) {
    return <Pill className={className} strokeWidth={1.75} />;
  }
  return <FileText className={className} strokeWidth={1.75} />;
}

export function MentionChip({ type, label, href, subtitle }: MentionChipProps) {
  return (
    <Link
      href={href}
      title={subtitle}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface"
    >
      <MentionIcon type={type} href={href} />
      <span className="truncate">{label}</span>
    </Link>
  );
}
