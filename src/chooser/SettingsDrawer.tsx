import { CloseIcon, MinusIcon, PlusIcon } from "./icons";
import {
  mode,
  teamCount,
  setMode,
  setTeamCount,
  MIN_TEAMS,
  MAX_TEAMS,
} from "../state/chooserState";
import type { Mode } from "./types";
import styles from "./SettingsDrawer.module.css";

interface Props {
  onClose: () => void;
}

const MODE_OPTIONS: ReadonlyArray<{
  value: Mode;
  label: string;
  desc: string;
}> = [
  {
    value: "winner",
    label: "One winner",
    desc: "Pick a single random finger.",
  },
  { value: "teams", label: "Split teams", desc: "Divide fingers into teams." },
  { value: "order", label: "Order", desc: "Assign each finger a position." },
];

export default function SettingsDrawer({ onClose }: Props) {
  const currentMode = mode.value;
  const teams = teamCount.value;

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
            <CloseIcon size={18} />
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
            <label class={styles.sectionLabel}>Number of teams</label>
            <div class={styles.counter}>
              <button
                type="button"
                class="btn btn-icon"
                aria-label="Fewer teams"
                disabled={teams <= MIN_TEAMS}
                onClick={() => setTeamCount(teams - 1)}
              >
                <MinusIcon size={18} />
              </button>
              <span class={styles.counterValue}>{teams}</span>
              <button
                type="button"
                class="btn btn-icon"
                aria-label="More teams"
                disabled={teams >= MAX_TEAMS}
                onClick={() => setTeamCount(teams + 1)}
              >
                <PlusIcon size={18} />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
