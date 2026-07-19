import { dismissToast, toast } from "../state/toast.ts";
import styles from "./Toast.module.css";

// Material-style snackbar pinned to the bottom of the viewport. Reads the
// global `toast` signal; render once near the app root.
export function Toast() {
  const current = toast.value;
  if (!current) return null;

  return (
    <div class={styles.toast} role="status" aria-live="polite">
      <span class={styles.message}>{current.message}</span>
      {current.actionLabel && (
        <button
          type="button"
          class={styles.action}
          onClick={() => {
            current.onAction?.();
            dismissToast();
          }}
        >
          {current.actionLabel}
        </button>
      )}
    </div>
  );
}
