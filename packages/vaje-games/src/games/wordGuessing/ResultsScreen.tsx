import { findWinner } from "./scoring";
import type { RoundStats, Team } from "./types";
import styles from "./ResultsScreen.module.css";

type Props =
  | {
      mode: "round";
      teamName: string;
      roundStats: RoundStats;
      teams: Team[];
      onContinue: () => void;
    }
  | {
      mode: "gameOver";
      teams: Team[];
      onPlayAgain: () => void;
      onNewSetup: () => void;
    };

function Scoreboard({
  teams,
  highlightName,
}: {
  teams: Team[];
  highlightName?: string;
}) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  return (
    <div class={styles.scoreboard}>
      {sorted.map((team) => (
        <div
          key={team.id}
          class={`${styles.scoreRow} ${
            team.name === highlightName ? styles.scoreRowHighlight : ""
          }`}
        >
          <span>{team.name}</span>
          <span class="font-bold">{team.score}</span>
        </div>
      ))}
    </div>
  );
}

export default function ResultsScreen(props: Props) {
  if (props.mode === "gameOver") {
    const winner = findWinner(props.teams);
    return (
      <div class={styles.screen}>
        <h1 class="text-2xl font-bold">
          🏆 {winner ? `${winner.name} برنده شد!` : "بازی تمام شد"}
        </h1>
        <Scoreboard teams={props.teams} highlightName={winner?.name} />
        <div class={styles.actions}>
          <button
            type="button"
            class="btn btn-primary !py-4 text-lg"
            onClick={props.onPlayAgain}
          >
            بازی دوباره
          </button>
          <button type="button" class="btn" onClick={props.onNewSetup}>
            تنظیمات جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class={styles.screen}>
      <h1 class="text-2xl font-bold">زمان تیم {props.teamName} تمام شد!</h1>
      <div class={styles.statsRow}>
        <span class="text-good">✅ {props.roundStats.correct} بلد شد</span>
        <span class="text-bad">⏭️ {props.roundStats.skipped} رد شد</span>
      </div>
      <Scoreboard teams={props.teams} highlightName={props.teamName} />
      <div class={styles.actions}>
        <button
          type="button"
          class="btn btn-primary !py-4 text-lg"
          onClick={props.onContinue}
        >
          ادامه
        </button>
      </div>
    </div>
  );
}
