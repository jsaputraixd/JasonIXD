"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import { featuredProjects } from "@/data/projects";
import {
  PROJECT_CARD_GRADIENTS,
  ProjectCardHeroImage,
} from "@/components/ProjectFlipCard";
import ProjectViewLink from "@/components/ProjectViewLink";
import { projectCarouselThumbSrc, resolveProjectCarouselSrc } from "@/lib/projectMedia";
import { projectHeroTransitionName } from "@/lib/viewTransition";
import { playClick } from "@/lib/typingSound";

export const MOBILE_CAROUSEL_TRANSITION_MS = 560;
export const MOBILE_CAROUSEL_EASE_BEZIER = [0.42, 0, 0.58, 1];
export const MOBILE_CAROUSEL_EASE = `cubic-bezier(${MOBILE_CAROUSEL_EASE_BEZIER.join(", ")})`;

const ACCENT = "#FF7A29";
const SWIPE_THRESHOLD = 48;

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

function roleFromRel(rel) {
  if (Math.abs(rel) < 0.45) return "center";
  if (rel > 0.45 && rel < 1.55) return "right";
  if (rel < -0.45 && rel > -1.55) return "left";
  return null;
}

function layoutForRole(role, metrics, dragOffsetX = 0) {
  const { stageW, cardW, cardH } = metrics;
  const layouts = {
    center: {
      x: dragOffsetX,
      y: 0,
      scale: 1,
      blur: 0,
      opacity: 1,
      z: 20,
      w: cardW,
      h: cardH,
    },
    left: {
      x: -stageW * 0.34 + dragOffsetX * 0.25,
      y: 16,
      scale: 0.5,
      opacity: 0.72,
      z: 10,
      w: cardW * 0.56,
      h: cardH * 0.56,
    },
    right: {
      x: stageW * 0.34 + dragOffsetX * 0.25,
      y: 16,
      scale: 0.5,
      opacity: 0.72,
      z: 10,
      w: cardW * 0.56,
      h: cardH * 0.56,
    },
  };
  return layouts[role];
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
  animate,
  isCenter,
}) {
  const heroSrc = resolveProjectCarouselSrc(project);
  const transition = animate
    ? `transform ${MOBILE_CAROUSEL_TRANSITION_MS}ms ${MOBILE_CAROUSEL_EASE}, opacity ${MOBILE_CAROUSEL_TRANSITION_MS}ms ${MOBILE_CAROUSEL_EASE}`
    : "none";

  return (
    <div
      className={
        isCenter
          ? "mobile-cover-card mobile-cover-card--center"
          : "mobile-cover-card"
      }
      style={{
        width: layout.w,
        height: layout.h,
        transform: `translate3d(calc(-50% + ${layout.x}px), calc(-50% + ${layout.y}px), 0) scale(${layout.scale})`,
        opacity: layout.opacity,
        zIndex: layout.z,
        pointerEvents: isCenter ? "auto" : "none",
        transition,
      }}
    >
      <ProjectViewLink
        href={`/work/${project.slug}`}
        prefetch={isCenter}
        className="mobile-project-card"
        aria-label={`Open case study: ${project.title}`}
        onClick={() => playClick()}
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 3,
          border: `1px solid rgba(255, 122, 41, ${isCenter ? 0.62 : 0.32})`,
          boxShadow: isCenter
            ? "0 12px 32px rgba(0, 0, 0, 0.52)"
            : "0 6px 16px rgba(0, 0, 0, 0.38)",
          textDecoration: "none",
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
      </ProjectViewLink>
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
  const animTimerRef = useRef(0);
  const [internalIdx, setInternalIdx] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const activeIdx = controlledIdx ?? internalIdx;

  const setActiveIdx = useCallback(
    (idx) => {
      const wrapped = wrapIndex(idx, count);
      if (onActiveChange) onActiveChange(wrapped);
      else setInternalIdx(wrapped);
    },
    [count, onActiveChange]
  );

  const startAnimationLock = useCallback(() => {
    setIsAnimating(true);
    window.clearTimeout(animTimerRef.current);
    animTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
    }, reduceMotion ? 80 : MOBILE_CAROUSEL_TRANSITION_MS);
  }, [reduceMotion]);

  useLayoutEffect(() => {
    preloadCarouselNeighbors(activeIdx);
  }, [activeIdx]);

  useEffect(() => {
    return () => window.clearTimeout(animTimerRef.current);
  }, []);

  const metrics = useMemo(() => {
    if (typeof window === "undefined") {
      return { stageW: 320, cardW: 260, cardH: 208 };
    }
    const vw = window.innerWidth;
    const stageW = Math.min(vw - 32, 360);
    const cardW = Math.min(Math.round(vw * 0.68), 280);
    const cardH = Math.round(cardW * 0.8);
    return { stageW, cardW, cardH };
  }, []);

  const navigate = useCallback(
    (direction) => {
      if (isAnimating) return;
      playClick();
      startAnimationLock();
      setDragPx(0);
      setActiveIdx(
        direction === "next" ? activeIdx + 1 : activeIdx - 1
      );
    },
    [activeIdx, isAnimating, setActiveIdx, startAnimationLock]
  );

  const goToIndex = useCallback(
    (idx) => {
      const wrapped = wrapIndex(idx, count);
      if (isAnimating || wrapped === activeIdx) return;
      playClick();
      startAnimationLock();
      setDragPx(0);
      setActiveIdx(wrapped);
    },
    [activeIdx, count, isAnimating, setActiveIdx, startAnimationLock]
  );

  const onPointerDown = useCallback(
    (e) => {
      if (isAnimating) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        axis: null,
      };
      setDragPx(0);
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [isAnimating]
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

    setDragPx(dx);
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
        setDragPx(0);
        return;
      }

      const dx = e.clientX - d.startX;
      setDragPx(0);
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        navigate(dx < 0 ? "next" : "prev");
      }
    },
    [navigate]
  );

  const centerFloat = activeIdx - dragPx / (metrics.stageW * 0.45);
  const animate = !dragging && !reduceMotion;

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
        aria-label="Selected projects — swipe or use arrows"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="mobile-cover-watermark" aria-hidden>
          WORK
        </div>

        {featuredProjects.map((p, i) => {
          const rel = relativeOffset(i, centerFloat, count);
          const role = roleFromRel(rel);
          if (!role) return null;

          const layout = layoutForRole(
            role,
            metrics,
            dragging ? dragPx : 0
          );
          const isCenter = role === "center";

          return (
            <CarouselCard
              key={p.id}
              project={p}
              index={i}
              layout={layout}
              animate={animate}
              isCenter={isCenter}
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
