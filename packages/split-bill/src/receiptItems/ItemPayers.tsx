import { ChevronRight } from "lucide-preact";
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import type { Item, Person } from "../splitApp/split.types.ts";
import { baseCurrency, setItemPayer } from "state/billState.ts";
import { formatCurrency, getCurrencySymbol } from "../utils/currency.utils.ts";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import styles from "./ItemCard.module.css";

interface ItemPayersProps {
  item: Item;
  people: Person[];
  open: boolean;
  onToggle: () => void;
}

// Collapsed-state summary: avatars of who paid, with their amounts when there's
// room. A hidden probe (always showing amounts) is measured against the
// available width so the decision is stable and never oscillates.
function PayerSummary({ item, people }: { item: Item; people: Person[] }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [compact, setCompact] = useState(false);

  const symbol = getCurrencySymbol(item.currency ?? baseCurrency.value);
  const payers = people
    .filter((p) => item.paidBy.has(p.id))
    .map((p) => ({ person: p, amount: item.paidBy.get(p.id)!.amount }));
  const signature = payers.map((p) => `${p.person.id}:${p.amount}`).join("|");

  useLayoutEffect(() => {
    const c = containerRef.current;
    const probe = probeRef.current;
    if (!c || !probe) return;
    const measure = () => setCompact(probe.scrollWidth > c.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    return () => ro.disconnect();
  }, [signature]);

  if (payers.length === 0)
    return <span class={styles.payersRule} aria-hidden="true" />;

  return (
    <span class={styles.payerSummary} ref={containerRef}>
      {payers.map((p) => (
        <span class={styles.payerChip} key={p.person.id}>
          <PersonAvatar person={p.person} />
          {!compact && (
            <span class={styles.payerAmt}>
              {symbol}
              {p.amount.toFixed(2)}
            </span>
          )}
        </span>
      ))}
      <span class={styles.payerProbe} ref={probeRef} aria-hidden="true">
        {payers.map((p) => (
          <span class={styles.payerChip} key={p.person.id}>
            <PersonAvatar person={p.person} />
            <span class={styles.payerAmt}>
              {symbol}
              {p.amount.toFixed(2)}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}

export function ItemPayers({ item, people, open, onToggle }: ItemPayersProps) {
  const totalPaid = Array.from(item.paidBy.values()).reduce(
    (sum, payer) => sum + payer.amount,
    0,
  );
  const isBalanced = Math.abs(totalPaid - item.price) < 0.01;
  const itemCurrency = item.currency ?? baseCurrency.value;

  return (
    <div class={styles.itemPayers}>
      <button
        type="button"
        class={styles.payersToggle}
        aria-expanded={open}
        onClick={onToggle}
      >
        <ChevronRight
          class={styles.payersChevron}
          data-open={open}
          size={14}
          aria-hidden="true"
        />
        <span class={styles.label}>Paid by</span>
        {open ? (
          <span class={styles.payersRule} aria-hidden="true" />
        ) : (
          <PayerSummary item={item} people={people} />
        )}
      </button>

      {open && (
        <>
          <div class={styles.payerInputs}>
            {people.map((person) => {
              const payer = item.paidBy.get(person.id);
              return (
                <div key={person.id} class={styles.payerRow}>
                  <label>{person.name}:</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={payer?.amount || ""}
                    onInput={(e) => {
                      const amount =
                        parseFloat((e.target as HTMLInputElement).value) || 0;
                      setItemPayer(item.id, person.id, amount, item.currency);
                    }}
                    placeholder="0.00"
                  />
                  <span class={styles.currencyLabel}>{itemCurrency}</span>
                </div>
              );
            })}
          </div>
          <div
            class={`${styles.paymentSummary} ${isBalanced ? styles.balanced : styles.unbalanced}`}
          >
            <span>Total paid: {formatCurrency(totalPaid, itemCurrency)}</span>
            <span>Item price: {formatCurrency(item.price, itemCurrency)}</span>
            {!isBalanced && (
              <span class={styles.warning}>
                {totalPaid > item.price ? "Overpaid!" : "Underpaid!"}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
