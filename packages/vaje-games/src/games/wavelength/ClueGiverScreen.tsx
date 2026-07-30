import { useState } from "preact/hooks";
import { Eye } from "lucide-preact";
import DialWheel from "./DialWheel";
import styles from "./ClueGiverScreen.module.css";

const SPIN_DURATION_MS = 900;

interface Props {
  teamName: string;
  leftLabel: string;
  rightLabel: string;
  target: number;
  onProceed: () => void;
  onExit: () => void;
}

export default function ClueGiverScreen({
  teamName,
  leftLabel,
  rightLabel,
  target,
  onProceed,
  onExit,
}: Props) {
  const [spinning, setSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [peeking, setPeeking] = useState(false);

  function spin() {
    setSpinning(true);
    window.setTimeout(() => {
      setSpinning(false);
      setHasSpun(true);
    }, SPIN_DURATION_MS);
  }

  return (
    <div class={styles.screen}>
      <button
        type="button"
        class="btn btn-ghost absolute top-4 left-4"
        onClick={onExit}
      >
        پایان بازی
      </button>
      <p class="text-secondary">نوبت تیم</p>
      <h1 class="text-2xl font-bold text-accent">{teamName}</h1>
      <p class="text-secondary">
        فقط شما گردونه رو نگاه می‌کنید، بقیه نگاه نکنن.
      </p>

      <div class={styles.dialArea}>
        <DialWheel
          leftLabel={leftLabel}
          rightLabel={rightLabel}
          target={target}
          showTarget={peeking}
        />
        {spinning && <div class={styles.spinner} />}
      </div>

      <div class={styles.actions}>
        {!hasSpun && (
          <button
            type="button"
            class="btn btn-primary !py-4 text-lg"
            disabled={spinning}
            onClick={spin}
          >
            {spinning ? "در حال چرخیدن..." : "چرخوندن گردونه"}
          </button>
        )}
        {hasSpun && (
          <button
            type="button"
            class="btn flex items-center justify-center gap-2 !py-4 text-lg"
            onPointerDown={() => setPeeking(true)}
            onPointerUp={() => setPeeking(false)}
            onPointerLeave={() => setPeeking(false)}
            onPointerCancel={() => setPeeking(false)}
          >
            <Eye size={18} />
            نگه‌دار تا ببینی
          </button>
        )}
        {hasSpun && (
          <button
            type="button"
            class="btn btn-primary !py-4 text-lg"
            onClick={onProceed}
          >
            سرنخ رو گفتم، حدس بزنن
          </button>
        )}
      </div>
    </div>
  );
}
