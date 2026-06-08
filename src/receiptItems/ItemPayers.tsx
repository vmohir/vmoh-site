import { ChevronRight } from "lucide-preact";
import type { Item, Person } from "../splitApp/split.types.ts";
import { baseCurrency, setItemPayer } from "state/billState.ts";
import { formatCurrency } from "../utils/currency.utils.ts";
import styles from "./ItemCard.module.css";

interface ItemPayersProps {
  item: Item;
  people: Person[];
  open: boolean;
  onToggle: () => void;
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
        <span class={styles.payersRule} aria-hidden="true" />
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
