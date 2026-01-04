import styles from "./EditableText.module.css";
import { useState, useEffect, useRef } from "preact/hooks";

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  type?: "text" | "number";
  inputMode?: string;
  autoFocus?: boolean;
  validate?: (value: string) => boolean;
  className?: string;
}

export default function EditableText({
  value,
  onSave,
  type = "text",
  inputMode,
  autoFocus = true,
  validate,
  className,
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
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
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
      class={`${className} ${styles.editableText}`}
    />
  );
}
