import {
  baseCurrency,
  updateBaseCurrency,
  isAdvancedMode,
  toggleAdvancedMode,
} from "../state/billState";
import { CurrencySelector } from "../domains/currencies/CurrencySelector.tsx";
import styles from "./AppHeader.module.css";

export default function AppHeader() {
  return (
    <header class={styles.header}>
      <h1 class={styles.title}>Split Bill</h1>

      <div class={styles.actions}>
        <label class={styles.baseCurrency}>
          <span class={styles.baseCurrencyLabel}>Currency</span>
          <CurrencySelector
            class={styles.currencySelect}
            value={baseCurrency.value}
            onChange={updateBaseCurrency}
          />
        </label>

        <button
          type="button"
          role="switch"
          aria-checked={isAdvancedMode.value}
          class={`${styles.toggle} ${isAdvancedMode.value ? styles.toggleOn : ""}`}
          onClick={toggleAdvancedMode}
        >
          <span class={styles.toggleTrack}>
            <span class={styles.toggleThumb} />
          </span>
          <span class={styles.toggleLabel}>Advanced</span>
        </button>
      </div>
    </header>
  );
}
