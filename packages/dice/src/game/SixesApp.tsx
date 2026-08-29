import { useState } from "preact/hooks";
import { playerNames } from "../state/setupState";
import { TOTAL_ROUNDS, checkBox, emptyBoxes, rollDice } from "./logic";
import type { ColorId, DiceRoll, Phase, PlayerState } from "./types";
import SetupScreen from "./SetupScreen";
import RollScreen from "./RollScreen";
import HandoffScreen from "./HandoffScreen";
import WildTurnScreen from "./WildTurnScreen";
import ActiveTurnScreen from "./ActiveTurnScreen";
import GameOverScreen from "./GameOverScreen";
import styles from "./SixesApp.module.css";

export default function SixesApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [round, setRound] = useState(0);
  const [roll, setRoll] = useState<DiceRoll | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const activeIndex = players.length > 0 ? round % players.length : 0;
  const currentPlayer = players[stepIndex] ?? null;

  function freshPlayers(): PlayerState[] {
    const names = playerNames.value.map((n) => n.trim()).filter(Boolean);
    return names.map((name) => ({
      id: crypto.randomUUID(),
      name,
      boxes: emptyBoxes(),
    }));
  }

  function startGame() {
    setPlayers(freshPlayers());
    setRound(0);
    setRoll(null);
    setStepIndex(0);
    setPhase("roll");
  }

  function playAgain() {
    setPlayers((prev) => prev.map((p) => ({ ...p, boxes: emptyBoxes() })));
    setRound(0);
    setRoll(null);
    setStepIndex(0);
    setPhase("roll");
  }

  function newSetup() {
    setPhase("setup");
  }

  function doRoll() {
    setRoll(rollDice());
    enterStep(0);
  }

  function enterStep(index: number) {
    setStepIndex(index);
    if (players.length > 1) {
      setPhase("handoff");
    } else {
      setPhase(index === activeIndex ? "activeTurn" : "wildTurn");
    }
  }

  function advanceStep() {
    const next = stepIndex + 1;
    if (next >= players.length) {
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        setPhase("gameOver");
        return;
      }
      setRound(nextRound);
      setRoll(null);
      setStepIndex(0);
      setPhase("roll");
      return;
    }
    enterStep(next);
  }

  function applyBox(playerId: string, color: ColorId, value: number) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? checkBox(p, color, value) : p)),
    );
  }

  return (
    <div class={styles.app}>
      {phase === "setup" && <SetupScreen onStart={startGame} />}

      {phase === "roll" && players[activeIndex] && (
        <RollScreen
          round={round}
          activePlayerName={players[activeIndex]!.name}
          onRoll={doRoll}
        />
      )}

      {phase === "handoff" && currentPlayer && (
        <HandoffScreen
          playerName={currentPlayer.name}
          active={stepIndex === activeIndex}
          onReady={() =>
            setPhase(stepIndex === activeIndex ? "activeTurn" : "wildTurn")
          }
        />
      )}

      {phase === "wildTurn" && currentPlayer && roll && (
        <WildTurnScreen
          key={`wild-${round}-${stepIndex}`}
          player={currentPlayer}
          wildValue={roll.wild}
          onApply={(color) => {
            applyBox(currentPlayer.id, color, roll.wild);
            advanceStep();
          }}
          onSkip={advanceStep}
        />
      )}

      {phase === "activeTurn" && currentPlayer && roll && (
        <ActiveTurnScreen
          key={`active-${round}-${stepIndex}`}
          player={currentPlayer}
          roll={roll}
          onApply={(color, value) => applyBox(currentPlayer.id, color, value)}
          onDone={advanceStep}
        />
      )}

      {phase === "gameOver" && (
        <GameOverScreen
          players={players}
          onPlayAgain={playAgain}
          onNewSetup={newSetup}
        />
      )}
    </div>
  );
}
