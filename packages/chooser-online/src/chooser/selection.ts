import type { ChoiceResult, Finger, Mode } from "./types";
import { TEAM_COLORS } from "./colors";

function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

export function pickResult(
  mode: Mode,
  fingers: readonly Finger[],
  teamCount: number,
): ChoiceResult | null {
  if (fingers.length < 2) return null;

  if (mode === "winner") {
    const idx = Math.floor(Math.random() * fingers.length);
    const winner = fingers[idx];
    if (!winner) return null;
    return { kind: "winner", winnerId: winner.id };
  }

  if (mode === "teams") {
    const t = Math.max(2, Math.min(teamCount, fingers.length));
    const shuffledFingers = shuffle(fingers);
    // Also shuffle team-label assignment so which team gets the "extra" finger
    // (when fingers don't divide evenly) is random, not always team 1.
    const teamOrder = shuffle(Array.from({ length: t }, (_, i) => i));
    const teamByFinger: Record<number, number> = {};
    shuffledFingers.forEach((f, i) => {
      teamByFinger[f.id] = teamOrder[i % t] ?? 0;
    });
    const teamColors = Array.from(
      { length: t },
      (_, i) => TEAM_COLORS[i % TEAM_COLORS.length] ?? "#f5f5f7",
    );
    return { kind: "teams", teamCount: t, teamColors, teamByFinger };
  }

  // order
  const shuffled = shuffle(fingers);
  const orderByFinger: Record<number, number> = {};
  shuffled.forEach((f, i) => {
    orderByFinger[f.id] = i + 1;
  });
  return { kind: "order", orderByFinger };
}
