export interface SpectrumPair {
  left: string;
  right: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export type Phase = "setup" | "clueGiver" | "guessing" | "reveal" | "gameOver";
