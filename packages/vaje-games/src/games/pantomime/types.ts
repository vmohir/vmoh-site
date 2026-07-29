export type Difficulty = "easy" | "medium" | "hard";
export type GameMode = "timed" | "selection";

export interface DifficultyMeta {
  id: Difficulty;
  label: string;
  points: number;
}

export interface Category {
  id: string;
  label: string;
}

export interface Word {
  id: string;
  text: string;
  // In "timed" mode this is content-only grouping, not filterable — all
  // categories play. In "selection" mode the player picks one per turn.
  category: string;
  difficulty: Difficulty;
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export type Phase = "setup" | "ready" | "playing" | "roundEnd" | "gameOver";

export interface RoundStats {
  correct: number;
  skipped: number;
}
