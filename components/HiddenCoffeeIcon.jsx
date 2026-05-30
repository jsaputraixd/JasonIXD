"use client";

import { motion } from "framer-motion";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";

/** Pop-out arc: starts inside bin → up & left → lands beside the bin (not on top). */
function popKeyframes(scale, iconWidth = 76) {
  const s = scale;
  const w = iconWidth;
  const beside = Math.round((w + 24) * s);
  return {
    start: { x: Math.round(w * 0.32), y: Math.round(w * 0.22) },
    apex: { x: Math.round(-w * 0.08), y: Math.round(-w * 0.62) },
    land: { x: -beside, y: Math.round(2 * s) },
  };
}

/** Only mounted after the 5th recycle-bin click. */
export default function HiddenCoffeeIcon({
  anchorLeft,
  anchorTop,
  width = 76,
  zIndex = 18,
  layoutScale = 1,
  selected = false,
  onOpen,
}) {
  const k = popKeyframes(layoutScale, width);

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
        height: Math.round(width * 1.26),
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
