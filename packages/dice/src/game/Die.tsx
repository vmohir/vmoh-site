import type { ColorId } from "./types";
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
  color?: ColorId | "wild";
  size?: "sm" | "md" | "lg";
  faded?: boolean;
}

export default function Die({
  value,
  color = "wild",
  size = "md",
  faded,
}: Props) {
  const active = new Set(PIPS[value] ?? []);
  return (
    <div
      class={`${styles.die} ${styles[size]} ${faded ? styles.faded : ""}`}
      data-color={color}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          class={styles.cell}
          data-pip={active.has(i + 1) ? "true" : "false"}
        />
      ))}
    </div>
  );
}
