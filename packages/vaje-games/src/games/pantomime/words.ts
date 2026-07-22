// `?url` gives us the built, hashed URL for words.json instead of inlining
// its ~500 words into the JS bundle. pantomime.astro preloads this same URL
// in <head> so the fetch below resolves from cache almost instantly.
import wordsUrl from "../../words.json?url";
import type { DifficultyMeta, Word } from "./types";

export const DIFFICULTIES: DifficultyMeta[] = [
  { id: "easy", label: "آسان", points: 1 },
  { id: "medium", label: "متوسط", points: 2 },
  { id: "hard", label: "سخت", points: 3 },
];

export const DIFFICULTY_POINTS: Record<string, number> = Object.fromEntries(
  DIFFICULTIES.map((d) => [d.id, d.points]),
);

interface RawWord {
  text: string;
  category: string;
  difficulty: string;
}

let wordsPromise: Promise<Word[]> | null = null;

// Kicks off on first call (see the eager call below) and memoizes the
// result — every caller shares the same in-flight/resolved promise.
export function loadWords(): Promise<Word[]> {
  if (!wordsPromise) {
    wordsPromise = fetch(wordsUrl)
      .then((res) => res.json())
      .then((data: { words: RawWord[] }) =>
        data.words.map((word, index) => ({
          id: `${word.category}-${word.difficulty}-${index}`,
          text: word.text,
          category: word.category,
          difficulty: word.difficulty as Word["difficulty"],
        })),
      );
  }
  return wordsPromise;
}

// Start the fetch as soon as this module runs (page load), well before the
// player finishes setting up teams.
loadWords();
