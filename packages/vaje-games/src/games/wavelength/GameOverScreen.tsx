import type { Team } from "./types";
import styles from "./GameOverScreen.module.css";

interface Props {
  teams: Team[];
  onPlayAgain: () => void;
  onNewSetup: () => void;
}

export default function GameOverScreen({
  teams,
  onPlayAgain,
  onNewSetup,
}: Props) {
  const winner = teams.reduce((best, team) =>
    team.score > best.score ? team : best,
  );

  return (
    <div class={styles.screen}>
      <h1 class="text-2xl font-bold">🏆 {winner.name} برنده شد!</h1>
      <div class={styles.scoreboard}>
        {[...teams]
          .sort((a, b) => b.score - a.score)
          .map((team) => (
            <div
              key={team.id}
              class={`${styles.scoreRow} ${
                team.id === winner.id ? styles.scoreRowHighlight : ""
              }`}
            >
              <span>{team.name}</span>
              <span class="font-bold">{team.score}</span>
            </div>
          ))}
      </div>
      <div class={styles.actions}>
        <button
          type="button"
          class="btn btn-primary !py-4 text-lg"
          onClick={onPlayAgain}
        >
          بازی دوباره
        </button>
        <button type="button" class="btn" onClick={onNewSetup}>
          تنظیمات جدید
        </button>
      </div>
    </div>
  );
}
