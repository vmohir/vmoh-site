import { useEffect, useRef, useState } from "preact/hooks";
import { Cog as SettingsIcon } from "lucide-preact";
import { mode, teamCount } from "../state/chooserState";
import { FINGER_COLORS } from "./colors";
import { pickResult } from "./selection";
import type { ChoiceResult, Finger } from "./types";
import SettingsDrawer from "./SettingsDrawer";
import styles from "./ChooserApp.module.css";

type Phase = "idle" | "countdown" | "result";

const RING_RADIUS = 56;
const HOLD_SECONDS = 3;
// 0 on non-touch devices (mouse-only desktop).
const MAX_TOUCH_POINTS =
  typeof navigator !== "undefined" && navigator.maxTouchPoints > 0
    ? navigator.maxTouchPoints
    : 0;

export default function ChooserApp() {
  // Fingers live in a ref so frame-rate pointermove doesn't re-allocate a Map
  // per event. A separate tick state drives re-renders.
  const fingersRef = useRef<Map<number, Finger>>(new Map());
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => (t + 1) % 1_000_000);

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ChoiceResult | null>(null);
  const [countdownProgress, setCountdownProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const countdownStartRef = useRef<number | null>(null);

  const currentMode = mode.value;
  const currentTeamCount = teamCount.value;

  function refreshPhase() {
    if (fingersRef.current.size >= 2) {
      countdownStartRef.current = performance.now();
      setCountdownProgress(0);
      setPhase("countdown");
    } else {
      countdownStartRef.current = null;
      setCountdownProgress(0);
      setPhase("idle");
    }
  }

  // RAF loop runs the countdown ring and triggers the pick.
  useEffect(() => {
    if (phase !== "countdown") return;
    let raf = 0;
    const loop = (now: number) => {
      const start = countdownStartRef.current;
      if (start == null) return;
      const progress = Math.min(1, (now - start) / 1000 / HOLD_SECONDS);
      setCountdownProgress(progress);
      if (progress >= 1) {
        const r = pickResult(
          currentMode,
          Array.from(fingersRef.current.values()),
          currentTeamCount,
        );
        if (r) {
          setResult(r);
          setPhase("result");
        } else {
          refreshPhase();
        }
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, currentMode, currentTeamCount]);

  // Restart the countdown if the mode/team setting changes mid-hold so the
  // user gets a full hold under the new settings.
  useEffect(() => {
    if (phase === "countdown") {
      countdownStartRef.current = performance.now();
      setCountdownProgress(0);
    }
  }, [currentMode, currentTeamCount]);

  function nextColor(): string {
    const used = new Set(
      Array.from(fingersRef.current.values()).map((f) => f.color),
    );
    return (
      FINGER_COLORS.find((c) => !used.has(c)) ??
      FINGER_COLORS[fingersRef.current.size % FINGER_COLORS.length] ??
      "#f5f5f7"
    );
  }

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* synthetic / inactive pointers — safe to ignore */
    }

    // A new touch after a result is showing starts a fresh round.
    if (phase === "result") {
      setResult(null);
      fingersRef.current.clear();
    }

    fingersRef.current.set(e.pointerId, {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      joinedAt: performance.now(),
      color: nextColor(),
    });
    refreshPhase();
    rerender();
  }

  function onPointerMove(e: PointerEvent) {
    const f = fingersRef.current.get(e.pointerId);
    if (!f) return;
    f.x = e.clientX;
    f.y = e.clientY;
    rerender();
  }

  function onPointerEnd(e: PointerEvent) {
    if (!fingersRef.current.has(e.pointerId)) return;

    // Keep rings frozen on screen once a result is showing.
    if (phase === "result") return;

    fingersRef.current.delete(e.pointerId);
    refreshPhase();
    rerender();
  }

  const liveFingers = Array.from(fingersRef.current.values());
  const winner =
    phase === "result" && result?.kind === "winner"
      ? liveFingers.find((f) => f.id === result.winnerId)
      : undefined;

  return (
    <div
      class={styles.surface}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerLeave={onPointerEnd}
    >
      {liveFingers.length === 0 && phase !== "result" && (
        <div class={styles.hint}>
          <h1 class={styles.hintTitle}>Tap with 2 or more fingers</h1>
          <p class={styles.hintSub}>
            {currentMode === "winner" && "One will be picked."}
            {currentMode === "teams" &&
              `Will split into ${currentTeamCount} teams.`}
            {currentMode === "order" && "An order will be assigned."}
          </p>
        </div>
      )}

      {winner && (
        <WinnerReveal x={winner.x} y={winner.y} color={winner.color} />
      )}

      {liveFingers.map((f) => (
        <Ring
          key={f.id}
          finger={f}
          phase={phase}
          result={result}
          progress={countdownProgress}
        />
      ))}

      {MAX_TOUCH_POINTS > 0 &&
        liveFingers.length >= MAX_TOUCH_POINTS &&
        phase !== "result" && (
          <div class={styles.touchLimit}>
            {MAX_TOUCH_POINTS} fingers is your device's max — pick in groups for
            bigger gatherings.
          </div>
        )}

      <button
        type="button"
        class={`${styles.settingsBtn} btn btn-ghost btn-icon`}
        aria-label="Settings"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setSettingsOpen(true)}
      >
        <SettingsIcon size={28} />
      </button>

      {phase === "result" && (
        <button
          type="button"
          class={`${styles.resetBtn} btn btn-primary`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            setResult(null);
            fingersRef.current.clear();
            refreshPhase();
            rerender();
          }}
        >
          Tap to play again
        </button>
      )}

      {settingsOpen && (
        <SettingsDrawer onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}

interface RingProps {
  finger: Finger;
  phase: Phase;
  result: ChoiceResult | null;
  progress: number;
}

function Ring({ finger, phase, result, progress }: RingProps) {
  let color = finger.color;
  let label: string | null = null;
  let isWinner = false;
  let isLoser = false;
  let scaleResult = 1;

  if (phase === "result" && result) {
    if (result.kind === "winner") {
      if (result.winnerId === finger.id) {
        isWinner = true;
        scaleResult = 1.6;
      } else {
        isLoser = true;
      }
    } else if (result.kind === "teams") {
      const t = result.teamByFinger[finger.id];
      if (t !== undefined) {
        color = result.teamColors[t] ?? color;
        label = `${t + 1}`;
      }
    } else {
      const n = result.orderByFinger[finger.id];
      if (n !== undefined) label = String(n);
    }
  }

  const radius = RING_RADIUS * scaleResult;
  const size = radius * 2;

  const ringStyle: Record<string, string> = {
    left: `${finger.x - radius}px`,
    top: `${finger.y - radius}px`,
    width: `${size}px`,
    height: `${size}px`,
    "--ring-color": color,
  };

  if (phase === "countdown") {
    const pulse = 1 + 0.06 * Math.sin(progress * Math.PI * 8) + progress * 0.1;
    ringStyle.transform = `scale(${pulse})`;
  }

  return (
    <div
      class={`${styles.ring} ${isLoser ? styles.ringFaded : ""} ${isWinner ? styles.ringWinner : ""}`}
      style={ringStyle}
    >
      <div class={styles.ringInner} />
      {label !== null && <span class={styles.ringLabel}>{label}</span>}
    </div>
  );
}

interface WinnerRevealProps {
  x: number;
  y: number;
  color: string;
}

function WinnerReveal({ x, y, color }: WinnerRevealProps) {
  return (
    <>
      <div
        class={styles.vignette}
        style={{
          background: `radial-gradient(circle at ${x}px ${y}px, transparent 80px, rgba(0,0,0,0.55) 240px, rgba(0,0,0,0.78) 100%)`,
        }}
      />
      <div
        class={styles.ripples}
        style={{ left: `${x}px`, top: `${y}px`, "--ring-color": color }}
      >
        <span class={styles.ripple} />
      </div>
    </>
  );
}
