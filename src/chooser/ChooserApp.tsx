import { useEffect, useRef, useState } from "preact/hooks";
import { Cog as SettingsIcon } from "lucide-preact";
import { mode, teamCount } from "../state/chooserState";
import { FINGER_COLORS } from "./colors";
import { pickResult } from "./selection";
import type { ChoiceResult, Finger } from "./types";
import SettingsDrawer from "./SettingsDrawer";
import styles from "./ChooserApp.module.css";

type Phase = "idle" | "countdown" | "result";
type InputMode = "touch" | "tap";

const RING_RADIUS = 56;
const HOLD_SECONDS = 3;
// 0 on non-touch devices (mouse-only desktop).
const MAX_TOUCH_POINTS =
  typeof navigator !== "undefined" && navigator.maxTouchPoints > 0
    ? navigator.maxTouchPoints
    : 0;

export default function ChooserApp() {
  const fingersRef = useRef<Map<number, Finger>>(new Map());
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => (t + 1) % 1_000_000);

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ChoiceResult | null>(null);
  const [countdownProgress, setCountdownProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("touch");

  const countdownStartRef = useRef<number | null>(null);
  // Synthetic ids for tap-to-add markers — negative so they never collide
  // with real PointerEvent ids.
  const markerIdRef = useRef(-1);

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

  // RAF loop runs the countdown ring and triggers the pick. Only used in
  // touch mode; tap mode picks via the explicit button.
  useEffect(() => {
    if (phase !== "countdown" || inputMode !== "touch") return;
    let raf = 0;
    const loop = (now: number) => {
      const start = countdownStartRef.current;
      if (start == null) return;
      const progress = Math.min(1, (now - start) / 1000 / HOLD_SECONDS);
      setCountdownProgress(progress);
      if (progress >= 1) {
        runPick();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, currentMode, currentTeamCount, inputMode]);

  // Restart the countdown if mode/team count changes mid-hold.
  useEffect(() => {
    if (phase === "countdown" && inputMode === "touch") {
      countdownStartRef.current = performance.now();
      setCountdownProgress(0);
    }
  }, [currentMode, currentTeamCount]);

  function runPick() {
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
  }

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

  function clearAll() {
    fingersRef.current.clear();
    setResult(null);
    countdownStartRef.current = null;
    setCountdownProgress(0);
    setPhase("idle");
  }

  function switchInputMode(next: InputMode) {
    if (next === inputMode) return;
    clearAll();
    setInputMode(next);
  }

  // -- Touch-mode pointer handlers -------------------------------------------

  function onPointerDownTouch(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* synthetic / inactive pointers — safe to ignore */
    }

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

  function onPointerMoveTouch(e: PointerEvent) {
    const f = fingersRef.current.get(e.pointerId);
    if (!f) return;
    f.x = e.clientX;
    f.y = e.clientY;
    rerender();
  }

  function onPointerEndTouch(e: PointerEvent) {
    if (!fingersRef.current.has(e.pointerId)) return;
    if (phase === "result") return; // keep rings frozen
    fingersRef.current.delete(e.pointerId);
    refreshPhase();
    rerender();
  }

  // -- Tap-to-add-mode pointer handlers --------------------------------------

  function onPointerDownTap(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (phase === "result") return; // ignore until reset

    // If the tap is on an existing marker, remove it.
    const hit = Array.from(fingersRef.current.values()).find((f) => {
      const dx = f.x - e.clientX;
      const dy = f.y - e.clientY;
      return Math.hypot(dx, dy) <= RING_RADIUS;
    });
    if (hit) {
      fingersRef.current.delete(hit.id);
      rerender();
      return;
    }

    // Otherwise add a new marker.
    const id = markerIdRef.current;
    markerIdRef.current -= 1;
    fingersRef.current.set(id, {
      id,
      x: e.clientX,
      y: e.clientY,
      joinedAt: performance.now(),
      color: nextColor(),
    });
    rerender();
  }

  // -- Render ----------------------------------------------------------------

  const liveFingers = Array.from(fingersRef.current.values());
  const winner =
    phase === "result" && result?.kind === "winner"
      ? liveFingers.find((f) => f.id === result.winnerId)
      : undefined;

  const showIdleHint = liveFingers.length === 0 && phase !== "result";
  const idleTitle =
    inputMode === "touch" ? "Tap with 2 or more fingers" : "Tap to add markers";
  const idleSub =
    inputMode === "tap"
      ? "Tap a marker again to remove it."
      : currentMode === "winner"
        ? "One will be picked."
        : currentMode === "teams"
          ? `Will split into ${currentTeamCount} teams.`
          : "An order will be assigned.";

  return (
    <div
      class={styles.surface}
      onPointerDown={
        inputMode === "touch" ? onPointerDownTouch : onPointerDownTap
      }
      onPointerMove={inputMode === "touch" ? onPointerMoveTouch : undefined}
      onPointerUp={inputMode === "touch" ? onPointerEndTouch : undefined}
      onPointerCancel={inputMode === "touch" ? onPointerEndTouch : undefined}
      onPointerLeave={inputMode === "touch" ? onPointerEndTouch : undefined}
    >
      {showIdleHint && (
        <div class={styles.hint}>
          <h1 class={styles.hintTitle}>{idleTitle}</h1>
          <p class={styles.hintSub}>{idleSub}</p>
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

      <button
        type="button"
        class={`${styles.settingsBtn} btn btn-ghost btn-icon`}
        aria-label="Settings"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setSettingsOpen(true)}
      >
        <SettingsIcon size={28} />
      </button>

      {/* Bottom bar — content depends on phase and input mode */}
      {phase === "result" ? (
        <button
          type="button"
          class={`${styles.resetBtn} btn btn-primary`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            clearAll();
          }}
        >
          Tap to play again
        </button>
      ) : inputMode === "touch" ? (
        <div
          class={styles.bottomBar}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span class={styles.bottomHint}>
            {MAX_TOUCH_POINTS > 0
              ? `Max ${MAX_TOUCH_POINTS} fingers on this device`
              : "More than touch can do?"}
          </span>
          <button
            type="button"
            class={`${styles.bottomBtn} btn`}
            onClick={() => switchInputMode("tap")}
          >
            Tap-to-add mode
          </button>
        </div>
      ) : (
        <div
          class={styles.bottomBar}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            class={`${styles.bottomBtn} btn`}
            onClick={() => switchInputMode("touch")}
          >
            Back to fingers
          </button>
          <span class={styles.bottomHint}>
            {liveFingers.length === 0
              ? "0 markers"
              : liveFingers.length === 1
                ? "1 marker"
                : `${liveFingers.length} markers`}
          </span>
          <button
            type="button"
            class={`${styles.bottomBtn} btn btn-primary`}
            disabled={liveFingers.length < 2}
            onClick={runPick}
          >
            Pick
          </button>
        </div>
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
