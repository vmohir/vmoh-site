import { useEffect } from "preact/hooks";
import {
  people,
  addPerson,
  removePerson,
  calculatedLedgers,
  groups,
  groupByPersonId,
  addMemberToGroup,
  movePersonRelative,
} from "state/billState.ts";
import PersonRow from "./PersonRow.tsx";
import GroupCard from "./GroupCard.tsx";
import GroupAdder from "./GroupAdder.tsx";
import { getRandomPersonName } from "utils/person.utils.ts";
import { PersonItemAdder } from "./PersonItemAdder.tsx";
import {
  DRAG_ACTIVATION,
  dragState,
  pickDropTarget,
  type DropTarget,
} from "./dnd.ts";
import DragGhost from "./DragGhost.tsx";
import styles from "./PeopleSection.module.css";

function applyDrop(personId: string, target: DropTarget): void {
  if (!target) return;
  if (target.kind === "group") {
    addMemberToGroup(target.groupId, personId);
    return;
  }
  movePersonRelative(personId, target.personId, target.position);
}

export default function PeopleSection() {
  const handleAddRandom = () => {
    addPerson(getRandomPersonName());
  };

  // Global pointer tracking while a drag is in progress. Pointer events bubble
  // up from the captured grip element, but we listen on window so we get
  // consistent coordinates wherever the cursor wanders. The cleanup runs on
  // unmount; the listeners themselves no-op when dragState is null.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const ds = dragState.value;
      if (!ds || ds.pointerId !== e.pointerId) return;
      // Activate the drag once the pointer has moved past the threshold —
      // before that, a small wobble on tap should be treated as a click.
      const active =
        ds.active ||
        Math.hypot(e.clientX - ds.startX, e.clientY - ds.startY) >=
          DRAG_ACTIVATION;
      const target = active
        ? pickDropTarget(e.clientX, e.clientY, ds.personId)
        : null;
      dragState.value = {
        ...ds,
        x: e.clientX,
        y: e.clientY,
        active,
        target,
      };
    };
    const onEnd = (e: PointerEvent) => {
      const ds = dragState.value;
      if (!ds || ds.pointerId !== e.pointerId) return;
      if (ds.active && ds.target) {
        applyDrop(ds.personId, ds.target);
      }
      dragState.value = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, []);

  const ledgers = calculatedLedgers.value;
  const peopleList = people.value;
  const personLookup = new Map(peopleList.map((p) => [p.id, p]));
  const inGroup = groupByPersonId.value;
  const ungrouped = peopleList.filter((p) => !inGroup.has(p.id));
  const removable = peopleList.length > 1 ? removePerson : undefined;

  return (
    <div class={styles.peopleSection}>
      <h2>People</h2>

      <div class="flex flex-col gap-2">
        {groups.value.map((group) => (
          <GroupCard key={group.id} group={group} ledgers={ledgers}>
            {group.memberIds
              .map((id) => personLookup.get(id))
              .filter((p): p is NonNullable<typeof p> => !!p)
              .map((person) => (
                <PersonRow
                  key={person.id}
                  person={person}
                  ledgers={ledgers}
                  onRemove={removable}
                />
              ))}
          </GroupCard>
        ))}

        {ungrouped.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            ledgers={ledgers}
            onRemove={removable}
          />
        ))}

        <div class={styles.adders}>
          <PersonItemAdder onAdd={handleAddRandom} />
          <GroupAdder ungrouped={ungrouped} />
        </div>
      </div>

      {peopleList.length === 0 && (
        <p class="text-sm text-muted italic">No people added yet</p>
      )}

      <DragGhost />
    </div>
  );
}
