import { X } from "lucide-preact";
import type { Item, Person } from "../splitApp/split.types.ts";
import {
  updateItemCurrency,
  updateItemName,
  updateItemPrice,
  setItemAssignees,
  setItemPayers,
  isAdvancedMode,
} from "state/billState.ts";
import EditableText from "ui/EditableText";
import { CurrencySelector } from "../domains/currencies/CurrencySelector.tsx";
import { PeoplePicker } from "./PeoplePicker.tsx";
import { ItemPayers } from "./ItemPayers.tsx";
import styles from "./ItemCard.module.css";
import { getCurrencySymbol } from "../utils/currency.utils.ts";

interface ItemCardProps {
  item: Item;
  people: Person[];
  onRemove: (id: string) => void;
}

export default function ItemCard({ item, people, onRemove }: ItemCardProps) {
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

  const paidByIds = new Set(item.paidBy.keys());

  return (
    <div class={styles.itemCard}>
      <div class={styles.itemHeader}>
        <EditableText
          className={styles.itemName}
          value={item.name}
          onSave={handleSaveName}
        />

        <div class={styles.priceGroup}>
          {getCurrencySymbol(item.currency)}
          <EditableText
            value={item.price.toString()}
            onSave={handleSavePrice}
            type="text"
            inputMode="decimal"
            validate={validatePrice}
            autoFocus={false}
          />
          {isAdvancedMode.value && (
            <CurrencySelector
              class={styles.currencySelector}
              value={item.currency}
              onChange={(currency) => updateItemCurrency(item.id, currency)}
            />
          )}
        </div>

        {people.length > 0 && (
          <>
            <PeoplePicker
              label="Shared by"
              people={people}
              selected={item.usedBy}
              onChange={(next) => setItemAssignees(item.id, [...next])}
              alwaysMulti
            />
            <PeoplePicker
              label="Paid by"
              people={people}
              selected={paidByIds}
              onChange={(next) => setItemPayers(item.id, [...next])}
            />
          </>
        )}

        <button
          onClick={() => onRemove(item.id)}
          class="btn btn-sm btn-icon btn-danger"
          aria-label="Remove"
          title="Remove"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {isAdvancedMode.value && item.paidBy.size > 1 && (
        <ItemPayers item={item} people={people} />
      )}
    </div>
  );
}
