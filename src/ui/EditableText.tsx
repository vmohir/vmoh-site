import styles from "./EditableText.module.css";
import { useState, useEffect, useRef } from "preact/hooks";
import { focusNextInput } from "../utils/focusNextInput.ts";

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  type?: "text" | "number";
  inputMode?: string;
  autoFocus?: boolean;
  validate?: (value: string) => boolean;
  className?: string;
  // When true, render with a visible field look (subtle bg, rounded) so it's
  // obviously editable — used while a row is expanded.
  field?: boolean;
}

export default function EditableText({
  value,
  onSave,
  type = "text",
  inputMode,
  autoFocus = true,
  validate,
  className,
  field = false,
}: EditableTextProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();

    if (validate && !validate(editValue)) {
      setEditValue(value);
      return;
    }

    if (trimmedValue && trimmedValue !== value) {
      onSave(trimmedValue);
    } else {
      setEditValue(value);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
      if (!focusNextInput(inputRef.current!)) {
        inputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      handleCancel();
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type={type}
      inputMode={inputMode}
      value={editValue}
      onInput={(e) => setEditValue((e.target as HTMLInputElement).value)}
      onBlur={handleSave}
      onKeyDown={handleKeyPress}
      enterKeyHint="next"
      class={`${className ?? ""} ${styles.editableText} ${field ? styles.field : ""}`}
    />
  );
}
