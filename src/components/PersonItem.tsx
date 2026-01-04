import type { Person } from '../types/models';

interface PersonItemProps {
  person: Person;
  onRemove: (id: string) => void;
}

export default function PersonItem({ person, onRemove }: PersonItemProps) {
  return (
    <div class="person-item">
      <span>{person.name}</span>
      <button onClick={() => onRemove(person.id)}>Remove</button>

      <style>{`
        .person-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          gap: 1rem;
        }

        .person-item span {
          flex: 1;
        }

        .person-item button {
          padding: 0.25rem 0.5rem;
        }
      `}</style>
    </div>
  );
}
