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

// Logomark — paths sourced from src/assets/logo.svg (the user's hand-drawn
// version). Colour is currentColor so the wordmark's CSS controls the
// hue; the black overlays at low opacity are kept as is — they're depth
// shading, not the brand colour.
function SLogo() {
  return (
    <svg
      viewBox="0 0 600 600"
      class={styles.logo}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M234.62 108.403L298.628 54.7893L328.058 57.3596L325.483 86.7366L325.484 86.7376L354.913 89.3069L352.338 118.684L381.767 121.254L379.193 150.631L408.623 153.201L406.047 182.578L342.039 236.192L234.62 108.403Z" />
      <path
        fill="black"
        fill-opacity="0.35"
        d="M234.62 108.403L298.628 54.7893L328.058 57.3596L325.483 86.7366L325.484 86.7376L354.913 89.3069L352.338 118.684L381.767 121.254L379.193 150.631L408.623 153.201L406.047 182.578L342.039 236.192L234.62 108.403Z"
      />
      <path fill="black" fill-opacity="0.05" d="M361.717 220.244L236.728 106.92L233.711 109.451L341.219 237.574L361.717 220.244Z" />
      <path fill="black" fill-opacity="0.05" d="M350.201 230.653L234.651 109.483L229.626 113.904L339.126 239.357L350.201 230.653Z" />
      <path d="M365.389 489.597L300.975 543.211L271.359 540.64L273.951 511.263L273.95 511.262L244.335 508.693L246.926 479.316L217.31 476.746L219.901 447.369L190.285 444.799L192.877 415.422L257.29 361.808L365.389 489.597Z" />
      <path
        fill="black"
        fill-opacity="0.35"
        d="M365.389 489.597L300.975 543.211L271.359 540.64L273.951 511.263L273.95 511.262L244.335 508.693L246.926 479.316L217.31 476.746L219.901 447.369L190.285 444.799L192.877 415.422L257.29 361.808L365.389 489.597Z"
      />
      <path fill="black" fill-opacity="0.05" d="M344.516 507.192L254.618 364.423L257.634 361.892L365.142 490.015L344.516 507.192Z" />
      <path fill="black" fill-opacity="0.05" d="M354.928 498.818L255.663 363.982L260.89 359.801L365.423 489.422L354.928 498.818Z" />
      <path d="M187.279 278.635C151.779 236.328 157.297 173.252 199.604 137.752L235.107 107.961L412.721 319.633C448.221 361.941 442.703 425.016 400.396 460.516L364.893 490.307L187.279 278.635Z" />
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
