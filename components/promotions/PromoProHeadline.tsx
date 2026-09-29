import { splitPromoHeadline } from "@/lib/promotions/promo-headline-emphasis";
import { cn } from "@/lib/utils";

type PromoProHeadlineProps = {
  id?: string;
  children: string;
  className?: string;
};

export function PromoProHeadline({ id, children, className }: PromoProHeadlineProps) {
  const { lead, emphasis } = splitPromoHeadline(children);

  return (
    <h2
      id={id}
      className={cn(
        "max-w-[22rem] text-balance text-xl font-medium tracking-tight text-white",
        className,
      )}
    >
      {lead}
      {emphasis ? (
        <span className="promo-pro-emphasis">{emphasis}</span>
      ) : null}
    </h2>
  );
}
