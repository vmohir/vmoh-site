import styles from "./RevealScreen.module.css";

interface Props {
  guesserName: string;
  question: string;
  number: number;
  onSeen: () => void;
}

export default function RevealScreen({
  guesserName,
  question,
  number,
  onSeen,
}: Props) {
  return (
    <div class={styles.screen}>
      <p class={styles.warning}>این صفحه رو به {guesserName} نشون نده!</p>
      <p class={styles.question}>{question}</p>
      <span class={styles.number}>{number}</span>
      <button
        type="button"
        class="btn btn-primary !px-10 !py-5 text-xl"
        onClick={onSeen}
      >
        دیدیم، بحث می‌کنیم
      </button>
    </div>
  );
}
