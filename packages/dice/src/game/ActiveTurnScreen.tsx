import { useState } from "preact/hooks";
import { legalBoxIndices, placeDieAt, rollDie } from "./logic";
import {
  COLUMN_LABEL,
  COLUMN_ORDER,
  DIE_ORDER,
  type ColorId,
  type DieId,
  type PlatterDie,
  type PlayerState,
} from "./types";
import Die from "./Die";
import ScoreSheet from "./ScoreSheet";
import styles from "./ActiveTurnScreen.module.css";

interface Props {
  roundLabel: string;
  player: PlayerState;
  onTurnEnd: (player: PlayerState, platter: PlatterDie[]) => void;
}

interface Selection {
  color: ColorId;
  value: number;
  consumedDice: DieId[];
  indices: number[];
}

export default function ActiveTurnScreen({
  roundLabel,
  player: initialPlayer,
  onTurnEnd,
}: Props) {
  const [player, setPlayer] = useState(initialPlayer);
  const [phase, setPhase] = useState<"beforeRoll" | "picking">("beforeRoll");
  const [values, setValues] = useState<Record<DieId, number>>(
    () =>
      Object.fromEntries(DIE_ORDER.map((d) => [d, 1])) as Record<DieId, number>,
  );
  const [inPlay, setInPlay] = useState<Record<DieId, boolean>>(
    () =>
      Object.fromEntries(DIE_ORDER.map((d) => [d, true])) as Record<
        DieId,
        boolean
      >,
  );
  const [platter, setPlatter] = useState<PlatterDie[]>([]);
  const [picksMade, setPicksMade] = useState(0);
  const [bonusRerolls, setBonusRerolls] = useState(0);
  const [rolled, setRolled] = useState(false);
  const [whiteChoice, setWhiteChoice] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);

  const maxPicks = 3 + bonusRerolls;
  const inPlayDice = DIE_ORDER.filter((d) => inPlay[d]);
  const sortedDice = [...DIE_ORDER].sort((a, b) => values[a] - values[b]);

  function rollDice() {
    setValues((prev) => {
      const next = { ...prev };
      inPlayDice.forEach((d) => {
        next[d] = rollDie();
      });
      return next;
    });
    setRolled(true);
    setPhase("picking");
    setSelection(null);
    setWhiteChoice(false);
  }

  function finishTurn(
    finalPlayer: PlayerState,
    finalInPlay: Record<DieId, boolean>,
    platterSoFar: PlatterDie[],
  ) {
    const leftover: PlatterDie[] = DIE_ORDER.filter((d) => finalInPlay[d]).map(
      (d) => ({ die: d, value: values[d] }),
    );
    onTurnEnd(finalPlayer, [...platterSoFar, ...leftover]);
  }

  function selectDie(color: ColorId, value: number, consumedDice: DieId[]) {
    const indices = legalBoxIndices(color, player.columns[color], value);
    if (indices.length === 0) return;
    setSelection({ color, value, consumedDice, indices });
    setWhiteChoice(false);
  }

  function pickDie(die: DieId) {
    if (die === "white") {
      setWhiteChoice(true);
      setSelection(null);
      return;
    }
    selectDie(die, values[die], [die]);
  }

  function confirmPick(color: ColorId, boxIndex: number) {
    if (!selection || selection.color !== color) return;
    const { value, consumedDice } = selection;
    const result = placeDieAt(player, color, boxIndex, value);
    if (!result) return;

    const nextInPlay = { ...inPlay };
    const newPlatter: PlatterDie[] = [];
    DIE_ORDER.forEach((d) => {
      if (consumedDice.includes(d)) {
        nextInPlay[d] = false;
      } else if (inPlay[d]) {
        if (values[d] < value) {
          nextInPlay[d] = false;
          newPlatter.push({ die: d, value: values[d] });
        }
      }
    });

    const nextPicks = picksMade + 1;
    const nextBonus = bonusRerolls + (result.bonusReroll ? 1 : 0);
    const stillInPlay = DIE_ORDER.some((d) => nextInPlay[d]);
    const done = nextPicks >= 3 + nextBonus || !stillInPlay;
    const updatedPlatter = [...platter, ...newPlatter];

    setPlayer(result.player);
    setPlatter(updatedPlatter);
    setInPlay(nextInPlay);
    setPicksMade(nextPicks);
    setBonusRerolls(nextBonus);
    setPhase("beforeRoll");
    setRolled(false);
    setSelection(null);
    setWhiteChoice(false);

    if (done) {
      finishTurn(result.player, nextInPlay, updatedPlatter);
    }
  }

  function stopTurn() {
    finishTurn(player, inPlay, platter);
  }

  const legalWhiteColors = COLUMN_ORDER.filter(
    (c) =>
      c !== "blue" &&
      legalBoxIndices(c, player.columns[c], values.white).length > 0,
  );
  const blueComboValue = values.white + values.blue;
  const blueComboLegal =
    inPlay.blue &&
    legalBoxIndices("blue", player.columns.blue, blueComboValue).length > 0;

  const anyLegal =
    rolled &&
    inPlayDice.some((d) =>
      canPlace(d, values[d], player, inPlay, blueComboValue),
    );

  return (
    <div class={styles.screen}>
      <div class={styles.header}>
        <p class="text-sm text-muted">{roundLabel}</p>
        <h1 class="text-xl font-bold">{player.name}'s roll</h1>
        <p class="text-sm text-secondary">
          Pick {picksMade + 1} of up to {maxPicks} — dice below what you pick
          fall to the Silver Platter for everyone else.
        </p>
      </div>

      <div class={styles.diceRow}>
        {sortedDice.map((d) => (
          <Die
            key={d}
            value={values[d]}
            color={d}
            size="lg"
            faded={!inPlay[d] || !rolled}
            disabled={
              phase !== "picking" ||
              !inPlay[d] ||
              !canPlace(d, values[d], player, inPlay, blueComboValue)
            }
            onClick={
              phase === "picking" && inPlay[d] ? () => pickDie(d) : undefined
            }
          />
        ))}
      </div>

      {whiteChoice && (
        <div class={styles.whiteChoice}>
          <p class="text-sm text-secondary">
            White die shows {values.white} — use it as:
          </p>
          <div class={styles.whiteButtons}>
            {COLUMN_ORDER.filter((c) => c !== "blue").map((color) => (
              <button
                key={color}
                type="button"
                class="btn"
                disabled={!legalWhiteColors.includes(color)}
                onClick={() => selectDie(color, values.white, ["white"])}
              >
                {COLUMN_LABEL[color]}
              </button>
            ))}
            {inPlay.blue && (
              <button
                type="button"
                class="btn"
                disabled={!blueComboLegal}
                onClick={() =>
                  selectDie("blue", blueComboValue, ["white", "blue"])
                }
              >
                Blue (white + blue = {blueComboValue})
              </button>
            )}
          </div>
          <button
            type="button"
            class="btn btn-ghost"
            onClick={() => setWhiteChoice(false)}
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

      {phase === "beforeRoll" && (
        <div class={styles.actions}>
          <button
            type="button"
            class="btn btn-primary !py-4 text-lg"
            onClick={rollDice}
          >
            Roll {inPlayDice.length} dice
          </button>
          {picksMade > 0 && (
            <button type="button" class="btn" onClick={stopTurn}>
              Stop here
            </button>
          )}
        </div>
      )}

      {phase === "picking" && !anyLegal && !selection && (
        <button type="button" class="btn btn-primary" onClick={stopTurn}>
          No legal moves — end turn
        </button>
      )}

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

function canPlace(
  die: DieId,
  value: number,
  player: PlayerState,
  inPlay: Record<DieId, boolean>,
  whiteBlueSum: number,
): boolean {
  if (die === "white") {
    const wildcard = COLUMN_ORDER.filter((c) => c !== "blue").some(
      (c) => legalBoxIndices(c, player.columns[c], value).length > 0,
    );
    const combo =
      inPlay.blue &&
      legalBoxIndices("blue", player.columns.blue, whiteBlueSum).length > 0;
    return wildcard || combo;
  }
  return legalBoxIndices(die, player.columns[die], value).length > 0;
}
