import type { ComponentChildren, JSX, Ref } from "preact";
import styles from "./Input.module.css";

interface InputProps extends Omit<
  JSX.HTMLAttributes<HTMLInputElement>,
  "prefix"
> {
  prefix?: ComponentChildren;
  inputRef?: Ref<HTMLInputElement>;
}

// Text input with the project's shared field styling. Optional `prefix`
// renders inside the field (e.g. a currency symbol).
export function Input({
  prefix,
  inputRef,
  class: extra,
  ...inputProps
}: InputProps) {
  if (prefix != null) {
    return (
      <label class={`${styles.field} ${extra ?? ""}`}>
        <span class={styles.prefix} aria-hidden="true">
          {prefix}
        </span>
        <input ref={inputRef} class={styles.fieldInput} {...inputProps} />
      </label>
    );
  }
  return (
    <input
      ref={inputRef}
      class={`${styles.input} ${extra ?? ""}`}
      {...inputProps}
    />
  );
}
