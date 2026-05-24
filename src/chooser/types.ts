export type Mode = "winner" | "teams" | "order";

export interface Finger {
  id: number;
  x: number;
  y: number;
  joinedAt: number;
  color: string;
}

export interface WinnerResult {
  kind: "winner";
  winnerId: number;
}

export interface TeamsResult {
  kind: "teams";
  teamCount: number;
  teamColors: string[];
  /** map from pointerId to team index 0..teamCount-1 */
  teamByFinger: Record<number, number>;
}

export interface OrderResult {
  kind: "order";
  /** map from pointerId to 1-indexed order */
  orderByFinger: Record<number, number>;
}

export type ChoiceResult = WinnerResult | TeamsResult | OrderResult;
