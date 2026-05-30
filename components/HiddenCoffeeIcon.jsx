"use client";

import { motion } from "framer-motion";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";

/** Pop-out arc: starts inside bin → up & sideways → bouncy landing nearby. */
function popKeyframes(scale) {
  const s = scale;
  return {
    start: { x: Math.round(20 * s), y: Math.round(18 * s) },
    apex: { x: Math.round(38 * s), y: Math.round(-44 * s) },
    land: { x: Math.round(-14 * s), y: Math.round(30 * s) },
  };
}

/** Only mounted after the 5th recycle-bin click. */
export default function HiddenCoffeeIcon({
  anchorLeft,
  anchorTop,
  width = 76,
  zIndex = 15,
  layoutScale = 1,
  selected = false,
  onOpen,
}) {
  const k = popKeyframes(layoutScale);

  return (
    <motion.button
      type="button"
      data-cursor="hover"
      className="desktop-coffee-icon desktop-coffee-icon--revealed"
      aria-label="Open coffee snake game"
      title="coffee_snake.exe"
      onClick={() => {
        playClick();
        onOpen?.();
      }}
      initial={{
        opacity: 0,
        scale: 0.1,
        x: k.start.x,
        y: k.start.y,
      }}
      animate={{
        opacity: [0, 1, 1],
        scale: [0.1, 1.14, 1],
        x: [k.start.x, k.apex.x, k.land.x],
        y: [k.start.y, k.apex.y, k.land.y],
      }}
      transition={{
        duration: 0.92,
        times: [0, 0.4, 1],
        ease: [
          [0.22, 1, 0.36, 1],
          [0.34, 1.55, 0.48, 1],
        ],
      }}
      style={{
        position: "absolute",
        left: anchorLeft,
        top: anchorTop,
        width,
        zIndex,
        margin: 0,
        padding: "4px 2px 6px",
        border: "none",
        background: selected
          ? "rgba(255, 122, 41, 0.14)"
          : "rgba(255, 122, 41, 0.1)",
        borderRadius: 2,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        transformOrigin: "center center",
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
