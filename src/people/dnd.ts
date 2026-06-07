import { signal } from "@preact/signals";

// Pointer-based drag-and-drop for the People section. Pointer events (rather
// than HTML5 DnD) so it works on touch as well as desktop. Drop targets are
// found by hit-testing data-* markers in the DOM on every pointermove.

export type DropTarget =
  | { kind: "group"; groupId: string }
  | { kind: "row"; personId: string; position: "before" | "after" }
  | null;

export interface DragState {
  personId: string;
  pointerId: number;
  // Initial pointerdown position — fixed, used for the activation threshold.
  startX: number;
  startY: number;
  // Current pointer position in viewport coordinates.
  x: number;
  y: number;
  // Offset from the grip handle to the row's top-left, so the ghost can be
  // positioned with the user's finger anchored where they grabbed.
  offsetX: number;
  offsetY: number;
  // Row footprint, used to size the ghost identically.
  width: number;
  height: number;
  // The current resolved drop target, or null if hovering nothing droppable.
  target: DropTarget;
  // True once the pointer has moved past the activation threshold. We delay
  // visual feedback until then so a tap on the grip doesn't flash a ghost.
  active: boolean;
}

export const dragState = signal<DragState | null>(null);

// Pixels of pointer movement before a drag is considered active. Below this
// we treat the gesture as a click on the grip and emit no ghost / drop.
export const DRAG_ACTIVATION = 4;

const ROW_ATTR = "data-person-row";
const GROUP_ATTR = "data-group-id";

export function pickDropTarget(
  x: number,
  y: number,
  draggedId: string,
): DropTarget {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;

  // A row wins over its enclosing group card — dropping on a specific
  // member positions the dragged person relative to that member.
  const row = el.closest(`[${ROW_ATTR}]`) as HTMLElement | null;
  if (row) {
    const rowId = row.getAttribute(ROW_ATTR);
    if (!rowId || rowId === draggedId) return null;
    const rect = row.getBoundingClientRect();
    const position = y - rect.top < rect.height / 2 ? "before" : "after";
    return { kind: "row", personId: rowId, position };
  }

  // Group container — drop here to append to that group.
  const group = el.closest(`[${GROUP_ATTR}]`) as HTMLElement | null;
  if (group) {
    const groupId = group.getAttribute(GROUP_ATTR);
    if (!groupId) return null;
    return { kind: "group", groupId };
  }

  return null;
}
