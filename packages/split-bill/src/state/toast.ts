import { signal } from "@preact/signals";

export interface ToastState {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const toast = signal<ToastState | null>(null);

let counter = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

interface ShowToastOptions {
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

// Show a transient snackbar. Replaces any current toast and auto-dismisses
// after `duration` (default 5s) unless replaced first.
export function showToast(
  message: string,
  options: ShowToastOptions = {},
): void {
  if (timer) clearTimeout(timer);
  const id = ++counter;
  toast.value = {
    id,
    message,
    actionLabel: options.actionLabel,
    onAction: options.onAction,
  };
  timer = setTimeout(() => {
    if (toast.value?.id === id) toast.value = null;
  }, options.duration ?? 5000);
}

export function dismissToast(): void {
  if (timer) clearTimeout(timer);
  timer = undefined;
  toast.value = null;
}
