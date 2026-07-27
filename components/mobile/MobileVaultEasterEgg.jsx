"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CoffeeSnakeGame from "@/components/CoffeeSnakeGame";
import { TypedLine } from "@/components/TypedLine";
import {
  hasVaultKey,
  subscribeVaultKey,
} from "@/lib/mobileVaultKey";
import { playClick } from "@/lib/typingSound";

const BREACH_EYEBROW = "> keyhole.exe — auth OK";
const BREACH_LINES = [
  "ERROR",
  "ERROR",
  "ERROR",
  "ERROR",
  "USER ENCRYPTION DATA VAULT BREACHED",
  "PLEASE LEAVE",
  "DO NOT TOUCH",
  "NOTHING HERE",
];

const BREACH_CHAR_MS = 42;
const BREACH_LINE_GAP_MS = 320;
const BREACH_HOLD_MS = 900;

function buildBreachTimeline() {
  let t = 280;
  const eyebrowDelay = t;
  t += BREACH_EYEBROW.length * BREACH_CHAR_MS + BREACH_LINE_GAP_MS + 120;
  const lines = BREACH_LINES.map((text) => {
    const delay = t;
    const charMs = text === "ERROR" ? 56 : BREACH_CHAR_MS;
    t += text.length * charMs + BREACH_LINE_GAP_MS;
    return { text, delay, charMs };
  });
  return { eyebrowDelay, lines, totalMs: t + BREACH_HOLD_MS };
}

/** Tiny keyhole tucked in a corner of the welcome banner body. */
export function MobileVaultKeyhole({ onUnlock }) {
  const [hasKey, setHasKey] = useState(false);
  const [buzz, setBuzz] = useState(false);

  useEffect(() => {
    setHasKey(hasVaultKey());
    return subscribeVaultKey(setHasKey);
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    playClick();
    if (!hasKey) {
      setBuzz(true);
      window.setTimeout(() => setBuzz(false), 420);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(8);
      }
      return;
    }
    onUnlock?.();
  };

  return (
    <button
      type="button"
      className={
        hasKey
          ? "mobile-vault-keyhole mobile-vault-keyhole--armed"
          : "mobile-vault-keyhole"
      }
      aria-label={
        hasKey
          ? "Open sealed vault"
          : "Locked keyhole — find a key somewhere nearby"
      }
      title={hasKey ? "unlocked?" : "…"}
      onClick={handleClick}
      style={{
        transform: buzz ? "translateX(1px)" : undefined,
      }}
    >
      <svg
        className="mobile-vault-keyhole__svg"
        viewBox="0 0 24 34"
        width="15"
        height="21"
        aria-hidden
      >
        {/* Classic keyhole: round bore + tapered slot */}
        <circle cx="12" cy="9.5" r="6.4" />
        <path d="M8.1 14.2h7.8l-1.7 15.2c-.15.9-.9 1.5-1.7 1.5h-1c-.8 0-1.55-.6-1.7-1.5L8.1 14.2z" />
      </svg>
    </button>
  );
}

/** Toast after collecting the orbit key. */
export function MobileVaultToast({ open, onDone }) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => onDone?.(), 3200);
    return () => window.clearTimeout(t);
  }, [open, onDone]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="mobile-vault-toast"
          role="status"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mobile-vault-toast__glyph" aria-hidden>
            🔑
          </span>
          <div>
            <p className="mobile-vault-toast__title">Key acquired</p>
            <p className="mobile-vault-toast__body">
              You got a key to somewhere.
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function VaultBreachTerminal({ onDone }) {
  const timeline = useMemo(() => buildBreachTimeline(), []);

  useEffect(() => {
    const t = window.setTimeout(() => onDone?.(), timeline.totalMs);
    return () => window.clearTimeout(t);
  }, [onDone, timeline.totalMs]);

  return (
    <motion.div
      key="breach"
      className="mobile-vault-breach"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mobile-vault-breach__titlebar" aria-hidden>
        <span>sys_alert.msg</span>
        <span>● ● ●</span>
      </div>
      <div className="mobile-vault-breach__body">
        <TypedLine
          as="p"
          text={BREACH_EYEBROW}
          charMs={BREACH_CHAR_MS}
          delay={timeline.eyebrowDelay}
          soundEvery={2}
          useThrottledSound
          style={{
            margin: "0 0 14px",
            fontFamily: "'VT323', monospace",
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255, 180, 112, 0.75)",
            display: "block",
            textAlign: "left",
          }}
        />
        {timeline.lines.map((line, i) => (
          <TypedLine
            key={`${line.text}-${i}`}
            as="p"
            text={line.text}
            charMs={line.charMs}
            delay={line.delay}
            soundEvery={line.text === "ERROR" ? 1 : 2}
            useThrottledSound={line.text !== "ERROR"}
            style={{
              margin: line.text === "ERROR" ? "0 0 4px" : "0 0 8px",
              fontFamily: "'VT323', monospace",
              fontSize: line.text === "ERROR" ? 18 : 15,
              letterSpacing: line.text === "ERROR" ? "0.28em" : "0.12em",
              textTransform: "uppercase",
              color: line.text === "ERROR" ? "#ff5a3c" : "rgba(255, 210, 180, 0.92)",
              textShadow:
                line.text === "ERROR"
                  ? "0 0 10px rgba(255, 70, 50, 0.55)"
                  : "none",
              display: "block",
              textAlign: "left",
              minHeight: "1.15em",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/** Desktop: typed breach, then hand off to the coffee_snake window. */
export function DesktopVaultBreachOverlay({ open, onComplete }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !reduceMotion) return;
    onComplete?.();
  }, [open, reduceMotion, onComplete]);

  return (
    <AnimatePresence>
      {open && !reduceMotion ? (
        <motion.div
          className="coffee-snake-overlay mobile-vault-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <VaultBreachTerminal onDone={onComplete} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Breach sequence → coffee_snake.exe overlay. */
export function MobileVaultGameFlow({ open, onClose }) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState("idle"); // idle | breach | game

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      return;
    }
    setPhase(reduceMotion ? "game" : "breach");
  }, [open, reduceMotion]);

  const finishBreach = useCallback(() => {
    setPhase("game");
  }, []);

  const handleClose = useCallback(() => {
    playClick();
    onClose?.();
  }, [onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="coffee-snake-overlay mobile-vault-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && phase === "game") handleClose();
          }}
        >
          <AnimatePresence mode="wait">
            {phase === "breach" ? (
              <VaultBreachTerminal onDone={finishBreach} />
            ) : null}

            {phase === "game" ? (
              <motion.div
                key="game"
                className="coffee-snake-overlay__panel"
                initial={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: -80, scale: 0.2, transformOrigin: "50% 0%" }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="coffee-snake-overlay__titlebar">
                  <span>coffee_snake.exe</span>
                  <button
                    type="button"
                    className="coffee-snake-overlay__close"
                    aria-label="Close game"
                    onClick={handleClose}
                  >
                    ×
                  </button>
                </div>
                <div className="coffee-snake-overlay__body">
                  <CoffeeSnakeGame variant="mobile" onQuit={handleClose} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function useVaultKeyState() {
  const [hasKey, setHasKey] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    setHasKey(hasVaultKey());
    return subscribeVaultKey((next) => {
      setHasKey(next);
      if (next) setToastOpen(true);
    });
  }, []);

  return {
    hasKey,
    toastOpen,
    dismissToast: () => setToastOpen(false),
  };
}
