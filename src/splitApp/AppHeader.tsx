import { Moon, RotateCcw, Settings, Sun } from "lucide-preact";
import {
  baseCurrency,
  updateBaseCurrency,
  isAdvancedMode,
  resetAll,
  toggleAdvancedMode,
} from "../state/billState";
import { theme, toggleTheme } from "../state/theme";
import { CurrencySelector } from "../domains/currencies/CurrencySelector.tsx";
import { Popover } from "../ui/Popover.tsx";
import { useDropdown } from "../ui/useDropdown.ts";
import styles from "./AppHeader.module.css";

function CurrencyControl() {
  return (
    <CurrencySelector
      variant="ghost"
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

function ThemeToggle() {
  const isDark = theme.value === "dark";
  return (
    <button
      type="button"
      class={styles.themeToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
    >
      {isDark ? (
        <Sun size={16} aria-hidden="true" />
      ) : (
        <Moon size={16} aria-hidden="true" />
      )}
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}

export default function AppHeader() {
  const {
    open: menuOpen,
    toggle: toggleMenu,
    wrapRef,
    triggerRef: menuTriggerRef,
    alignEnd: menuAlignEnd,
  } = useDropdown<HTMLButtonElement>({ alignByViewport: true });

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

        <div class={styles.menuWrap} ref={wrapRef}>
          <button
            ref={menuTriggerRef}
            type="button"
            class={styles.iconButton}
            aria-label="Settings"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={toggleMenu}
          >
            <Settings size={18} aria-hidden="true" />
          </button>
          {menuOpen && (
            <Popover align={menuAlignEnd ? "end" : "start"} role="menu">
              <div class={styles.menuItem}>
                <span class={styles.menuLabel}>Currency</span>
                <CurrencyControl />
              </div>
              <div class={styles.menuItem}>
                <AdvancedToggle />
              </div>
              <div class={styles.menuItem}>
                <ThemeToggle />
              </div>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
}
