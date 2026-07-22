import { Check, X } from "lucide-preact";
import { pointsForWord } from "./scoring";
import { DIFFICULTIES } from "./words";
import type { Word } from "./types";
import styles from "./RoundScreen.module.css";

interface Props {
  word: Word;
  timeLeft: number;
  teamName: string;
  teamScore: number;
  onGotIt: () => void;
  onSkip: () => void;
}

export default function RoundScreen({
  word,
  timeLeft,
  teamName,
  teamScore,
  onGotIt,
  onSkip,
}: Props) {
  const points = pointsForWord(word);
  const difficultyLabel =
    DIFFICULTIES.find((d) => d.id === word.difficulty)?.label ?? "";
  return (
    <div class={styles.screen}>
      <div class={styles.topBar}>
        <div>
          <p class="text-sm text-secondary">{teamName}</p>
          <p class="font-bold">{teamScore} امتیاز</p>
        </div>
        <span
          class={`${styles.timer} ${timeLeft <= 10 ? styles.timerLow : ""}`}
        >
          {timeLeft}
        </span>
      </div>

      <div class={styles.wordArea}>
        <span class={`${styles.difficultyBadge} ${styles[word.difficulty]}`}>
          {difficultyLabel} · {points} امتیاز
        </span>
        <span class={styles.word}>{word.text}</span>
      </div>

      <div class={styles.actions}>
        <button
          type="button"
          class={`btn ${styles.actionButton} ${styles.skipButton}`}
          onClick={onSkip}
        >
          <X size={20} class="inline-block" /> رد کن
        </button>
        <button
          type="button"
          class={`btn ${styles.actionButton} ${styles.gotItButton}`}
          onClick={onGotIt}
        >
          <Check size={20} class="inline-block" /> بلد شد
        </button>
      </div>
    </div>
  );
}
