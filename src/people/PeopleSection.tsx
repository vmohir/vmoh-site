import { people, addPerson, removePerson } from "state/billState.ts";
import PersonItem from "./PersonItem.tsx";
import { getRandomPersonName } from "utils/person.utils.ts";
import { PersonItemAdder } from "./PersonItemAdder.tsx";
import styles from "./PeopleSection.module.css";

export default function PeopleSection() {
  const handleAddRandom = () => {
    addPerson(getRandomPersonName());
  };

  return (
    <div class={styles.peopleSection}>
      <h2>People</h2>

      {/* People list */}
      <div class="flex flex-col gap-2">
        {people.value.map((person, i) => (
          <PersonItem
            key={person.id}
            person={person}
            onRemove={people.value.length <= 1 ? undefined : removePerson}
          />
        ))}

        <PersonItemAdder onAdd={handleAddRandom} />
      </div>

      {people.value.length === 0 && (
        <p class="text-sm text-muted italic">No people added yet</p>
      )}
    </div>
  );
}
