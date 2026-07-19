import { people } from "../state/billState.ts";
import { PersonAvatar } from "ui/PersonAvatar.tsx";
import { dragState } from "./dnd.ts";
import styles from "./DragGhost.module.css";

// Floating preview that follows the pointer during a drag. Rendered once
// at the top of PeopleSection; reads dragState directly so it re-renders on
// every pointermove without needing prop plumbing.
export default function DragGhost() {
  const ds = dragState.value;
  if (!ds || !ds.active) return null;
  const person = people.value.find((p) => p.id === ds.personId);
  if (!person) return null;

  // Pin the ghost so the user's finger stays where they grabbed.
  const style = {
    left: `${ds.x - ds.offsetX}px`,
    top: `${ds.y - ds.offsetY}px`,
    minWidth: `${ds.width}px`,
  };
  return (
    <div class={styles.ghost} style={style}>
      <PersonAvatar person={person} />
      <span>{person.name}</span>
    </div>
  );
}
