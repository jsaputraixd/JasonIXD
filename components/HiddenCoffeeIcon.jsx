"use client";

import { motion } from "framer-motion";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];

/** Hidden coffee launcher — fixed under the recycle bin until the bin is moved. */
export default function HiddenCoffeeIcon({
  left,
  top,
  width = 76,
  zIndex = 13,
  parallaxShift = { x: 0, y: 0 },
  delay = 0,
  revealed = false,
  selected = false,
  onOpen,
}) {
  return (
    <motion.button
      type="button"
      data-cursor={revealed ? "hover" : undefined}
      className={`desktop-coffee-icon${revealed ? " desktop-coffee-icon--revealed" : ""}`}
      aria-label={revealed ? "Open coffee snake game" : undefined}
      aria-hidden={!revealed}
      tabIndex={revealed ? 0 : -1}
      title={revealed ? "COFFEE_SNAKE.EXE" : undefined}
      onClick={() => {
        if (!revealed) return;
        playClick();
        onOpen?.();
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.32, delay, ease: EASE }}
      style={{
        position: "absolute",
        left,
        top,
        width,
        zIndex,
        margin: 0,
        padding: "4px 2px 6px",
        border: "none",
        background: selected
          ? "rgba(255, 122, 41, 0.14)"
          : "transparent",
        borderRadius: 2,
        cursor: revealed ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        transform: `translate3d(${parallaxShift.x}px, ${parallaxShift.y}px, 0)`,
        pointerEvents: revealed ? "auto" : "none",
        transition: "background 140ms ease",
      }}
    >
      <span className="desktop-coffee-icon__glyph" aria-hidden>
        ☕
      </span>
      <span
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 11,
          lineHeight: 1.2,
          letterSpacing: "0.04em",
          textAlign: "center",
          color: selected ? "#ffe2c4" : ACCENT,
          textShadow: selected
            ? "0 0 8px rgba(255, 122, 41, 0.55)"
            : "0 0 6px rgba(255, 122, 41, 0.35)",
        }}
      >
        coffee.exe
      </span>
    </motion.button>
  );
}
