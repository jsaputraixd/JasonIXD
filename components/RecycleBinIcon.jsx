"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useDesktopIconDrag } from "@/hooks/useDesktopIconDrag";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];
const TRASH_ICON_SRC = "/images/trash-bin-icon.png";

export default function RecycleBinIcon({
  left: baseLeft,
  top: baseTop,
  width = 76,
  height = 96,
  iconId = "trashIcon",
  stageRef,
  onActivate,
  onFocus,
  onOffsetChange,
  zIndex = 14,
  parallaxShift = { x: 0, y: 0 },
  delay = 0,
}) {
  const iconH = Math.round(width * 0.82);

  const drag = useDesktopIconDrag({
    iconId,
    baseLeft,
    baseTop,
    width,
    height,
    stageRef,
    onFocus,
    onOffsetChange,
  });

  const parallax = drag.isDragging ? { x: 0, y: 0 } : parallaxShift;

  return (
    <motion.button
      type="button"
      data-cursor="hover"
      aria-label="Recycle Bin"
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onClick={() => {
        if (drag.consumeClickIfDragged()) return;
        playClick();
        onFocus?.();
        onActivate?.();
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: 1,
        scale: drag.isDragging ? 1.05 : 1,
      }}
      transition={{ duration: drag.isDragging ? 0.08 : 0.32, delay, ease: EASE }}
      style={{
        position: "absolute",
        left: drag.left,
        top: drag.top,
        width,
        zIndex: drag.isDragging ? zIndex + 20 : zIndex,
        margin: 0,
        padding: "4px 2px 6px",
        border: "none",
        background: drag.isDragging
          ? "rgba(255, 122, 41, 0.12)"
          : "rgba(10, 6, 4, 0.94)",
        borderRadius: 2,
        cursor: drag.isDragging ? "grabbing" : "grab",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
        boxShadow: drag.isDragging
          ? "0 10px 28px rgba(0,0,0,0.45)"
          : "0 4px 16px rgba(0,0,0,0.4)",
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
