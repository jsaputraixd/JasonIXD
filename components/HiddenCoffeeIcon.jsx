"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useThrowableCoffeeIcon } from "@/hooks/useThrowableCoffeeIcon";
import { playClick } from "@/lib/typingSound";

export const COFFEE_ICON_ID = "coffeeIcon";

/** Only mounted after the 5th recycle-bin click. */
export default function HiddenCoffeeIcon({
  baseLeft,
  baseTop,
  binBounds,
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
  const revealStartedRef = useRef(false);
  const onRevealCompleteRef = useRef(onRevealComplete);
  onRevealCompleteRef.current = onRevealComplete;
  const [awaitingLaunch, setAwaitingLaunch] = useState(playReveal);

  const coffee = useThrowableCoffeeIcon({
    iconId: COFFEE_ICON_ID,
    baseLeft,
    baseTop,
    width,
    height,
    stageRef,
    onFocus,
    onOffsetChange,
  });

  const launchFromBinRef = useRef(coffee.launchFromBin);
  launchFromBinRef.current = coffee.launchFromBin;
  const snapToRef = useRef(coffee.snapTo);
  snapToRef.current = coffee.snapTo;

  useLayoutEffect(() => {
    if (!playReveal) {
      revealStartedRef.current = false;
      setAwaitingLaunch(false);
      return;
    }
    if (revealStartedRef.current) return;
    revealStartedRef.current = true;
    setAwaitingLaunch(true);

    if (reduceMotion) {
      setAwaitingLaunch(false);
      snapToRef.current?.(baseLeft, baseTop, 0);
      onRevealCompleteRef.current?.();
      return;
    }

    const ejectTimer = window.setTimeout(() => {
      setAwaitingLaunch(false);
      launchFromBinRef.current?.({
        binLeft: binBounds.left,
        binTop: binBounds.top,
        binWidth: binBounds.width,
      });
    }, 160);

    const doneTimer = window.setTimeout(() => {
      onRevealCompleteRef.current?.();
    }, 3600);

    return () => {
      window.clearTimeout(ejectTimer);
      window.clearTimeout(doneTimer);
    };
  }, [
    playReveal,
    reduceMotion,
    baseLeft,
    baseTop,
    binBounds.left,
    binBounds.top,
    binBounds.width,
  ]);

  const isActive = coffee.isDragging || coffee.isFlying;
  const parallax = isActive ? { x: 0, y: 0 } : parallaxShift;
  const canInteract = !coffee.isFlying;

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
      onPointerDown={canInteract ? coffee.onPointerDown : undefined}
      onClick={() => {
        if (!canInteract || coffee.consumeClickIfThrown()) return;
        playClick();
        onFocus?.();
        onOpen?.();
      }}
      style={{
        position: "absolute",
        left: coffee.left,
        top: coffee.top,
        width,
        height,
        zIndex: coffee.isDragging ? zIndex + 20 : zIndex,
        cursor: coffee.isFlying
          ? "default"
          : coffee.isDragging
            ? "grabbing"
            : "grab",
        pointerEvents: coffee.isFlying ? "none" : "auto",
        visibility: awaitingLaunch ? "hidden" : "visible",
      }}
    >
      <span
        className={
          coffee.isDragging
            ? "desktop-coffee-icon__inner desktop-coffee-icon__inner--held"
            : coffee.isFlying
              ? "desktop-coffee-icon__inner desktop-coffee-icon__inner--flying"
              : "desktop-coffee-icon__inner"
        }
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) rotate(${coffee.rotation}deg)`,
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
