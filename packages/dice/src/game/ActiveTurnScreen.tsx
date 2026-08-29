import { useState } from "preact/hooks";
import { canCheck } from "./logic";
import {
  COLUMN_LABEL,
  COLUMN_ORDER,
  type ColorId,
  type DiceRoll,
  type PlayerState,
} from "./types";
import Die from "./Die";
import ColumnRow from "./ColumnRow";
import styles from "./TurnScreen.module.css";
import wildStyles from "./ActiveTurnScreen.module.css";

interface Props {
  player: PlayerState;
  roll: DiceRoll;
  onApply: (color: ColorId, value: number) => void;
  onDone: () => void;
}

export default function ActiveTurnScreen({
  player,
  roll,
  onApply,
  onDone,
}: Props) {
  const [wildUsed, setWildUsed] = useState(false);

  function applyWild(color: ColorId) {
    setWildUsed(true);
    onApply(color, roll.wild);
  }

  return (
    <div class={styles.screen}>
      <div class={styles.header}>
        <h1 class="text-xl font-bold">{player.name}'s bonus turn</h1>
        <p class="text-sm text-secondary">
          Use your white die on any one column, then each colored die on its own
          column.
        </p>
      </div>

      <div class={wildStyles.wildSection}>
        <Die value={roll.wild} color="wild" size="md" />
        <div class={wildStyles.wildButtons}>
          {COLUMN_ORDER.map((color) => (
            <button
              key={color}
              type="button"
              class="btn !px-2.5 !py-1.5 text-xs"
              disabled={
                wildUsed || !canCheck(player.boxes[color] ?? [], roll.wild)
              }
              onClick={() => applyWild(color)}
            >
              {COLUMN_LABEL[color]}
            </button>
          ))}
        </div>
      </div>

      <div class={styles.columns}>
        {COLUMN_ORDER.map((color) => {
          const value = roll.colors[color] ?? 0;
          return (
            <ColumnRow
              key={color}
              color={color}
              boxes={player.boxes[color] ?? []}
              targetValue={value}
              canApply={canCheck(player.boxes[color] ?? [], value)}
              onApply={() => onApply(color, value)}
            />
          );
        })}
      </div>

      <button
        type="button"
        class="btn btn-primary mt-auto !py-3"
        onClick={onDone}
      >
        Continue
      </button>
    </div>
  );
}
