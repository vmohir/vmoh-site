import {
  COLUMN_ORDER,
  type ColorId,
  type DiceRoll,
  type PlayerState,
} from "./types";

export const TOTAL_ROUNDS = 6;
export const BOX_COUNT = 6;
export const COMPLETE_COLUMN_BONUS = 10;
export const TOP_BOX_BONUS = 3;
export const RAINBOW_BONUS = 5;

export function emptyBoxes(): Record<ColorId, boolean[]> {
  return Object.fromEntries(
    COLUMN_ORDER.map((color) => [color, Array<boolean>(BOX_COUNT).fill(false)]),
  ) as Record<ColorId, boolean[]>;
}

function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

export function rollDice(): DiceRoll {
  return {
    wild: rollDie(),
    colors: Object.fromEntries(
      COLUMN_ORDER.map((color) => [color, rollDie()]),
    ) as Record<ColorId, number>,
  };
}

// The highest value checked off in a column so far — boxes must be checked
// in strictly ascending order, so this is also the floor for the next check.
export function highestChecked(boxes: boolean[]): number {
  for (let i = boxes.length - 1; i >= 0; i--) {
    if (boxes[i]) return i + 1;
  }
  return 0;
}

export function canCheck(boxes: boolean[], value: number): boolean {
  return value >= 1 && value <= BOX_COUNT && value > highestChecked(boxes);
}

export function checkBox(
  player: PlayerState,
  color: ColorId,
  value: number,
): PlayerState {
  const boxes = player.boxes[color];
  if (!boxes || !canCheck(boxes, value)) return player;
  return {
    ...player,
    boxes: {
      ...player.boxes,
      [color]: boxes.map((checked, i) => (i === value - 1 ? true : checked)),
    },
  };
}

export function columnScore(boxes: boolean[]): number {
  const sum = boxes.reduce(
    (total, checked, i) => total + (checked ? i + 1 : 0),
    0,
  );
  const topBonus = boxes[BOX_COUNT - 1] ? TOP_BOX_BONUS : 0;
  const completeBonus = boxes.every(Boolean) ? COMPLETE_COLUMN_BONUS : 0;
  return sum + topBonus + completeBonus;
}

export function totalScore(player: PlayerState): number {
  const columnsTotal = COLUMN_ORDER.reduce(
    (total, color) => total + columnScore(player.boxes[color] ?? []),
    0,
  );
  const rainbow = COLUMN_ORDER.every(
    (color) => highestChecked(player.boxes[color] ?? []) > 0,
  )
    ? RAINBOW_BONUS
    : 0;
  return columnsTotal + rainbow;
}
