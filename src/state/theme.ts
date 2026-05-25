import { effect, signal } from "@preact/signals";

export type Theme = "light" | "dark";

const STORAGE_KEY = "split-bill-theme";

function getInitial(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const theme = signal<Theme>(getInitial());

if (typeof window !== "undefined") {
  effect(() => {
    document.documentElement.setAttribute("data-theme", theme.value);
    try {
      localStorage.setItem(STORAGE_KEY, theme.value);
    } catch {
      // ignore
    }
  });
}

export function toggleTheme(): void {
  theme.value = theme.value === "dark" ? "light" : "dark";
}
