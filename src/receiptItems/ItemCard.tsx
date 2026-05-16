import type { Item, Person } from "../splitApp/split.types.ts";
import {
  updateItemCurrency,
  updateItemName,
  updateItemPrice,
  isAdvancedMode,
} from "state/billState.ts";
import EditableText from "ui/EditableText";
import { CurrencySelector } from "../domains/currencies/CurrencySelector.tsx";
import { ItemAssignments } from "./ItemAssignments.tsx";
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
            {isAdvancedMode.value && (
              <CurrencySelector
                class={styles.currencySelector}
                value={item.currency}
                onChange={(currency) => updateItemCurrency(item.id, currency)}
              />
            )}
          </div>
        </div>
        <button onClick={() => onRemove(item.id)} class="btn btn-sm btn-danger">
          Remove
        </button>
      </div>

      {people.length > 0 && (
        <>
          <ItemAssignments item={item} people={people} />
          <ItemPayers item={item} people={people} />
        </>
      )}
    </div>
  );
}
