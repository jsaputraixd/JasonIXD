"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useDesktopIconDrag } from "@/hooks/useDesktopIconDrag";
import { playClick } from "@/lib/typingSound";

export const COFFEE_ICON_ID = "coffeeIcon";

const EASE_OUT = [0.22, 1.05, 0.36, 1];

function resolveSpawnPoint({ spawnFrom, baseLeft, baseTop, width, height }) {
  if (
    spawnFrom &&
    Number.isFinite(spawnFrom.left) &&
    Number.isFinite(spawnFrom.top)
  ) {
    return { left: spawnFrom.left, top: spawnFrom.top };
  }

  return { left: baseLeft, top: baseTop + Math.round(height * 0.18) };
}

/** Only mounted after the 5th recycle-bin click. */
export default function HiddenCoffeeIcon({
  baseLeft,
  baseTop,
  spawnFrom,
  width = 76,
  height = Math.round(76 * 1.26),
  stageRef,
  zIndex = 18,
  parallaxShift = { x: 0, y: 0 },
  selected = false,
  playReveal = false,
  onFocus,
  onOpen,
  onOffsetChange,
  onRevealComplete,
}) {
  const reduceMotion = useReducedMotion();

  const drag = useDesktopIconDrag({
    iconId: COFFEE_ICON_ID,
    baseLeft,
    baseTop,
    width,
    height,
    stageRef,
    onFocus,
    onOffsetChange,
  });

  const spawnPoint = useMemo(
    () => resolveSpawnPoint({ spawnFrom, baseLeft, baseTop, width, height }),
    [spawnFrom, baseLeft, baseTop, width, height]
  );

  const emergeFrom = useMemo(
    () => ({
      x: spawnPoint.left - baseLeft,
      y: spawnPoint.top - baseTop,
    }),
    [spawnPoint.left, spawnPoint.top, baseLeft, baseTop]
  );

  const shouldEmerge = playReveal && !reduceMotion;
  const parallax = drag.isDragging ? { x: 0, y: 0 } : parallaxShift;

  return (
    <motion.button
      type="button"
      data-cursor="hover"
      className={
        selected
          ? "desktop-coffee-icon desktop-coffee-icon--selected"
          : "desktop-coffee-icon"
      }
      aria-label="Open coffee snake game"
      title="coffee_snake.exe"
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onClick={() => {
        if (drag.consumeClickIfDragged()) return;
        playClick();
        onFocus?.();
        onOpen?.();
      }}
      initial={
        shouldEmerge
          ? {
              x: emergeFrom.x,
              y: emergeFrom.y,
              scale: 0.28,
              opacity: 0,
            }
          : false
      }
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      transition={{
        duration: 0.52,
        ease: EASE_OUT,
        opacity: { duration: 0.18 },
        scale: { duration: 0.46, ease: [0.34, 1.25, 0.64, 1] },
      }}
      onAnimationComplete={() => {
        if (shouldEmerge) onRevealComplete?.();
      }}
      style={{
        position: "absolute",
        left: drag.left,
        top: drag.top,
        width,
        height,
        zIndex: drag.isDragging ? zIndex + 20 : zIndex,
        cursor: drag.isDragging ? "grabbing" : "grab",
      }}
    >
      <span
        className="desktop-coffee-icon__inner"
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
        }}
      >
        <span className="desktop-coffee-icon__glyph" aria-hidden>
          ☕
        </span>
        <span className="desktop-coffee-icon__label">coffee.exe</span>
      </span>
    </motion.button>
  );
}
