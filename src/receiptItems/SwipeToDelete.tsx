import type { ComponentChildren } from "preact";
import { useRef, useState } from "preact/hooks";
import { Trash2 } from "lucide-preact";
import styles from "./SwipeToDelete.module.css";

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: ComponentChildren;
}

const TAP_SLOP = 8; // px before a gesture is classified
const DELETE_THRESHOLD = 96; // px of leftward travel that commits the delete

// Touch swipe-left-to-delete wrapper. Vertical scrolling is preserved via
// `touch-action: pan-y`; only once a gesture is clearly horizontal do we take
// over and translate the surface. Mouse input is ignored (desktop uses cards).
export function SwipeToDelete({ onDelete, children }: SwipeToDeleteProps) {
  const [dx, setDx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<null | "h" | "v">(null);
  const dragging = useRef(false);

  const reset = () => {
    dragging.current = false;
    axis.current = null;
    setDx(0);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = true;
    axis.current = null;
    setAnimating(false);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging.current) return;
    const moveX = e.clientX - startX.current;
    const moveY = e.clientY - startY.current;
    if (axis.current === null) {
      if (Math.abs(moveX) < TAP_SLOP && Math.abs(moveY) < TAP_SLOP) return;
      axis.current = Math.abs(moveX) > Math.abs(moveY) ? "h" : "v";
      if (axis.current === "h") {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      }
    }
    if (axis.current === "h") setDx(Math.min(0, moveX));
  };

  const onPointerEnd = () => {
    if (!dragging.current) return;
    const committed = axis.current === "h" && -dx > DELETE_THRESHOLD;
    dragging.current = false;
    axis.current = null;
    setAnimating(true);
    if (committed) {
      setDx(-window.innerWidth);
      setTimeout(onDelete, 180);
    } else {
      setDx(0);
    }
  };

  return (
    <div class={styles.wrap}>
      <div class={styles.deleteHint} aria-hidden="true">
        <Trash2 size={18} />
      </div>
      <div
        class={styles.surface}
        style={{
          transform: `translateX(${dx}px)`,
          transition: animating ? "transform 180ms ease" : "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={reset}
      >
        {children}
      </div>
    </div>
  );
}
