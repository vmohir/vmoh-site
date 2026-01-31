import type { Currency } from "../../splitApp/split.types.ts";
import { CURRENCY_LIST } from "./currency-list.contant.ts";

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  class?: string;
}

export function CurrencySelector({
  value,
  onChange,
  class: className,
}: CurrencySelectorProps) {
  return (
    <select
      class={className}
      value={value}
      onChange={(e) =>
        onChange((e.target as HTMLSelectElement).value as Currency)
      }
    >
      {CURRENCY_LIST.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.code}
        </option>
      ))}
    </select>
  );
}
