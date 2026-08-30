import { BOARD } from "./board";
import { colorTotals, countFoxes, scoreColumn, totalScore } from "./logic";
import { COLUMN_LABEL, COLUMN_ORDER, type PlayerState } from "./types";
import styles from "./ScoreSheet.module.css";

interface Props {
  player: PlayerState;
  showScores?: boolean;
}

export default function ScoreSheet({ player, showScores }: Props) {
  const totals = showScores ? colorTotals(player) : null;

  return (
    <div class={styles.sheet}>
      {COLUMN_ORDER.map((color) => {
        const defs = BOARD[color];
        const state = player.columns[color];
        const grid = color === "yellow";
        return (
          <div key={color} class={styles.column} data-color={color}>
            <div class={styles.columnHead}>
              <span class={styles.label}>{COLUMN_LABEL[color]}</span>
              {showScores && (
                <span class={styles.score}>
                  {scoreColumn(color, state)} pts
                </span>
              )}
            </div>
            <div class={grid ? styles.grid : styles.row}>
              {defs.map((def, i) => (
                <span
                  key={i}
                  class={styles.box}
                  data-checked={state.checked[i] ? "true" : "false"}
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
                </span>
              ))}
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
