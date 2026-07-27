"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import { featuredProjects } from "@/data/projects";
import {
  PROJECT_CARD_GRADIENTS,
  ProjectCardHeroImage,
} from "@/components/ProjectFlipCard";
import { projectCarouselThumbSrc, resolveProjectCarouselSrc } from "@/lib/projectMedia";
import { projectHeroTransitionName } from "@/lib/viewTransition";
import { playClick } from "@/lib/typingSound";

export const MOBILE_CAROUSEL_TRANSITION_MS = 640;
export const MOBILE_CAROUSEL_EASE_BEZIER = [0.22, 1, 0.36, 1];
export const MOBILE_CAROUSEL_EASE = `cubic-bezier(${MOBILE_CAROUSEL_EASE_BEZIER.join(", ")})`;

const ACCENT = "#FF7A29";
const SWIPE_THRESHOLD = 48;
/** Radians between neighboring cards on the ring (~50°). */
const SLOT_ANGLE = 0.88;
const DEG = 180 / Math.PI;

function wrapIndex(idx, count) {
  return ((idx % count) + count) % count;
}

export function carouselDirection(from, to, count) {
  if (from === to) return 1;
  const forward = (to - from + count) % count;
  const backward = (from - to + count) % count;
  return forward <= backward ? 1 : -1;
}

function relativeOffset(i, center, count) {
  let d = i - center;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Cards sit on a 3D ring — they orbit around the center instead of
 * sliding through each other on a flat plane.
 */
function layoutFromRel(rel, metrics) {
  const { stageW, cardW, cardH } = metrics;
  const abs = Math.abs(rel);
  if (abs > 1.85) return null;

  const angle = rel * SLOT_ANGLE;
  const radius = stageW * 0.58;
  const x = Math.sin(angle) * radius;
  // Center at z=0; neighbors push back so paths arc around, not through.
  const z = (Math.cos(angle) - 1) * radius * 1.15;
  const rotateY = -angle * DEG;
  const t = clamp(abs, 0, 1);
  const scale = 1 - 0.16 * t - (abs > 1 ? (abs - 1) * 0.1 : 0);

  return {
    x,
    y: 8 * t,
    z,
    rotateY,
    scale: clamp(scale, 0.58, 1),
    opacity: clamp(1 - 0.16 * t - (abs > 1 ? (abs - 1) * 0.65 : 0), 0, 1),
    // Closer-to-center always paints in front (avoids mid-swap z fights).
    zIndex: Math.round(100 - abs * 40),
    w: cardW,
    h: cardH,
    isCenter: abs < 0.45,
  };
}

function preloadCarouselNeighbors(centerIdx) {
  const count = featuredProjects.length;
  const slots = new Set(
    [centerIdx, centerIdx - 1, centerIdx + 1].map((i) => wrapIndex(i, count))
  );
  slots.forEach((i) => {
    const p = featuredProjects[i];
    const src = resolveProjectCarouselSrc(p);
    if (!src) return;
    const url = projectCarouselThumbSrc(src);
    const img = new Image();
    img.decoding = "async";
    if (i === centerIdx) img.fetchPriority = "high";
    img.src = url;
  });
}

const CarouselCard = memo(function CarouselCard({
  project,
  index,
  layout,
  isCenter,
  onActivate,
}) {
  const heroSrc = resolveProjectCarouselSrc(project);

  return (
    <div
      className={
        isCenter
          ? "mobile-cover-card mobile-cover-card--center"
          : "mobile-cover-card mobile-cover-card--side"
      }
      role={isCenter ? undefined : "button"}
      tabIndex={isCenter ? undefined : 0}
      aria-label={isCenter ? undefined : `Focus ${project.title}`}
      onClick={
        isCenter
          ? undefined
          : (e) => {
              e.stopPropagation();
              onActivate?.(index);
            }
      }
      onKeyDown={
        isCenter
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onActivate?.(index);
              }
            }
      }
      onPointerDown={
        isCenter
          ? undefined
          : (e) => {
              e.stopPropagation();
            }
      }
      style={{
        width: layout.w,
        height: layout.h,
        transform: `translate3d(calc(-50% + ${layout.x}px), calc(-50% + ${layout.y}px), ${layout.z}px) rotateY(${layout.rotateY}deg) scale(${layout.scale})`,
        opacity: layout.opacity,
        zIndex: layout.zIndex,
        pointerEvents: "auto",
        cursor: isCenter ? "grab" : "pointer",
        // RAF drives motion — avoid CSS fighting the glide
        transition: "none",
        willChange: "transform, opacity",
      }}
    >
      <div
        className="mobile-project-card"
        aria-hidden={!isCenter}
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 3,
          border: `1px solid rgba(255, 122, 41, ${isCenter ? 0.62 : 0.38})`,
          boxShadow: isCenter
            ? "0 12px 32px rgba(0, 0, 0, 0.52)"
            : "0 6px 16px rgba(0, 0, 0, 0.38)",
          color: "inherit",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: PROJECT_CARD_GRADIENTS[index % PROJECT_CARD_GRADIENTS.length],
            viewTransitionName: isCenter ? projectHeroTransitionName(project.slug) : undefined,
          }}
        >
          {heroSrc ? (
            <ProjectCardHeroImage
              src={heroSrc}
              variant="carousel"
              loading="eager"
              fetchPriority={isCenter ? "high" : "auto"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : null}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(12,8,6,0.08) 0%, rgba(8,5,4,0.42) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
});

function CarouselNavButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      className="mobile-carousel-nav__btn"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        margin: 0,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2,
        border: "1px solid rgba(255, 180, 112, 0.55)",
        background: "rgba(10, 6, 4, 0.75)",
        color: ACCENT,
        fontFamily: "'VT323', monospace",
        fontSize: 20,
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "transform 150ms ease, background-color 150ms ease",
      }}
    >
      {children}
    </button>
  );
}

export default function MobileOrbitCarousel({
  activeIdx: controlledIdx,
  onActiveChange,
}) {
  const count = featuredProjects.length;
  const reduceMotion = useReducedMotion();

  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const rafRef = useRef(0);
  const visualCenterRef = useRef(0);
  const activeIdxRef = useRef(0);
  const dragUnitRef = useRef(144);

  const [internalIdx, setInternalIdx] = useState(0);
  const [visualCenter, setVisualCenter] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const activeIdx = controlledIdx ?? internalIdx;
  activeIdxRef.current = activeIdx;

  const setActiveIdx = useCallback(
    (idx) => {
      const wrapped = wrapIndex(idx, count);
      if (onActiveChange) onActiveChange(wrapped);
      else setInternalIdx(wrapped);
    },
    [count, onActiveChange]
  );

  const stopRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  /** Glide visualCenter from current float → integer target (no snap). */
  const animateCenterTo = useCallback(
    (target, { from } = {}) => {
      stopRaf();
      const start = from ?? visualCenterRef.current;
      const end = target;
      const duration = reduceMotion ? 0 : MOBILE_CAROUSEL_TRANSITION_MS;
      const wrappedEnd = wrapIndex(Math.round(end), count);

      setIsAnimating(true);
      setActiveIdx(wrappedEnd);

      if (duration <= 0 || Math.abs(end - start) < 0.001) {
        visualCenterRef.current = wrappedEnd;
        setVisualCenter(wrappedEnd);
        setIsAnimating(false);
        return;
      }

      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        const v = start + (end - start) * easeOutCubic(t);
        visualCenterRef.current = v;
        setVisualCenter(v);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          visualCenterRef.current = wrappedEnd;
          setVisualCenter(wrappedEnd);
          setIsAnimating(false);
          rafRef.current = 0;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [count, reduceMotion, setActiveIdx, stopRaf]
  );

  useLayoutEffect(() => {
    preloadCarouselNeighbors(activeIdx);
  }, [activeIdx]);

  useEffect(() => {
    return () => stopRaf();
  }, [stopRaf]);

  // Keep visual center in sync if parent controls index externally
  useEffect(() => {
    if (dragging || isAnimating) return;
    const current = wrapIndex(Math.round(visualCenterRef.current), count);
    if (current !== activeIdx) {
      visualCenterRef.current = activeIdx;
      setVisualCenter(activeIdx);
    }
  }, [activeIdx, count, dragging, isAnimating]);

  const [metrics, setMetrics] = useState({
    stageW: 320,
    cardW: 260,
    cardH: 208,
  });

  useLayoutEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const stageW = Math.min(vw - 32, 360);
      const cardW = Math.min(Math.round(vw * 0.68), 280);
      const cardH = Math.round(cardW * 0.8);
      dragUnitRef.current = stageW * 0.45;
      setMetrics((prev) =>
        prev.stageW === stageW && prev.cardW === cardW && prev.cardH === cardH
          ? prev
          : { stageW, cardW, cardH }
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  const navigate = useCallback(
    (direction) => {
      if (isAnimating) return;
      playClick();
      const from = visualCenterRef.current;
      const base = Math.round(from);
      const end = direction === "next" ? base + 1 : base - 1;
      animateCenterTo(end, { from });
    },
    [animateCenterTo, isAnimating]
  );

  const goToIndex = useCallback(
    (idx) => {
      const wrapped = wrapIndex(idx, count);
      if (isAnimating || wrapped === wrapIndex(Math.round(visualCenterRef.current), count)) {
        return;
      }
      playClick();
      const from = visualCenterRef.current;
      const current = wrapIndex(Math.round(from), count);
      const dir = carouselDirection(current, wrapped, count);
      const steps =
        dir === 1
          ? (wrapped - current + count) % count
          : -((current - wrapped + count) % count);
      animateCenterTo(Math.round(from) + steps, { from });
    },
    [animateCenterTo, count, isAnimating]
  );

  const onPointerDown = useCallback(
    (e) => {
      if (isAnimating) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stopRaf();
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originCenter: visualCenterRef.current,
        axis: null,
      };
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [isAnimating, stopRaf]
  );

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (d.axis === null) {
      if (Math.hypot(dx, dy) < 10) return;
      d.axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? "x" : "y";
      if (d.axis === "y") return;
    }
    if (d.axis !== "x") return;

    const next = d.originCenter - dx / dragUnitRef.current;
    visualCenterRef.current = next;
    setVisualCenter(next);
  }, []);

  const endDrag = useCallback(
    (e) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== e.pointerId) return;
      dragRef.current = null;
      setDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (d.axis !== "x") {
        animateCenterTo(Math.round(d.originCenter), {
          from: visualCenterRef.current,
        });
        return;
      }

      const dx = e.clientX - d.startX;
      const from = visualCenterRef.current;
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        playClick();
        const base = Math.round(d.originCenter);
        animateCenterTo(dx < 0 ? base + 1 : base - 1, { from });
      } else {
        animateCenterTo(Math.round(d.originCenter), { from });
      }
    },
    [animateCenterTo]
  );

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        ref={stageRef}
        className={
          dragging
            ? "mobile-cover-stage mobile-cover-stage--dragging"
            : "mobile-cover-stage"
        }
        role="region"
        aria-roledescription="carousel"
        aria-label="Selected projects — swipe, tap a side card, or use arrows"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="mobile-cover-watermark" aria-hidden>
          WORK
        </div>

        {featuredProjects.map((p, i) => {
          const rel = relativeOffset(i, visualCenter, count);
          const layout = layoutFromRel(rel, metrics);
          if (!layout) return null;

          return (
            <CarouselCard
              key={p.id}
              project={p}
              index={i}
              layout={layout}
              isCenter={layout.isCenter}
              onActivate={goToIndex}
            />
          );
        })}
      </div>

      <div
        className="mobile-carousel-meta"
        aria-live="polite"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "4px 12px 8px",
        }}
      >
        <CarouselNavButton
          label="Previous project"
          disabled={isAnimating}
          onClick={() => navigate("prev")}
        >
          ◀
        </CarouselNavButton>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            minWidth: 88,
          }}
        >
          <span
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 12,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: ACCENT,
              textShadow: "0 0 6px rgba(255, 122, 41, 0.4)",
            }}
          >
            {String(activeIdx + 1).padStart(2, "0")} /{" "}
            {String(count).padStart(2, "0")}
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }} aria-hidden>
            {featuredProjects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className="mobile-carousel-dot"
                aria-label={`Go to ${p.title}`}
                disabled={isAnimating}
                onClick={() => goToIndex(i)}
                style={{
                  width: i === activeIdx ? 18 : 7,
                  height: 7,
                  margin: 0,
                  padding: 0,
                  border: "none",
                  borderRadius: 1,
                  background:
                    i === activeIdx ? ACCENT : "rgba(255, 122, 41, 0.28)",
                  boxShadow:
                    i === activeIdx
                      ? "0 0 10px rgba(255, 122, 41, 0.65)"
                      : "none",
                  cursor: isAnimating ? "default" : "pointer",
                  transition: "width 0.2s ease, background 0.2s ease",
                }}
              />
            ))}
          </div>
        </div>

        <CarouselNavButton
          label="Next project"
          disabled={isAnimating}
          onClick={() => navigate("next")}
        >
          ▶
        </CarouselNavButton>
      </div>
    </div>
  );
}
