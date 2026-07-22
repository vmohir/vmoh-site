export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultyMeta {
  id: Difficulty;
  label: string;
  points: number;
}

export interface Word {
  id: string;
  text: string;
  // Content-only grouping (see words.json) — not filterable in the UI, all
  // categories always play.
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
