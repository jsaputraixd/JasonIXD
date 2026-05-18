"use client";

import { motion } from "framer-motion";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];

function TrashGraphic({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="trash-lid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffb070" />
          <stop offset="100%" stopColor="#ff7a29" />
        </linearGradient>
      </defs>
      <rect
        x="14"
        y="10"
        width="36"
        height="6"
        rx="1"
        fill="url(#trash-lid)"
        stroke="#ff9a50"
        strokeWidth="1"
      />
      <rect x="28" y="6" width="8" height="6" rx="1" fill="#ff7a29" />
      <path
        d="M18 18 L22 54 H42 L46 18 Z"
        fill="rgba(255, 122, 41, 0.22)"
        stroke="#ff7a29"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="26" y1="24" x2="24" y2="48" stroke="#ff9a50" strokeWidth="1.2" />
      <line x1="32" y1="24" x2="32" y2="50" stroke="#ff9a50" strokeWidth="1.2" />
      <line x1="38" y1="24" x2="40" y2="48" stroke="#ff9a50" strokeWidth="1.2" />
    </svg>
  );
}

export default function RecycleBinIcon({
  left,
  top,
  width = 76,
  onActivate,
  onFocus,
  zIndex = 14,
  parallaxShift = { x: 0, y: 0 },
  delay = 0,
}) {
  const iconSize = Math.round(width * 0.72);

  return (
    <motion.button
      type="button"
      data-cursor="hover"
      aria-label="Recycle Bin"
      onClick={() => {
        playClick();
        onFocus?.();
        onActivate?.();
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
        background: "transparent",
        borderRadius: 2,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transform: `translate3d(${parallaxShift.x}px, ${parallaxShift.y}px, 0)`,
        transition: "transform 0.14s ease-out",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          height: Math.round(width * 0.82),
        }}
      >
        <TrashGraphic size={iconSize} />
      </span>
      <span
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 11,
          lineHeight: 1.25,
          letterSpacing: "0.06em",
          textAlign: "center",
          color: ACCENT,
          textShadow: "0 0 6px rgba(255, 122, 41, 0.35)",
          maxWidth: width + 12,
        }}
      >
        Recycle Bin
      </span>
    </motion.button>
  );
}
