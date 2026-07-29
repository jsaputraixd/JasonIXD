"use client";

import Link from "next/link";
import { otherProjects } from "@/data/otherProjects";
import ProjectFlipCard, {
  PROJECT_CARD_GRADIENTS,
  ProjectCardHeroImage,
} from "@/components/ProjectFlipCard";
import { DESKTOP_PROJECT_CARD_ASPECT } from "@/lib/projectDesktopCards";
import { projectCardMeta } from "@/lib/projectCardMeta";
import { playClick } from "@/lib/typingSound";

function MobileOtherProjectRow({ project, gradient, loading }) {
  const heroSrc = project.thumb ?? project.caseStudyHero ?? null;
  const { category, timeline } = projectCardMeta(project);
  const meta = [category, timeline].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/work/${project.slug}`}
      className="other-projects-row"
      data-cursor="view"
      aria-label={`Open ${project.title} case study`}
      onClick={() => playClick()}
    >
      <span
        className="other-projects-row__thumb"
        style={{ background: gradient }}
        aria-hidden
      >
        {heroSrc ? (
          <ProjectCardHeroImage
            src={heroSrc}
            loading={loading}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        ) : null}
      </span>
      <span className="other-projects-row__copy">
        <span className="other-projects-row__title">{project.title}</span>
        {project.tagline ? (
          <span className="other-projects-row__tagline">{project.tagline}</span>
        ) : null}
        {meta ? <span className="other-projects-row__meta">{meta}</span> : null}
      </span>
      <span className="other-projects-row__arrow" aria-hidden>
        →
      </span>
    </Link>
  );
}

export default function OtherProjectsFolder({
  variant = "desktop",
  layoutScale = 1,
}) {
  const s = variant === "desktop" ? layoutScale : 1;
  const pad = variant === "desktop" ? Math.round(14 * s) : 10;
  const bio = variant === "desktop" ? Math.max(11, Math.round(12 * s)) : 12;
  const gap = variant === "desktop" ? Math.round(12 * s) : 8;
  const projects = otherProjects.projects;

  const isMobile = variant === "mobile";
  const cardWidth = isMobile ? undefined : Math.round(220 * s);
  const cardHeight = isMobile
    ? undefined
    : Math.round(cardWidth / DESKTOP_PROJECT_CARD_ASPECT);

  return (
    <div
      className={
        isMobile
          ? "other-projects-body other-projects-body--mobile"
          : "other-projects-body"
      }
      style={{
        padding: pad,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 10 : Math.round(12 * s),
        minHeight: 0,
        overflowY: "auto",
        maxHeight: variant === "desktop" ? "min(72vh, 640px)" : undefined,
      }}
    >
      {isMobile ? (
        <p
          style={{
            margin: 0,
            fontFamily: "'VT323', monospace",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255, 180, 112, 0.72)",
          }}
        >
          {projects.length} archived case studies
        </p>
      ) : (
        <p
          style={{
            margin: 0,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: bio,
            lineHeight: 1.55,
            color: "rgba(255, 255, 255, 0.76)",
          }}
        >
          {otherProjects.blurb}
        </p>
      )}

      {isMobile ? (
        <div className="other-projects-list" style={{ display: "flex", flexDirection: "column", gap }}>
          {projects.map((project, index) => (
            <MobileOtherProjectRow
              key={project.slug}
              project={project}
              gradient={
                PROJECT_CARD_GRADIENTS[index % PROJECT_CARD_GRADIENTS.length]
              }
              loading={index < 3 ? "eager" : "lazy"}
            />
          ))}
        </div>
      ) : (
        <div
          className="other-projects-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap,
          }}
        >
          {projects.map((project, index) => (
            <ProjectFlipCard
              key={project.slug}
              project={project}
              gradient={
                PROJECT_CARD_GRADIENTS[index % PROJECT_CARD_GRADIENTS.length]
              }
              layoutScale={s}
              frameWidth={cardWidth}
              frameHeight={cardHeight}
              loading={index < 2 ? "eager" : "lazy"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
