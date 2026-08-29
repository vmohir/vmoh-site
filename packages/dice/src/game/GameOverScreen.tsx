import { useState } from "preact/hooks";
import { totalScore } from "./logic";
import type { PlayerState } from "./types";
import ScoreSheet from "./ScoreSheet";
import styles from "./GameOverScreen.module.css";

interface Props {
  players: PlayerState[];
  onPlayAgain: () => void;
  onNewSetup: () => void;
}

export default function GameOverScreen({
  players,
  onPlayAgain,
  onNewSetup,
}: Props) {
  const ranked = [...players].sort((a, b) => totalScore(b) - totalScore(a));
  const winner = ranked[0];
  const [expandedId, setExpandedId] = useState<string | null>(
    winner?.id ?? null,
  );

  return (
    <div class={styles.screen}>
      {winner && <h1 class="text-2xl font-bold">🎲 {winner.name} wins!</h1>}

      <div class={styles.scoreboard}>
        {ranked.map((player, i) => {
          const expanded = expandedId === player.id;
          return (
            <div key={player.id} class={styles.entry}>
              <button
                type="button"
                class={`${styles.scoreRow} ${i === 0 ? styles.scoreRowHighlight : ""}`}
                onClick={() => setExpandedId(expanded ? null : player.id)}
              >
                <span>
                  {i + 1}. {player.name}
                </span>
                <span class="font-bold">{totalScore(player)}</span>
              </button>
              {expanded && (
                <div class={styles.sheetWrap}>
                  <ScoreSheet player={player} showScores />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div class={styles.actions}>
        <button
          type="button"
          class="btn btn-primary !py-4 text-lg"
          onClick={onPlayAgain}
        >
          Play again
        </button>
        <button type="button" class="btn" onClick={onNewSetup}>
          New players
        </button>
      </div>
    </div>
  );
}
