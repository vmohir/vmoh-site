import { useState } from "preact/hooks";
import { playerNames } from "../../state/hiddenNumberState";
import { fillTemplate, freshQuestionDeck, randomNumber } from "./logic";
import type { Phase, Player } from "./types";
import PlayerSetupScreen from "./PlayerSetupScreen";
import HandoffScreen from "./HandoffScreen";
import RevealScreen from "./RevealScreen";
import DiscussScreen from "./DiscussScreen";
import ResultScreen from "./ResultScreen";
import styles from "./HiddenNumberApp.module.css";

export default function HiddenNumberApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deck, setDeck] = useState<string[]>([]);
  const [template, setTemplate] = useState<string | null>(null);
  const [number, setNumber] = useState<number | null>(null);

  const guesser = players[currentIndex] ?? null;

  function drawRound(remaining: string[]) {
    const pool = remaining.length > 0 ? remaining : freshQuestionDeck();
    setTemplate(pool[0] as string);
    setNumber(randomNumber());
    setDeck(pool.slice(1));
  }

  function startGame() {
    const names = playerNames.value.map((name) => name.trim()).filter(Boolean);
    setPlayers(names.map((name) => ({ id: crypto.randomUUID(), name })));
    setCurrentIndex(0);
    drawRound(freshQuestionDeck());
    setPhase("handoff");
  }

  function nextRound() {
    setCurrentIndex((i) => (i + 1) % players.length);
    drawRound(deck);
    setPhase("handoff");
  }

  function backToSetup() {
    setPhase("setup");
  }

  return (
    <div class={styles.app}>
      {phase === "setup" && <PlayerSetupScreen onStart={startGame} />}
      {phase === "handoff" && guesser && (
        <HandoffScreen
          guesserName={guesser.name}
          onReady={() => setPhase("reveal")}
          onExit={backToSetup}
        />
      )}
      {phase === "reveal" && guesser && template && number !== null && (
        <RevealScreen
          guesserName={guesser.name}
          question={fillTemplate(template, number)}
          number={number}
          onSeen={() => setPhase("discuss")}
        />
      )}
      {phase === "discuss" && guesser && template && (
        <DiscussScreen
          guesserName={guesser.name}
          questionWithBlank={fillTemplate(template, null)}
          onReveal={() => setPhase("result")}
          onExit={backToSetup}
        />
      )}
      {phase === "result" && template && number !== null && (
        <ResultScreen
          question={fillTemplate(template, number)}
          number={number}
          onNext={nextRound}
          onExit={backToSetup}
        />
      )}
    </div>
  );
}
