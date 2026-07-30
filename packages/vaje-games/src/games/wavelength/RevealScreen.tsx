import DialWheel from "./DialWheel";
import type { Team } from "./types";
import styles from "./RevealScreen.module.css";

interface Props {
  leftLabel: string;
  rightLabel: string;
  target: number;
  guess: number;
  points: number;
  guessingTeamName: string;
  teams: Team[];
  onNext: () => void;
  onExit: () => void;
}

export default function RevealScreen({
  leftLabel,
  rightLabel,
  target,
  guess,
  points,
  guessingTeamName,
  teams,
  onNext,
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

      <div class={styles.scoreboard}>
        {teams.map((team) => (
          <span key={team.id}>
            {team.name}: {team.score}
          </span>
        ))}
      </div>

      <DialWheel
        leftLabel={leftLabel}
        rightLabel={rightLabel}
        target={target}
        showTarget
        guess={guess}
      />

      <span class={styles.points}>{points > 0 ? `+${points}` : points}</span>
      <p class="text-secondary">امتیاز تیم {guessingTeamName}</p>

      <button
        type="button"
        class="btn btn-primary !px-10 !py-5 text-xl"
        onClick={onNext}
      >
        دور بعدی
      </button>
    </div>
  );
}
