import { people, addPerson, removePerson } from "state/billState";
import PersonItem from "./PersonItem";
import { getRandomPersonName } from "utils/person.utils.ts";

export default function PeopleSection() {
  const handleAddRandom = () => {
    addPerson(getRandomPersonName());
  };

  return (
    <div class="flex flex-col gap-4">
      {/* Title row with add button */}
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-xl font-semibold">People</h2>
        <button
          onClick={handleAddRandom}
          class="px-3 py-1.5 text-sm font-medium hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-300 rounded-md hover:border-neutral-400 transition-colors"
        >
          Add
        </button>
      </div>

      {/* People list */}
      <div class="flex flex-col gap-2">
        {people.value.map((person) => (
          <PersonItem key={person.id} person={person} onRemove={removePerson} />
        ))}
      </div>

      {people.value.length === 0 && (
        <p class="text-sm text-neutral-500 italic">No people added yet</p>
      )}
    </div>
  );
}
