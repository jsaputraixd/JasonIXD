"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useDesktopIconDrag } from "@/hooks/useDesktopIconDrag";
import { runCoffeeRevealPhysics } from "@/lib/coffeeRevealPhysics";
import { playClick } from "@/lib/typingSound";

export const COFFEE_ICON_ID = "coffeeIcon";

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
  const [revealPos, setRevealPos] = useState(null);
  const [revealActive, setRevealActive] = useState(false);
  const cancelPhysicsRef = useRef(null);
  const revealStartedRef = useRef(false);
  const commitOffsetRef = useRef(null);
  const onRevealCompleteRef = useRef(onRevealComplete);
  onRevealCompleteRef.current = onRevealComplete;

  const { commitOffset, ...dragHandlers } = useDesktopIconDrag({
    iconId: COFFEE_ICON_ID,
    baseLeft,
    baseTop,
    width,
    height,
    stageRef,
    onFocus,
    onOffsetChange,
  });

  const drag = { commitOffset, ...dragHandlers };
  commitOffsetRef.current = commitOffset;

  useLayoutEffect(() => {
    if (!playReveal) {
      revealStartedRef.current = false;
      return;
    }
    if (revealStartedRef.current) return;
    revealStartedRef.current = true;

    cancelPhysicsRef.current?.();

    const commit = commitOffsetRef.current;
    if (!commit) return;

    if (reduceMotion) {
      commit({ dx: 0, dy: 0 });
      setRevealActive(false);
      setRevealPos(null);
      onRevealCompleteRef.current?.();
      return;
    }

    commit({ dx: 0, dy: 0 });

    const spawn = { left: spawnFrom.left, top: spawnFrom.top };

    setRevealActive(true);
    setRevealPos(spawn);

    const stage = stageRef?.current?.getBoundingClientRect();
    const stageWidth = stage?.width ?? window.innerWidth;
    const stageHeight = stage?.height ?? window.innerHeight;

    cancelPhysicsRef.current = runCoffeeRevealPhysics({
      spawn,
      bounds: { width, height, stageWidth, stageHeight },
      onFrame: setRevealPos,
      onComplete: (final) => {
        commitOffsetRef.current?.({
          dx: Math.round(final.left - baseLeft),
          dy: Math.round(final.top - baseTop),
        });
        setRevealActive(false);
        setRevealPos(null);
        onRevealCompleteRef.current?.();
      },
    });

    return () => cancelPhysicsRef.current?.();
  }, [
    playReveal,
    reduceMotion,
    baseLeft,
    baseTop,
    spawnFrom.left,
    spawnFrom.top,
    width,
    height,
    stageRef,
  ]);

  const parallax = drag.isDragging || revealActive ? { x: 0, y: 0 } : parallaxShift;
  const left = revealPos?.left ?? drag.left;
  const top = revealPos?.top ?? drag.top;
  const canDrag = !revealActive;

  return (
    <button
      type="button"
      data-cursor="hover"
      className={
        selected
          ? "desktop-coffee-icon desktop-coffee-icon--selected"
          : "desktop-coffee-icon"
      }
      aria-label="Open coffee snake game"
      title="coffee_snake.exe"
      onPointerDown={canDrag ? drag.onPointerDown : undefined}
      onPointerMove={canDrag ? drag.onPointerMove : undefined}
      onPointerUp={canDrag ? drag.onPointerUp : undefined}
      onPointerCancel={canDrag ? drag.onPointerCancel : undefined}
      onClick={() => {
        if (!canDrag || drag.consumeClickIfDragged()) return;
        playClick();
        onFocus?.();
        onOpen?.();
      }}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        zIndex: drag.isDragging ? zIndex + 20 : zIndex,
        cursor: revealActive ? "default" : drag.isDragging ? "grabbing" : "grab",
        pointerEvents: revealActive ? "none" : "auto",
        visibility: playReveal && !revealPos && !revealActive ? "hidden" : "visible",
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
    </button>
  );
}
