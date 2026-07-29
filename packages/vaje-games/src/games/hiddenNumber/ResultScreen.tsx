import styles from "./ResultScreen.module.css";

interface Props {
  number: number;
  onNext: () => void;
  onExit: () => void;
}

export default function ResultScreen({ number, onNext, onExit }: Props) {
  return (
    <div class={styles.screen}>
      <button
        type="button"
        class="btn btn-ghost absolute top-4 left-4"
        onClick={onExit}
      >
        پایان بازی
      </button>
      <p class="text-secondary">عدد واقعی</p>
      <span class={styles.number}>{number}</span>
      <button
        type="button"
        class="btn btn-primary !px-10 !py-5 text-xl"
        onClick={onNext}
      >
        نفر بعد
      </button>
    </div>
  );
}
