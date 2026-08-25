"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import { useDesktopIconDrag } from "@/hooks/useDesktopIconDrag";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];

/**
 * Classic desktop folder icon — image on top, label underneath.
 */
export default function DesktopFolderIcon({
  label,
  iconSrc,
  left: baseLeft,
  top: baseTop,
  width = 76,
  height = 96,
  iconId = "otherStuffIcon",
  stageRef,
  onOpen,
  onFocus,
  onOffsetChange,
  zIndex = 14,
  parallaxDepth = 0,
  /** @deprecated Prefer parallaxDepth. */
  parallaxShift,
  delay = 0,
  selected = false,
  interactive = true,
  windowOpen = false,
  windowMinimized = false,
}) {
  const iconH = Math.round(width * 0.82);
  const lastActivateRef = useRef(0);

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

  const actionLabel = !windowOpen
    ? "Open"
    : windowMinimized
      ? "Restore"
      : "Close";

  const activate = () => {
    if (!interactive) return;
    const now = Date.now();
    // A double-click fires two clicks; don't open then immediately close.
    if (now - lastActivateRef.current < 280) return;
    lastActivateRef.current = now;
    playClick();
    onFocus?.();
    onOpen?.();
  };

  return (
    <motion.button
      type="button"
      data-cursor="hover"
      aria-label={`${actionLabel} ${label}`}
      disabled={!interactive}
      onPointerDown={interactive ? drag.onPointerDown : undefined}
      onPointerMove={interactive ? drag.onPointerMove : undefined}
      onPointerUp={interactive ? drag.onPointerUp : undefined}
      onPointerCancel={interactive ? drag.onPointerCancel : undefined}
      onClick={() => {
        if (!interactive) return;
        if (drag.consumeClickIfDragged()) return;
        activate();
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
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
        height,
        zIndex: drag.isDragging ? zIndex + 20 : zIndex,
        margin: 0,
        padding: "4px 2px 6px",
        border: "none",
        background: selected
          ? "rgba(255, 122, 41, 0.14)"
          : drag.isDragging
            ? "rgba(255, 122, 41, 0.12)"
            : "transparent",
        pointerEvents: interactive ? "auto" : "none",
        borderRadius: 2,
        cursor: drag.isDragging ? "grabbing" : "grab",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transform: drag.isDragging
          ? undefined
          : parallaxShift
            ? `translate3d(${parallaxShift.x}px, ${parallaxShift.y}px, 0)`
            : parallaxDepth
              ? `translate3d(calc(var(--desk-px, 0) * ${-parallaxDepth} * 1px), calc(var(--desk-py, 0) * ${-parallaxDepth * 0.78} * 1px), 0)`
              : undefined,
        transition: "background 140ms ease",
        boxShadow: drag.isDragging
          ? "0 10px 28px rgba(0,0,0,0.45)"
          : undefined,
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
          width: "100%",
          minHeight: 28,
          display: "block",
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
