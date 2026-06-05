import { useState } from "preact/hooks";
import { ArrowRight, ChevronDown, Users, Wallet } from "lucide-preact";
import type { Item, Person } from "../splitApp/split.types.ts";
import {
  baseCurrency,
  hasMultipleCurrencies,
  hasMultiplePayers,
  setItemAssignees,
  setItemConsumedAmount,
  setItemPayers,
  updateItemCurrency,
  updateItemName,
  updateItemPrice,
} from "../state/billState.ts";
import EditableText from "ui/EditableText";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import { CurrencySelector } from "../domains/currencies/CurrencySelector.tsx";
import { PeoplePicker } from "./PeoplePicker.tsx";
import { ItemPayers } from "./ItemPayers.tsx";
// Reuse the card layout verbatim so the row matches the original item card.
import card from "./ItemCard.module.css";
import styles from "./ItemRow.module.css";

interface ItemRowProps {
  item: Item;
  people: Person[];
}

function ConsumedAmounts({ item, people }: { item: Item; people: Person[] }) {
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
          <input
            type="text"
            inputMode="decimal"
            class={styles.amountInput}
            value={item.consumedBy.get(p.id) || ""}
            placeholder="0.00"
            onInput={(e) =>
              setItemConsumedAmount(
                item.id,
                p.id,
                parseFloat((e.target as HTMLInputElement).value) || 0,
              )
            }
          />
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

export function ItemRow({ item, people }: ItemRowProps) {
  const [open, setOpen] = useState(false);
  const itemCurrency = item.currency ?? baseCurrency.value;
  const paidByIds = new Set(item.paidBy.keys());

  return (
    <div class={styles.row}>
      <div class={card.titleRow}>
        <EditableText
          className={card.itemName}
          value={item.name}
          onSave={(v) => updateItemName(item.id, v)}
          autoFocus={false}
        />

        <div class={card.priceGroup}>
          {getCurrencySymbol(itemCurrency)}
          <EditableText
            value={item.price.toString()}
            onSave={(v) => {
              const price = parseFloat(v);
              if (!isNaN(price) && price >= 0) updateItemPrice(item.id, price);
            }}
            type="text"
            inputMode="decimal"
            validate={(v) => {
              const price = parseFloat(v);
              return !isNaN(price) && price >= 0;
            }}
            autoFocus={false}
          />
          {hasMultipleCurrencies.value && (
            <CurrencySelector
              class={card.currencySelector}
              value={itemCurrency}
              onChange={(currency) => updateItemCurrency(item.id, currency)}
            />
          )}
        </div>
      </div>

      <div class={card.controlsRow}>
        {people.length > 0 && (
          <div class={card.flow}>
            <PeoplePicker
              label="Payer"
              people={people}
              selected={paidByIds}
              onChange={(next) => setItemPayers(item.id, [...next])}
              leading={<Wallet size={14} />}
              multi={hasMultiplePayers.value}
            />
            <ArrowRight class={card.flowArrow} size={14} aria-hidden="true" />
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
