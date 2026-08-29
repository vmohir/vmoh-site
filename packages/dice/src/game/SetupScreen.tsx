import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  addPlayer,
  playerNames,
  removePlayer,
  renamePlayer,
} from "../state/setupState";
import { TOTAL_ROUNDS } from "./logic";
import styles from "./SetupScreen.module.css";

interface Props {
  onStart: () => void;
}

export default function SetupScreen({ onStart }: Props) {
  const validPlayerCount = playerNames.value.filter((n) => n.trim()).length;
  const canStart = validPlayerCount >= MIN_PLAYERS;

  return (
    <div class="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
      <div>
        <h1 class="text-2xl font-bold">Sixes</h1>
        <p class="text-sm text-secondary">
          A pass-and-play roll-and-write. Each round someone rolls six dice —
          everyone checks a box with the white die, and the roller also gets to
          use their five colored dice. Fill columns low to high; the player with
          the highest score after {TOTAL_ROUNDS} rounds wins.
        </p>
      </div>

      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-medium text-secondary">Players</h2>
        {playerNames.value.map((name, index) => (
          <div key={index} class={styles.playerRow}>
            <input
              class={`${styles.playerInput} btn`}
              value={name}
              placeholder={`Player ${index + 1}`}
              onInput={(e) => renamePlayer(index, e.currentTarget.value)}
            />
            {playerNames.value.length > MIN_PLAYERS && (
              <button
                type="button"
                class="btn btn-ghost btn-icon"
                aria-label="Remove player"
                onClick={() => removePlayer(index)}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {playerNames.value.length < MAX_PLAYERS && (
          <button
            type="button"
            class="btn flex items-center justify-center gap-1"
            onClick={addPlayer}
          >
            + Add player
          </button>
        )}
      </section>

      <button
        type="button"
        class="btn btn-primary mt-auto !py-4 text-lg"
        disabled={!canStart}
        onClick={onStart}
      >
        Start game
      </button>
      {!canStart && (
        <p class="text-center text-sm text-muted">
          At least {MIN_PLAYERS} named player is required.
        </p>
      )}
    </div>
  );
}
