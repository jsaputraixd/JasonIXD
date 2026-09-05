"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { carouselProjects } from "@/data/projects";
import {
  PROJECT_DOCK_H,
  STATUS_BAR_RESERVE,
} from "@/lib/desktopWindowPlacement";
import ProjectFlipCard, {
  PROJECT_CARD_GRADIENTS,
} from "@/components/ProjectFlipCard";
import { playDragTick } from "@/lib/typingSound";

const DESKTOP = { cardW: 168, cardH: 96, gap: 18 };
const MOBILE = { cardW: 132, cardH: 76, gap: 14 };
/** Idle marquee speed */
const AUTO_PX_PER_SEC = 52;
const RESUME_IDLE_MS = 1400;
const SOUND_EVERY_PX = 30;

function DockSet({ items, cardW, cardH, gap, scale, copy }) {
  return (
    <div className="project-dock__set" style={{ gap }} aria-hidden={copy}>
      {items.map((project, i) => (
        <div
          key={`${copy ? "b" : "a"}-${project.slug}`}
          className="project-dock__item"
          data-project-slug={project.slug}
          data-peek-placement="above"
          style={{ width: cardW }}
        >
          <span className="project-dock__name">{project.title}</span>
          <div
            className="project-dock__card"
            style={{ width: cardW, height: cardH }}
          >
            <ProjectFlipCard
              project={project}
              gradient={
                PROJECT_CARD_GRADIENTS[i % PROJECT_CARD_GRADIENTS.length]
              }
              layoutScale={scale}
              frameWidth={cardW}
              frameHeight={cardH}
              hoverScale={false}
              loading="lazy"
              shareHeroTransition={!copy}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProjectDockCarousel({
  leftInset = 0,
  layoutScale = 1,
  variant = "desktop",
}) {
  const reduceMotion = useReducedMotion();
  const maskRef = useRef(null);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const pauseUntilRef = useRef(0);
  const draggingRef = useRef(false);
  const soundMarkRef = useRef(0);
  const items = carouselProjects;

  const isMobile = variant === "mobile";
  const dims = isMobile ? MOBILE : DESKTOP;
  const scale = isMobile
    ? 1
    : Math.min(1, Math.max(0.82, layoutScale));
  const cardW = Math.round(dims.cardW * scale);
  const cardH = Math.round(dims.cardH * scale);
  const gap = Math.round(dims.gap * scale);

  useEffect(() => {
    const mask = maskRef.current;
    const track = trackRef.current;
    if (!mask || !track || !items.length) return undefined;

    let raf = 0;
    let last = performance.now();

    const loopWidth = () => {
      // Two identical sets — one set is half the track
      return track.scrollWidth / 2;
    };

    const apply = () => {
      const half = loopWidth();
      if (half <= 0) return;
      let x = offsetRef.current;
      // Keep offset in [0, half)
      x = ((x % half) + half) % half;
      offsetRef.current = x;
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
    };

    const pause = (ms = RESUME_IDLE_MS) => {
      pauseUntilRef.current = performance.now() + ms;
    };

    const playScrollSound = (dx) => {
      const acc = (soundMarkRef.current || 0) + Math.abs(dx);
      if (acc >= SOUND_EVERY_PX) {
        soundMarkRef.current = acc % SOUND_EVERY_PX;
        playDragTick(Math.min(1, Math.abs(dx) / 36));
      } else {
        soundMarkRef.current = acc;
      }
    };

    const onWheel = (e) => {
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (!delta) return;
      e.preventDefault();
      pause();
      offsetRef.current += delta;
      apply();
      playScrollSound(delta);
    };

    const onPointerDown = (e) => {
      // Only primary button / touch / pen
      if (e.pointerType === "mouse" && e.button !== 0) return;
      draggingRef.current = true;
      pause(120_000);
      const startX = e.clientX;
      const startOffset = offsetRef.current;
      let moved = false;

      const onMove = (ev) => {
        const dx = startX - ev.clientX;
        if (Math.abs(dx) > 3) moved = true;
        const prev = offsetRef.current;
        offsetRef.current = startOffset + dx;
        apply();
        playScrollSound(offsetRef.current - prev);
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        draggingRef.current = false;
        pause();
        if (moved) {
          const block = (clickEv) => {
            clickEv.preventDefault();
            clickEv.stopPropagation();
            mask.removeEventListener("click", block, true);
          };
          mask.addEventListener("click", block, true);
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    mask.addEventListener("wheel", onWheel, { passive: false });
    mask.addEventListener("pointerdown", onPointerDown);

    apply();

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, Math.max(0, now - last));
      last = now;
      if (reduceMotion) return;
      if (dt <= 0 || document.hidden || draggingRef.current) return;
      if (now < pauseUntilRef.current) return;
      const half = loopWidth();
      // Content may still be measuring on first frames
      if (!(half > 8)) return;

      const step = (AUTO_PX_PER_SEC * dt) / 1000;
      offsetRef.current += step;
      apply();
      playScrollSound(step);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => apply();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      mask.removeEventListener("wheel", onWheel);
      mask.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [reduceMotion, items.length, cardW, gap]);

  if (!items.length) return null;

  const track = (
    <div
      ref={maskRef}
      className="project-dock__mask project-dock__mask--scroll"
      tabIndex={0}
      role="region"
      aria-label="Scroll project carousel"
    >
      <div
        ref={trackRef}
        className="project-dock__track project-dock__track--scroll"
        style={{ "--dock-gap": `${gap}px` }}
      >
        <DockSet
          items={items}
          cardW={cardW}
          cardH={cardH}
          gap={gap}
          scale={scale}
          copy={false}
        />
        <DockSet
          items={items}
          cardW={cardW}
          cardH={cardH}
          gap={gap}
          scale={scale}
          copy
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <nav
        className="project-dock project-dock--mobile"
        aria-label="More case studies"
      >
        {track}
      </nav>
    );
  }

  return (
    <nav
      className="project-dock"
      aria-label="More projects"
      style={{
        position: "absolute",
        left: leftInset,
        right: 12,
        bottom: STATUS_BAR_RESERVE,
        height: PROJECT_DOCK_H,
        zIndex: 28,
      }}
    >
      {track}
    </nav>
  );
}
