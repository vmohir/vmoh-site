import type { BoxDef, ColorId } from "./types";

// The printed sheet. Values/points here are an original approximation of the
// shape of the real "That's Pretty Clever"-style scoresheet (fill rule, fox
// spots, reroll spots) — not a copy of any publisher's exact numbers, which
// weren't verifiable from this environment.
export const BOARD: Record<ColorId, BoxDef[]> = {
  // 4x3-ish grid: place a die showing this number in any open matching box.
  yellow: [
    { kind: "match", value: 1 },
    { kind: "match", value: 2 },
    { kind: "match", value: 3 },
    { kind: "match", value: 4 },
    { kind: "match", value: 5 },
    { kind: "match", value: 6, fox: true },
    { kind: "match", value: 6 },
    { kind: "match", value: 5 },
    { kind: "match", value: 4 },
    { kind: "match", value: 3 },
    { kind: "match", value: 2 },
    { kind: "match", value: 1, bonusReroll: true },
  ],
  // Any order, matching number — scored by count of boxes filled, not sum.
  blue: [
    { kind: "match", value: 1 },
    { kind: "match", value: 2 },
    { kind: "match", value: 3 },
    { kind: "match", value: 4, bonusReroll: true },
    { kind: "match", value: 5 },
    { kind: "match", value: 6 },
    { kind: "match", value: 7 },
    { kind: "match", value: 8 },
    { kind: "match", value: 9 },
    { kind: "match", value: 10 },
    { kind: "match", value: 11 },
    { kind: "match", value: 12, fox: true },
  ],
  // Left to right, each box needs a die at least as high as its threshold.
  green: [
    { kind: "threshold", threshold: 1, points: 1 },
    { kind: "threshold", threshold: 2, points: 2 },
    { kind: "threshold", threshold: 3, points: 3 },
    { kind: "threshold", threshold: 4, points: 4, bonusReroll: true },
    { kind: "threshold", threshold: 5, points: 5 },
    { kind: "threshold", threshold: 1, points: 7 },
    { kind: "threshold", threshold: 2, points: 9 },
    { kind: "threshold", threshold: 3, points: 11, fox: true },
  ],
  // Left to right, write the die's value (some boxes multiply it).
  orange: [
    { kind: "free", multiplier: 1 },
    { kind: "free", multiplier: 1 },
    { kind: "free", multiplier: 2 },
    { kind: "free", multiplier: 1, bonusReroll: true },
    { kind: "free", multiplier: 1 },
    { kind: "free", multiplier: 2 },
    { kind: "free", multiplier: 1 },
    { kind: "free", multiplier: 3, fox: true },
  ],
  // Left to right, each entry must beat the previous one — caps at 6 boxes
  // since values only run 1-6.
  purple: [
    { kind: "increasing", points: 2 },
    { kind: "increasing", points: 4 },
    { kind: "increasing", points: 6, bonusReroll: true },
    { kind: "increasing", points: 8 },
    { kind: "increasing", points: 10 },
    { kind: "increasing", points: 14, fox: true },
  ],
};

export type ScoringMode = "sum" | "count-table";

export const COLUMN_SCORING: Record<ColorId, ScoringMode> = {
  yellow: "sum",
  blue: "count-table",
  green: "sum",
  orange: "sum",
  purple: "sum",
};

// Points for having filled N boxes in the blue column (accelerating, so
// committing to blue pays off more the further you push it).
export const BLUE_COUNT_TABLE = [
  0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78,
];

export function roundsForPlayerCount(playerCount: number): number {
  if (playerCount <= 2) return 6;
  if (playerCount === 3) return 5;
  return 4;
}
