import { BLUE_COUNT_TABLE, BOARD, COLUMN_SCORING } from "./board";
import {
  COLUMN_ORDER,
  type ColorId,
  type ColumnState,
  type DieId,
  type PlayerState,
} from "./types";

export function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

export function emptyColumns(): Record<ColorId, ColumnState> {
  return Object.fromEntries(
    COLUMN_ORDER.map((color) => [
      color,
      {
        checked: BOARD[color].map(() => false),
        entered: BOARD[color].map(() => null),
      },
    ]),
  ) as Record<ColorId, ColumnState>;
}

// The next box a die can legally go into for this column, or null if none.
export function findLegalBox(
  color: ColorId,
  state: ColumnState,
  value: number,
): number | null {
  const defs = BOARD[color];
  const first = defs[0];
  if (!first) return null;

  if (first.kind === "match") {
    const idx = defs.findIndex(
      (def, i) =>
        def.kind === "match" && def.value === value && !state.checked[i],
    );
    return idx === -1 ? null : idx;
  }

  const idx = state.checked.findIndex((c) => !c);
  if (idx === -1) return null;
  const def = defs[idx];
  if (!def) return null;

  if (def.kind === "threshold") return value >= def.threshold ? idx : null;
  if (def.kind === "free") return idx;
  if (def.kind === "increasing") {
    const prev = idx > 0 ? (state.entered[idx - 1] ?? null) : null;
    return prev === null || value > prev ? idx : null;
  }
  return null;
}

export function hasAnyLegalMove(
  player: PlayerState,
  dieValue: number,
): boolean {
  return COLUMN_ORDER.some(
    (color) => findLegalBox(color, player.columns[color], dieValue) !== null,
  );
}

export interface PlaceResult {
  player: PlayerState;
  boxIndex: number;
  fox: boolean;
  bonusReroll: boolean;
}

export function placeDie(
  player: PlayerState,
  color: ColorId,
  value: number,
): PlaceResult | null {
  const state = player.columns[color];
  const idx = findLegalBox(color, state, value);
  if (idx === null) return null;
  const def = BOARD[color][idx];
  if (!def) return null;

  const checked = state.checked.map((c, i) => (i === idx ? true : c));
  const entered = state.entered.map((e, i) => (i === idx ? value : e));

  return {
    player: {
      ...player,
      columns: { ...player.columns, [color]: { checked, entered } },
    },
    boxIndex: idx,
    fox: def.fox === true,
    bonusReroll: def.bonusReroll === true,
  };
}

export function scoreColumn(color: ColorId, state: ColumnState): number {
  if (COLUMN_SCORING[color] === "count-table") {
    const count = state.checked.filter(Boolean).length;
    return BLUE_COUNT_TABLE[Math.min(count, BLUE_COUNT_TABLE.length - 1)] ?? 0;
  }
  const defs = BOARD[color];
  let total = 0;
  defs.forEach((def, i) => {
    if (!state.checked[i]) return;
    if (def.kind === "match") total += def.value;
    else if (def.kind === "threshold") total += def.points;
    else if (def.kind === "increasing") total += def.points;
    else if (def.kind === "free")
      total += (state.entered[i] ?? 0) * def.multiplier;
  });
  return total;
}

export function countFoxes(player: PlayerState): number {
  return COLUMN_ORDER.reduce((total, color) => {
    const defs = BOARD[color];
    const state = player.columns[color];
    return (
      total +
      defs.reduce((n, def, i) => n + (def.fox && state.checked[i] ? 1 : 0), 0)
    );
  }, 0);
}

export function colorTotals(player: PlayerState): Record<ColorId, number> {
  return Object.fromEntries(
    COLUMN_ORDER.map((color) => [
      color,
      scoreColumn(color, player.columns[color]),
    ]),
  ) as Record<ColorId, number>;
}

export function totalScore(player: PlayerState): number {
  const totals = colorTotals(player);
  const values = COLUMN_ORDER.map((c) => totals[c]);
  const lowest = Math.min(...values);
  const foxScore = countFoxes(player) * lowest;
  return values.reduce((a, b) => a + b, 0) + foxScore;
}

export function dieColor(die: DieId): ColorId | null {
  return die === "white" ? null : die;
}
