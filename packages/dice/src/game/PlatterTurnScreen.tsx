import { useState } from "preact/hooks";
import { legalBoxIndices, placeDieAt } from "./logic";
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

interface Selection {
  color: ColorId;
  value: number;
  indices: number[];
}

export default function PlatterTurnScreen({
  roundLabel,
  player,
  platter,
  onDone,
}: Props) {
  const [whiteChoiceValue, setWhiteChoiceValue] = useState<number | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  const sortedPlatter = [...platter].sort((a, b) => a.value - b.value);

  function selectColor(color: ColorId, value: number) {
    const indices = legalBoxIndices(color, player.columns[color], value);
    if (indices.length === 0) return;
    setSelection({ color, value, indices });
    setWhiteChoiceValue(null);
  }

  function pickEntry(entry: PlatterDie) {
    if (entry.die === "white") {
      setWhiteChoiceValue(entry.value);
      setSelection(null);
      return;
    }
    selectColor(entry.die, entry.value);
  }

  function confirmPick(color: ColorId, boxIndex: number) {
    if (!selection || selection.color !== color) return;
    const result = placeDieAt(player, color, boxIndex, selection.value);
    onDone(result ? result.player : player);
  }

  const legalWhiteColors =
    whiteChoiceValue !== null
      ? COLUMN_ORDER.filter(
          (c) =>
            c !== "blue" &&
            legalBoxIndices(c, player.columns[c], whiteChoiceValue).length > 0,
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
        {sortedPlatter.length === 0 && (
          <p class="text-sm text-muted">Nothing was left on the platter.</p>
        )}
        {sortedPlatter.map((entry, i) => {
          const legal =
            entry.die === "white"
              ? COLUMN_ORDER.some(
                  (c) =>
                    c !== "blue" &&
                    legalBoxIndices(c, player.columns[c], entry.value).length >
                      0,
                )
              : legalBoxIndices(
                  entry.die,
                  player.columns[entry.die],
                  entry.value,
                ).length > 0;
          return (
            <Die
              key={i}
              value={entry.value}
              color={entry.die}
              size="lg"
              disabled={!legal}
              onClick={legal ? () => pickEntry(entry) : undefined}
            />
          );
        })}
      </div>

      {whiteChoiceValue !== null && (
        <div class={styles.whiteChoice}>
          <p class="text-sm text-secondary">
            White die shows {whiteChoiceValue} — use it as:
          </p>
          <div class={styles.whiteButtons}>
            {COLUMN_ORDER.filter((c) => c !== "blue").map((color) => (
              <button
                key={color}
                type="button"
                class="btn"
                disabled={!legalWhiteColors.includes(color)}
                onClick={() => selectColor(color, whiteChoiceValue)}
              >
                {COLUMN_LABEL[color]}
              </button>
            ))}
          </div>
          <button
            type="button"
            class="btn btn-ghost"
            onClick={() => setWhiteChoiceValue(null)}
          >
            Back
          </button>
        </div>
      )}

      {selection && (
        <div class={styles.selectionHint}>
          <p class="text-sm text-secondary">
            Tap the glowing box in{" "}
            <strong>{COLUMN_LABEL[selection.color]}</strong> to place{" "}
            {selection.value}.
          </p>
          <button
            type="button"
            class="btn btn-ghost"
            onClick={() => setSelection(null)}
          >
            Cancel
          </button>
        </div>
      )}

      <button type="button" class="btn mt-auto" onClick={() => onDone(player)}>
        Skip
      </button>

      <ScoreSheet
        player={player}
        pickable={
          selection
            ? { color: selection.color, indices: selection.indices }
            : undefined
        }
        onPick={confirmPick}
      />
    </div>
  );
}
