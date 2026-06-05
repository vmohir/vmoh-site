import { useState } from "preact/hooks";
import type { Item, Person, SplitMode } from "../splitApp/split.types.ts";
import {
  baseCurrency,
  setItemConsumedAmount,
  setItemSplitMode,
} from "../state/billState.ts";
import { resolveItemShares } from "../utils/calculations.ts";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import styles from "./ConsumedAmounts.module.css";

interface ConsumedAmountsProps {
  item: Item;
  people: Person[];
}

const MODES: { id: SplitMode; label: string; hint: string }[] = [
  {
    id: "amounts",
    label: "Amounts",
    hint: "Blank fields share the remainder.",
  },
  {
    id: "amounts-even",
    label: "+ Even",
    hint: "Amounts plus the rest split evenly across everyone.",
  },
  {
    id: "shares",
    label: "Shares",
    hint: "Weights — price split proportionally.",
  },
];

// One consumer's value field. Local text so partial decimals aren't clobbered.
// Keyed (upstream) by split mode so it re-seeds when the mode clears values.
function ValueInput({
  item,
  person,
  placeholder,
}: {
  item: Item;
  person: Person;
  placeholder: string;
}) {
  const stored = item.consumedBy.get(person.id);
  const [text, setText] = useState(stored ? String(stored) : "");

  return (
    <input
      type="text"
      inputMode="decimal"
      class={styles.amountInput}
      value={text}
      placeholder={placeholder}
      onInput={(e) => {
        const next = (e.target as HTMLInputElement).value;
        setText(next);
        const parsed = parseFloat(next);
        setItemConsumedAmount(item.id, person.id, isNaN(parsed) ? 0 : parsed);
      }}
    />
  );
}

export function ConsumedAmounts({ item, people }: ConsumedAmountsProps) {
  const consumers = people.filter((p) => item.usedBy.has(p.id));
  const cur = item.currency ?? baseCurrency.value;
  const symbol = getCurrencySymbol(cur);
  const mode = item.splitMode;
  const isShares = mode === "shares";

  const activeHint = MODES.find((m) => m.id === mode)?.hint;

  return (
    <div class={styles.consumed}>
      <div class={styles.modes} role="group" aria-label="Split mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            class={`${styles.modeBtn} ${mode === m.id ? styles.modeActive : ""}`}
            aria-pressed={mode === m.id}
            onClick={() => setItemSplitMode(item.id, m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {consumers.length === 0 ? (
        <p class={styles.hint}>Pick who shared this item to set the split.</p>
      ) : (
        <ConsumerList
          item={item}
          consumers={consumers}
          symbol={symbol}
          cur={cur}
          isShares={isShares}
          hint={activeHint}
        />
      )}
    </div>
  );
}

function ConsumerList({
  item,
  consumers,
  symbol,
  cur,
  isShares,
  hint,
}: {
  item: Item;
  consumers: Person[];
  symbol: string;
  cur: string;
  isShares: boolean;
  hint?: string;
}) {
  const shares = resolveItemShares(item);
  const total = consumers.reduce((sum, p) => sum + (shares.get(p.id) ?? 0), 0);
  // Only the "amounts" mode can be genuinely unbalanced (every field filled but
  // not summing to the price); the other modes always reconcile.
  const balanced = Math.abs(total - item.price) < 0.01;

  return (
    <>
      {hint && <p class={styles.hint}>{hint}</p>}

      {consumers.map((p) => {
        const resolved = shares.get(p.id) ?? 0;
        const placeholder = isShares ? "1" : resolved.toFixed(2);
        const showResolved = isShares || item.splitMode === "amounts-even";
        return (
          <div key={p.id} class={styles.consumedRow}>
            <PersonAvatar person={p} />
            <span class={styles.consumedName}>{p.name}</span>
            <ValueInput
              key={`${item.splitMode}-${p.id}`}
              item={item}
              person={p}
              placeholder={placeholder}
            />
            {showResolved ? (
              <span class={styles.resolved}>
                = {symbol}
                {resolved.toFixed(2)}
              </span>
            ) : (
              <span class={styles.curLabel}>{cur}</span>
            )}
          </div>
        );
      })}

      <div class={`${styles.summary} ${balanced ? styles.ok : styles.bad}`}>
        <span>
          Total: {symbol}
          {total.toFixed(2)} / {symbol}
          {item.price.toFixed(2)}
        </span>
        {!balanced && (
          <button
            type="button"
            class={styles.splitEvenBtn}
            onClick={() => setItemSplitMode(item.id, "amounts-even")}
          >
            Split remainder evenly
          </button>
        )}
      </div>
    </>
  );
}
