"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";

const ACCENT = "#FF7A29";
const ACCENT_DIM = "rgba(255, 180, 112, 0.7)";

const VARIANTS = {
  default: { size: 12, opacity: 0.9, label: "" },
  hover: { size: 40, opacity: 0.4, label: "" },
  view: { size: 88, opacity: 0.95, label: "view", labelFontSize: 10 },
  enter: { size: 64, opacity: 0.95, label: "enter" },
};

const PROJECT_WIN_W = 300;
const PROJECT_WIN_H = 268;

export default function Cursor() {
  const [variant, setVariant] = useState("default");
  const [projectPreview, setProjectPreview] = useState(null);
  const [isTouch, setIsTouch] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const handleMove = (e) => {
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
        setVariant((cur) => (cur === "project" ? cur : "project"));
        return;
      }

      setProjectPreview((prev) => (prev === null ? prev : null));
      const hit = el?.closest("[data-cursor]");
      const next = hit?.getAttribute("data-cursor");
      const resolved =
        next && next !== "project" && VARIANTS[next] ? next : "default";
      setVariant((cur) => (cur === resolved ? cur : resolved));
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isTouch]);

  if (isTouch) return null;

  const isProject = variant === "project" && projectPreview;
  const v = VARIANTS[variant] ?? VARIANTS.default;
  const size = isProject ? PROJECT_WIN_W : v.size;
  const height = isProject ? PROJECT_WIN_H : size;
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
        zIndex: 50000,
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
          transition:
            "width 220ms ease, height 220ms ease, border-radius 220ms ease, background 180ms ease, opacity 140ms ease, box-shadow 220ms ease",
        }}
      >
        {isProject ? (
          <ProjectCursorWindow project={projectPreview} />
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

function ProjectCursorWindow({ project }) {
  return (
    <>
      <div
        className="project-cursor-scanlines"
        aria-hidden
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          padding: "5px 10px",
          borderBottom: "1px solid rgba(255, 122, 41, 0.45)",
          background:
            "linear-gradient(to bottom, rgba(255,122,41,0.16), rgba(255,122,41,0.06))",
          fontFamily: "'VT323', monospace",
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: ACCENT,
          textShadow: "0 0 6px rgba(255, 122, 41, 0.45)",
        }}
      >
        <span className="mobile-window-dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {project.title}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: "10px 12px 12px",
          gap: 8,
        }}
      >
        <p
          style={{
            margin: 0,
            flexShrink: 0,
            fontFamily: "'VT323', monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: ACCENT_DIM,
            lineHeight: 1.35,
          }}
        >
          {project.tagline}
        </p>
        <p className="project-cursor-desc project-pane-scroll">
          {project.description}
        </p>
        <span
          style={{
            flexShrink: 0,
            alignSelf: "flex-end",
            fontFamily: "'VT323', monospace",
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: ACCENT,
            textShadow: "0 0 8px rgba(255, 122, 41, 0.45)",
          }}
        >
          Case study →
        </span>
      </div>
    </>
  );
}
