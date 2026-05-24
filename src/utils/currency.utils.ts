export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD";

export function getCurrencyFromLocale(): Currency {
  const locale = navigator.language;

  // Simple mapping based on common locales
  if (locale.includes("GB")) return "GBP";
  if (locale.includes("CA")) return "CAD";
  if (locale.includes("AU")) return "AUD";
  if (locale.includes("JP")) return "JPY";
  if (locale.includes("US")) return "USD";

  // if (locale.match(/de|fr|es|it|nl|be|at|pt|ie/i)) return 'EUR';
  return "EUR"; // Default
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
