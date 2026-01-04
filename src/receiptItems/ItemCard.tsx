import type { Item, Person } from "splitApp/split.types.ts";
import {
  toggleItemAssignment,
  setItemPayer,
  updateItemCurrency,
  updateItemName,
  updateItemPrice,
  hasMultipleCurrencies,
} from "state/billState.ts";
import EditableText from "ui/EditableText";
import styles from "./ItemCard.module.css";
import {
  type Currency,
  formatCurrency,
  getCurrencySymbol,
} from "../utils/currency.utils.ts";

interface ItemCardProps {
  item: Item;
  people: Person[];
  onRemove: (id: string) => void;
}

export default function ItemCard({ item, people, onRemove }: ItemCardProps) {
  // Calculate total paid for this item
  const getTotalPaid = (): number => {
    return Array.from(item.paidBy.values()).reduce(
      (sum, payer) => sum + payer.amount,
      0,
    );
  };

  const totalPaid = getTotalPaid();
  const isBalanced = Math.abs(totalPaid - item.price) < 0.01;

  // Name edit handler
  const handleSaveName = (newName: string) => {
    updateItemName(item.id, newName);
  };

  const handleSavePrice = (newPrice: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price >= 0) {
      updateItemPrice(item.id, price);
    }
  };

  const validatePrice = (value: string): boolean => {
    const price = parseFloat(value);
    return !isNaN(price) && price >= 0;
  };

  return (
    <div class={styles.itemCard}>
      <div class={styles.itemHeader}>
        <div class="flex flex-1 gap-2">
          <EditableText
            className="flex-1"
            value={item.name}
            onSave={handleSaveName}
          />

          <div class="flex gap-0.5 items-center">
            {getCurrencySymbol(item.currency)}
            <EditableText
              value={item.price.toString()}
              onSave={handleSavePrice}
              type="text"
              inputMode="decimal"
              validate={validatePrice}
              autoFocus={false}
            />
            {hasMultipleCurrencies.value && (
              <select
                class={styles.currencySelector}
                value={item.currency}
                onChange={(e) =>
                  updateItemCurrency(
                    item.id,
                    (e.target as HTMLSelectElement).value as Currency,
                  )
                }
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            )}
          </div>
        </div>
        <button onClick={() => onRemove(item.id)} class="btn btn-sm btn-danger">
          Remove
        </button>
      </div>

      {people.length > 0 && (
        <>
          <div class={styles.itemAssignments}>
            <span class={styles.label}>
              Assigned to (who shares this item):
            </span>
            <div class={styles.checkboxes}>
              {people.map((person) => (
                <label key={person.id}>
                  <input
                    type="checkbox"
                    checked={item.usedBy.has(person.id)}
                    onChange={() => toggleItemAssignment(item.id, person.id)}
                  />
                  {person.name}
                </label>
              ))}
            </div>
          </div>

          <div class={styles.itemPayers}>
            <span class={styles.label}>Paid by (who actually paid):</span>
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
              <span>
                Total paid: {formatCurrency(totalPaid, item.currency)}
              </span>
              <span>
                Item price: {formatCurrency(item.price, item.currency)}
              </span>
              {!isBalanced && (
                <span class={styles.warning}>
                  {totalPaid > item.price ? "Overpaid!" : "Underpaid!"}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
