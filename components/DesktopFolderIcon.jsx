"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];

/**
 * Classic desktop folder icon — image on top, label underneath.
 */
export default function DesktopFolderIcon({
  label,
  iconSrc,
  left,
  top,
  width = 76,
  onOpen,
  onFocus,
  zIndex = 14,
  parallaxShift = { x: 0, y: 0 },
  delay = 0,
  selected = false,
}) {
  const iconH = Math.round(width * 0.82);

  return (
    <motion.button
      type="button"
      data-cursor="hover"
      aria-label={`Open ${label}`}
      onClick={() => {
        playClick();
        onFocus?.();
        onOpen?.();
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        playClick();
        onFocus?.();
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
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transform: `translate3d(${parallaxShift.x}px, ${parallaxShift.y}px, 0)`,
        transition: "background 140ms ease",
      }}
    >
      <span
        style={{
          position: "relative",
          width: width - 8,
          height: iconH,
          flexShrink: 0,
        }}
      >
        <Image
          src={iconSrc}
          alt=""
          fill
          sizes={`${width}px`}
          style={{ objectFit: "contain", objectPosition: "center bottom" }}
          draggable={false}
        />
      </span>
      <span
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 11,
          lineHeight: 1.25,
          letterSpacing: "0.06em",
          textAlign: "center",
          color: selected ? "#ffe2c4" : ACCENT,
          textShadow: selected
            ? "0 0 8px rgba(255, 122, 41, 0.55)"
            : "0 0 6px rgba(255, 122, 41, 0.35)",
          maxWidth: width + 12,
          wordBreak: "break-word",
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
