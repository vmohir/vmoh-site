import type { Currency } from "../../splitApp/split.types.ts";
import { Select } from "../../ui/Select.tsx";
import { CURRENCY_LIST } from "./currency-list.contant.ts";

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  variant?: "default" | "ghost";
  class?: string;
}

export function CurrencySelector({
  value,
  onChange,
  variant,
  class: className,
}: CurrencySelectorProps) {
  return (
    <Select
      variant={variant}
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
    </Select>
  );
}
