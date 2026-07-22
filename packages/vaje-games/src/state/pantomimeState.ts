import { effect, signal } from "@preact/signals";
import { DIFFICULTIES } from "../games/pantomime/words";
import type { Difficulty } from "../games/pantomime/types";

const STORAGE_KEY = "vaje-games-pantomime-settings";

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 8;
export const MIN_ROUND_SECONDS = 30;
export const MAX_ROUND_SECONDS = 120;
export const MIN_TARGET_SCORE = 10;
export const MAX_TARGET_SCORE = 100;

export const DEFAULT_TEAM_NAMES = ["تیم ۱", "تیم ۲"];
export const DEFAULT_ROUND_SECONDS = 60;
export const DEFAULT_TARGET_SCORE = 30;
export const DEFAULT_DIFFICULTIES: Difficulty[] = DIFFICULTIES.map((d) => d.id);

interface StoredSettings {
  teamNames: string[];
  selectedDifficulties: Difficulty[];
  roundSeconds: number;
  targetScore: number;
}

function loadSettings(): StoredSettings {
  if (typeof localStorage === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;

    const validDifficultyIds = new Set(DEFAULT_DIFFICULTIES);
    const restoredDifficulties = (parsed.selectedDifficulties ?? []).filter(
      (d) => validDifficultyIds.has(d),
    );

    return {
      teamNames:
        parsed.teamNames && parsed.teamNames.length >= MIN_TEAMS
          ? parsed.teamNames
          : DEFAULT_TEAM_NAMES,
      selectedDifficulties:
        restoredDifficulties.length > 0
          ? restoredDifficulties
          : DEFAULT_DIFFICULTIES,
      roundSeconds: parsed.roundSeconds ?? DEFAULT_ROUND_SECONDS,
      targetScore: parsed.targetScore ?? DEFAULT_TARGET_SCORE,
    };
  } catch {
    return defaults();
  }
}

function defaults(): StoredSettings {
  return {
    teamNames: DEFAULT_TEAM_NAMES,
    selectedDifficulties: DEFAULT_DIFFICULTIES,
    roundSeconds: DEFAULT_ROUND_SECONDS,
    targetScore: DEFAULT_TARGET_SCORE,
  };
}

const initial = loadSettings();

export const teamNames = signal<string[]>(initial.teamNames);
export const selectedDifficulties = signal<Difficulty[]>(
  initial.selectedDifficulties,
);
export const roundSeconds = signal<number>(initial.roundSeconds);
export const targetScore = signal<number>(initial.targetScore);

export function clampRoundSeconds(n: number): number {
  return Math.max(MIN_ROUND_SECONDS, Math.min(MAX_ROUND_SECONDS, n));
}

export function clampTargetScore(n: number): number {
  return Math.max(MIN_TARGET_SCORE, Math.min(MAX_TARGET_SCORE, n));
}

export function addTeam(): void {
  if (teamNames.value.length >= MAX_TEAMS) return;
  teamNames.value = [...teamNames.value, `تیم ${teamNames.value.length + 1}`];
}

export function removeTeam(index: number): void {
  if (teamNames.value.length <= MIN_TEAMS) return;
  teamNames.value = teamNames.value.filter((_, i) => i !== index);
}

export function renameTeam(index: number, name: string): void {
  teamNames.value = teamNames.value.map((existing, i) =>
    i === index ? name : existing,
  );
}

export function toggleDifficulty(id: Difficulty): void {
  const isSelected = selectedDifficulties.value.includes(id);
  if (isSelected && selectedDifficulties.value.length === 1) return;
  selectedDifficulties.value = isSelected
    ? selectedDifficulties.value.filter((d) => d !== id)
    : [...selectedDifficulties.value, id];
}

export function setRoundSeconds(n: number): void {
  roundSeconds.value = clampRoundSeconds(n);
}

export function setTargetScore(n: number): void {
  targetScore.value = clampTargetScore(n);
}

if (typeof localStorage !== "undefined") {
  effect(() => {
    const snapshot: StoredSettings = {
      teamNames: teamNames.value,
      selectedDifficulties: selectedDifficulties.value,
      roundSeconds: roundSeconds.value,
      targetScore: targetScore.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  });
}
