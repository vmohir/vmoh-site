import {
  tax,
  taxIsPercent,
  tip,
  tipIsPercent,
  updateTax,
  updateTip,
} from "../state/billState";
import styles from "./TaxTipSection.module.css";

export default function TaxTipSection() {
  return (
    <div class={styles.taxTipSection}>
      <div class={styles.inputRow}>
        <label>
          <div class={`${styles.inputWithToggle} flex gap-2 items-center`}>
            <span>Tax:</span>
            <input
              type="text"
              inputmode="number"
              value={tax.value}
              onInput={(e) =>
                updateTax(
                  parseFloat((e.target as HTMLInputElement).value) || 0,
                  taxIsPercent.value,
                )
              }
            />
            <select
              value={taxIsPercent.value ? "percent" : "fixed"}
              onChange={(e) =>
                updateTax(
                  tax.value,
                  (e.target as HTMLSelectElement).value === "percent",
                )
              }
            >
              <option value="percent">%</option>
              <option value="fixed">$</option>
            </select>
          </div>
        </label>
      </div>

      <div class={styles.inputRow}>
        <label>
          <div className={`${styles.inputWithToggle} flex gap-2 items-center`}>
            <span>Tip:</span>
            <input
              type="text"
              inputmode="number"
              value={tip.value}
              onInput={(e) =>
                updateTip(
                  parseFloat((e.target as HTMLInputElement).value) || 0,
                  tipIsPercent.value,
                )
              }
            />
            <select
              value={tipIsPercent.value ? "percent" : "fixed"}
              onChange={(e) =>
                updateTip(
                  tip.value,
                  (e.target as HTMLSelectElement).value === "percent",
                )
              }
            >
              <option value="percent">%</option>
              <option value="fixed">$</option>
            </select>
          </div>
        </label>
      </div>
    </div>
  );
}
