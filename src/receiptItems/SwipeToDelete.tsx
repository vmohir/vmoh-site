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
    if (committed) {
      setAnimating(true);
      setDx(-window.innerWidth);
      setTimeout(onDelete, 180);
    } else if (dx !== 0) {
      // A real horizontal swipe that didn't reach the threshold — animate back.
      setAnimating(true);
      setDx(0);
    }
    // Otherwise it was a tap or a vertical scroll: leave dx at 0 and animating
    // false so the surface keeps transform:none. Engaging the transform here
    // would turn the surface into a stacking context and trap an open dropdown
    // beneath the following row, so taps on its options would miss.
  };

  // Only transform/clip while a swipe is in progress or animating. At rest we
  // use transform:none and overflow:visible so an open dropdown inside the row
  // isn't clipped or trapped under later rows by a transform stacking context.
  const active = animating || dx !== 0;

  return (
    <div
      class={styles.wrap}
      style={{ overflow: active ? "hidden" : "visible" }}
    >
      <div class={styles.deleteHint} aria-hidden="true">
        <Trash2 size={18} />
      </div>
      <div
        class={styles.surface}
        style={{
          transform: active ? `translateX(${dx}px)` : "none",
          transition: animating ? "transform 180ms ease" : "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={reset}
        onTransitionEnd={() => setAnimating(false)}
      >
        {children}
      </div>
    </div>
  );
}
