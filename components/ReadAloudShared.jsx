"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export const READ_ALOUD_ACCENT = "#FF7A29";
export const READ_ALOUD_ACCENT_DIM = "rgba(255, 180, 112, 0.75)";
const EASE = [0.16, 1, 0.3, 1];

/** Retro single-line speaker icon (stroke) — matches site accent. */
export function SpeakerGlyph({ size = 20, active = false }) {
  const c = active ? READ_ALOUD_ACCENT_DIM : READ_ALOUD_ACCENT;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        display: "block",
        filter: active ? "none" : undefined,
        opacity: active ? 0.85 : 1,
      }}
    >
      <path
        d="M4 10v4h3l4 3V7L7 10H4z"
        stroke={c}
        strokeWidth={1.35}
        strokeLinejoin="round"
        fill="rgba(255,122,41,0.08)"
      />
      <path
        d="M15 9.5c1.5 1 1.5 4 0 5M17.5 7c2.5 1.8 2.5 8.2 0 10"
        stroke={c}
        strokeWidth={1.25}
        strokeLinecap="round"
        opacity={0.9}
      />
    </svg>
  );
}

export function ReadAloudPortal({
  mounted,
  busy,
  stop,
  panelTitle,
  subtitle = "Playing · browser voice",
  floatKey = "read-aloud-float",
}) {
  if (!mounted || typeof document === "undefined") return null;

  const layer = (
    <AnimatePresence>
      {busy ? (
        <motion.div
          key={floatKey}
          role="dialog"
          aria-modal="true"
          aria-label="Reading aloud"
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{
            position: "fixed",
            right: "max(16px, env(safe-area-inset-right))",
            bottom: "max(20px, env(safe-area-inset-bottom))",
            zIndex: 12000,
            width: 220,
            fontFamily: "'VT323', monospace",
            boxShadow:
              "0 0 24px rgba(255, 122, 41, 0.15), 0 18px 48px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              background: "rgba(18, 12, 8, 0.96)",
              border: "1px solid rgba(255, 122, 41, 0.55)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "5px 10px",
                background:
                  "linear-gradient(to bottom, rgba(255, 122, 41, 0.2), rgba(255, 122, 41, 0.08))",
                borderBottom: "1px solid rgba(255, 122, 41, 0.45)",
                fontSize: 12,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: READ_ALOUD_ACCENT,
                textShadow: "0 0 6px rgba(255, 122, 41, 0.45)",
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }} className="truncate">
                {panelTitle}
              </span>
              <button
                type="button"
                data-cursor="hover"
                aria-label="Stop and close"
                onClick={stop}
                style={{
                  flexShrink: 0,
                  background: "transparent",
                  border: "none",
                  color: READ_ALOUD_ACCENT,
                  fontSize: 18,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: "0 2px",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "14px 12px 12px" }}>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: READ_ALOUD_ACCENT_DIM,
                  lineHeight: 1.45,
                }}
              >
                {subtitle}
              </p>
              <button
                type="button"
                data-cursor="hover"
                onClick={stop}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "rgba(255, 122, 41, 0.16)",
                  border: "1px solid rgba(255, 122, 41, 0.45)",
                  color: READ_ALOUD_ACCENT,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontSize: 12,
                  cursor: "pointer",
                  textShadow: "0 0 6px rgba(255, 122, 41, 0.35)",
                }}
              >
                Stop
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(layer, document.body);
}

export function useReadAloud() {
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!busy) return;
    const onKey = (e) => {
      if (e.key === "Escape") stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, stop]);

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.93;
      u.pitch = 1;
      u.onend = () => setBusy(false);
      u.onerror = () => setBusy(false);
      setBusy(true);
      window.speechSynthesis.speak(u);
    },
    [supported]
  );

  return { busy, supported, mounted, speak, stop };
}
