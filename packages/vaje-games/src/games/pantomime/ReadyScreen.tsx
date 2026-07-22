import styles from "./ReadyScreen.module.css";

interface Props {
  teamName: string;
  roundSeconds: number;
  onReady: () => void;
  onExit: () => void;
}

export default function ReadyScreen({
  teamName,
  roundSeconds,
  onReady,
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
      <p class="text-secondary">نوبت تیم</p>
      <h1 class="text-4xl font-bold text-accent">{teamName}</h1>
      <p class="text-secondary">
        گوشی رو بده به تیم {teamName}. هر دور {roundSeconds} ثانیه طول می‌کشه.
      </p>
      <button
        type="button"
        class="btn btn-primary !px-10 !py-5 text-xl"
        onClick={onReady}
      >
        آماده‌ام
      </button>
    </div>
  );
}
