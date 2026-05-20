"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";
import ProjectPreviewPane from "@/components/ProjectPreviewPane";
const ACCENT = "#FF7A29";

const VARIANTS = {
  default: { size: 12, opacity: 0.9, label: "" },
  hover: { size: 40, opacity: 0.4, label: "" },
  view: { size: 88, opacity: 0.95, label: "view", labelFontSize: 10 },
  enter: { size: 64, opacity: 0.95, label: "enter" },
};

/** Text-only project blurb — no thumb (card already shows the image). */
const PROJECT_PREVIEW_W = 300;
const PROJECT_PREVIEW_TITLE_H = 28;
const PROJECT_PREVIEW_BODY_H = 168;
const PROJECT_PREVIEW_H = PROJECT_PREVIEW_TITLE_H + PROJECT_PREVIEW_BODY_H;

export default function Cursor() {
  const [variant, setVariant] = useState("default");
  const [projectPreview, setProjectPreview] = useState(null);
  const [isTouch, setIsTouch] = useState(false);
  const wrapperRef = useRef(null);
  const rafRef = useRef(0);
  const pendingRef = useRef(null);
  const variantRef = useRef("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  useEffect(() => {
    if (isTouch) return;

    const flush = () => {
      rafRef.current = 0;
      const e = pendingRef.current;
      if (!e) return;

      const node = wrapperRef.current;
      if (node) {
        node.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const el = e.target instanceof Element ? e.target : null;
      const projectHit = el?.closest('[data-cursor="project"]');

      if (projectHit) {
        const slug = projectHit.getAttribute("data-project-slug");
        const project = projects.find((p) => p.slug === slug) ?? null;
        setProjectPreview((prev) =>
          prev?.slug === project?.slug ? prev : project
        );
        if (variantRef.current !== "project") setVariant("project");
        return;
      }

      setProjectPreview((prev) => (prev === null ? prev : null));
      const hit = el?.closest("[data-cursor]");
      const next = hit?.getAttribute("data-cursor");
      const resolved =
        next && next !== "project" && VARIANTS[next] ? next : "default";
      if (variantRef.current !== resolved) setVariant(resolved);
    };

    const handleMove = (e) => {
      pendingRef.current = e;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch]);

  if (isTouch) return null;

  const isProject = variant === "project" && projectPreview;
  const v = VARIANTS[variant] ?? VARIANTS.default;
  const size = isProject ? PROJECT_PREVIEW_W : v.size;
  const height = isProject ? PROJECT_PREVIEW_H : size;
  const isDefault = variant === "default" && !isProject;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 70000,
        mixBlendMode: isProject ? "normal" : "screen",
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: size,
          height,
          transform: "translate(-50%, -50%)",
          borderRadius: isProject ? 3 : 9999,
          border: isDefault ? "none" : `1px solid rgba(255, 122, 41, 0.5)`,
          background: isDefault
            ? ACCENT
            : isProject
              ? "rgba(18, 12, 8, 0.96)"
              : "rgba(255, 122, 41, 0.08)",
          boxShadow: isDefault
            ? "0 0 10px rgba(255, 122, 41, 0.6)"
            : isProject
              ? "0 0 40px rgba(255, 122, 41, 0.22), 0 16px 48px rgba(0, 0, 0, 0.55)"
              : "0 0 16px rgba(255, 122, 41, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: isProject ? 1 : v.opacity,
        }}
      >
        {isProject ? (
          <ProjectPreviewPane
            project={projectPreview}
            variant="cursor"
            frameWidth={PROJECT_PREVIEW_W}
            frameHeight={PROJECT_PREVIEW_BODY_H}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: ACCENT,
              fontFamily: "'VT323', monospace",
              fontSize: v.labelFontSize ?? 13,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            {v.label}
          </div>
        )}
      </div>
    </div>
  );
}
