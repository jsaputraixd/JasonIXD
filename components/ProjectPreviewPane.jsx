"use client";

import { motion, AnimatePresence } from "framer-motion";
import ProjectViewLink from "@/components/ProjectViewLink";
import { projectTitleTransitionName } from "@/lib/viewTransition";

const ACCENT = "#FF7A29";
const ACCENT_DIM = "rgba(255, 180, 112, 0.7)";
const EASE = [0.16, 1, 0.3, 1];

/** Desktop cursor hover window or mobile selected-project description panel. */
export default function ProjectPreviewPane({
  project,
  variant = "cursor",
  frameWidth,
  frameHeight,
}) {
  const isMobile = variant === "mobile";
  const isCursor = variant === "cursor";
  const titleSize = isMobile ? 11 : 12;
  const tagSize = isMobile ? 10 : 11;
  const descSize = isMobile ? 11 : 12;
  const bodyPad = isMobile ? "8px 10px 10px" : "10px 12px 12px";
  const descMaxH = isMobile ? 96 : 72;

  const heroSrc = project.thumb ?? project.caseStudyHero ?? null;
  const heroSrcEnc = heroSrc ? encodeURI(heroSrc) : null;
  const thumbH = isCursor && frameHeight ? frameHeight : undefined;

  const inner = (
    <>
      <div aria-hidden className="project-cursor-scanlines" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          padding: isMobile ? "4px 8px" : "5px 10px",
          borderBottom: "1px solid rgba(255, 122, 41, 0.45)",
          background:
            "linear-gradient(to bottom, rgba(255,122,41,0.16), rgba(255,122,41,0.06))",
          fontFamily: "'VT323', monospace",
          fontSize: titleSize,
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
            viewTransitionName: isMobile
              ? projectTitleTransitionName(project.slug)
              : undefined,
          }}
        >
          {project.title}
        </span>
        {project.category ? (
          <span
            style={{
              flexShrink: 0,
              fontSize: isMobile ? 9 : 10,
              letterSpacing: "0.14em",
              color: ACCENT_DIM,
              opacity: 0.9,
            }}
          >
            {project.category}
          </span>
        ) : null}
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          padding: bodyPad,
          gap: isMobile ? 6 : 6,
          minHeight: 0,
          flex: isCursor ? 1 : undefined,
        }}
      >
        <p
          style={{
            margin: 0,
            flexShrink: 0,
            fontFamily: "'VT323', monospace",
            fontSize: tagSize,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: ACCENT_DIM,
            lineHeight: 1.35,
          }}
        >
          {project.tagline}
        </p>
        <p
          className="project-cursor-desc project-pane-scroll"
          style={{ maxHeight: descMaxH, fontSize: descSize, margin: 0 }}
        >
          {project.description}
        </p>
        <span
          style={{
            flexShrink: 0,
            alignSelf: "flex-end",
            fontFamily: "'VT323', monospace",
            fontSize: isMobile ? 10 : 11,
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

  const shellStyle = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: isCursor && frameWidth ? frameWidth : undefined,
    height: isCursor && frameHeight ? "100%" : undefined,
    flex: isCursor ? 1 : undefined,
    minHeight: 0,
    overflow: "hidden",
    borderRadius: isCursor ? 0 : 3,
    border: isCursor ? "none" : "1px solid rgba(255, 122, 41, 0.5)",
    background: "rgba(18, 12, 8, 0.96)",
    boxShadow: isMobile
      ? "0 0 24px rgba(255, 122, 41, 0.12), 0 8px 28px rgba(0, 0, 0, 0.45)"
      : isCursor
        ? "none"
        : "0 0 40px rgba(255, 122, 41, 0.22), 0 16px 48px rgba(0, 0, 0, 0.55)",
    color: "inherit",
    textDecoration: "none",
  };

  if (isMobile) {
    return (
      <ProjectViewLink
        href={`/work/${project.slug}`}
        prefetch
        aria-label={`Open case study: ${project.title}`}
        style={shellStyle}
      >
        {inner}
      </ProjectViewLink>
    );
  }

  return <div style={shellStyle}>{inner}</div>;
}

export function MobileProjectPreviewPanel({ project }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={project.slug}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        <ProjectPreviewPane project={project} variant="mobile" />
      </motion.div>
    </AnimatePresence>
  );
}
