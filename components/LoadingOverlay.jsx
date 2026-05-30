"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  shouldSkipIntro,
  signalBootComplete,
} from "@/lib/introSession";
import {
  playStartupChime,
  playStartupWordAccent,
  playTypingClick,
} from "@/lib/typingSound";
import { preloadPortfolioAssets } from "@/lib/preloadPortfolio";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];

const BOOT_LINES = [
  "> BOOTING JS-OS v1.0...",
  "> LOC: SF // BALI",
  "> SYNC OK",
  "> READY \u25A2",
];

const CHAR_MS = 42;
const LINE_GAP_MS = 300;
const POST_BOOT_PAUSE = 580;
const WORD_DURATION_S = 1.2;
const WORD_STAGGER_S = 0.58;
const TAGLINE_HOLD_MS = 4400;
const EXIT_FADE_MS = 950;

const TAGLINE_WORDS = ["Dream.", "Think.", "Build."];

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const id = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(signal.reason);
      },
      { once: true }
    );
  });
}

export default function LoadingOverlay() {
  const [typed, setTyped] = useState(BOOT_LINES.map(() => ""));
  const [activeLine, setActiveLine] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [exiting, setExiting] = useState(false);
  /** Hidden until client decides: full boot vs skip (refresh with intro seen). */
  const [visible, setVisible] = useState(false);
  const skipBootRef = useRef(false);
  const [bootReady, setBootReady] = useState(false);

  useLayoutEffect(() => {
    preloadPortfolioAssets();
    if (shouldSkipIntro()) {
      skipBootRef.current = true;
      setVisible(false);
      signalBootComplete();
    } else {
      setVisible(true);
    }
    setBootReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bootReady || skipBootRef.current) return;

    const ac = new AbortController();
    const { signal } = ac;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    (async () => {
      try {
        if (reduced) {
          setTyped(BOOT_LINES);
          setActiveLine(BOOT_LINES.length);
          setBootDone(true);
          setShowTagline(true);
          await delay(2000, signal);
          setExiting(true);
          await delay(EXIT_FADE_MS, signal);
          setVisible(false);
          signalBootComplete();
          return;
        }

        await delay(220, signal);

        for (let lineIdx = 0; lineIdx < BOOT_LINES.length; lineIdx++) {
          const line = BOOT_LINES[lineIdx];
          setActiveLine(lineIdx);
          for (let i = 1; i <= line.length; i++) {
            await delay(CHAR_MS, signal);
            setTyped((prev) => {
              const next = [...prev];
              next[lineIdx] = line.slice(0, i);
              return next;
            });
            if (i % 3 === 0) playTypingClick();
          }
          await delay(LINE_GAP_MS, signal);
        }

        setBootDone(true);
        setActiveLine(BOOT_LINES.length);
        await delay(POST_BOOT_PAUSE, signal);
        setShowTagline(true);
        await delay(TAGLINE_HOLD_MS, signal);
        setExiting(true);
        await delay(EXIT_FADE_MS, signal);
        setVisible(false);
        signalBootComplete();
      } catch {
        /* aborted — Strict Mode remount will start a fresh run */
      }
    })();

    return () => ac.abort();
  }, [bootReady]);

  useEffect(() => {
    if (!showTagline) return;
    if (skipBootRef.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    playStartupChime();
    const pings = TAGLINE_WORDS.map((_, i) =>
      window.setTimeout(
        () => playStartupWordAccent(i),
        (i * WORD_STAGGER_S + 0.2) * 1000
      )
    );
    return () => pings.forEach((id) => clearTimeout(id));
  }, [showTagline]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: EXIT_FADE_MS / 1000, ease: EASE }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "#070405",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
          aria-hidden="true"
        >
          {/* Scanline veil + warm tint */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 2px, transparent 4px)",
              mixBlendMode: "overlay",
              opacity: 0.5,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at 50% 45%, rgba(255, 122, 41, 0.08) 0%, transparent 60%)",
            }}
          />

          {/* Boot terminal block — fades out as tagline rises */}
          <motion.div
            animate={{
              opacity: showTagline ? 0 : 1,
              y: showTagline ? -20 : 0,
            }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              position: "absolute",
              fontFamily: "'VT323', monospace",
              fontSize: 18,
              letterSpacing: "0.06em",
              color: ACCENT,
              textShadow: "0 0 10px rgba(255, 122, 41, 0.5)",
              lineHeight: 1.55,
              minWidth: 280,
              textAlign: "left",
              whiteSpace: "pre",
              pointerEvents: "none",
            }}
          >
            {BOOT_LINES.map((line, i) => {
              const isCurrent = i === activeLine && !bootDone;
              const isLastDone =
                i === BOOT_LINES.length - 1 && bootDone && !showTagline;
              const isFuture = i > activeLine && !bootDone;
              return (
                <div key={i} style={{ opacity: isFuture ? 0 : 1 }}>
                  {typed[i]}
                  {(isCurrent || isLastDone) && <BlinkCursor />}
                </div>
              );
            })}
          </motion.div>

          {/* Tagline reveal */}
          {showTagline && (
            <motion.div
              key="tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{
                position: "absolute",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0.32em",
                fontFamily: "'Bonbon', cursive",
                fontSize: "clamp(56px, 9.5vw, 132px)",
                color: "#ffffff",
                textShadow:
                  "0 0 32px rgba(255, 122, 41, 0.45), 0 0 90px rgba(255, 122, 41, 0.18)",
                lineHeight: 1,
                textAlign: "center",
                padding: "0 20px",
              }}
            >
              {TAGLINE_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: WORD_DURATION_S,
                    delay: i * WORD_STAGGER_S,
                    ease: EASE,
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BlinkCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1,
        times: [0, 0.5, 0.5, 1],
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        display: "inline-block",
        width: "0.55em",
        marginLeft: 2,
        background: ACCENT,
        height: "1em",
        verticalAlign: "-0.12em",
        boxShadow: "0 0 8px rgba(255, 122, 41, 0.6)",
      }}
    />
  );
}
