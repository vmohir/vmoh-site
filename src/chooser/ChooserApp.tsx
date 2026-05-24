import { useEffect, useRef, useState } from "preact/hooks";
import { Settings as SettingsIcon } from "lucide-preact";
import {
  mode,
  teamCount,
  holdSeconds,
  settingsOpen,
} from "../state/chooserState";
import { FINGER_COLORS, colorForIndex } from "./colors";
import { pickResult } from "./selection";
import type { ChoiceResult, Finger } from "./types";
import SettingsDrawer from "./SettingsDrawer";
import styles from "./ChooserApp.module.css";

type Phase = "idle" | "countdown" | "result";

const RING_RADIUS = 56;

export default function ChooserApp() {
  // Fingers are stored in a ref and we force a render via `tick`, because
  // pointermove fires at frame-rate and re-allocating a new Map per event
  // would thrash GC.
  const fingersRef = useRef<Map<number, Finger>>(new Map());
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => (t + 1) % 1_000_000);

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ChoiceResult | null>(null);
  const [countdownProgress, setCountdownProgress] = useState(0);

  const countdownStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Subscribe to settings signals
  const currentMode = mode.value;
  const currentTeamCount = teamCount.value;
  const currentHold = holdSeconds.value;
  const isSettingsOpen = settingsOpen.value;

  // RAF loop drives the countdown ring + triggers the pick
  useEffect(() => {
    if (phase !== "countdown") return;
    let cancelled = false;

    const loop = (now: number) => {
      if (cancelled) return;
      const start = countdownStartRef.current;
      if (start == null) return;
      const elapsed = (now - start) / 1000;
      const progress = Math.min(1, elapsed / currentHold);
      setCountdownProgress(progress);
      if (progress >= 1) {
        const fingers = Array.from(fingersRef.current.values());
        const r = pickResult(currentMode, fingers, currentTeamCount);
        if (r) {
          setResult(r);
          setPhase("result");
        } else {
          countdownStartRef.current = null;
          setPhase("idle");
          setCountdownProgress(0);
        }
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, currentMode, currentTeamCount, currentHold]);

  // If settings change while in countdown, restart the countdown so the
  // new mode/teams setting takes effect on the next pick.
  useEffect(() => {
    if (phase === "countdown" && fingersRef.current.size >= 2) {
      countdownStartRef.current = performance.now();
      setCountdownProgress(0);
    }
  }, [currentMode, currentTeamCount, currentHold]);

  function resetToIdle() {
    setResult(null);
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

  function nextColor(): string {
    const existing = new Set(
      Array.from(fingersRef.current.values()).map((f) => f.color),
    );
    for (let i = 0; i < FINGER_COLORS.length; i++) {
      const c = colorForIndex(i);
      if (!existing.has(c)) return c;
    }
    return colorForIndex(fingersRef.current.size);
  }

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* setPointerCapture can throw for synthetic / inactive pointers — safe to ignore */
    }

    // If a result is showing, fresh touches start a new round
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

    if (fingersRef.current.size >= 2) {
      countdownStartRef.current = performance.now();
      setCountdownProgress(0);
      setPhase("countdown");
    } else {
      setPhase("idle");
    }
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
    fingersRef.current.delete(e.pointerId);

    if (phase === "result") {
      rerender();
      return;
    }

    if (fingersRef.current.size >= 2) {
      countdownStartRef.current = performance.now();
      setCountdownProgress(0);
      setPhase("countdown");
    } else {
      countdownStartRef.current = null;
      setCountdownProgress(0);
      setPhase("idle");
    }
    rerender();
  }

  const liveFingers = Array.from(fingersRef.current.values());

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
          <h1 class={styles.hintTitle}>Place 2+ fingers</h1>
          <p class={styles.hintSub}>
            {currentMode === "winner" && "One will be picked."}
            {currentMode === "teams" &&
              `Will split into ${currentTeamCount} teams.`}
            {currentMode === "order" && "An order will be assigned."}
          </p>
        </div>
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

      <button
        type="button"
        class={`${styles.settingsBtn} btn btn-ghost btn-icon`}
        aria-label="Settings"
        onClick={() => (settingsOpen.value = true)}
      >
        <SettingsIcon size={20} />
      </button>

      {phase === "result" && (
        <button
          type="button"
          class={`${styles.resetBtn} btn btn-primary`}
          onClick={resetToIdle}
        >
          Tap to play again
        </button>
      )}

      {isSettingsOpen && (
        <SettingsDrawer onClose={() => (settingsOpen.value = false)} />
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

  const pulse =
    phase === "countdown"
      ? 1 + 0.06 * Math.sin(progress * Math.PI * 8) + progress * 0.1
      : 1;

  const ringStyle: Record<string, string> = {
    left: `${finger.x - radius}px`,
    top: `${finger.y - radius}px`,
    width: `${size}px`,
    height: `${size}px`,
    "--ring-color": color,
    transform: `scale(${pulse})`,
  };

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
