"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { playClick, playDragTick, playWindowWhoosh, playWindowPickup, playWindowDrop, playWindowClose, notePointerHover } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];
/** Wait before raising a hero window that is covered by another window. */
const FEATURED_STACK_RAISE_DELAY_MS = 700;

function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function readElementZ(el) {
  const parsed = Number.parseInt(getComputedStyle(el).zIndex, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isObscuredByHigherWindow(el) {
  const stage = el.closest(".desktop-stage");
  if (!stage) return false;

  const myRect = el.getBoundingClientRect();
  const myZ = readElementZ(el);

  for (const other of stage.querySelectorAll("[data-window-id]")) {
    if (other === el) continue;
    const otherZ = readElementZ(other);
    if (otherZ <= myZ) continue;
    if (rectsOverlap(myRect, other.getBoundingClientRect())) return true;
  }
  return false;
}

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
  /** Depth in px for CSS-var parallax (`--desk-px` / `--desk-py` on the stage). */
  parallaxDepth = 0,
  /** @deprecated Prefer parallaxDepth (avoids React re-renders on mouse move). */
  parallaxShift,
  titleUppercase = true,
  uiScale = 1,
  titleBarExtra,
  /** When false, content may extend outside window bounds (e.g. hover scale on project cards). */
  clipContent = true,
  /** Scale the full chrome (title bar + body) on hover. */
  growOnHover = false,
  /** CSS-driven hover zoom for featured hero windows (no React state). */
  featuredProject = false,
  /** Marks this window as a featured project for the hover peek. */
  dataProjectSlug,
  /** Skip the floating description peek when the card plays video instead. */
  hideProjectPeek = false,
  /** Play a short whoosh when the window first appears (cascade delay respected). */
  playOpenSound = true,
  /** When false, ignore focus/drag so overlays (skills zoom) stay on top. */
  interactive = true,
}) {
  const canMinimize = minimizable ?? closable;
  const handleMinimizeCb = onMinimize ?? onClose;
  const [isHeld, setIsHeld] = useState(false);
  const [hasBeenHeld, setHasBeenHeld] = useState(false);
  const [featuredRaised, setFeaturedRaised] = useState(false);
  const rootRef = useRef(null);
  const raiseTimerRef = useRef(null);
  const dragControls = useDragControls();
  const openSoundPlayed = useRef(false);

  const clearFeaturedRaiseTimer = () => {
    if (raiseTimerRef.current == null) return;
    clearTimeout(raiseTimerRef.current);
    raiseTimerRef.current = null;
  };

  const applyFeaturedRaise = () => {
    setFeaturedRaised(true);
    onFocus?.(id);
  };

  const scheduleFeaturedRaise = () => {
    clearFeaturedRaiseTimer();
    const el = rootRef.current;
    if (!el) {
      applyFeaturedRaise();
      return;
    }
    const delay = isObscuredByHigherWindow(el)
      ? FEATURED_STACK_RAISE_DELAY_MS
      : 0;
    if (delay <= 0) {
      applyFeaturedRaise();
      return;
    }
    raiseTimerRef.current = setTimeout(() => {
      raiseTimerRef.current = null;
      applyFeaturedRaise();
    }, delay);
  };

  const resetFeaturedRaise = () => {
    clearFeaturedRaiseTimer();
    setFeaturedRaised(false);
  };

  useEffect(() => () => clearFeaturedRaiseTimer(), []);

  useEffect(() => {
    if (!playOpenSound || openSoundPlayed.current) return;
    openSoundPlayed.current = true;
    const ms = Math.max(0, delay * 1000);
    const t = setTimeout(() => playWindowWhoosh(), ms);
    return () => clearTimeout(t);
  }, [delay, playOpenSound]);

  useEffect(() => {
    if (!isHeld) return;
    const release = () => {
      setIsHeld(false);
      playWindowDrop();
    };
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
    playWindowClose();
    handleMinimizeCb?.();
  };

  const startDrag = (event) => {
    if (!interactive) return;
    event.stopPropagation();
    playWindowPickup();
    onFocus?.(id);
    setFeaturedRaised(true);
    setIsHeld(true);
    setHasBeenHeld(true);
    dragControls.start(event);
  };

  return (
    <AnimatePresence>
      {!minimized && (
        <motion.div
          key={id}
          ref={rootRef}
          data-window-id={id}
          className={[
            featuredProject ? "os-window--featured" : "",
            featuredProject && (featuredRaised || isHeld)
              ? "os-window--featured-raised"
              : "",
            isHeld ? "os-window--held" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          drag
          dragListener={false}
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={dragConstraints}
          onPointerEnter={() => {
            if (!interactive) return;
            if (featuredProject) {
              scheduleFeaturedRaise();
              return;
            }
            onFocus?.(id);
          }}
          onPointerLeave={(e) => {
            if (!featuredProject) return;
            if (
              e.relatedTarget instanceof Node &&
              e.currentTarget.contains(e.relatedTarget)
            ) {
              return;
            }
            resetFeaturedRaise();
          }}
          onPointerCancel={() => {
            if (featuredProject) resetFeaturedRaise();
          }}
          onPointerDown={() => {
            if (!interactive) return;
            playClick();
            if (featuredProject) {
              clearFeaturedRaiseTimer();
              applyFeaturedRaise();
              return;
            }
            onFocus?.(id);
          }}
          onDrag={(_e, info) => {
            const dist = Math.hypot(info.delta.x, info.delta.y);
            if (dist > 1.2) playDragTick(Math.min(1, dist / 16));
          }}
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
              : featuredProject
                ? { opacity: 1, scale: 1, rotate: 0, skewX: 0 }
                : { opacity: 1, scale: 1, rotate: 0, skewX: 0 }
          }
          transition={{
            duration: isHeld ? 0.08 : 0.16,
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
            willChange: isHeld || featuredProject ? "transform" : "auto",
            pointerEvents: interactive ? "auto" : "none",
            transformOrigin: "center center",
          }}
        >
          <div className={featuredProject ? "os-window-featured-zoom" : undefined}>
          <div
            className={[
              "os-window-shell",
              growOnHover && !featuredProject ? "os-window-grow" : "",
              isHeld ? "os-window-shell--held" : "",
              growOnHover && isHeld ? "os-window-grow--held" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-project-slug={dataProjectSlug || undefined}
            data-peek={hideProjectPeek ? "off" : undefined}
            data-sound="object"
            data-cursor="hover"
            onMouseEnter={(e) => notePointerHover(e.currentTarget)}
          >
          <div
            className="os-window-chrome"
            style={{
              position: "relative",
              zIndex: 1,
              height: height != null ? "100%" : undefined,
              display: height != null ? "flex" : undefined,
              flexDirection: height != null ? "column" : undefined,
              background: "rgba(18, 12, 8, 0.92)",
              border: "1px solid rgba(255, 122, 41, 0.55)",
              borderRadius: 3,
              boxShadow: isHeld
                ? "0 0 28px rgba(255, 122, 41, 0.22), 0 24px 56px rgba(0, 0, 0, 0.65)"
                : featuredProject
                  ? undefined
                  : "0 0 24px rgba(255, 122, 41, 0.12), 0 16px 50px rgba(0, 0, 0, 0.5)",
              color: "#ffffff",
              userSelect: "none",
              overflow: clipContent ? "hidden" : "visible",
              transform: parallaxShift
                ? `translate3d(${parallaxShift.x}px, ${parallaxShift.y}px, 0)`
                : parallaxDepth
                  ? `translate3d(calc(var(--desk-px, 0) * ${-parallaxDepth} * 1px), calc(var(--desk-py, 0) * ${-parallaxDepth * 0.78} * 1px), 0)`
                  : undefined,
            }}
          >
            {/* Title bar — only drag handle */}
            <div
              onPointerDown={startDrag}
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
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

            <div
              className={height != null ? "os-window-body os-window-body--fill" : "os-window-body"}
              style={{ position: "relative" }}
            >
              {children}
            </div>
          </div>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
