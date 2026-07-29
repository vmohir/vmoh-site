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

// Timed mode: all categories always play; only difficulty is filterable.
export function buildDeck(
  words: Word[],
  selectedDifficulties: Difficulty[],
): Word[] {
  const pool = words.filter((word) =>
    selectedDifficulties.includes(word.difficulty),
  );
  return shuffle(pool.length > 0 ? pool : words);
}

// Selection mode: one word per turn for a chosen category+difficulty,
// avoiding repeats until that combination is exhausted this game.
export function pickOne(
  words: Word[],
  category: string,
  difficulty: Difficulty,
  seen: Set<string>,
): Word | null {
  const pool = words.filter(
    (word) => word.category === category && word.difficulty === difficulty,
  );
  const unseen = pool.filter((word) => !seen.has(word.id));
  const candidates = unseen.length > 0 ? unseen : pool;
  if (candidates.length === 0) return null;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index] as Word;
}

export function applyScoreDelta(team: Team, delta: number): Team {
  return { ...team, score: Math.max(0, team.score + delta) };
}

export function findWinner(teams: Team[]): Team | null {
  if (teams.length === 0) return null;
  return teams.reduce((best, team) => (team.score > best.score ? team : best));
}
