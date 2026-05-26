export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD";

// Region (ISO 3166) -> currency. Limited to the currencies we support.
// Used for picking a sensible default when the user has not picked one.
const REGION_TO_CURRENCY: Partial<Record<string, Currency>> = {
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  NZ: "AUD",
  JP: "JPY",
  // Eurozone
  AT: "EUR",
  BE: "EUR",
  CY: "EUR",
  DE: "EUR",
  EE: "EUR",
  ES: "EUR",
  FI: "EUR",
  FR: "EUR",
  GR: "EUR",
  HR: "EUR",
  IE: "EUR",
  IT: "EUR",
  LT: "EUR",
  LU: "EUR",
  LV: "EUR",
  MT: "EUR",
  NL: "EUR",
  PT: "EUR",
  SI: "EUR",
  SK: "EUR",
};

// Guess a default currency from the browser locale, no location permission needed.
export function getCurrencyFromLocale(): Currency {
  if (typeof navigator === "undefined") return "USD";
  const lang = navigator.language;
  if (!lang) return "USD";

  // Prefer Intl.Locale.region when available (modern browsers).
  try {
    const region = new Intl.Locale(lang).region;
    if (region && REGION_TO_CURRENCY[region])
      return REGION_TO_CURRENCY[region]!;
  } catch {
    // ignore — fall through to string match
  }

  // Fallback: scan the BCP-47 tag for a known region subtag.
  const upper = lang.toUpperCase();
  for (const region in REGION_TO_CURRENCY) {
    if (upper.includes(`-${region}`) || upper.endsWith(region)) {
      return REGION_TO_CURRENCY[region]!;
    }
  }
  return "USD";
}

export const getCurrencySymbol = (currency: Currency) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  });
  return formatter
    .formatToParts(0)
    .filter((p) => p.type === "currency")
    .map((p) => p.value)
    .join("");
};

export const formatCurrency = (amount: number, currency: Currency) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  });
  return formatter.format(amount);
};
