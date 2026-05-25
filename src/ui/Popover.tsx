import type { ComponentChildren } from "preact";
import styles from "./Popover.module.css";

interface PopoverProps {
  align?: "start" | "end";
  role?: "menu" | "listbox";
  class?: string;
  children: ComponentChildren;
}

// Floating menu surface anchored to the parent dropdown wrapper.
// Pair with useDropdown — render only when `open` is true.
export function Popover({
  align = "end",
  role = "menu",
  class: extra,
  children,
}: PopoverProps) {
  return (
    <div
      class={`${styles.popover} ${align === "end" ? styles.alignEnd : styles.alignStart} ${extra ?? ""}`}
      role={role}
    >
      {children}
    </div>
  );
}
