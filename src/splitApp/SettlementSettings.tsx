import { useEffect, useRef, useState } from "preact/hooks";
import { Check, Settings } from "lucide-preact";
import {
  settlementAlgorithm,
  updateSettlementAlgorithm,
} from "../state/billState";
import { getAvailableAlgorithms } from "../utils/settlementAlgorithms";
import styles from "./SettlementSettings.module.css";

export default function SettlementSettings() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const algorithms = getAvailableAlgorithms();

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div class={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        class={styles.trigger}
        aria-label="Settlement settings"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <Settings size={16} aria-hidden="true" />
      </button>

      {open && (
        <div class={styles.menu} role="menu">
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
                  setOpen(false);
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
        </div>
      )}
    </div>
  );
}
