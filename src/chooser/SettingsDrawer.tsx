import { X } from "lucide-preact";
import {
  mode,
  teamCount,
  holdSeconds,
  setMode,
  setTeamCount,
  setHoldSeconds,
  MIN_TEAMS,
  MAX_TEAMS,
  MIN_HOLD,
  MAX_HOLD,
} from "../state/chooserState";
import type { Mode } from "./types";
import styles from "./SettingsDrawer.module.css";

interface Props {
  onClose: () => void;
}

const MODE_OPTIONS: ReadonlyArray<{ value: Mode; label: string; desc: string }> = [
  { value: "winner", label: "One winner", desc: "Pick a single random finger." },
  { value: "teams", label: "Split teams", desc: "Divide fingers into teams." },
  { value: "order", label: "Order", desc: "Assign each finger a position." },
];

export default function SettingsDrawer({ onClose }: Props) {
  const currentMode = mode.value;
  const teams = teamCount.value;
  const hold = holdSeconds.value;

  return (
    <div class={styles.backdrop} onClick={onClose}>
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
                data-active={currentMode === opt.value}
                onClick={() => setMode(opt.value)}
              >
                <span class={styles.modeName}>{opt.label}</span>
                <span class={styles.modeDesc}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {currentMode === "teams" && (
          <section class={styles.section}>
            <div class={styles.row}>
              <label for="team-count" class={styles.sectionLabel}>
                Number of teams
              </label>
              <span class={styles.value}>{teams}</span>
            </div>
            <input
              id="team-count"
              type="range"
              min={MIN_TEAMS}
              max={MAX_TEAMS}
              step={1}
              value={teams}
              onInput={(e) =>
                setTeamCount(Number((e.currentTarget as HTMLInputElement).value))
              }
              class={styles.slider}
            />
          </section>
        )}

        <section class={styles.section}>
          <div class={styles.row}>
            <label for="hold-seconds" class={styles.sectionLabel}>
              Hold time
            </label>
            <span class={styles.value}>{hold}s</span>
          </div>
          <input
            id="hold-seconds"
            type="range"
            min={MIN_HOLD}
            max={MAX_HOLD}
            step={1}
            value={hold}
            onInput={(e) =>
              setHoldSeconds(Number((e.currentTarget as HTMLInputElement).value))
            }
            class={styles.slider}
          />
        </section>

        <p class={styles.tip}>
          Place 2 or more fingers on the screen and hold for {hold} second{hold === 1 ? "" : "s"}.
        </p>
      </div>
    </div>
  );
}
