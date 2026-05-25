import { Copy, X } from "lucide-preact";
import type { Adjustment, AdjustmentType } from "./split.types";
import {
  updateAdjustment,
  removeAdjustment,
  duplicateAdjustment,
} from "../state/billState";
import EditableText from "../ui/EditableText";
import { Select } from "../ui/Select.tsx";
import styles from "./AdjustmentCard.module.css";

interface AdjustmentCardProps {
  adjustment: Adjustment;
}

export default function AdjustmentCard({ adjustment }: AdjustmentCardProps) {
  const handleLabelChange = (newLabel: string) => {
    updateAdjustment(adjustment.id, { label: newLabel });
  };

  const handleValueChange = (newValue: string) => {
    const value = parseFloat(newValue);
    if (!isNaN(value) && value >= 0) {
      updateAdjustment(adjustment.id, { value });
    }
  };

  const handleTypeChange = (e: Event) => {
    const type = (e.target as HTMLSelectElement).value as AdjustmentType;
    updateAdjustment(adjustment.id, { type });
  };

  const handleUnitChange = (e: Event) => {
    const isPercent = (e.target as HTMLSelectElement).value === "percent";
    updateAdjustment(adjustment.id, { isPercent });
  };

  const validateValue = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };

  return (
    <div class={`${styles.adjustmentCard} ${styles[adjustment.type]}`}>
      <div class={styles.cardHeader}>
        <EditableText
          className={styles.labelInput}
          value={adjustment.label}
          onSave={handleLabelChange}
          autoFocus={false}
        />

        <Select
          class={styles.typeSelector}
          value={adjustment.type}
          onChange={handleTypeChange}
        >
          <option value="tip">Tip</option>
          <option value="tax">Tax</option>
          <option value="discount">Discount</option>
        </Select>
      </div>

      <div class={styles.cardBody}>
        <div class={styles.valueInput}>
          <EditableText
            className={styles.valueField}
            value={adjustment.value.toString()}
            onSave={handleValueChange}
            type="text"
            inputMode="decimal"
            validate={validateValue}
            autoFocus={false}
          />

          <Select
            class={styles.unitSelector}
            value={adjustment.isPercent ? "percent" : "fixed"}
            onChange={handleUnitChange}
          >
            <option value="percent">%</option>
            <option value="fixed">$</option>
          </Select>
        </div>

        <div class={styles.actions}>
          <button
            class="btn btn-sm btn-icon"
            onClick={() => duplicateAdjustment(adjustment.id)}
            aria-label="Duplicate"
            title="Duplicate"
          >
            <Copy size={14} aria-hidden="true" />
          </button>
          <button
            class="btn btn-sm btn-icon btn-danger"
            onClick={() => removeAdjustment(adjustment.id)}
            aria-label="Remove"
            title="Remove"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
