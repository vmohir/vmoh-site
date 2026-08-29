import { BOX_COUNT } from "./logic";
import { COLUMN_LABEL, type ColorId } from "./types";
import styles from "./ColumnRow.module.css";

interface Props {
  color: ColorId;
  boxes: boolean[];
  targetValue: number;
  canApply: boolean;
  onApply: () => void;
}

export default function ColumnRow({
  color,
  boxes,
  targetValue,
  canApply,
  onApply,
}: Props) {
  return (
    <div class={styles.row} data-color={color}>
      <span class={styles.label}>{COLUMN_LABEL[color]}</span>
      <div class={styles.boxes}>
        {Array.from({ length: BOX_COUNT }, (_, i) => (
          <span
            key={i}
            class={styles.box}
            data-checked={boxes[i] ? "true" : "false"}
            data-target={canApply && i === targetValue - 1 ? "true" : "false"}
          >
            {i + 1}
          </span>
        ))}
      </div>
      <button
        type="button"
        class="btn !px-3 !py-1.5 text-sm"
        disabled={!canApply}
        onClick={onApply}
      >
        Take {targetValue}
      </button>
    </div>
  );
}
