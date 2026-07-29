import { useState } from "preact/hooks";
import type { Category, Difficulty, Team } from "./types";
import { DIFFICULTIES } from "./words";
import styles from "./CategoryPickerScreen.module.css";

interface Props {
  teamName: string;
  teams: Team[];
  categories: Category[];
  onPick: (category: string, difficulty: Difficulty) => void;
  onExit: () => void;
}

export default function CategoryPickerScreen({
  teamName,
  teams,
  categories,
  onPick,
  onExit,
}: Props) {
  const [category, setCategory] = useState<string | null>(null);

  return (
    <div class={styles.screen}>
      <div class={styles.header}>
        <button type="button" class="btn btn-ghost" onClick={onExit}>
          پایان بازی
        </button>
        <div class={styles.scoreboard}>
          {teams.map((team) => (
            <span key={team.id}>
              {team.name}: {team.score}
            </span>
          ))}
        </div>
      </div>

      <div class={styles.turnBanner}>
        <p class="text-secondary">نوبت تیم</p>
        <h1 class="text-2xl font-bold text-accent">{teamName}</h1>
      </div>

      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-medium text-secondary">انتخاب موضوع</h2>
        <div class={styles.chipWrap}>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              class={category === c.id ? `btn ${styles.chipActive}` : "btn"}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section
        class={`flex flex-col gap-2 ${styles.difficultySection}`}
        data-disabled={!category}
      >
        <h2 class="text-sm font-medium text-secondary">انتخاب سختی</h2>
        <div class={styles.chipWrap}>
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty.id}
              type="button"
              class="btn"
              disabled={!category}
              onClick={() => category && onPick(category, difficulty.id)}
            >
              {difficulty.label} ({difficulty.points} امتیاز)
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
