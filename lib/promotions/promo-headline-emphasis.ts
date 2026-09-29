export function splitPromoHeadline(headline: string): {
  lead: string;
  emphasis: string | null;
} {
  const trimmed = headline.trim();
  const commaIndex = trimmed.lastIndexOf(",");
  if (commaIndex !== -1 && commaIndex < trimmed.length - 1) {
    return {
      lead: trimmed.slice(0, commaIndex + 1),
      emphasis: trimmed.slice(commaIndex + 1).trim(),
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return { lead: trimmed, emphasis: null };
  }

  const emphasisWords = words.slice(-2).join(" ");
  const lead = words.slice(0, -2).join(" ");
  return {
    lead: lead ? `${lead} ` : "",
    emphasis: emphasisWords,
  };
}

export function splitCouponPriceLine(line: string): {
  amount: string;
  period: string | null;
} {
  const slash = line.indexOf("/");
  if (slash === -1) {
    return { amount: line, period: null };
  }
  return {
    amount: line.slice(0, slash).trim(),
    period: line.slice(slash).trim(),
  };
}
