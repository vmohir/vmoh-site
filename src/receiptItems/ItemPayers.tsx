import type { Item, Person } from "../splitApp/split.types.ts";
import { setItemPayer } from "state/billState.ts";
import { formatCurrency } from "../utils/currency.utils.ts";
import styles from "./ItemCard.module.css";

interface ItemPayersProps {
  item: Item;
  people: Person[];
}

export function ItemPayers({ item, people }: ItemPayersProps) {
  const totalPaid = Array.from(item.paidBy.values()).reduce(
    (sum, payer) => sum + payer.amount,
    0,
  );
  const isBalanced = Math.abs(totalPaid - item.price) < 0.01;

  return (
    <div class={styles.itemPayers}>
      <span class={styles.label}>Amounts paid</span>
      <div class={styles.payerInputs}>
        {people.map((person) => {
          const payer = item.paidBy.get(person.id);
          return (
            <div key={person.id} class={styles.payerRow}>
              <label>{person.name}:</label>
              <input
                type="number"
                value={payer?.amount || ""}
                onInput={(e) => {
                  const amount =
                    parseFloat((e.target as HTMLInputElement).value) || 0;
                  setItemPayer(item.id, person.id, amount, item.currency);
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <span class={styles.currencyLabel}>{item.currency}</span>
            </div>
          );
        })}
      </div>
      <div
        class={`${styles.paymentSummary} ${isBalanced ? styles.balanced : styles.unbalanced}`}
      >
        <span>Total paid: {formatCurrency(totalPaid, item.currency)}</span>
        <span>Item price: {formatCurrency(item.price, item.currency)}</span>
        {!isBalanced && (
          <span class={styles.warning}>
            {totalPaid > item.price ? "Overpaid!" : "Underpaid!"}
          </span>
        )}
      </div>
    </div>
  );
}
