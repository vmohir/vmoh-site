import { useState } from "preact/hooks";
import { playerNames } from "../state/setupState";
import { roundsForPlayerCount } from "./board";
import { emptyColumns } from "./logic";
import type { Phase, PlatterDie, PlayerState } from "./types";
import SetupScreen from "./SetupScreen";
import HandoffScreen from "./HandoffScreen";
import ActiveTurnScreen from "./ActiveTurnScreen";
import PlatterTurnScreen from "./PlatterTurnScreen";
import GameOverScreen from "./GameOverScreen";
import styles from "./SixesApp.module.css";

export default function SixesApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [round, setRound] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [platter, setPlatter] = useState<PlatterDie[]>([]);

  const totalRounds = roundsForPlayerCount(players.length || 1);
  const activeIndex = players.length > 0 ? round % players.length : 0;
  const order =
    players.length > 0
      ? [
          activeIndex,
          ...players.map((_, i) => i).filter((i) => i !== activeIndex),
        ]
      : [];
  const currentPlayer = players[order[stepIndex] ?? -1] ?? null;
  const isActiveStep = stepIndex === 0;
  const roundLabel = `Round ${round + 1} of ${totalRounds}`;

  function freshPlayers(): PlayerState[] {
    const names = playerNames.value.map((n) => n.trim()).filter(Boolean);
    return names.map((name) => ({
      id: crypto.randomUUID(),
      name,
      columns: emptyColumns(),
    }));
  }

  function firstPhase(playerCount: number): Phase {
    return playerCount > 1 ? "handoff" : "activeTurn";
  }

  function startGame() {
    const fresh = freshPlayers();
    setPlayers(fresh);
    setRound(0);
    setStepIndex(0);
    setPlatter([]);
    setPhase(firstPhase(fresh.length));
  }

  function playAgain() {
    setPlayers((prev) => prev.map((p) => ({ ...p, columns: emptyColumns() })));
    setRound(0);
    setStepIndex(0);
    setPlatter([]);
    setPhase(firstPhase(players.length));
  }

  function newSetup() {
    setPhase("setup");
  }

  function updatePlayer(updated: PlayerState) {
    setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function advanceStep() {
    const next = stepIndex + 1;
    if (next >= order.length) {
      const nextRound = round + 1;
      if (nextRound >= totalRounds) {
        setPhase("gameOver");
        return;
      }
      setRound(nextRound);
      setStepIndex(0);
      setPlatter([]);
      setPhase(firstPhase(players.length));
      return;
    }
    setStepIndex(next);
    setPhase(players.length > 1 ? "handoff" : "platterTurn");
  }

  return (
    <div class={styles.app}>
      {phase === "setup" && <SetupScreen onStart={startGame} />}

      {phase === "handoff" && currentPlayer && (
        <HandoffScreen
          playerName={currentPlayer.name}
          active={isActiveStep}
          onReady={() => setPhase(isActiveStep ? "activeTurn" : "platterTurn")}
        />
      )}

      {phase === "activeTurn" && currentPlayer && (
        <ActiveTurnScreen
          key={`active-${round}-${currentPlayer.id}`}
          roundLabel={roundLabel}
          player={currentPlayer}
          onTurnEnd={(updated, newPlatter) => {
            updatePlayer(updated);
            setPlatter(newPlatter);
            advanceStep();
          }}
        />
      )}

      {phase === "platterTurn" && currentPlayer && (
        <PlatterTurnScreen
          key={`platter-${round}-${currentPlayer.id}`}
          roundLabel={roundLabel}
          player={currentPlayer}
          platter={platter}
          onDone={(updated) => {
            updatePlayer(updated);
            advanceStep();
          }}
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
