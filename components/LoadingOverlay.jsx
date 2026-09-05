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
} from "@/lib/typingSound";
import { preloadPortfolioAssets } from "@/lib/preloadPortfolio";

const EASE = [0.16, 1, 0.3, 1];

const START_MS = 320;
const WORD_DURATION_S = 1.2;
const WORD_STAGGER_S = 0.65;
/** Time from tagline show → exit starts (words finish ~2.5s in). */
const TAGLINE_HOLD_MS = 4300;
const EXIT_FADE_MS = 800;

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
          setShowTagline(true);
          await delay(1800, signal);
          setExiting(true);
          await delay(EXIT_FADE_MS, signal);
          setVisible(false);
          signalBootComplete();
          return;
        }

        await delay(START_MS, signal);
        setShowTagline(true);
        await delay(TAGLINE_HOLD_MS, signal);
        setExiting(true);
        await delay(EXIT_FADE_MS, signal);
        setVisible(false);
        signalBootComplete();
      } catch {
        /* aborted. Strict Mode remount will start a fresh run */
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
        (i * WORD_STAGGER_S + 0.12) * 1000
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

          {showTagline ? (
            <motion.div
              key="tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
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
                  initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
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
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
