export interface Player {
  id: string;
  name: string;
}

export type Phase = "setup" | "handoff" | "showNumber" | "discuss" | "result";
