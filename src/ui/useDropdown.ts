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
  wrapRef: { current: HTMLDivElement | null };
  // Trigger button. Only required when alignByViewport is on.
  triggerRef: { current: T | null };
  // Ref for the popover/menu element for keyboard navigation.
  menuRef: { current: HTMLDivElement | null };
  // True when the dropdown should anchor to the trigger's right edge.
  alignEnd: boolean;
}

// Custom event to close other dropdowns when one opens.
const DROPDOWN_OPEN_EVENT = "dropdown:open";
let dropdownCounter = 0;

// Selector for focusable menu items within a menu.
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Hook for any popover/dropdown built around an outer wrapper + a trigger
// button. Handles open state, click-outside, Escape, arrow-key navigation,
// and (optionally) viewport-aware alignment. Only one dropdown can be open
// at a time.
export function useDropdown<T extends HTMLElement = HTMLButtonElement>(
  options: UseDropdownOptions = {},
): UseDropdownReturn<T> {
  const [open, setOpen] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<T>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Stable ID for this dropdown instance.
  const idRef = useRef<number | null>(null);
  if (idRef.current === null) {
    idRef.current = ++dropdownCounter;
  }
  const dropdownId = idRef.current;

  // Close other dropdowns when this one opens.
  useEffect(() => {
    if (!open) return;
    // Notify other dropdowns to close.
    document.dispatchEvent(
      new CustomEvent(DROPDOWN_OPEN_EVENT, { detail: dropdownId }),
    );
  }, [open, dropdownId]);

  // Listen for other dropdowns opening and close this one.
  useEffect(() => {
    const handleOtherOpen = (e: Event) => {
      const event = e as CustomEvent<number>;
      if (event.detail !== dropdownId) {
        setOpen(false);
      }
    };
    document.addEventListener(DROPDOWN_OPEN_EVENT, handleOtherOpen);
    return () => {
      document.removeEventListener(DROPDOWN_OPEN_EVENT, handleOtherOpen);
    };
  }, [dropdownId]);

  // Click-outside, Escape, and arrow-key navigation.
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      // Arrow-key navigation within the menu.
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const menu = menuRef.current;
        if (!menu) return;
        const items = Array.from(
          menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        );
        if (items.length === 0) return;
        e.preventDefault();
        const currentIndex = items.findIndex(
          (item) => item === document.activeElement,
        );
        let nextIndex: number;
        if (e.key === "ArrowDown") {
          nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
        } else {
          nextIndex =
            currentIndex < 0
              ? items.length - 1
              : (currentIndex - 1 + items.length) % items.length;
        }
        items[nextIndex]?.focus();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Focus first menu item when opening.
  useEffect(() => {
    if (!open) return;
    // Use requestAnimationFrame to ensure the menu is rendered.
    const raf = requestAnimationFrame(() => {
      const menu = menuRef.current;
      if (!menu) return;
      const firstItem = menu.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstItem?.focus();
    });
    return () => cancelAnimationFrame(raf);
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
    menuRef,
    alignEnd,
  };
}
