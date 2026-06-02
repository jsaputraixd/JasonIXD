"use client";

import {
  memo,
  useCallback,
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
import { projectCarouselThumbSrc } from "@/lib/projectMedia";
import { projectHeroTransitionName } from "@/lib/viewTransition";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function wrapIndex(idx, count) {
  return ((idx % count) + count) % count;
}

function relativeOffset(i, center, count) {
  let d = i - center;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

function preloadCarouselImages() {
  featuredProjects.forEach((p, i) => {
    const src = p.thumb ?? p.caseStudyHero;
    if (!src) return;
    const url = projectCarouselThumbSrc(src);
    const img = new Image();
    img.decoding = "async";
    if (i === 0) img.fetchPriority = "high";
    img.src = url;
  });
}

const CarouselCard = memo(function CarouselCard({
  project,
  index,
  rel,
  metrics,
  dragging,
  reduceMotion,
  isCenter,
}) {
  const absRel = Math.abs(rel);
  const x = rel * metrics.spacing;
  const opacity = isCenter ? 1 : absRel < 0.85 ? 0.72 : 0.45;
  const scale = isCenter ? 1 : absRel < 0.85 ? 0.9 : 0.82;
  const zIndex = 20 - Math.round(absRel * 10);
  const heroSrc = project.thumb ?? project.caseStudyHero;

  return (
    <div
      className={
        isCenter
          ? "mobile-cover-card mobile-cover-card--center"
          : "mobile-cover-card"
      }
      style={{
        width: metrics.cardW,
        height: metrics.cardH,
        transform: `translate3d(calc(-50% + ${x}px), -50%, 0) scale(${scale})`,
        opacity,
        zIndex,
        pointerEvents: isCenter ? "auto" : "none",
        transition:
          dragging || reduceMotion
            ? "none"
            : `transform 0.32s ${EASE}, opacity 0.22s ${EASE}`,
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
          border: `1px solid rgba(255, 122, 41, ${isCenter ? 0.6 : 0.35})`,
          boxShadow: isCenter
            ? "0 10px 28px rgba(0, 0, 0, 0.5)"
            : "0 6px 18px rgba(0, 0, 0, 0.4)",
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
            viewTransitionName:
              isCenter && !dragging
                ? projectHeroTransitionName(project.slug)
                : undefined,
          }}
        >
          {heroSrc ? (
            <ProjectCardHeroImage
              src={heroSrc}
              variant="carousel"
              loading={absRel <= 1 ? "eager" : "lazy"}
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
                "linear-gradient(180deg, rgba(12,8,6,0.1) 0%, rgba(8,5,4,0.45) 100%)",
            }}
          />
        </div>
      </ProjectViewLink>
    </div>
  );
});

export default function MobileOrbitCarousel({
  activeIdx: controlledIdx,
  onActiveChange,
}) {
  const count = featuredProjects.length;
  const reduceMotion = useReducedMotion();

  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const rafRef = useRef(0);
  const pendingDragPxRef = useRef(0);
  const [internalIdx, setInternalIdx] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const activeIdx = controlledIdx ?? internalIdx;

  const setActiveIdx = useCallback(
    (idx) => {
      const wrapped = wrapIndex(idx, count);
      if (onActiveChange) onActiveChange(wrapped);
      else setInternalIdx(wrapped);
    },
    [count, onActiveChange]
  );

  useLayoutEffect(() => {
    preloadCarouselImages();
  }, []);

  const metrics = useMemo(() => {
    if (typeof window === "undefined") {
      return { cardW: 260, cardH: 200, spacing: 200 };
    }
    const vw = window.innerWidth;
    const cardW = Math.min(Math.round(vw * 0.72), 300);
    const cardH = Math.round(cardW * 0.8);
    return {
      cardW,
      cardH,
      spacing: Math.round(cardW * 0.62),
    };
  }, []);

  const goToIndex = useCallback(
    (idx) => {
      playClick();
      setDragPx(0);
      setActiveIdx(wrapIndex(idx, count));
    },
    [count, setActiveIdx]
  );

  const scheduleDragPx = useCallback((px) => {
    pendingDragPxRef.current = px;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setDragPx(pendingDragPxRef.current);
    });
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startIdx: activeIdx,
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
    [activeIdx]
  );

  const onPointerMove = useCallback(
    (e) => {
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

      scheduleDragPx(dx);
    },
    [scheduleDragPx]
  );

  const endDrag = useCallback(
    (e) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== e.pointerId) return;
      dragRef.current = null;
      setDragging(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
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
      const nextIdx = wrapIndex(
        d.startIdx + Math.round(-dx / metrics.spacing),
        count
      );
      setActiveIdx(nextIdx);
      setDragPx(0);
    },
    [count, metrics.spacing, setActiveIdx]
  );

  const dragStartIdx = dragging && dragRef.current ? dragRef.current.startIdx : activeIdx;
  const centerFloat = dragStartIdx - dragPx / metrics.spacing;
  const displayIdx = dragging
    ? wrapIndex(dragStartIdx + Math.round(-dragPx / metrics.spacing), count)
    : activeIdx;

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        ref={stageRef}
        className={dragging ? "mobile-cover-stage mobile-cover-stage--dragging" : "mobile-cover-stage"}
        role="region"
        aria-roledescription="carousel"
        aria-label="Selected projects — swipe to browse"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {featuredProjects.map((p, i) => {
          const rel = relativeOffset(i, centerFloat, count);
          if (Math.abs(rel) > 1.05) return null;

          const isCenter = Math.abs(rel) < 0.35;

          return (
            <CarouselCard
              key={p.id}
              project={p}
              index={i}
              rel={rel}
              metrics={metrics}
              dragging={dragging}
              reduceMotion={reduceMotion}
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
          gap: 12,
          padding: "0 16px 8px",
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
          {String(displayIdx + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} aria-hidden>
          {featuredProjects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="mobile-carousel-dot"
              aria-label={`Go to ${p.title}`}
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
                cursor: "pointer",
                transition: "width 0.2s ease, background 0.2s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
