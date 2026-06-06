import { useState } from "preact/hooks";
import { ChevronRight, Plus, X } from "lucide-preact";
import type {
  Adjustment,
  AdjustmentType,
  Item,
} from "../splitApp/split.types.ts";
import {
  addItemAdjustment,
  baseCurrency,
  removeItemAdjustment,
  updateItemAdjustment,
} from "../state/billState.ts";
import { itemAdjustmentNet } from "../utils/calculations.ts";
import { getCurrencySymbol } from "../utils/currency.utils.ts";
import EditableText from "ui/EditableText";
import { Select } from "ui/Select.tsx";
import styles from "./ItemAdjustments.module.css";

function AdjustmentRow({
  item,
  adjustment,
  symbol,
}: {
  item: Item;
  adjustment: Adjustment;
  symbol: string;
}) {
  return (
    <div class={styles.row}>
      <Select
        class={styles.typeSelect}
        value={adjustment.type}
        onChange={(e) =>
          updateItemAdjustment(item.id, adjustment.id, {
            type: (e.target as HTMLSelectElement).value as AdjustmentType,
          })
        }
      >
        <option value="tip">Tip</option>
        <option value="tax">VAT</option>
        <option value="discount">Discount</option>
      </Select>

      <EditableText
        className={styles.valueField}
        value={adjustment.value.toString()}
        type="text"
        inputMode="decimal"
        autoFocus={false}
        validate={(v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0}
        onSave={(v) => {
          const value = parseFloat(v);
          if (!isNaN(value) && value >= 0)
            updateItemAdjustment(item.id, adjustment.id, { value });
        }}
      />

      <Select
        class={styles.unitSelect}
        value={adjustment.isPercent ? "percent" : "fixed"}
        onChange={(e) =>
          updateItemAdjustment(item.id, adjustment.id, {
            isPercent: (e.target as HTMLSelectElement).value === "percent",
          })
        }
      >
        <option value="percent">%</option>
        <option value="fixed">{symbol}</option>
      </Select>

      <button
        type="button"
        class="btn btn-sm btn-icon btn-danger"
        aria-label="Remove adjustment"
        onClick={() => removeItemAdjustment(item.id, adjustment.id)}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ItemAdjustments({ item }: { item: Item }) {
  const [open, setOpen] = useState(item.adjustments.length > 0);
  const symbol = getCurrencySymbol(item.currency ?? baseCurrency.value);
  const net = itemAdjustmentNet(item);
  const count = item.adjustments.length;

  return (
    <div class={styles.wrap}>
      <button
        type="button"
        class={styles.toggle}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <ChevronRight
          class={styles.chevron}
          data-open={open}
          size={14}
          aria-hidden="true"
        />
        <span class={styles.label}>Adjustments</span>
        {count > 0 && Math.abs(net) > 0.005 && (
          <span class={styles.net}>
            {net < 0 ? "−" : "+"}
            {symbol}
            {Math.abs(net).toFixed(2)}
          </span>
        )}
      </button>

      {open && (
        <div class={styles.body}>
          {item.adjustments.map((adjustment) => (
            <AdjustmentRow
              key={adjustment.id}
              item={item}
              adjustment={adjustment}
              symbol={symbol}
            />
          ))}
          <button
            type="button"
            class={styles.addBtn}
            onClick={() => addItemAdjustment(item.id, "tip")}
          >
            <Plus size={14} aria-hidden="true" />
            Add adjustment
          </button>
        </div>
      )}
    </div>
  );
}
