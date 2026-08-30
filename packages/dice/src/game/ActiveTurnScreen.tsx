import { useState } from "preact/hooks";
import { findLegalBox, hasAnyLegalMove, placeDie, rollDie } from "./logic";
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

type LocalPhase = "beforeRoll" | "picking" | "choosingWhiteColor";

export default function ActiveTurnScreen({
  roundLabel,
  player: initialPlayer,
  onTurnEnd,
}: Props) {
  const [player, setPlayer] = useState(initialPlayer);
  const [phase, setPhase] = useState<LocalPhase>("beforeRoll");
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

  const maxPicks = 3 + bonusRerolls;
  const inPlayDice = DIE_ORDER.filter((d) => inPlay[d]);

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

  function applyPlacement(color: ColorId, value: number, die: DieId) {
    const result = placeDie(player, color, value);
    if (!result) return;

    const nextInPlay = { ...inPlay };
    const newPlatter: PlatterDie[] = [];
    DIE_ORDER.forEach((d) => {
      if (d === die) {
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

    if (done) {
      finishTurn(result.player, nextInPlay, updatedPlatter);
    }
  }

  function pickDie(die: DieId) {
    if (die === "white") {
      setPhase("choosingWhiteColor");
      return;
    }
    applyPlacement(die, values[die], die);
  }

  function stopTurn() {
    finishTurn(player, inPlay, platter);
  }

  const legalWhiteColors = COLUMN_ORDER.filter(
    (c) => findLegalBox(c, player.columns[c], values.white) !== null,
  );

  const anyLegal =
    rolled && inPlayDice.some((d) => canPlace(d, values[d], player));

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
        {DIE_ORDER.map((d) => (
          <Die
            key={d}
            value={values[d]}
            color={d}
            size="lg"
            faded={!inPlay[d] || !rolled}
            disabled={
              phase !== "picking" ||
              !inPlay[d] ||
              !canPlace(d, values[d], player)
            }
            onClick={
              phase === "picking" && inPlay[d] ? () => pickDie(d) : undefined
            }
          />
        ))}
      </div>

      {phase === "choosingWhiteColor" && (
        <div class={styles.whiteChoice}>
          <p class="text-sm text-secondary">
            White die shows {values.white} — use it as:
          </p>
          <div class={styles.whiteButtons}>
            {COLUMN_ORDER.map((color) => (
              <button
                key={color}
                type="button"
                class="btn"
                disabled={!legalWhiteColors.includes(color)}
                onClick={() => applyPlacement(color, values.white, "white")}
              >
                {COLUMN_LABEL[color]}
              </button>
            ))}
          </div>
          <button
            type="button"
            class="btn btn-ghost"
            onClick={() => setPhase("picking")}
          >
            Back
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

      {phase === "picking" && !anyLegal && (
        <button type="button" class="btn btn-primary" onClick={stopTurn}>
          No legal moves — end turn
        </button>
      )}

      <ScoreSheet player={player} />
    </div>
  );
}

function canPlace(die: DieId, value: number, player: PlayerState): boolean {
  if (die === "white") return hasAnyLegalMove(player, value);
  return findLegalBox(die, player.columns[die], value) !== null;
}
