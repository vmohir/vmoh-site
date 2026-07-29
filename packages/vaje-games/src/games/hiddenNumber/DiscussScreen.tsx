import styles from "./DiscussScreen.module.css";

interface Props {
  guesserName: string;
  questionWithBlank: string;
  onReveal: () => void;
  onExit: () => void;
}

export default function DiscussScreen({
  guesserName,
  questionWithBlank,
  onReveal,
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
      <p class="text-secondary">
        بدون گفتن عدد، دربارهٔ این سوال بحث کنید تا {guesserName} حدس بزنه:
      </p>
      <p class={styles.question}>{questionWithBlank}</p>
      <button
        type="button"
        class="btn btn-primary !px-10 !py-5 text-xl"
        onClick={onReveal}
      >
        {guesserName} حدس زد، عدد رو نشون بده
      </button>
    </div>
  );
}
