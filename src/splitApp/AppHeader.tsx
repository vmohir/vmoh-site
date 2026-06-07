import { Check, Moon, RotateCcw, Settings, Share2, Sun } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { appTitle } from "../state/appTitle";
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

// Stacked twin of the "Split" wordmark: the top layer is contentEditable and
// the source of truth; the orange .titleTextSplit layer mirrors the signal
// so typing in the top live-updates the bottom. We seed the editable layer's
// textContent once via the ref and never re-render its children — pushing
// the signal back through JSX would clobber the caret on every keystroke.
function EditableTitle() {
  const editRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (editRef.current && editRef.current.textContent !== appTitle.value) {
      editRef.current.textContent = appTitle.value;
    }
  }, []);

  const handleInput = (e: Event) => {
    const el = e.currentTarget as HTMLElement;
    // Strip newlines so Enter / paste-with-linebreaks can't break the wordmark.
    const text = (el.textContent ?? "").replace(/\n/g, "");
    if (text !== el.textContent) el.textContent = text;
    appTitle.value = text;
  };

  return (
    <h1 class={styles.title}>
      <SLogo />
      <span class={styles.wordmark}>
        <p
          ref={editRef}
          class={styles.titleText}
          contentEditable
          spellcheck={false}
          onInput={handleInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.currentTarget as HTMLElement).blur();
            }
          }}
        />
        <p class={styles.titleTextSplit} aria-hidden="true">
          {appTitle.value}
        </p>
      </span>
    </h1>
  );
}

// SplitFare-style S logomark — a stack of three receipt-ribbon pieces.
// The back two pieces (existing front + back of the S) are rotated as a
// group by ~10° so the whole S leans dynamically. A third smaller piece
// sits on top at a different angle, as if a third receipt was laid across
// the others — adds depth and makes the receipt-stack metaphor explicit.
function SLogo() {
  return (
    <svg
      viewBox="0 0 48 72"
      class={styles.logo}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* Existing two pieces rotated together as the base of the stack. */}
      <g transform="rotate(-10 24 36)">
        {/* Back piece — lower-right of the S, with serrated bottom. */}
        <path d="M 20 32 L 36 32 L 40 62 L 38 64 L 36 62 L 34 64 L 32 62 L 30 64 L 28 62 L 26 64 L 24 62 L 22 64 L 20 62 Z" />
        {/* Darkening overlay so the back reads as the shadowed side of the fold. */}
        <path
          fill="black"
          fill-opacity="0.28"
          d="M 20 32 L 36 32 L 40 62 L 38 64 L 36 62 L 34 64 L 32 62 L 30 64 L 28 62 L 26 64 L 24 62 L 22 64 L 20 62 Z"
        />
        {/* Front piece — upper-left of the S, with serrated top. */}
        <path d="M 8 10 L 10 8 L 12 10 L 14 8 L 16 10 L 18 8 L 20 10 L 22 8 L 24 10 L 26 8 L 28 10 L 32 40 L 16 40 Z" />
      </g>
      {/* Third piece on top — a smaller receipt laid across the middle at
          a steeper angle so it reads as a separate scrap covering the fold. */}
      <g transform="rotate(18 24 36)">
        <path d="M 18 18 L 20 16 L 22 18 L 24 16 L 26 18 L 28 16 L 30 18 L 34 54 L 22 54 Z" />
        {/* A faint white wash on the top piece so it reads brighter than the
            two below — like fresher paper laid on top. */}
        <path
          fill="white"
          fill-opacity="0.18"
          d="M 18 18 L 20 16 L 22 18 L 24 16 L 26 18 L 28 16 L 30 18 L 34 54 L 22 54 Z"
        />
      </g>
    </svg>
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
      <EditableTitle />

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
