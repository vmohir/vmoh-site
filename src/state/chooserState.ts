import { signal, effect } from "@preact/signals";
import type { Mode } from "../chooser/types";

const STORAGE_KEY = "chooser-state";

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;

interface PersistedState {
  mode: Mode;
  teamCount: number;
}

const DEFAULTS: PersistedState = {
  mode: "winner",
  teamCount: 2,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function loadState(): PersistedState {
  if (typeof localStorage === "undefined") return DEFAULTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULTS;
    const parsed = JSON.parse(stored) as Partial<PersistedState>;
    return {
      mode:
        parsed.mode === "teams" || parsed.mode === "order"
          ? parsed.mode
          : "winner",
      teamCount: clamp(
        parsed.teamCount ?? DEFAULTS.teamCount,
        MIN_TEAMS,
        MAX_TEAMS,
      ),
    };
  } catch {
    return DEFAULTS;
  }
}

const initial = loadState();

export const mode = signal<Mode>(initial.mode);
export const teamCount = signal<number>(initial.teamCount);

export function setMode(next: Mode): void {
  mode.value = next;
}

export function setTeamCount(next: number): void {
  teamCount.value = clamp(next, MIN_TEAMS, MAX_TEAMS);
}

if (typeof window !== "undefined") {
  effect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode: mode.value, teamCount: teamCount.value }),
      );
    } catch {
      /* ignore quota errors */
    }
  });
}
