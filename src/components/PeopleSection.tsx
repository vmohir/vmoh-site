import { useState } from 'preact/hooks';
import { people, addPerson, removePerson } from '../state/billState';
import PersonItem from './PersonItem';

export default function PeopleSection() {
  const [nameInput, setNameInput] = useState('');

  const handleAdd = () => {
    if (nameInput.trim()) {
      addPerson(nameInput);
      setNameInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div class="people-section-content">
      <div class="input-group">
        <input
          type="text"
          value={nameInput}
          onInput={(e) => setNameInput((e.target as HTMLInputElement).value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter person name"
        />
        <button onClick={handleAdd}>Add Person</button>
      </div>

      <div class="people-list">
        {people.value.map(person => (
          <PersonItem key={person.id} person={person} onRemove={removePerson} />
        ))}
      </div>

      {people.value.length === 0 && (
        <p class="empty-message">No people added yet</p>
      )}

      <style>{`
        .people-section-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-group {
          display: flex;
          gap: 0.5rem;
        }

        .input-group input {
          flex: 1;
          padding: 0.5rem;
        }

        .input-group button {
          padding: 0.5rem 1rem;
        }

        .people-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .empty-message {
          margin: 0;
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
