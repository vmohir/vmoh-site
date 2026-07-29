export interface Player {
  id: string;
  name: string;
}

export type Phase = "setup" | "handoff" | "reveal" | "discuss" | "result";
