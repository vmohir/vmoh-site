import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

interface UseDropdownOptions {
  // When true, on every open the trigger position is measured and the menu's
  // preferred alignment (start vs. end) is set so it stays inside the viewport.
  // When false, alignEnd stays false (callers can hard-code their own alignment).
  alignByViewport?: boolean;
}

interface UseDropdownReturn<T extends HTMLElement> {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  close: () => void;
  // Outer wrapper that detects clicks-outside. Spread `ref={wrapRef}` on it.
  wrapRef: ReturnType<typeof useRef<HTMLDivElement>>;
  // Trigger button. Only required when alignByViewport is on.
  triggerRef: ReturnType<typeof useRef<T>>;
  // True when the dropdown should anchor to the trigger's right edge.
  alignEnd: boolean;
}

// Hook for any popover/dropdown built around an outer wrapper + a trigger
// button. Handles open state, click-outside, Escape, and (optionally)
// viewport-aware alignment.
export function useDropdown<T extends HTMLElement = HTMLButtonElement>(
  options: UseDropdownOptions = {},
): UseDropdownReturn<T> {
  const [open, setOpen] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !options.alignByViewport || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    // Pick whichever alignment leaves more horizontal room for the menu.
    // alignStart anchors the menu's left edge to the trigger's left → it
    // grows rightward; alignEnd anchors right edge to trigger's right →
    // it grows leftward.
    const spaceIfStart = vw - rect.left;
    const spaceIfEnd = rect.right;
    setAlignEnd(spaceIfEnd > spaceIfStart);
  }, [open, options.alignByViewport]);

  return {
    open,
    setOpen,
    toggle: () => setOpen((v) => !v),
    close: () => setOpen(false),
    wrapRef,
    triggerRef,
    alignEnd,
  };
}
