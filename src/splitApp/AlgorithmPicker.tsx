import { useEffect, useRef, useState } from "preact/hooks";
import { ChevronDown } from "lucide-preact";
import type { SettlementAlgorithm } from "./split.types.ts";
import {
  settlementAlgorithm,
  updateSettlementAlgorithm,
} from "../state/billState";
import { getAvailableAlgorithms } from "../utils/settlementAlgorithms";
import styles from "./AlgorithmPicker.module.css";

export default function AlgorithmPicker() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const algorithms = getAvailableAlgorithms();
  const current = algorithms.find((a) => a.id === settlementAlgorithm.value);

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

  const handlePick = (id: SettlementAlgorithm) => {
    updateSettlementAlgorithm(id);
    setOpen(false);
  };

  return (
    <div class={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        class={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span class={styles.triggerName}>{current?.name}</span>
        <ChevronDown class={styles.caret} size={14} aria-hidden="true" />
      </button>

      {open && (
        <div class={styles.menu} role="listbox">
          {algorithms.map((alg) => {
            const isSelected = alg.id === settlementAlgorithm.value;
            return (
              <button
                key={alg.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                class={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                onClick={() => handlePick(alg.id)}
              >
                <span class={styles.optionName}>{alg.name}</span>
                <span class={styles.optionDesc}>{alg.description}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
