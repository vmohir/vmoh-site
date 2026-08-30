import type { DieId } from "./types";
import styles from "./Die.module.css";

const PIPS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

interface Props {
  value: number;
  color?: DieId;
  size?: "sm" | "md" | "lg";
  faded?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function Die({
  value,
  color = "white",
  size = "md",
  faded,
  disabled,
  onClick,
}: Props) {
  const active = new Set(PIPS[value] ?? []);
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      class={`${styles.die} ${styles[size]} ${faded ? styles.faded : ""} ${onClick ? styles.clickable : ""}`}
      data-color={color}
      disabled={onClick ? disabled : undefined}
      onClick={onClick}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          class={styles.cell}
          data-pip={active.has(i + 1) ? "true" : "false"}
        />
      ))}
    </Tag>
  );
}
