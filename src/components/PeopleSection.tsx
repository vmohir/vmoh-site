import { useState } from "preact/hooks";
import { people, addPerson, removePerson } from "../state/billState";
import PersonItem from "./PersonItem";
import styles from "./PeopleSection.module.css";
import { getRandomPersonName } from "../utils/person.utils.ts";

export default function PeopleSection() {
  const [nameInput, setNameInput] = useState("");

  const handleAdd = () => {
    if (nameInput.trim()) {
      addPerson(nameInput);
      setNameInput("");
    }
  };
  const handleAddRandom = () => {
    addPerson(getRandomPersonName());
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <>
      <div class="flex gap-2">
        <h2 class="h2">People</h2>
        <div>d</div>
      </div>

      <div class={styles.peopleSection}>
        <div class={styles.inputGroup}>
          <input
            type="text"
            value={nameInput}
            onInput={(e) => setNameInput((e.target as HTMLInputElement).value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter person name"
          />
          <button onClick={handleAdd}>Add person</button>
          <button onClick={handleAddRandom}>Add random person</button>
        </div>

        <div class={styles.peopleList}>
          {people.value.map((person) => (
            <PersonItem
              key={person.id}
              person={person}
              onRemove={removePerson}
            />
          ))}
        </div>

        {people.value.length === 0 && (
          <p class={styles.emptyMessage}>No people added yet</p>
        )}
      </div>
    </>
  );
}
