import type { JSX, Ref } from "preact";
import styles from "./Select.module.css";

interface SelectProps extends JSX.HTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "ghost";
  selectRef?: Ref<HTMLSelectElement>;
}

// Native <select> with the project's shared field styling.
// variant="ghost" removes the background fill (used in header).
export function Select({
  variant = "default",
  selectRef,
  class: extra,
  children,
  ...props
}: SelectProps) {
  const variantClass = variant === "ghost" ? styles.ghost : styles.default;
  return (
    <select
      ref={selectRef}
      class={`${styles.select} ${variantClass} ${extra ?? ""}`}
      {...props}
    >
      {children}
    </select>
  );
}
