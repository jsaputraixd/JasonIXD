"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];
const TRASH_ICON_SRC = "/images/trash-bin-icon.png";

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
  const iconH = Math.round(width * 0.82);

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
          position: "relative",
          width: width - 8,
          height: iconH,
          flexShrink: 0,
        }}
      >
        <Image
          src={TRASH_ICON_SRC}
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
