import { Minus, Plus, X } from "lucide-preact";
import {
  MAX_TEAMS,
  MIN_TEAMS,
  addTeam,
  removeTeam,
  renameTeam,
  roundSeconds,
  selectedDifficulties,
  setRoundSeconds,
  setTargetScore,
  targetScore,
  teamNames,
  toggleDifficulty,
} from "../../state/pantomimeState";
import { DIFFICULTIES } from "./words";
import styles from "./TeamSetupScreen.module.css";

interface Props {
  wordsReady: boolean;
  onStart: () => void;
}

export default function TeamSetupScreen({ wordsReady, onStart }: Props) {
  const validTeamCount = teamNames.value.filter((n) => n.trim()).length;
  const canStart =
    wordsReady &&
    validTeamCount >= MIN_TEAMS &&
    selectedDifficulties.value.length > 0;

  return (
    <div class="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
      <h1 class="text-2xl font-bold">پانتومیم</h1>

      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-medium text-secondary">تیم‌ها</h2>
        {teamNames.value.map((name, index) => (
          <div key={index} class={styles.teamRow}>
            <input
              class={`${styles.teamInput} btn`}
              value={name}
              placeholder={`تیم ${index + 1}`}
              onInput={(e) => renameTeam(index, e.currentTarget.value)}
            />
            {teamNames.value.length > MIN_TEAMS && (
              <button
                type="button"
                class="btn btn-ghost btn-icon"
                aria-label="حذف تیم"
                onClick={() => removeTeam(index)}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        {teamNames.value.length < MAX_TEAMS && (
          <button
            type="button"
            class="btn flex items-center justify-center gap-1"
            onClick={addTeam}
          >
            <Plus size={16} />
            افزودن تیم
          </button>
        )}
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-medium text-secondary">سطح دشواری</h2>
        <div class={styles.chipWrap}>
          {DIFFICULTIES.map((difficulty) => {
            const active = selectedDifficulties.value.includes(difficulty.id);
            return (
              <button
                key={difficulty.id}
                type="button"
                class={active ? `btn ${styles.chipActive}` : "btn"}
                onClick={() => toggleDifficulty(difficulty.id)}
              >
                {difficulty.label} ({difficulty.points} امتیاز)
              </button>
            );
          })}
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-medium text-secondary">تنظیمات</h2>
        <div class={styles.stepper}>
          <span>زمان هر دور (ثانیه)</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-icon"
              aria-label="کم کردن زمان"
              onClick={() => setRoundSeconds(roundSeconds.value - 10)}
            >
              <Minus size={16} />
            </button>
            <span class={styles.stepperValue}>{roundSeconds.value}</span>
            <button
              type="button"
              class="btn btn-icon"
              aria-label="زیاد کردن زمان"
              onClick={() => setRoundSeconds(roundSeconds.value + 10)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div class={styles.stepper}>
          <span>امتیاز برای پیروزی</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-icon"
              aria-label="کم کردن امتیاز"
              onClick={() => setTargetScore(targetScore.value - 5)}
            >
              <Minus size={16} />
            </button>
            <span class={styles.stepperValue}>{targetScore.value}</span>
            <button
              type="button"
              class="btn btn-icon"
              aria-label="زیاد کردن امتیاز"
              onClick={() => setTargetScore(targetScore.value + 5)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </section>

      <button
        type="button"
        class="btn btn-primary mt-auto !py-4 text-lg"
        disabled={!canStart}
        onClick={onStart}
      >
        {wordsReady ? "شروع بازی" : "در حال بارگذاری کلمات…"}
      </button>
      {wordsReady && !canStart && (
        <p class="text-center text-sm text-muted">
          حداقل ۲ تیم با نام و یک سطح دشواری لازم است.
        </p>
      )}
    </div>
  );
}
