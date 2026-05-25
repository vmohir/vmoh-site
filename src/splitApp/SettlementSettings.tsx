import { Check, Settings } from "lucide-preact";
import {
  settlementAlgorithm,
  updateSettlementAlgorithm,
} from "../state/billState";
import { getAvailableAlgorithms } from "../utils/settlementAlgorithms";
import { Popover } from "../ui/Popover.tsx";
import { useDropdown } from "../ui/useDropdown.ts";
import styles from "./SettlementSettings.module.css";

export default function SettlementSettings() {
  const { open, toggle, close, wrapRef, triggerRef, alignEnd } =
    useDropdown<HTMLButtonElement>({ alignByViewport: true });
  const algorithms = getAvailableAlgorithms();

  return (
    <div class={styles.wrap} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        class={styles.trigger}
        aria-label="Settlement settings"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggle}
      >
        <Settings size={16} aria-hidden="true" />
      </button>

      {open && (
        <Popover align={alignEnd ? "end" : "start"} role="menu">
          <div class={styles.sectionLabel}>Method</div>
          {algorithms.map((alg) => {
            const isSelected = alg.id === settlementAlgorithm.value;
            return (
              <button
                key={alg.id}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                class={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                onClick={() => {
                  updateSettlementAlgorithm(alg.id);
                  close();
                }}
              >
                <span class={styles.optionText}>
                  <span class={styles.optionName}>{alg.name}</span>
                  <span class={styles.optionDesc}>{alg.description}</span>
                </span>
                {isSelected && (
                  <Check
                    size={14}
                    class={styles.checkIcon}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </Popover>
      )}
    </div>
  );
}
