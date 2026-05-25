import { useEffect, useRef, useState } from "preact/hooks";
import { RotateCcw, Settings } from "lucide-preact";
import {
  baseCurrency,
  updateBaseCurrency,
  isAdvancedMode,
  resetAll,
  toggleAdvancedMode,
} from "../state/billState";
import { CurrencySelector } from "../domains/currencies/CurrencySelector.tsx";
import styles from "./AppHeader.module.css";

function CurrencyControl() {
  return (
    <CurrencySelector
      class={styles.currencySelect}
      value={baseCurrency.value}
      onChange={updateBaseCurrency}
    />
  );
}

function AdvancedToggle() {
  return (
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
  );
}

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const handleReset = () => {
    if (
      window.confirm(
        "Reset all people, items, and adjustments? Preferences (currency, advanced mode) are kept.",
      )
    ) {
      resetAll();
    }
  };

  return (
    <header class={styles.header}>
      <h1 class={styles.title}>Split Bill</h1>

      <div class={styles.rightCluster}>
        <div class={styles.actionsInline}>
          <CurrencyControl />
          <AdvancedToggle />
        </div>

        <button
          type="button"
          class={styles.iconButton}
          aria-label="Reset all"
          title="Reset all"
          onClick={handleReset}
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>

        <div class={styles.menuWrap} ref={menuRef}>
          <button
            type="button"
            class={`${styles.menuTrigger} ${styles.iconButton}`}
            aria-label="Settings"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Settings size={18} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div class={styles.menu} role="menu">
              <div class={styles.menuItem}>
                <span class={styles.menuLabel}>Currency</span>
                <CurrencyControl />
              </div>
              <div class={styles.menuItem}>
                <AdvancedToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
