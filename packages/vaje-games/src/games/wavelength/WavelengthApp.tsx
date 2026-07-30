import { useState } from "preact/hooks";
import { targetScore, teamNames } from "../../state/wavelengthState";
import { freshPairDeck, randomValue, scoreForGuess } from "./logic";
import type { Phase, SpectrumPair, Team } from "./types";
import TeamSetupScreen from "./TeamSetupScreen";
import ClueGiverScreen from "./ClueGiverScreen";
import GuessingScreen from "./GuessingScreen";
import RevealScreen from "./RevealScreen";
import GameOverScreen from "./GameOverScreen";
import styles from "./WavelengthApp.module.css";

const DEFAULT_GUESS = 50;

export default function WavelengthApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [teams, setTeams] = useState<Team[]>([]);
  const [clueTeamIndex, setClueTeamIndex] = useState<0 | 1>(0);
  const [deck, setDeck] = useState<SpectrumPair[]>([]);
  const [pair, setPair] = useState<SpectrumPair | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [guess, setGuess] = useState(DEFAULT_GUESS);
  const [lastPoints, setLastPoints] = useState(0);

  const clueTeam = teams[clueTeamIndex] ?? null;
  const guessingIndex = clueTeamIndex === 0 ? 1 : 0;
  const guessingTeam = teams[guessingIndex] ?? null;

  function drawPair(remaining: SpectrumPair[]): {
    pair: SpectrumPair;
    rest: SpectrumPair[];
  } {
    const pool = remaining.length > 0 ? remaining : freshPairDeck();
    return { pair: pool[0] as SpectrumPair, rest: pool.slice(1) };
  }

  function startRoundContent(remaining: SpectrumPair[]): SpectrumPair[] {
    const { pair: p, rest } = drawPair(remaining);
    setPair(p);
    setTarget(randomValue());
    setGuess(DEFAULT_GUESS);
    return rest;
  }

  function startGame() {
    const newTeams: Team[] = teamNames.value.map((name) => ({
      id: crypto.randomUUID(),
      name: name.trim(),
      score: 0,
    }));
    setTeams(newTeams);
    setClueTeamIndex(0);
    const rest = startRoundContent(freshPairDeck());
    setDeck(rest);
    setPhase("clueGiver");
  }

  function updateGuessingTeamScore(delta: number): number {
    let newScore = 0;
    setTeams((prev) =>
      prev.map((team, index) => {
        if (index !== guessingIndex) return team;
        const updated = { ...team, score: team.score + delta };
        newScore = updated.score;
        return updated;
      }),
    );
    return newScore;
  }

  function lockInGuess() {
    if (target === null) return;
    const points = scoreForGuess(target, guess);
    setLastPoints(points);
    updateGuessingTeamScore(points);
    setPhase("reveal");
  }

  function nextRound() {
    const reachedTarget = teams.some((team) => team.score >= targetScore.value);
    if (reachedTarget) {
      setPhase("gameOver");
      return;
    }
    setClueTeamIndex((i) => (i === 0 ? 1 : 0));
    const rest = startRoundContent(deck);
    setDeck(rest);
    setPhase("clueGiver");
  }

  function playAgain() {
    setTeams((prev) => prev.map((team) => ({ ...team, score: 0 })));
    setClueTeamIndex(0);
    const rest = startRoundContent(freshPairDeck());
    setDeck(rest);
    setPhase("clueGiver");
  }

  function backToSetup() {
    setPhase("setup");
  }

  return (
    <div class={styles.app}>
      {phase === "setup" && <TeamSetupScreen onStart={startGame} />}
      {phase === "clueGiver" && clueTeam && pair && target !== null && (
        <ClueGiverScreen
          teamName={clueTeam.name}
          leftLabel={pair.left}
          rightLabel={pair.right}
          target={target}
          onProceed={() => setPhase("guessing")}
          onExit={backToSetup}
        />
      )}
      {phase === "guessing" && guessingTeam && pair && (
        <GuessingScreen
          guessingTeamName={guessingTeam.name}
          leftLabel={pair.left}
          rightLabel={pair.right}
          guess={guess}
          onGuessChange={setGuess}
          onLockIn={lockInGuess}
          onExit={backToSetup}
        />
      )}
      {phase === "reveal" && guessingTeam && pair && target !== null && (
        <RevealScreen
          leftLabel={pair.left}
          rightLabel={pair.right}
          target={target}
          guess={guess}
          points={lastPoints}
          guessingTeamName={guessingTeam.name}
          teams={teams}
          onNext={nextRound}
          onExit={backToSetup}
        />
      )}
      {phase === "gameOver" && (
        <GameOverScreen
          teams={teams}
          onPlayAgain={playAgain}
          onNewSetup={backToSetup}
        />
      )}
    </div>
  );
}
