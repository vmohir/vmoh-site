export type ColorId = "red" | "blue" | "green" | "amber" | "purple";

export const COLUMN_ORDER: ColorId[] = [
  "red",
  "blue",
  "green",
  "amber",
  "purple",
];

export const COLUMN_LABEL: Record<ColorId, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
  amber: "Amber",
  purple: "Purple",
};

export interface PlayerState {
  id: string;
  name: string;
  boxes: Record<ColorId, boolean[]>;
}

export interface DiceRoll {
  wild: number;
  colors: Record<ColorId, number>;
}

export type Phase =
  "setup" | "roll" | "handoff" | "wildTurn" | "activeTurn" | "gameOver";
