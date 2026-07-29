import { useState } from "preact/hooks";
import { playerNames } from "../../state/hiddenNumberState";
import { freshQuestionDeck, questionText, randomNumber } from "./logic";
import type { Phase, Player } from "./types";
import PlayerSetupScreen from "./PlayerSetupScreen";
import HandoffScreen from "./HandoffScreen";
import ShowNumberScreen from "./ShowNumberScreen";
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

  function drawQuestion(remaining: string[]): {
    template: string;
    rest: string[];
  } {
    const pool = remaining.length > 0 ? remaining : freshQuestionDeck();
    return { template: pool[0] as string, rest: pool.slice(1) };
  }

  function startGame() {
    const names = playerNames.value.map((name) => name.trim()).filter(Boolean);
    setPlayers(names.map((name) => ({ id: crypto.randomUUID(), name })));
    setCurrentIndex(0);
    setNumber(randomNumber());
    const { template: t, rest } = drawQuestion(freshQuestionDeck());
    setTemplate(t);
    setDeck(rest);
    setPhase("handoff");
  }

  function nextQuestion() {
    const { template: t, rest } = drawQuestion(deck);
    setTemplate(t);
    setDeck(rest);
  }

  function nextRound() {
    setCurrentIndex((i) => (i + 1) % players.length);
    setNumber(randomNumber());
    nextQuestion();
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
          onReady={() => setPhase("showNumber")}
          onExit={backToSetup}
        />
      )}
      {phase === "showNumber" && guesser && number !== null && (
        <ShowNumberScreen
          guesserName={guesser.name}
          number={number}
          onSeen={() => setPhase("discuss")}
        />
      )}
      {phase === "discuss" && guesser && template && (
        <DiscussScreen
          guesserName={guesser.name}
          question={questionText(template)}
          onNextQuestion={nextQuestion}
          onReveal={() => setPhase("result")}
          onExit={backToSetup}
        />
      )}
      {phase === "result" && number !== null && (
        <ResultScreen number={number} onNext={nextRound} onExit={backToSetup} />
      )}
    </div>
  );
}
