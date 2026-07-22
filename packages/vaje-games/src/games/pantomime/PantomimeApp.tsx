import { useEffect, useState } from "preact/hooks";
import {
  roundSeconds,
  selectedDifficulties,
  targetScore,
  teamNames,
} from "../../state/pantomimeState";
import { applyScoreDelta, buildDeck, pointsForWord } from "./scoring";
import { loadWords } from "./words";
import type { Phase, RoundStats, Team, Word } from "./types";
import TeamSetupScreen from "./TeamSetupScreen";
import ReadyScreen from "./ReadyScreen";
import RoundScreen from "./RoundScreen";
import ResultsScreen from "./ResultsScreen";
import styles from "./PantomimeApp.module.css";

export default function PantomimeApp() {
  const [allWords, setAllWords] = useState<Word[] | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundStats, setRoundStats] = useState<RoundStats>({
    correct: 0,
    skipped: 0,
  });

  useEffect(() => {
    loadWords().then(setAllWords);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      setPhase("roundEnd");
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, timeLeft]);

  const currentTeam = teams[currentTeamIndex] ?? null;

  function freshDeck(): Word[] {
    return buildDeck(allWords ?? [], selectedDifficulties.value);
  }

  function nextWord(remaining: Word[]): { word: Word | null; deck: Word[] } {
    if (remaining.length > 0)
      return { word: remaining[0] as Word, deck: remaining };
    const reshuffled = freshDeck();
    return { word: reshuffled[0] ?? null, deck: reshuffled };
  }

  function startGame() {
    if (!allWords) return;
    const names = teamNames.value.map((name) => name.trim()).filter(Boolean);
    const newTeams: Team[] = names.map((name) => ({
      id: crypto.randomUUID(),
      name,
      score: 0,
    }));
    setTeams(newTeams);
    setCurrentTeamIndex(0);
    setDeck(freshDeck());
    setPhase("ready");
  }

  function startRound() {
    setRoundStats({ correct: 0, skipped: 0 });
    setTimeLeft(roundSeconds.value);
    const { word, deck: nextDeck } = nextWord(deck);
    setCurrentWord(word);
    setDeck(nextDeck);
    setPhase("playing");
  }

  function updateCurrentTeamScore(delta: number) {
    setTeams((prev) =>
      prev.map((team, index) =>
        index === currentTeamIndex ? applyScoreDelta(team, delta) : team,
      ),
    );
  }

  function gotIt() {
    if (!currentWord) return;
    updateCurrentTeamScore(pointsForWord(currentWord));
    setRoundStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
    const rest = deck.slice(1);
    const { word, deck: nextDeck } = nextWord(rest);
    setCurrentWord(word);
    setDeck(nextDeck);
  }

  function skip() {
    if (!currentWord) return;
    updateCurrentTeamScore(-pointsForWord(currentWord));
    setRoundStats((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
    const rest = [...deck.slice(1), currentWord];
    const { word, deck: nextDeck } = nextWord(rest);
    setCurrentWord(word);
    setDeck(nextDeck);
  }

  function continueAfterRound() {
    const reachedTarget = teams.some((team) => team.score >= targetScore.value);
    if (reachedTarget) {
      setPhase("gameOver");
      return;
    }
    setCurrentTeamIndex((i) => (i + 1) % teams.length);
    setPhase("ready");
  }

  function playAgain() {
    setTeams((prev) => prev.map((team) => ({ ...team, score: 0 })));
    setCurrentTeamIndex(0);
    setDeck(freshDeck());
    setPhase("ready");
  }

  function backToSetup() {
    setPhase("setup");
  }

  return (
    <div class={styles.app}>
      {phase === "setup" && (
        <TeamSetupScreen wordsReady={allWords !== null} onStart={startGame} />
      )}
      {phase === "ready" && currentTeam && (
        <ReadyScreen
          teamName={currentTeam.name}
          roundSeconds={roundSeconds.value}
          onReady={startRound}
          onExit={backToSetup}
        />
      )}
      {phase === "playing" && currentTeam && currentWord && (
        <RoundScreen
          word={currentWord}
          timeLeft={timeLeft}
          teamName={currentTeam.name}
          teamScore={currentTeam.score}
          onGotIt={gotIt}
          onSkip={skip}
        />
      )}
      {phase === "roundEnd" && currentTeam && (
        <ResultsScreen
          mode="round"
          teamName={currentTeam.name}
          roundStats={roundStats}
          teams={teams}
          onContinue={continueAfterRound}
        />
      )}
      {phase === "gameOver" && (
        <ResultsScreen
          mode="gameOver"
          teams={teams}
          onPlayAgain={playAgain}
          onNewSetup={backToSetup}
        />
      )}
    </div>
  );
}
