import { Check, ChevronDown } from "lucide-preact";
import type { Currency } from "../../splitApp/split.types.ts";
import {
  baseCurrency,
  hasMultipleCurrencies,
  toggleHasMultipleCurrencies,
  toggleUseExchangeRates,
  updateBaseCurrency,
  useExchangeRates,
} from "../../state/billState.ts";
import { Popover } from "../../ui/Popover.tsx";
import { useDropdown } from "../../ui/useDropdown.ts";
import { CURRENCY_LIST } from "./currency-list.contant.ts";
import styles from "./CurrencyMenu.module.css";

// Base-currency picker plus the currency-related toggles, in one dropdown that
// uses the app's shared Popover (like the settlement / payer menus).
export function CurrencyMenu() {
  const { open, toggle, close, wrapRef, triggerRef, menuRef, alignEnd } =
    useDropdown<HTMLButtonElement>({ alignByViewport: true });

  return (
    <div class={styles.wrap} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        class={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        {baseCurrency.value}
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open && (
        <Popover align={alignEnd ? "end" : "start"} role="menu" overflow="auto" menuRef={menuRef}>
          <div class={styles.sectionLabel}>Base currency</div>
          {CURRENCY_LIST.map((c) => {
            const code = c.code as Currency;
            const selected = baseCurrency.value === code;
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                class={`${styles.option} ${selected ? styles.optionSelected : ""}`}
                onClick={() => {
                  updateBaseCurrency(code);
                  close();
                }}
              >
                <span class={styles.optionName}>{code}</span>
                {selected && (
                  <Check size={14} class={styles.check} aria-hidden="true" />
                )}
              </button>
            );
          })}

          <div class={styles.divider} />

          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={hasMultipleCurrencies.value}
            class={`${styles.option} ${hasMultipleCurrencies.value ? styles.optionSelected : ""}`}
            onClick={() => toggleHasMultipleCurrencies()}
          >
            <span class={styles.optionName}>Multiple currencies</span>
            {hasMultipleCurrencies.value && (
              <Check size={14} class={styles.check} aria-hidden="true" />
            )}
          </button>

          {hasMultipleCurrencies.value && (
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={useExchangeRates.value}
              class={`${styles.option} ${useExchangeRates.value ? styles.optionSelected : ""}`}
              onClick={() => toggleUseExchangeRates()}
            >
              <span class={styles.optionName}>Exchange between currencies</span>
              {useExchangeRates.value && (
                <Check size={14} class={styles.check} aria-hidden="true" />
              )}
            </button>
          )}
        </Popover>
      )}
    </div>
  );
}
