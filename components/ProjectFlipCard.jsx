"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { projectCardThumbSrc } from "@/lib/projectMedia";
import { DESKTOP_PROJECT_CARD_ASPECT } from "@/lib/projectDesktopCards";

export const PROJECT_CARD_GRADIENTS = [
  "linear-gradient(135deg, #4a1f0a 0%, #1a0a05 60%, #0a0505 100%)",
  "linear-gradient(135deg, #4a2818 0%, #1f0e08 60%, #0a0505 100%)",
  "linear-gradient(135deg, #4a3010 0%, #221305 60%, #0a0505 100%)",
  "linear-gradient(135deg, #3a3518 0%, #181505 60%, #0a0505 100%)",
  "linear-gradient(135deg, #2a2840 0%, #121018 60%, #0a0505 100%)",
  "linear-gradient(135deg, #1a3040 0%, #0a1520 60%, #0a0505 100%)",
];

export function ProjectCardHeroImage({ src, style, loading = "lazy" }) {
  const [displaySrc, setDisplaySrc] = useState(() => projectCardThumbSrc(src));

  useEffect(() => {
    setDisplaySrc(projectCardThumbSrc(src));
  }, [src]);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={displaySrc}
      alt=""
      aria-hidden
      loading={loading}
      decoding="async"
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
  loading = "lazy",
}) {
  const innerW = frameWidth ?? 268;
  const cardH =
    frameHeight ?? Math.round(innerW / (aspectRatio ?? DESKTOP_PROJECT_CARD_ASPECT));

  const heroSrc = project.thumb ?? project.caseStudyHero ?? null;

  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="view"
      aria-label={`Open ${project.title} case study`}
      onMouseEnter={() => onRequestFocus?.()}
      onFocus={() => onRequestFocus?.()}
      style={{
        display: "block",
        position: "relative",
        width: "100%",
        height: cardH,
        overflow: "hidden",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
        outline: "none",
      }}
    >
      <div
        className="project-card-shell"
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
                  objectPosition: "center",
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
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
              zIndex: 1,
            }}
          />
        </div>

        <div className="project-card-caption" aria-hidden="true">
          <p className="project-card-caption__title">{project.title}</p>
          <p className="project-card-caption__tagline">{project.tagline}</p>
          <span className="project-card-caption__cta">Case study →</span>
        </div>
      </div>
    </Link>
  );
}
