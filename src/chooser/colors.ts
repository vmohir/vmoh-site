export const FINGER_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#84cc16", // lime
];

export const TEAM_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#06b6d4",
];

export function colorForIndex(i: number, palette: readonly string[] = FINGER_COLORS): string {
  const safe = palette.length > 0 ? palette : FINGER_COLORS;
  return safe[i % safe.length] ?? "#f5f5f7";
}
