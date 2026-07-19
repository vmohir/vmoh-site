import { X, Minus, Plus } from "lucide-preact";
import { MIN_TEAMS, MAX_TEAMS } from "../state/chooserState";
import type { InputMode, Mode } from "./types";
import styles from "./SettingsDrawer.module.css";

interface Props {
  onClose: () => void;
  inputMode: InputMode;
  onChangeInputMode: (next: InputMode) => void;
  mode: Mode;
  onChangeMode: (next: Mode) => void;
  teamCount: number;
  onChangeTeamCount: (next: number) => void;
}

const MODE_OPTIONS: ReadonlyArray<{
  value: Mode;
  label: string;
  desc: string;
}> = [
  {
    value: "winner",
    label: "Pick winner",
    desc: "Pick a single random finger.",
  },
  { value: "teams", label: "Split teams", desc: "Divide fingers into teams." },
  {
    value: "order",
    label: "Order fingers",
    desc: "Assign each finger a position.",
  },
];

export default function SettingsDrawer({
  onClose,
  inputMode,
  onChangeInputMode,
  mode,
  onChangeMode,
  teamCount,
  onChangeTeamCount,
}: Props) {
  const tapToAddOn = inputMode === "tap";

  return (
    <div
      class={styles.backdrop}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClose}
    >
      <div
        class={styles.sheet}
        role="dialog"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <header class={styles.header}>
          <h2 class={styles.title}>Settings</h2>
          <button
            type="button"
            class="btn btn-ghost btn-icon"
            aria-label="Close settings"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <section class={styles.section}>
          <label class={styles.sectionLabel}>Mode</label>
          <div class={styles.modeList}>
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                class={styles.modeOption}
                data-active={mode === opt.value}
                onClick={() => onChangeMode(opt.value)}
              >
                <span class={styles.modeName}>{opt.label}</span>
                <span class={styles.modeDesc}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {mode === "teams" && (
          <section class={styles.section}>
            <label class={styles.sectionLabel}>Number of teams</label>
            <div class={styles.counter}>
              <button
                type="button"
                class="btn btn-icon"
                aria-label="Fewer teams"
                disabled={teamCount <= MIN_TEAMS}
                onClick={() => onChangeTeamCount(teamCount - 1)}
              >
                <Minus size={18} />
              </button>
              <span class={styles.counterValue}>{teamCount}</span>
              <button
                type="button"
                class="btn btn-icon"
                aria-label="More teams"
                disabled={teamCount >= MAX_TEAMS}
                onClick={() => onChangeTeamCount(teamCount + 1)}
              >
                <Plus size={18} />
              </button>
            </div>
          </section>
        )}

        <label class={styles.toggle}>
          <input
            type="checkbox"
            checked={tapToAddOn}
            onChange={(e) =>
              onChangeInputMode(
                (e.currentTarget as HTMLInputElement).checked ? "tap" : "touch",
              )
            }
          />
          <span class={styles.toggleLabel}>
            <span class={styles.toggleTitle}>Tap-to-add mode</span>
            <span class={styles.toggleDesc}>
              Tap to place markers instead of using fingers.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
