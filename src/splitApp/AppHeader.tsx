import { Check, Moon, RotateCcw, Settings, Share2, Sun } from "lucide-preact";
import { useState } from "preact/hooks";
import {
  adjustments,
  baseCurrency,
  exchangeRates,
  groups,
  hasMultipleCurrencies,
  hasMultiplePayers,
  items,
  people,
  resetAll,
  settlementAlgorithm,
  toggleHasMultipleCurrencies,
  toggleHasMultiplePayers,
  toggleUseExchangeRates,
  updateBaseCurrency,
  useExchangeRates,
} from "../state/billState";
import { theme, toggleTheme } from "../state/theme";
import { LogoOptions } from "../ui/LogoOptions.tsx";
import { CurrencySelector } from "../domains/currencies/CurrencySelector.tsx";
import { Popover } from "../ui/Popover.tsx";
import { useDropdown } from "../ui/useDropdown.ts";
import { buildSharePayload, buildShareUrl } from "../utils/share.ts";
import type { Signal } from "@preact/signals";
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

interface SwitchProps {
  label: string;
  signal: Signal<boolean>;
  onToggle: () => void;
}

function Switch({ label, signal, onToggle }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={signal.value}
      class={`${styles.toggle} ${signal.value ? styles.toggleOn : ""}`}
      onClick={onToggle}
    >
      <span class={styles.toggleTrack}>
        <span class={styles.toggleThumb} />
      </span>
      <span class={styles.toggleLabel}>{label}</span>
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
        "Reset all people, items, and adjustments? Preferences are kept.",
      )
    ) {
      resetAll();
    }
  };

  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const handleShare = async () => {
    const payload = buildSharePayload({
      people: people.value,
      items: items.value,
      adjustments: adjustments.value,
      baseCurrency: baseCurrency.value,
      settlementAlgorithm: settlementAlgorithm.value,
      hasMultipleCurrencies: hasMultipleCurrencies.value,
      hasMultiplePayers: hasMultiplePayers.value,
      useExchangeRates: useExchangeRates.value,
      exchangeRates: exchangeRates.value,
      groups: groups.value,
    });
    let url: string;
    try {
      url = await buildShareUrl(payload);
    } catch (e) {
      console.error("Failed to build share URL:", e);
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: "Split Bill", url });
        return;
      } catch {
        // user dismissed or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1800);
    } catch (e) {
      console.error("Failed to copy share URL:", e);
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <header class={styles.header}>
      <h1 class={styles.title}>
        <p class={styles.titleText}>Split</p>
        <p class={styles.titleText}>Split</p>
      </h1>

      <LogoOptions />

      <div class={styles.rightCluster}>
        <button
          type="button"
          class={styles.iconButton}
          aria-label={shareState === "copied" ? "Link copied" : "Share bill"}
          title={shareState === "copied" ? "Link copied" : "Share bill"}
          onClick={handleShare}
        >
          {shareState === "copied" ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Share2 size={16} aria-hidden="true" />
          )}
        </button>
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
                <Switch
                  label="Multiple currencies"
                  signal={hasMultipleCurrencies}
                  onToggle={toggleHasMultipleCurrencies}
                />
              </div>
              {hasMultipleCurrencies.value && (
                <div class={styles.menuItem}>
                  <Switch
                    label="Exchange between currencies"
                    signal={useExchangeRates}
                    onToggle={toggleUseExchangeRates}
                  />
                </div>
              )}
              <div class={styles.menuItem}>
                <Switch
                  label="Multiple payers per item"
                  signal={hasMultiplePayers}
                  onToggle={toggleHasMultiplePayers}
                />
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
