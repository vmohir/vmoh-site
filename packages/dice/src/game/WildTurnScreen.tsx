import { canCheck } from "./logic";
import { COLUMN_ORDER, type PlayerState } from "./types";
import Die from "./Die";
import ColumnRow from "./ColumnRow";
import styles from "./TurnScreen.module.css";

interface Props {
  player: PlayerState;
  wildValue: number;
  onApply: (color: (typeof COLUMN_ORDER)[number]) => void;
  onSkip: () => void;
}

export default function WildTurnScreen({
  player,
  wildValue,
  onApply,
  onSkip,
}: Props) {
  return (
    <div class={styles.screen}>
      <div class={styles.header}>
        <h1 class="text-xl font-bold">{player.name}</h1>
        <p class="text-sm text-secondary">
          Use the white die on one column, or skip.
        </p>
      </div>

      <div class={styles.dice}>
        <Die value={wildValue} color="wild" size="lg" />
      </div>

      <div class={styles.columns}>
        {COLUMN_ORDER.map((color) => (
          <ColumnRow
            key={color}
            color={color}
            boxes={player.boxes[color] ?? []}
            targetValue={wildValue}
            canApply={canCheck(player.boxes[color] ?? [], wildValue)}
            onApply={() => onApply(color)}
          />
        ))}
      </div>

      <button type="button" class="btn mt-auto" onClick={onSkip}>
        Skip
      </button>
    </div>
  );
}
