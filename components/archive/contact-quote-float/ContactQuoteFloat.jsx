"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { quotes } from "@/data/quotes";

const TYPE_MS = 7000;
const HOLD_MS = 1800;
const DELETE_MS = 4200;
const GAP_MS = 500;

function formatQuote({ text, author }) {
  return `"${text}" — ${author}`;
}

function BlinkCursor() {
  return (
    <motion.span
      aria-hidden
      className="contact-quote-float__cursor"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1,
        times: [0, 0.5, 0.5, 1],
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

export default function ContactQuoteFloat() {
  const reduceMotion = useReducedMotion();
  const order = useMemo(() => {
    const list = quotes.map((_, i) => i);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, []);

  const [quoteIdx, setQuoteIdx] = useState(0);
  const [display, setDisplay] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const timersRef = useRef([]);

  const fullText = formatQuote(quotes[order[quoteIdx % order.length]]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (reduceMotion) {
      setDisplay(fullText);
      setShowCursor(false);
      const t = setTimeout(() => {
        setQuoteIdx((i) => i + 1);
      }, TYPE_MS + HOLD_MS + DELETE_MS + GAP_MS);
      timersRef.current.push(t);
      return () => timersRef.current.forEach(clearTimeout);
    }

    const schedule = (fn, ms) => {
      const t = setTimeout(fn, ms);
      timersRef.current.push(t);
      return t;
    };

    const typeCharMs = Math.max(16, Math.floor(TYPE_MS / Math.max(1, fullText.length)));
    const deleteCharMs = Math.max(
      12,
      Math.floor(DELETE_MS / Math.max(1, fullText.length))
    );

    setDisplay("");
    setShowCursor(true);

    for (let i = 1; i <= fullText.length; i++) {
      schedule(() => setDisplay(fullText.slice(0, i)), i * typeCharMs);
    }

    const typedEnd = fullText.length * typeCharMs;
    schedule(() => setShowCursor(true), typedEnd);

    const deleteStart = typedEnd + HOLD_MS;
    for (let i = fullText.length - 1; i >= 0; i--) {
      schedule(() => setDisplay(fullText.slice(0, i)), deleteStart + (fullText.length - i) * deleteCharMs);
    }

    const cycleEnd =
      deleteStart + fullText.length * deleteCharMs + GAP_MS;
    schedule(() => {
      setQuoteIdx((i) => i + 1);
    }, cycleEnd);

    return () => timersRef.current.forEach(clearTimeout);
  }, [fullText, quoteIdx, reduceMotion]);

  return (
    <p className="contact-quote-float" aria-hidden="true">
      <span className="contact-quote-float__line">
        {display || "\u00a0"}
        {showCursor ? <BlinkCursor /> : null}
      </span>
    </p>
  );
}
