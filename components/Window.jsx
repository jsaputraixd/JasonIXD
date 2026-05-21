"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { playClick, playWindowWhoosh } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];

export default function Window({
  id,
  title,
  left = 0,
  top = 0,
  width = 360,
  height,
  minWidth,
  zIndex = 1,
  onFocus,
  /** Called when the user hits minimize (—). */
  onMinimize,
  /** @deprecated Use onMinimize */
  onClose,
  minimized = false,
  minimizable = true,
  /** @deprecated Use minimizable */
  closable = true,
  delay = 0,
  dragConstraints,
  children,
  parallaxShift = { x: 0, y: 0 },
  titleUppercase = true,
  uiScale = 1,
  titleBarExtra,
  /** When false, content may extend outside window bounds (e.g. hover scale on project cards). */
  clipContent = true,
  /** Play a short whoosh when the window first appears (cascade delay respected). */
  playOpenSound = true,
}) {
  const canMinimize = minimizable ?? closable;
  const handleMinimizeCb = onMinimize ?? onClose;
  const [isHeld, setIsHeld] = useState(false);
  const [hasBeenHeld, setHasBeenHeld] = useState(false);
  const dragControls = useDragControls();
  const openSoundPlayed = useRef(false);

  useEffect(() => {
    if (!playOpenSound || openSoundPlayed.current) return;
    openSoundPlayed.current = true;
    const ms = Math.max(0, delay * 1000);
    const t = setTimeout(() => playWindowWhoosh(), ms);
    return () => clearTimeout(t);
  }, [delay, playOpenSound]);

  useEffect(() => {
    if (!isHeld) return;
    const release = () => setIsHeld(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, [isHeld]);

  const handleMinimize = (e) => {
    e.stopPropagation();
    playClick();
    handleMinimizeCb?.();
  };

  const startDrag = (event) => {
    onFocus?.(id);
    setIsHeld(true);
    setHasBeenHeld(true);
    dragControls.start(event);
  };

  return (
    <AnimatePresence>
      {!minimized && (
        <motion.div
          key={id}
          drag
          dragListener={false}
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={dragConstraints}
          onPointerDown={() => onFocus?.(id)}
          initial={{ opacity: 0, scale: 0.94 }}
          exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.22, ease: EASE } }}
          animate={
            isHeld
              ? {
                  opacity: 1,
                  scale: 1.04,
                  rotate: -1.4,
                  skewX: 0.8,
                }
              : { opacity: 1, scale: 1, rotate: 0, skewX: 0 }
          }
          transition={{
            duration: isHeld ? 0.08 : hasBeenHeld ? 0 : 0.28,
            delay: isHeld || hasBeenHeld ? 0 : delay,
            ease: EASE,
          }}
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            minWidth,
            zIndex,
            willChange: "transform",
          }}
        >
          <div
            style={{
              background: "rgba(18, 12, 8, 0.92)",
              border: "1px solid rgba(255, 122, 41, 0.55)",
              borderRadius: 3,
              boxShadow: isHeld
                ? "0 0 28px rgba(255, 122, 41, 0.22), 0 24px 56px rgba(0, 0, 0, 0.65)"
                : "0 0 24px rgba(255, 122, 41, 0.12), 0 16px 50px rgba(0, 0, 0, 0.5)",
              color: "#ffffff",
              userSelect: "none",
              overflow: clipContent ? "hidden" : "visible",
              transform: `translate3d(${parallaxShift.x}px, ${parallaxShift.y}px, 0)`,
              willChange: "transform",
            }}
          >
            {/* Title bar — only drag handle */}
            <div
              onPointerDown={startDrag}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                boxSizing: "border-box",
                background: isHeld
                  ? "linear-gradient(to bottom, rgba(255, 122, 41, 0.42), rgba(255, 122, 41, 0.22))"
                  : "linear-gradient(to bottom, rgba(255, 122, 41, 0.18), rgba(255, 122, 41, 0.08))",
                borderBottom: "1px solid rgba(255, 122, 41, 0.45)",
                padding: `${Math.max(4, Math.round(5 * uiScale))}px ${Math.max(
                  6,
                  Math.round(10 * uiScale)
                )}px`,
                fontFamily: "'VT323', monospace",
                fontSize: Math.max(11, Math.round(13 * uiScale)),
                letterSpacing: "0.22em",
                textTransform: titleUppercase ? "uppercase" : "none",
                color: isHeld ? "#ffe2c4" : ACCENT,
                textShadow: isHeld
                  ? "0 0 10px rgba(255, 122, 41, 0.7)"
                  : "0 0 6px rgba(255, 122, 41, 0.55)",
                cursor: isHeld ? "grabbing" : "grab",
                touchAction: "none",
                transition:
                  "background 150ms ease, color 150ms ease, text-shadow 150ms ease",
              }}
            >
              <span
                style={{
                  flex: "1 1 0%",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {title}
              </span>
              {titleBarExtra ? (
                <span
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    marginLeft: Math.max(6, Math.round(8 * uiScale)),
                    pointerEvents: "auto",
                  }}
                >
                  {titleBarExtra}
                </span>
              ) : null}
              {canMinimize && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleMinimize}
                  data-cursor="hover"
                  aria-label={`Minimize ${title}`}
                  style={{
                    flexShrink: 0,
                    marginLeft: 10,
                    background: "transparent",
                    border: "none",
                    color: isHeld ? "#ffe2c4" : ACCENT,
                    fontFamily: "'VT323', monospace",
                    fontSize: Math.max(13, Math.round(16 * uiScale)),
                    lineHeight: 1,
                    cursor: "pointer",
                    padding: "0 4px",
                    textShadow: "0 0 6px rgba(255, 122, 41, 0.55)",
                  }}
                >
                  —
                </button>
              )}
            </div>

            <div style={{ position: "relative" }}>{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
