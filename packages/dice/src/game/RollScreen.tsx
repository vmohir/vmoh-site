import { TOTAL_ROUNDS } from "./logic";
import styles from "./RollScreen.module.css";

interface Props {
  round: number;
  activePlayerName: string;
  onRoll: () => void;
}

export default function RollScreen({ round, activePlayerName, onRoll }: Props) {
  return (
    <div class={styles.screen}>
      <p class="text-sm text-muted">
        Round {round + 1} of {TOTAL_ROUNDS}
      </p>
      <h1 class="text-3xl font-bold">{activePlayerName}'s roll</h1>
      <p class="text-sm text-secondary">
        Roll the six dice. Everyone gets to use the white die; you also get your
        five colored dice.
      </p>
      <button
        type="button"
        class="btn btn-primary mt-4 !py-4 text-lg"
        onClick={onRoll}
      >
        Roll the dice
      </button>
    </div>
  );
}
