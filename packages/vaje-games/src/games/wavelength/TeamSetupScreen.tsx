import { Minus, Plus } from "lucide-preact";
import {
  renameTeam,
  setTargetScore,
  targetScore,
  teamNames,
} from "../../state/wavelengthState";
import styles from "./TeamSetupScreen.module.css";

interface Props {
  onStart: () => void;
}

export default function TeamSetupScreen({ onStart }: Props) {
  const canStart = teamNames.value.every((name) => name.trim().length > 0);

  return (
    <div class="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
      <div>
        <h1 class="text-2xl font-bold">طیف</h1>
        <p class="text-sm text-secondary">
          دو تیم به نوبت سرنخ می‌دن. هر دور یه تیم گردونه رو می‌چرخونه و با یه
          سرنخ کمک می‌کنه تیم مقابل نقطهٔ دقیق روی طیف رو حدس بزنه.
        </p>
      </div>

      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-medium text-secondary">تیم‌ها</h2>
        <input
          class="btn"
          value={teamNames.value[0]}
          placeholder="تیم ۱"
          onInput={(e) => renameTeam(0, e.currentTarget.value)}
        />
        <input
          class="btn"
          value={teamNames.value[1]}
          placeholder="تیم ۲"
          onInput={(e) => renameTeam(1, e.currentTarget.value)}
        />
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-medium text-secondary">تنظیمات</h2>
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
        شروع بازی
      </button>
      {!canStart && (
        <p class="text-center text-sm text-muted">
          هر دو تیم باید نام داشته باشن.
        </p>
      )}
    </div>
  );
}
