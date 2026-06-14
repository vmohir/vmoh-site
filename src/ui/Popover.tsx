import type { ComponentChildren } from "preact";
import styles from "./Popover.module.css";

interface PopoverProps {
  align?: "start" | "end";
  role?: "menu" | "listbox";
  class?: string;
  // "visible" lets the surface overflow its box (e.g. for a nested dropdown);
  // default "auto" keeps a scrollable, clipped surface for long lists.
  overflow?: "auto" | "visible";
  // Ref from useDropdown for keyboard navigation.
  menuRef?: { current: HTMLDivElement | null };
  children: ComponentChildren;
}

// Floating menu surface anchored to the parent dropdown wrapper.
// Pair with useDropdown — render only when `open` is true.
export function Popover({
  align = "end",
  role = "menu",
  class: extra,
  overflow = "auto",
  menuRef,
  children,
}: PopoverProps) {
  return (
    <div
      ref={menuRef}
      class={`${styles.popover} ${align === "end" ? styles.alignEnd : styles.alignStart} ${overflow === "visible" ? styles.overflowVisible : ""} ${extra ?? ""}`}
      role={role}
    >
      {children}
    </div>
  );
}
