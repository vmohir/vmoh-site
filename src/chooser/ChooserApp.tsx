import { useEffect, useRef, useState } from "preact/hooks";
import { Cog as SettingsIcon, X } from "lucide-preact";
import {
  DEFAULT_MODE,
  DEFAULT_TEAM_COUNT,
  clampTeamCount,
} from "../state/chooserState";
import { FINGER_COLORS } from "./colors";
import { pickResult } from "./selection";
import type { ChoiceResult, Finger, InputMode, Mode } from "./types";
import SettingsDrawer from "./SettingsDrawer";
import styles from "./ChooserApp.module.css";

type Phase = "idle" | "countdown" | "result";

const RING_RADIUS = 56;
const HOLD_SECONDS = 3;
// Tap-to-add picks don't need the full hold — they're an explicit press of
// the Pick button — but we run a quick countdown so the reveal animation
// matches touch mode.
const TAP_HOLD_SECONDS = 1;
// 0 on non-touch devices (mouse-only desktop).
const MAX_TOUCH_POINTS =
  typeof navigator !== "undefined" && navigator.maxTouchPoints > 0
    ? navigator.maxTouchPoints
    : 0;
const PREFERS_REDUCED_MOTION =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function vibrate(pattern: number | number[]): void {
  if (PREFERS_REDUCED_MOTION) return;
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function"
  ) {
    return;
  }
  try {
    navigator.vibrate(pattern);
  } catch {
    /* some browsers throw if called too early or in cross-origin frames */
  }
}

export default function ChooserApp() {
  const fingersRef = useRef<Map<number, Finger>>(new Map());
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => (t + 1) % 1_000_000);

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ChoiceResult | null>(null);
  const [countdownProgress, setCountdownProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("touch");
  const [currentMode, setMode] = useState<Mode>(DEFAULT_MODE);
  const [currentTeamCount, setTeamCountState] =
    useState<number>(DEFAULT_TEAM_COUNT);
  const setTeamCount = (n: number) => setTeamCountState(clampTeamCount(n));
  // Touch-mode-only: surfaces a "max N fingers / try tap-to-add mode" bar
  // when the user hits the device's touch-point ceiling. Stays visible long
  // enough that if a sixth finger collapses tracking and the count drops to
  // 0, the user still sees the hint.
  const [showLimitHint, setShowLimitHint] = useState(false);
  const reachedMaxRef = useRef(false);
  const limitHintTimerRef = useRef<number | null>(null);

  const countdownStartRef = useRef<number | null>(null);
  // Synthetic ids for tap-to-add markers — negative so they never collide
  // with real PointerEvent ids.
  const markerIdRef = useRef(-1);

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

  // RAF loop drives the countdown ring and triggers the pick. Runs in both
  // input modes — touch mode uses the full hold (HOLD_SECONDS), tap mode
  // uses a shorter buildup so the reveal animation lines up the same.
  useEffect(() => {
    if (phase !== "countdown") return;
    const holdSec = inputMode === "touch" ? HOLD_SECONDS : TAP_HOLD_SECONDS;
    let raf = 0;
    const loop = (now: number) => {
      const start = countdownStartRef.current;
      if (start == null) return;
      const progress = Math.min(1, (now - start) / 1000 / holdSec);
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

  // Restart the countdown if mode/team count changes mid-hold (touch mode
  // only — in tap mode the user has already pressed Pick).
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
      // Winner gets a celebratory two-pulse buzz; teams and order get a
      // single satisfying tap. Silent on iOS — no JS haptics there.
      vibrate(r.kind === "winner" ? [120, 60, 220] : 150);
    } else {
      refreshPhase();
    }
  }

  function startTapCountdown() {
    countdownStartRef.current = performance.now();
    setCountdownProgress(0);
    setPhase("countdown");
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

  function clearLimitHint() {
    setShowLimitHint(false);
    reachedMaxRef.current = false;
    if (limitHintTimerRef.current != null) {
      clearTimeout(limitHintTimerRef.current);
      limitHintTimerRef.current = null;
    }
  }

  function switchInputMode(next: InputMode) {
    if (next === inputMode) return;
    clearAll();
    clearLimitHint();
    setInputMode(next);
  }

  // Changing pick mode (winner / teams / order) also resets back to touch
  // input — the spec'd behaviour is "a mode change starts fresh".
  function handleModeChange(next: Mode) {
    setMode(next);
    if (inputMode !== "touch") switchInputMode("touch");
  }

  // -- Touch-mode pointer handlers -------------------------------------------

  function scheduleHintHide(delayMs = 3000) {
    if (limitHintTimerRef.current != null) {
      clearTimeout(limitHintTimerRef.current);
    }
    limitHintTimerRef.current = window.setTimeout(() => {
      setShowLimitHint(false);
      reachedMaxRef.current = false;
      limitHintTimerRef.current = null;
    }, delayMs);
  }

  function maybeUpdateLimitHint() {
    if (MAX_TOUCH_POINTS === 0) return;
    const count = fingersRef.current.size;
    if (count >= MAX_TOUCH_POINTS) {
      // At the device's ceiling — show the hint and start a fade timer. If
      // the user sustains all fingers down, the hint fades after 3s. A 6th
      // finger collapsing tracking will land us in the count===0 branch
      // below, which keeps the hint up a little longer.
      reachedMaxRef.current = true;
      setShowLimitHint(true);
      scheduleHintHide(3000);
    } else if (count === 0 && reachedMaxRef.current) {
      // Just dropped from max to zero — could be a normal release, could be
      // a 6th touch wiping tracking. Either way, keep the hint visible a
      // little longer so the user can react.
      scheduleHintHide(3000);
    }
  }

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
    maybeUpdateLimitHint();
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
    maybeUpdateLimitHint();
    rerender();
  }

  // -- Tap-to-add-mode pointer handlers --------------------------------------

  function onPointerDownTap(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Ignore taps while the countdown is running or a result is showing.
    if (phase !== "idle") return;

    // If the tap is on an existing marker, remove it.
    const hit = Array.from(fingersRef.current.values()).find((f) => {
      const dx = f.x - e.clientX;
      const dy = f.y - e.clientY;
      return Math.hypot(dx, dy) <= RING_RADIUS;
    });
    if (hit) {
      fingersRef.current.delete(hit.id);
      vibrate(15);
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
    vibrate(25);
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

      {liveFingers.map((f, idx) => (
        <Ring
          key={f.id}
          finger={f}
          phase={phase}
          result={result}
          progress={countdownProgress}
          reducedMotion={PREFERS_REDUCED_MOTION}
          markerNumber={inputMode === "tap" ? idx + 1 : undefined}
        />
      ))}

      <div role="status" aria-live="polite" class={styles.srOnly}>
        {phase === "result" && result
          ? describeResult(result, liveFingers)
          : ""}
      </div>

      <button
        type="button"
        class={`${styles.settingsBtn} btn btn-ghost btn-icon`}
        aria-label="Settings"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setSettingsOpen(true)}
      >
        <SettingsIcon size={28} />
      </button>

      {inputMode === "tap" && (
        <div class={styles.modePill} onPointerDown={(e) => e.stopPropagation()}>
          <span class={styles.modePillLabel}>Tap-to-add</span>
          <button
            type="button"
            class={styles.modePillClose}
            aria-label="Disable tap-to-add mode"
            onClick={() => switchInputMode("touch")}
          >
            <X size={16} />
          </button>
        </div>
      )}

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
        showLimitHint && (
          <div
            class={styles.bottomBar}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span class={styles.bottomHint}>
              {MAX_TOUCH_POINTS > 0
                ? `Max ${MAX_TOUCH_POINTS} fingers on this device.`
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
        )
      ) : (
        <div
          class={styles.bottomBar}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span class={styles.bottomHint}>
            {liveFingers.length === 0
              ? "Tap to add markers"
              : liveFingers.length === 1
                ? "1 marker"
                : `${liveFingers.length} markers`}
          </span>
          <button
            type="button"
            class={`${styles.bottomBtn} btn btn-primary`}
            disabled={liveFingers.length < 2 || phase === "countdown"}
            onClick={startTapCountdown}
          >
            Pick
          </button>
        </div>
      )}

      {settingsOpen && (
        <SettingsDrawer
          onClose={() => setSettingsOpen(false)}
          inputMode={inputMode}
          onChangeInputMode={switchInputMode}
          mode={currentMode}
          onChangeMode={handleModeChange}
          teamCount={currentTeamCount}
          onChangeTeamCount={setTeamCount}
        />
      )}
    </div>
  );
}

