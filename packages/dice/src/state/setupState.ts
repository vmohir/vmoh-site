import { effect, signal } from "@preact/signals";

const STORAGE_KEY = "sixes-setup";

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 6;

export const DEFAULT_PLAYER_NAMES = ["Player 1"];

function loadPlayerNames(): string[] {
  if (typeof localStorage === "undefined") return DEFAULT_PLAYER_NAMES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_NAMES;
    const parsed = JSON.parse(raw) as Partial<{ playerNames: string[] }>;
    return parsed.playerNames &&
      parsed.playerNames.length >= MIN_PLAYERS &&
      parsed.playerNames.length <= MAX_PLAYERS
      ? parsed.playerNames
      : DEFAULT_PLAYER_NAMES;
  } catch {
    return DEFAULT_PLAYER_NAMES;
  }
}

export const playerNames = signal<string[]>(loadPlayerNames());

export function addPlayer(): void {
  if (playerNames.value.length >= MAX_PLAYERS) return;
  playerNames.value = [
    ...playerNames.value,
    `Player ${playerNames.value.length + 1}`,
  ];
}

export function removePlayer(index: number): void {
  if (playerNames.value.length <= MIN_PLAYERS) return;
  playerNames.value = playerNames.value.filter((_, i) => i !== index);
}

export function renamePlayer(index: number, name: string): void {
  playerNames.value = playerNames.value.map((existing, i) =>
    i === index ? name : existing,
  );
}

if (typeof localStorage !== "undefined") {
  effect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ playerNames: playerNames.value }),
    );
  });
}
