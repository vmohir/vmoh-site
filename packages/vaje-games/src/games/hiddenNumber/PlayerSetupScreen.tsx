import { Plus, X } from "lucide-preact";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  addPlayer,
  playerNames,
  removePlayer,
  renamePlayer,
} from "../../state/hiddenNumberState";
import styles from "./PlayerSetupScreen.module.css";

interface Props {
  onStart: () => void;
}

export default function PlayerSetupScreen({ onStart }: Props) {
  const validPlayerCount = playerNames.value.filter((n) => n.trim()).length;
  const canStart = validPlayerCount >= MIN_PLAYERS;

  return (
    <div class="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
      <div>
        <h1 class="text-2xl font-bold">عدد مخفی</h1>
        <p class="text-sm text-secondary">
          هر دور یه نفر یه عدد بین ۱ تا ۱۰۰ رو نمی‌دونه؛ بقیه اون عدد رو می‌بینن
          و با بحث دربارهٔ یه سوال، بدون گفتن عدد، کمکش می‌کنن حدس بزنه.
        </p>
      </div>

      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-medium text-secondary">بازیکن‌ها</h2>
        {playerNames.value.map((name, index) => (
          <div key={index} class={styles.playerRow}>
            <input
              class={`${styles.playerInput} btn`}
              value={name}
              placeholder={`نفر ${index + 1}`}
              onInput={(e) => renamePlayer(index, e.currentTarget.value)}
            />
            {playerNames.value.length > MIN_PLAYERS && (
              <button
                type="button"
                class="btn btn-ghost btn-icon"
                aria-label="حذف بازیکن"
                onClick={() => removePlayer(index)}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        {playerNames.value.length < MAX_PLAYERS && (
          <button
            type="button"
            class="btn flex items-center justify-center gap-1"
            onClick={addPlayer}
          >
            <Plus size={16} />
            افزودن بازیکن
          </button>
        )}
      </section>

      <button
        type="button"
        class="btn btn-primary mt-auto !py-4 text-lg"
        disabled={!canStart}
        onClick={onStart}
      >
        شروع بازی
      </button>
      {!canStart && (
        <p class="text-center text-sm text-muted">
          حداقل {MIN_PLAYERS} بازیکن با نام لازم است.
        </p>
      )}
    </div>
  );
}
