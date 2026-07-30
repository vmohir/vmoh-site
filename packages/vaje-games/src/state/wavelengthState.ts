import { effect, signal } from "@preact/signals";

const STORAGE_KEY = "vaje-games-wavelength-settings";

export const MIN_TARGET_SCORE = 5;
export const MAX_TARGET_SCORE = 30;
export const DEFAULT_TARGET_SCORE = 10;
export const DEFAULT_TEAM_NAMES: [string, string] = ["تیم ۱", "تیم ۲"];

interface StoredSettings {
  teamNames: [string, string];
  targetScore: number;
}

function loadSettings(): StoredSettings {
  if (typeof localStorage === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    return {
      teamNames:
        parsed.teamNames && parsed.teamNames.length === 2
          ? parsed.teamNames
          : DEFAULT_TEAM_NAMES,
      targetScore: parsed.targetScore ?? DEFAULT_TARGET_SCORE,
    };
  } catch {
    return defaults();
  }
}

function defaults(): StoredSettings {
  return { teamNames: DEFAULT_TEAM_NAMES, targetScore: DEFAULT_TARGET_SCORE };
}

const initial = loadSettings();

export const teamNames = signal<[string, string]>(initial.teamNames);
export const targetScore = signal<number>(initial.targetScore);

export function clampTargetScore(n: number): number {
  return Math.max(MIN_TARGET_SCORE, Math.min(MAX_TARGET_SCORE, n));
}

export function renameTeam(index: 0 | 1, name: string): void {
  const next: [string, string] = [...teamNames.value];
  next[index] = name;
  teamNames.value = next;
}

export function setTargetScore(n: number): void {
  targetScore.value = clampTargetScore(n);
}

if (typeof localStorage !== "undefined") {
  effect(() => {
    const snapshot: StoredSettings = {
      teamNames: teamNames.value,
      targetScore: targetScore.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  });
}
