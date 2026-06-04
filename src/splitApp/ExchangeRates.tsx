import { useState } from "preact/hooks";
import type { Currency } from "./split.types.ts";
import {
  baseCurrency,
  exchangeRateInBase,
  resetExchangeRates,
  setExchangeRateInBase,
} from "../state/billState";
import { CURRENCY_LIST } from "../domains/currencies/currency-list.contant.ts";
import styles from "./ExchangeRates.module.css";

// Trim a rate to a readable precision without dangling zeros (0.79, 1.2658).
function formatRate(value: number): string {
  return String(Math.round(value * 10000) / 10000);
}

interface RateRowProps {
  currency: Currency;
  base: Currency;
}

function RateRow({ currency, base }: RateRowProps) {
  // Local text state so typing decimals isn't fought by re-formatting. Keyed by
  // base+currency upstream so it re-seeds when either changes.
  const [text, setText] = useState(() =>
    formatRate(exchangeRateInBase(currency)),
  );

  return (
    <label class={styles.row}>
      <span class={styles.unit}>1 {currency}</span>
      <span class={styles.equals}>=</span>
      <input
        type="text"
        inputMode="decimal"
        class={styles.input}
        value={text}
        onInput={(e) => {
          const next = (e.target as HTMLInputElement).value;
          setText(next);
          const parsed = parseFloat(next);
          if (parsed > 0) setExchangeRateInBase(currency, parsed);
        }}
      />
      <span class={styles.base}>{base}</span>
    </label>
  );
}

export default function ExchangeRates() {
  const base = baseCurrency.value;
  const others = CURRENCY_LIST.map((c) => c.code as Currency).filter(
    (code) => code !== base,
  );

  return (
    <div class={styles.exchangeRates}>
      <div class={styles.header}>
        <h3>Exchange rates</h3>
        <button type="button" class={styles.reset} onClick={resetExchangeRates}>
          Reset
        </button>
      </div>
      <p class={styles.hint}>
        Amounts are converted to {base} for settlement. Edit any rate to use
        your own.
      </p>
      <div class={styles.rows}>
        {others.map((currency) => (
          <RateRow
            key={`${base}-${currency}`}
            currency={currency}
            base={base}
          />
        ))}
      </div>
    </div>
  );
}
