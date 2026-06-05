import { useState } from "preact/hooks";
import type { Item, Person } from "../splitApp/split.types.ts";
import { baseCurrency, setItemConsumedAmount } from "../state/billState.ts";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import styles from "./ConsumedAmounts.module.css";

interface ConsumedAmountsProps {
  item: Item;
  people: Person[];
}

// One consumer's amount field. Keeps local text so partial decimals ("12.",
// "0.") aren't clobbered by re-formatting the parsed number on every keystroke.
function AmountInput({ item, person }: { item: Item; person: Person }) {
  const stored = item.consumedBy.get(person.id);
  const [text, setText] = useState(stored ? String(stored) : "");

  return (
    <input
      type="text"
      inputMode="decimal"
      class={styles.amountInput}
      value={text}
      placeholder="0.00"
      onInput={(e) => {
        const next = (e.target as HTMLInputElement).value;
        setText(next);
        const parsed = parseFloat(next);
        setItemConsumedAmount(item.id, person.id, isNaN(parsed) ? 0 : parsed);
      }}
    />
  );
}

// Expanded editor: one input per consumer for the exact amount they consumed,
// with a running total vs the item price. Empty across the board means the
// price is split equally (handled in calculations).
export function ConsumedAmounts({ item, people }: ConsumedAmountsProps) {
  const consumers = people.filter((p) => item.usedBy.has(p.id));
  const cur = item.currency ?? baseCurrency.value;
  const symbol = getCurrencySymbol(cur);

  if (consumers.length === 0) {
    return <p class={styles.hint}>Pick who shared this item to set amounts.</p>;
  }

  const total = [...item.consumedBy.values()].reduce((sum, n) => sum + n, 0);
  const balanced =
    item.consumedBy.size === 0 || Math.abs(total - item.price) < 0.01;

  return (
    <div class={styles.consumed}>
      <span class={styles.label}>Consumed amounts</span>
      {consumers.map((p) => (
        <div key={p.id} class={styles.consumedRow}>
          <PersonAvatar person={p} />
          <span class={styles.consumedName}>{p.name}</span>
          <AmountInput item={item} person={p} />
          <span class={styles.curLabel}>{cur}</span>
        </div>
      ))}
      <div class={`${styles.summary} ${balanced ? styles.ok : styles.bad}`}>
        <span>
          Total: {symbol}
          {total.toFixed(2)} / {symbol}
          {item.price.toFixed(2)}
        </span>
        {!balanced && (
          <span class={styles.summaryFlag}>
            {total > item.price ? "Over" : "Under"}
          </span>
        )}
      </div>
    </div>
  );
}
