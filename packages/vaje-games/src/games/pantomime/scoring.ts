import { DIFFICULTY_POINTS } from "./words";
import type { Difficulty, Team, Word } from "./types";

// A correct guess scores +pointsForWord(word); a skip costs the same amount
// so skipping a hard word is riskier than skipping an easy one.
export function pointsForWord(word: Word): number {
  return DIFFICULTY_POINTS[word.difficulty] ?? 1;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = result[i] as T;
    const b = result[j] as T;
    result[i] = b;
    result[j] = a;
  }
  return result;
}

// All categories always play; only difficulty is filterable.
export function buildDeck(
  words: Word[],
  selectedDifficulties: Difficulty[],
): Word[] {
  const pool = words.filter((word) =>
    selectedDifficulties.includes(word.difficulty),
  );
  return shuffle(pool.length > 0 ? pool : words);
}

export function applyScoreDelta(team: Team, delta: number): Team {
  return { ...team, score: Math.max(0, team.score + delta) };
}

export function findWinner(teams: Team[]): Team | null {
  if (teams.length === 0) return null;
  return teams.reduce((best, team) => (team.score > best.score ? team : best));
}
