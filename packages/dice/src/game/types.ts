export type ColorId = "yellow" | "blue" | "green" | "orange" | "purple";

export const COLUMN_ORDER: ColorId[] = [
  "yellow",
  "blue",
  "green",
  "orange",
  "purple",
];

export const COLUMN_LABEL: Record<ColorId, string> = {
  yellow: "Yellow",
  blue: "Blue",
  green: "Green",
  orange: "Orange",
  purple: "Purple",
};

export type DieId = "white" | ColorId;

export const DIE_ORDER: DieId[] = [
  "white",
  "yellow",
  "blue",
  "green",
  "orange",
  "purple",
];

// A box that accepts any die showing its printed value, in any order.
export interface MatchBoxDef {
  kind: "match";
  value: number;
  fox?: boolean;
  bonusReroll?: boolean;
}

// A box filled strictly left-to-right; needs a die at least this high.
export interface ThresholdBoxDef {
  kind: "threshold";
  threshold: number;
  points: number;
  fox?: boolean;
  bonusReroll?: boolean;
}

// A box filled strictly left-to-right; any die works, value is written down
// (optionally multiplied).
export interface FreeBoxDef {
  kind: "free";
  multiplier: number;
  fox?: boolean;
  bonusReroll?: boolean;
}

// A box filled strictly left-to-right; the die must beat the previous entry.
export interface IncreasingBoxDef {
  kind: "increasing";
  points: number;
  fox?: boolean;
  bonusReroll?: boolean;
}

export type BoxDef =
  MatchBoxDef | ThresholdBoxDef | FreeBoxDef | IncreasingBoxDef;

export interface ColumnState {
  checked: boolean[];
  entered: (number | null)[];
}

export interface PlayerState {
  id: string;
  name: string;
  columns: Record<ColorId, ColumnState>;
}

export interface PlatterDie {
  die: DieId;
  value: number;
}

export type Phase =
  "setup" | "handoff" | "activeTurn" | "platterTurn" | "gameOver";
