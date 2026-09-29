export function formatDzdAmount(amount: number): string {
  return new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCouponPriceLine(
  currentPriceDzd: number,
  billingPeriod: "month" | "year",
): string {
  const amount = formatDzdAmount(currentPriceDzd);
  return billingPeriod === "month" ? `${amount} DA/mois` : `${amount} DA/an`;
}
