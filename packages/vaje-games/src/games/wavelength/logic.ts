import pairsData from "./pairs.json";
import type { SpectrumPair } from "./types";

export const PAIRS: SpectrumPair[] = pairsData.pairs;

export const MIN_VALUE = 0;
export const MAX_VALUE = 100;

// Distance from target within which a guess earns 4 / 3 / 2 points;
// anything further scores 0. Widths roughly mirror the physical board
// game's bullseye + two widening rings.
export const BAND_4 = 6;
export const BAND_3 = 13;
export const BAND_2 = 20;

export function randomValue(): number {
  return Math.round(MIN_VALUE + Math.random() * (MAX_VALUE - MIN_VALUE));
}

export function scoreForGuess(target: number, guess: number): number {
  const distance = Math.abs(target - guess);
  if (distance <= BAND_4) return 4;
  if (distance <= BAND_3) return 3;
  if (distance <= BAND_2) return 2;
  return 0;
}

export interface BandSegment {
  from: number;
  to: number;
  points: 2 | 3 | 4;
}

// The five colored rings drawn around a target: one 4pt bullseye, two 3pt
// rings on either side, two 2pt rings outside those. Clamped to [0, 100]
// and degenerate (empty) segments near the edges are dropped.
export function bandSegments(target: number): BandSegment[] {
  const raw: BandSegment[] = [
    { from: target - BAND_2, to: target - BAND_3, points: 2 },
    { from: target - BAND_3, to: target - BAND_4, points: 3 },
    { from: target - BAND_4, to: target + BAND_4, points: 4 },
    { from: target + BAND_4, to: target + BAND_3, points: 3 },
    { from: target + BAND_3, to: target + BAND_2, points: 2 },
  ];
  return raw
    .map((seg) => ({
      ...seg,
      from: Math.max(MIN_VALUE, seg.from),
      to: Math.min(MAX_VALUE, seg.to),
    }))
    .filter((seg) => seg.to > seg.from);
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

export function freshPairDeck(): SpectrumPair[] {
  return shuffle(PAIRS);
}
