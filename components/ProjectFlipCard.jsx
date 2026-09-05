"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projectCardThumbSrc, projectCarouselThumbSrc } from "@/lib/projectMedia";
import { DESKTOP_PROJECT_CARD_ASPECT } from "@/lib/projectDesktopCards";
import { PROJECT_CARD_TEASERS } from "@/lib/projectCardVideos";
import { playClick, notePointerHover } from "@/lib/typingSound";
import ProjectHeroTeaser from "@/components/ProjectHeroTeaser";
import KitsCardPhones from "@/components/KitsCardPhones";

/** Per-project crop so wordmarks land in the card instead of getting clipped. */
const PROJECT_CARD_CROP = {};

export const PROJECT_CARD_GRADIENTS = [
  "linear-gradient(135deg, #4a1f0a 0%, #1a0a05 60%, #0a0505 100%)",
  "linear-gradient(135deg, #4a2818 0%, #1f0e08 60%, #0a0505 100%)",
  "linear-gradient(135deg, #4a3010 0%, #221305 60%, #0a0505 100%)",
  "linear-gradient(135deg, #3a3518 0%, #181505 60%, #0a0505 100%)",
  "linear-gradient(135deg, #2a2840 0%, #121018 60%, #0a0505 100%)",
  "linear-gradient(135deg, #1a3040 0%, #0a1520 60%, #0a0505 100%)",
];

export function ProjectCardHeroImage({
  src,
  style,
  loading = "lazy",
  fetchPriority,
  variant = "card",
}) {
  const [displaySrc, setDisplaySrc] = useState(() =>
    variant === "carousel" ? projectCarouselThumbSrc(src) : projectCardThumbSrc(src)
  );

  useEffect(() => {
    setDisplaySrc(
      variant === "carousel"
        ? projectCarouselThumbSrc(src)
        : projectCardThumbSrc(src)
    );
  }, [src, variant]);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={displaySrc}
      alt=""
      aria-hidden
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      style={style}
      onError={() => {
        const fallback = encodeURI(src);
        if (displaySrc !== fallback) setDisplaySrc(fallback);
      }}
    />
  );
}

export default function ProjectFlipCard({
  project,
  gradient,
  layoutScale = 1,
  frameWidth,
  frameHeight,
  aspectRatio = DESKTOP_PROJECT_CARD_ASPECT,
  onRequestFocus,
  hoverFocusDelayMs = 0,
  hoverScale = true,
  loading = "lazy",
  motionPreview = false,
}) {
  const aspect = aspectRatio ?? DESKTOP_PROJECT_CARD_ASPECT;
  const fluid = frameWidth == null && frameHeight == null;
  const innerW = frameWidth ?? 268;
  const cardH = frameHeight ?? Math.round(innerW / aspect);

  const heroSrc = project.thumb ?? project.caseStudyHero ?? null;
  const crop = PROJECT_CARD_CROP[project.slug] ?? null;
  const teaser = motionPreview ? PROJECT_CARD_TEASERS[project.slug] : null;
  const kitsPhones = motionPreview && project.slug === "kits";
  const [previewHot, setPreviewHot] = useState(false);
  const hoverTimerRef = useRef(null);
  const previewTimerRef = useRef(null);
  /** Featured motion: start after expand + blur have begun. */
  const previewDelayMs = motionPreview ? 250 : 0;

  const clearHoverTimer = () => {
    if (hoverTimerRef.current == null) return;
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  };

  const clearPreviewTimer = () => {
    if (previewTimerRef.current == null) return;
    clearTimeout(previewTimerRef.current);
    previewTimerRef.current = null;
  };

  useEffect(() => {
    if (hoverFocusDelayMs <= 0) clearHoverTimer();
    return () => {
      clearHoverTimer();
      clearPreviewTimer();
    };
  }, [hoverFocusDelayMs]);

  const handleMouseEnter = (e) => {
    if (teaser || kitsPhones) {
      clearPreviewTimer();
      if (previewDelayMs <= 0) {
        setPreviewHot(true);
      } else {
        previewTimerRef.current = setTimeout(() => {
          previewTimerRef.current = null;
          setPreviewHot(true);
        }, previewDelayMs);
      }
    }
    notePointerHover(e.currentTarget);
    if (!onRequestFocus) return;
    if (hoverFocusDelayMs <= 0) {
      onRequestFocus();
      return;
    }
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null;
      onRequestFocus();
    }, hoverFocusDelayMs);
  };

  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="view"
      aria-label={`Open ${project.title} case study`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        setPreviewHot(false);
        clearHoverTimer();
        clearPreviewTimer();
      }}
      onFocus={() => onRequestFocus?.()}
      onPointerDown={() => {
        clearHoverTimer();
        clearPreviewTimer();
        playClick();
        onRequestFocus?.();
      }}
      style={{
        display: "block",
        position: "relative",
        width: "100%",
        height: fluid ? undefined : cardH,
        aspectRatio: fluid ? String(aspect) : undefined,
        overflow: "hidden",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
        outline: "none",
      }}
    >
      <div
        className={
          hoverScale ? "project-card-shell" : "project-card-shell project-card-shell--locked"
        }
        style={{
          position: "relative",
          height: "100%",
          transformOrigin: "center center",
          borderRadius: 3,
          border: "1px solid rgba(255, 122, 41, 0.4)",
          overflow: "hidden",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: gradient,
          }}
        >
          {heroSrc ? (
            <>
              <ProjectCardHeroImage
                src={heroSrc}
                loading={loading}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: crop?.objectPosition ?? "center",
                  transform: crop?.scale ? `scale(${crop.scale})` : undefined,
                  transformOrigin: crop?.objectPosition ?? "center",
                }}
              />
              {teaser ? (
                <ProjectHeroTeaser
                  src={teaser.src}
                  active={previewHot}
                  objectPosition={teaser.objectPosition}
                />
              ) : null}
              {kitsPhones ? <KitsCardPhones active={previewHot} /> : null}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 2,
                  background:
                    "linear-gradient(180deg, rgba(12, 8, 6, 0.08) 0%, rgba(8, 5, 4, 0.35) 100%)",
                  pointerEvents: "none",
                }}
              />
            </>
          ) : null}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 1px, transparent 2px, transparent 4px)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
