"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { playTypingClick, playTypingClickThrottled } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];

function TypedLine({
  text,
  charMs = 40,
  delay = 0,
  skipTyping = false,
  enabled = true,
  soundEvery = 1,
  useThrottledSound = false,
  onComplete,
  as: Tag = "span",
  style,
}) {
  const [typed, setTyped] = useState(skipTyping ? text : "");
  const [done, setDone] = useState(skipTyping);

  useEffect(() => {
    if (!enabled) return;

    if (skipTyping) {
      setTyped(text);
      setDone(true);
      return;
    }

    setTyped("");
    setDone(false);
    const timers = [];
    const tickSound =
      useThrottledSound
        ? () => playTypingClickThrottled(58)
        : () => playTypingClick();

    timers.push(
      setTimeout(() => {
        for (let i = 1; i <= text.length; i++) {
          timers.push(
            setTimeout(() => {
              setTyped(text.slice(0, i));
              if (i % soundEvery === 0) tickSound();
            }, i * charMs)
          );
        }
        timers.push(
          setTimeout(() => {
            setDone(true);
            onComplete?.();
          }, text.length * charMs + 80)
        );
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [
    text,
    charMs,
    delay,
    skipTyping,
    enabled,
    soundEvery,
    useThrottledSound,
    onComplete,
  ]);

  return (
    <Tag style={style}>
      {enabled || skipTyping ? typed : "\u00a0"}
      {enabled && !done && typed.length > 0 && <BlinkCursor />}
    </Tag>
  );
}

/** Starts typing when scrolled into the mobile column (once). */
function ScrollTypedLine({
  scrollRoot,
  amount = 0.38,
  ...typedProps
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, {
    root: scrollRoot ?? undefined,
    once: true,
    amount,
    margin: "0px 0px -8% 0px",
  });
  const active = reduceMotion || typedProps.skipTyping || inView;

  return (
    <span ref={ref} style={{ display: typedProps.style?.display ?? "block" }}>
      <TypedLine {...typedProps} enabled={active} />
    </span>
  );
}

function ScrollTypedParagraph({
  text,
  scrollRoot,
  skipTyping = false,
  charMs = 14,
  delay = 120,
  style,
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, {
    root: scrollRoot ?? undefined,
    once: true,
    amount: 0.32,
    margin: "0px 0px -6% 0px",
  });
  const active = reduceMotion || skipTyping || inView;

  return (
    <p ref={ref} style={style}>
      <TypedLine
        text={text}
        charMs={charMs}
        delay={delay}
        skipTyping={skipTyping}
        enabled={active}
        soundEvery={3}
        useThrottledSound
        style={{ display: "inline" }}
      />
    </p>
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
        marginLeft: 4,
        background: ACCENT,
        height: "1em",
        verticalAlign: "-0.12em",
        boxShadow: "0 0 8px rgba(255, 122, 41, 0.6)",
      }}
    />
  );
}

function FadeInLine({ delay = 0, children, style: motionStyle }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={motionStyle}
    >
      {children}
    </motion.div>
  );
}

export { TypedLine, ScrollTypedLine, ScrollTypedParagraph, BlinkCursor, FadeInLine, ACCENT, EASE };
