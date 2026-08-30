import { useState } from "preact/hooks";
import { findLegalBox, hasAnyLegalMove, placeDie } from "./logic";
import {
  COLUMN_LABEL,
  COLUMN_ORDER,
  type ColorId,
  type PlatterDie,
  type PlayerState,
} from "./types";
import Die from "./Die";
import ScoreSheet from "./ScoreSheet";
import styles from "./ActiveTurnScreen.module.css";

interface Props {
  roundLabel: string;
  player: PlayerState;
  platter: PlatterDie[];
  onDone: (player: PlayerState) => void;
}

export default function PlatterTurnScreen({
  roundLabel,
  player,
  platter,
  onDone,
}: Props) {
  const [choosingWhite, setChoosingWhite] = useState<number | null>(null);

  function take(color: ColorId, value: number) {
    const result = placeDie(player, color, value);
    onDone(result ? result.player : player);
  }

  const pendingWhiteValue =
    choosingWhite !== null ? (platter[choosingWhite]?.value ?? null) : null;
  const legalWhiteColors =
    pendingWhiteValue !== null
      ? COLUMN_ORDER.filter(
          (c) => findLegalBox(c, player.columns[c], pendingWhiteValue) !== null,
        )
      : [];

  return (
    <div class={styles.screen}>
      <div class={styles.header}>
        <p class="text-sm text-muted">{roundLabel}</p>
        <h1 class="text-xl font-bold">{player.name}</h1>
        <p class="text-sm text-secondary">
          Take one die's value off the Silver Platter, or skip.
        </p>
      </div>

      <div class={styles.diceRow}>
        {platter.length === 0 && (
          <p class="text-sm text-muted">Nothing was left on the platter.</p>
        )}
        {platter.map((entry, i) => {
          const legal =
            entry.die === "white"
              ? hasAnyLegalMove(player, entry.value)
              : findLegalBox(
                  entry.die,
                  player.columns[entry.die],
                  entry.value,
                ) !== null;
          return (
            <Die
              key={i}
              value={entry.value}
              color={entry.die}
              size="lg"
              disabled={!legal}
              onClick={
                legal
                  ? () =>
                      entry.die === "white"
                        ? setChoosingWhite(i)
                        : take(entry.die, entry.value)
                  : undefined
              }
            />
          );
        })}
      </div>

      {choosingWhite !== null && pendingWhiteValue !== null && (
        <div class={styles.whiteChoice}>
          <p class="text-sm text-secondary">
            White die shows {pendingWhiteValue} — use it as:
          </p>
          <div class={styles.whiteButtons}>
            {COLUMN_ORDER.map((color) => (
              <button
                key={color}
                type="button"
                class="btn"
                disabled={!legalWhiteColors.includes(color)}
                onClick={() => take(color, pendingWhiteValue)}
              >
                {COLUMN_LABEL[color]}
              </button>
            ))}
          </div>
          <button
            type="button"
            class="btn btn-ghost"
            onClick={() => setChoosingWhite(null)}
          >
            Back
          </button>
        </div>
      )}

      <button type="button" class="btn mt-auto" onClick={() => onDone(player)}>
        Skip
      </button>

      <ScoreSheet player={player} />
    </div>
  );
}
