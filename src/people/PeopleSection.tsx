import {
  people,
  addPerson,
  removePerson,
  calculatedLedgers,
  groups,
  groupByPersonId,
} from "state/billState.ts";
import PersonRow from "./PersonRow.tsx";
import GroupCard from "./GroupCard.tsx";
import GroupAdder from "./GroupAdder.tsx";
import { getRandomPersonName } from "utils/person.utils.ts";
import { PersonItemAdder } from "./PersonItemAdder.tsx";
import styles from "./PeopleSection.module.css";

export default function PeopleSection() {
  const handleAddRandom = () => {
    addPerson(getRandomPersonName());
  };

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
    </div>
  );
}
