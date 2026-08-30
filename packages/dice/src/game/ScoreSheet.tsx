import { BOARD } from "./board";
import { colorTotals, countFoxes, scoreColumn, totalScore } from "./logic";
import {
  COLUMN_LABEL,
  COLUMN_ORDER,
  type ColorId,
  type PlayerState,
} from "./types";
import styles from "./ScoreSheet.module.css";

interface Props {
  player: PlayerState;
  showScores?: boolean;
  // When set, boxes at these indices in this one column are the legal
  // targets for the currently-selected die — rendered as clickable and
  // highlighted, everything else inert. There's never more than one column
  // active at once (only one die is ever "selected" at a time).
  pickable?: { color: ColorId; indices: number[] };
  onPick?: (color: ColorId, boxIndex: number) => void;
}

export default function ScoreSheet({
  player,
  showScores,
  pickable,
  onPick,
}: Props) {
  const totals = showScores ? colorTotals(player) : null;

  return (
    <div class={styles.sheet}>
      {COLUMN_ORDER.map((color) => {
        const defs = BOARD[color];
        const state = player.columns[color];
        const grid = color === "yellow";
        const pickableHere = pickable?.color === color ? pickable.indices : [];
        return (
          <div
            key={color}
            class={styles.column}
            data-color={color}
            data-active={pickableHere.length > 0 ? "true" : "false"}
          >
            <div class={styles.columnHead}>
              <span class={styles.label}>{COLUMN_LABEL[color]}</span>
              {showScores && (
                <span class={styles.score}>
                  {scoreColumn(color, state)} pts
                </span>
              )}
            </div>
            <div class={grid ? styles.grid : styles.row}>
              {defs.map((def, i) => {
                const isPickable = pickableHere.includes(i);
                const Tag = isPickable ? "button" : "span";
                return (
                  <Tag
                    key={i}
                    type={isPickable ? "button" : undefined}
                    class={`${styles.box} ${isPickable ? styles.pickable : ""}`}
                    data-checked={state.checked[i] ? "true" : "false"}
                    onClick={isPickable ? () => onPick?.(color, i) : undefined}
                  >
                    <span class={styles.boxValue}>
                      {def.kind === "match"
                        ? def.value
                        : def.kind === "free"
                          ? state.checked[i]
                            ? state.entered[i]
                            : def.multiplier > 1
                              ? `×${def.multiplier}`
                              : ""
                          : def.points}
                    </span>
                    {def.fox && <span class={styles.fox}>🦊</span>}
                    {def.bonusReroll && <span class={styles.reroll}>⟳</span>}
                  </Tag>
                );
              })}
            </div>
          </div>
        );
      })}

      <div class={styles.foxRow}>
        <span class={styles.label}>🦊 Foxes</span>
        <span class={styles.foxCount}>{countFoxes(player)}</span>
        {showScores && totals && (
          <span class={styles.foxNote}>
            × {Math.min(...COLUMN_ORDER.map((c) => totals[c]))} (lowest color)
          </span>
        )}
      </div>

      {showScores && (
        <div class={styles.total}>
          <span>Total</span>
          <span>{totalScore(player)}</span>
        </div>
      )}
    </div>
  );
}
