import { signal, effect } from "@preact/signals";

// The wordmark in the header — editable in place. Persisted so the user's
// pick survives reloads; cleared from storage when reset to the default
// to keep localStorage tidy.
const STORAGE_KEY = "split-bill-app-title";
const DEFAULT_TITLE = "Split";

function loadTitle(): string {
  if (typeof window === "undefined") return DEFAULT_TITLE;
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_TITLE;
  } catch {
    return DEFAULT_TITLE;
  }
}

export const appTitle = signal<string>(loadTitle());

if (typeof window !== "undefined") {
  effect(() => {
    try {
      if (appTitle.value === DEFAULT_TITLE) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, appTitle.value);
      }
    } catch {
      // Ignore storage failures (private mode, quota, etc.).
    }
  });
}
