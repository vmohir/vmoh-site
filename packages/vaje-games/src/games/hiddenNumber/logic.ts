import questionsData from "./questions.json";

export const QUESTION_TEMPLATES: string[] = questionsData.questions;

export const MIN_NUMBER = 1;
export const MAX_NUMBER = 100;

export function randomNumber(): number {
  return MIN_NUMBER + Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1));
}

export function fillTemplate(template: string, n: number | null): string {
  return template.replace("{n}", n === null ? "؟" : String(n));
}

export function shuffle<T>(items: T[]): T[] {
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

export function freshQuestionDeck(): string[] {
  return shuffle(QUESTION_TEMPLATES);
}
