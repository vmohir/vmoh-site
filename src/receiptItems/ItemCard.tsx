import { useState } from "preact/hooks";
import { ArrowRight, ChevronDown, Users, Wallet, X } from "lucide-preact";
import type { Item, Person } from "../splitApp/split.types.ts";
import {
  baseCurrency,
  hasMultipleCurrencies,
  hasMultiplePayers,
  setItemAssignees,
  setItemPayers,
  updateItemCurrency,
  updateItemName,
  updateItemPrice,
} from "state/billState.ts";
import EditableText from "ui/EditableText";
import { CurrencySelector } from "../domains/currencies/CurrencySelector.tsx";
import { PeoplePicker } from "./PeoplePicker.tsx";
import { ItemPayers } from "./ItemPayers.tsx";
import { ConsumedAmounts } from "./ConsumedAmounts.tsx";
import styles from "./ItemCard.module.css";
import { getCurrencySymbol } from "../utils/currency.utils.ts";

interface ItemCardProps {
  item: Item;
  people: Person[];
  onRemove: (id: string) => void;
}

export default function ItemCard({ item, people, onRemove }: ItemCardProps) {
  const [open, setOpen] = useState(false);

  const handleSavePrice = (newPrice: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price >= 0) updateItemPrice(item.id, price);
  };

  const validatePrice = (value: string): boolean => {
    const price = parseFloat(value);
    return !isNaN(price) && price >= 0;
  };

  const paidByIds = new Set(item.paidBy.keys());
  const itemCurrency = item.currency ?? baseCurrency.value;

  return (
    <div class={styles.itemCard}>
      <div class={styles.mainRow}>
        <EditableText
          className={styles.itemName}
          value={item.name}
          onSave={(v) => updateItemName(item.id, v)}
          autoFocus={false}
        />

        <div class={styles.priceGroup}>
          {getCurrencySymbol(itemCurrency)}
          <EditableText
            className={styles.priceInput}
            value={item.price.toString()}
            onSave={handleSavePrice}
            type="text"
            inputMode="decimal"
            validate={validatePrice}
            autoFocus={false}
          />
          {hasMultipleCurrencies.value && (
            <CurrencySelector
              class={styles.currencySelector}
              value={itemCurrency}
              onChange={(currency) => updateItemCurrency(item.id, currency)}
            />
          )}
        </div>

        {people.length > 0 && (
          <div class={styles.flow}>
            <PeoplePicker
              label="Payer"
              people={people}
              selected={paidByIds}
              onChange={(next) => setItemPayers(item.id, [...next])}
              leading={<Wallet size={14} />}
              multi={hasMultiplePayers.value}
            />
            <ArrowRight class={styles.flowArrow} size={14} aria-hidden="true" />
            <PeoplePicker
              label="Split"
              people={people}
              selected={item.usedBy}
              onChange={(next) => setItemAssignees(item.id, [...next])}
              leading={<Users size={14} />}
              multi
            />
          </div>
        )}

        <button
          type="button"
          class={`btn btn-sm btn-icon btn-ghost ${styles.expandBtn}`}
          aria-label={open ? "Collapse" : "Expand"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <ChevronDown
            class={styles.chevron}
            data-open={open}
            size={16}
            aria-hidden="true"
          />
        </button>

        <button
          onClick={() => onRemove(item.id)}
          class={`btn btn-sm btn-icon btn-danger ${styles.removeBtn}`}
          aria-label="Remove"
          title="Remove"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {hasMultiplePayers.value && item.paidBy.size > 1 && (
        <ItemPayers item={item} people={people} />
      )}

      {open && (
        <div class={styles.panel}>
          <ConsumedAmounts item={item} people={people} />
        </div>
      )}
    </div>
  );
}
