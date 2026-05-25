import type { Mode } from "../chooser/types";

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;

export const DEFAULT_MODE: Mode = "winner";
export const DEFAULT_TEAM_COUNT = 2;

export function clampTeamCount(n: number): number {
  return Math.max(MIN_TEAMS, Math.min(MAX_TEAMS, n));
}
