import { signal, effect } from "@preact/signals";
import type { Mode } from "../chooser/types";

const STORAGE_KEY = "chooser-state";

interface PersistedState {
  mode: Mode;
  teamCount: number;
  holdSeconds: number;
}

const DEFAULTS: PersistedState = {
  mode: "winner",
  teamCount: 2,
  holdSeconds: 3,
};

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;
export const MIN_HOLD = 1;
export const MAX_HOLD = 6;

function loadState(): PersistedState {
  if (typeof localStorage === "undefined") return DEFAULTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULTS;
    const parsed = JSON.parse(stored) as Partial<PersistedState>;
    return {
      mode: parsed.mode === "teams" || parsed.mode === "order" ? parsed.mode : "winner",
      teamCount: clamp(parsed.teamCount ?? DEFAULTS.teamCount, MIN_TEAMS, MAX_TEAMS),
      holdSeconds: clamp(parsed.holdSeconds ?? DEFAULTS.holdSeconds, MIN_HOLD, MAX_HOLD),
    };
  } catch {
    return DEFAULTS;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

const initial = loadState();

export const mode = signal<Mode>(initial.mode);
export const teamCount = signal<number>(initial.teamCount);
export const holdSeconds = signal<number>(initial.holdSeconds);
export const settingsOpen = signal<boolean>(false);

export function setMode(next: Mode): void {
  mode.value = next;
}

export function setTeamCount(next: number): void {
  teamCount.value = clamp(next, MIN_TEAMS, MAX_TEAMS);
}

export function setHoldSeconds(next: number): void {
  holdSeconds.value = clamp(next, MIN_HOLD, MAX_HOLD);
}

if (typeof window !== "undefined") {
  effect(() => {
    const snapshot: PersistedState = {
      mode: mode.value,
      teamCount: teamCount.value,
      holdSeconds: holdSeconds.value,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* ignore quota errors */
    }
  });
}
