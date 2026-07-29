import styles from "./HandoffScreen.module.css";

interface Props {
  guesserName: string;
  onReady: () => void;
  onExit: () => void;
}

export default function HandoffScreen({ guesserName, onReady, onExit }: Props) {
  return (
    <div class={styles.screen}>
      <button
        type="button"
        class="btn btn-ghost absolute top-4 left-4"
        onClick={onExit}
      >
        پایان بازی
      </button>
      <p class="text-secondary">این دور نمی‌دونه</p>
      <h1 class="text-4xl font-bold text-accent">{guesserName}</h1>
      <p class="text-secondary">
        گوشی رو بده به یکی دیگه، نه به {guesserName}. بقیه باید عدد رو ببینن.
      </p>
      <button
        type="button"
        class="btn btn-primary !px-10 !py-5 text-xl"
        onClick={onReady}
      >
        گوشی دست یکی دیگه‌ست
      </button>
    </div>
  );
}
