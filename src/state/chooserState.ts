import { signal } from "@preact/signals";
import type { Mode } from "../chooser/types";

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;

const DEFAULT_MODE: Mode = "winner";
const DEFAULT_TEAM_COUNT = 2;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export const mode = signal<Mode>(DEFAULT_MODE);
export const teamCount = signal<number>(DEFAULT_TEAM_COUNT);

export function setMode(next: Mode): void {
  mode.value = next;
}

export function setTeamCount(next: number): void {
  teamCount.value = clamp(next, MIN_TEAMS, MAX_TEAMS);
}