interface RingProps {
  finger: Finger;
  phase: Phase;
  result: ChoiceResult | null;
  progress: number;
  reducedMotion: boolean;
  markerNumber?: number;
}

function Ring({
  finger,
  phase,
  result,
  progress,
  reducedMotion,
  markerNumber,
}: RingProps) {
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
  } else if (markerNumber != null) {
    // Tap-to-add marker — label helps color-blind users distinguish them
    // and acts as the screen-reader identity for each marker.
    label = String(markerNumber);
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

  if (phase === "countdown" && !reducedMotion) {
    const pulse = 1 + 0.06 * Math.sin(progress * Math.PI * 8) + progress * 0.1;
    ringStyle.transform = `scale(${pulse})`;
  }

  return (
    <div
      class={`${styles.ring} ${isLoser ? styles.ringFaded : ""} ${isWinner ? styles.ringWinner : ""}`}
      style={ringStyle}
      role="img"
      aria-label={
        isWinner
          ? `Winner${label ? ` (marker ${label})` : ""}`
          : label
            ? `Marker ${label}`
            : "Finger"
      }
    >
      <div class={styles.ringInner} />
      {label !== null && <span class={styles.ringLabel}>{label}</span>}
    </div>
  );
}

function describeResult(
  result: ChoiceResult,
  fingers: readonly Finger[],
): string {
  if (result.kind === "winner") {
    const winnerIdx = fingers.findIndex((f) => f.id === result.winnerId);
    return winnerIdx >= 0
      ? `Winner picked: marker ${winnerIdx + 1} of ${fingers.length}.`
      : "Winner picked.";
  }
  if (result.kind === "teams") {
    const sizes = new Array<number>(result.teamCount).fill(0);
    for (const t of Object.values(result.teamByFinger)) {
      if (t >= 0 && t < sizes.length) sizes[t] = (sizes[t] ?? 0) + 1;
    }
    return `Split into ${result.teamCount} teams: ${sizes
      .map((n, i) => `team ${i + 1} has ${n}`)
      .join(", ")}.`;
  }
  return `Order assigned to ${fingers.length} fingers.`;
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
