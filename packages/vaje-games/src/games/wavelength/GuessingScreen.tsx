import DialWheel from "./DialWheel";
import styles from "./GuessingScreen.module.css";

interface Props {
  guessingTeamName: string;
  leftLabel: string;
  rightLabel: string;
  guess: number;
  onGuessChange: (value: number) => void;
  onLockIn: () => void;
  onExit: () => void;
}

export default function GuessingScreen({
  guessingTeamName,
  leftLabel,
  rightLabel,
  guess,
  onGuessChange,
  onLockIn,
  onExit,
}: Props) {
  return (
    <div class={styles.screen}>
      <button
        type="button"
        class="btn btn-ghost absolute top-4 left-4"
        onClick={onExit}
      >
        پایان بازی
      </button>
      <p class="text-secondary">نوبت حدس زدن</p>
      <h1 class="text-2xl font-bold text-accent">{guessingTeamName}</h1>
      <p class="text-secondary">
        با توجه به سرنخ، عقربه رو بکش روی نقطه‌ای که فکر می‌کنید هدفه.
      </p>

      <DialWheel
        leftLabel={leftLabel}
        rightLabel={rightLabel}
        guess={guess}
        onGuessChange={onGuessChange}
      />

      <button
        type="button"
        class="btn btn-primary !px-10 !py-5 text-xl"
        onClick={onLockIn}
      >
        قفل کردن حدس
      </button>
    </div>
  );
}
