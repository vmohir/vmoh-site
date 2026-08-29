import { BOX_COUNT, columnScore } from "./logic";
import { COLUMN_LABEL, COLUMN_ORDER, type PlayerState } from "./types";
import styles from "./ScoreSheet.module.css";

interface Props {
  player: PlayerState;
  showScores?: boolean;
}

export default function ScoreSheet({ player, showScores }: Props) {
  return (
    <div class={styles.sheet}>
      {COLUMN_ORDER.map((color) => {
        const boxes = player.boxes[color] ?? [];
        return (
          <div key={color} class={styles.column} data-color={color}>
            <span class={styles.label}>{COLUMN_LABEL[color]}</span>
            <div class={styles.boxes}>
              {Array.from({ length: BOX_COUNT }, (_, i) => (
                <span
                  key={i}
                  class={styles.box}
                  data-checked={boxes[i] ? "true" : "false"}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            {showScores && (
              <span class={styles.score}>{columnScore(boxes)} pts</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
