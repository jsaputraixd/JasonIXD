"use client";

import { otherProjects } from "@/data/otherProjects";
import ProjectFlipCard, { PROJECT_CARD_GRADIENTS } from "@/components/ProjectFlipCard";
import { DESKTOP_PROJECT_CARD_ASPECT } from "@/lib/projectDesktopCards";

export default function OtherProjectsFolder({
  variant = "desktop",
  layoutScale = 1,
}) {
  const s = variant === "desktop" ? layoutScale : 1;
  const pad = variant === "desktop" ? Math.round(14 * s) : 14;
  const bio = variant === "desktop" ? Math.max(11, Math.round(12 * s)) : 13;
  const gap = variant === "desktop" ? Math.round(12 * s) : 12;
  const projects = otherProjects.projects;

  const cardWidth =
    variant === "desktop" ? Math.round(220 * s) : 240;

  const cardHeight = Math.round(cardWidth / DESKTOP_PROJECT_CARD_ASPECT);

  return (
    <div
      className="other-projects-body"
      style={{
        padding: pad,
        display: "flex",
        flexDirection: "column",
        gap: Math.round(12 * s),
        minHeight: 0,
        overflowY: "auto",
        maxHeight: variant === "desktop" ? "min(72vh, 640px)" : undefined,
      }}
    >
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
      <div
        className="other-projects-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            variant === "desktop" ? "repeat(2, minmax(0, 1fr))" : "1fr",
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
    </div>
  );
}
