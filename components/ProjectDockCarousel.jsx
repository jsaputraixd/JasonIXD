"use client";

import { useReducedMotion } from "framer-motion";
import { carouselProjects } from "@/data/projects";
import {
  PROJECT_DOCK_H,
  STATUS_BAR_RESERVE,
} from "@/lib/desktopWindowPlacement";
import ProjectFlipCard, {
  PROJECT_CARD_GRADIENTS,
} from "@/components/ProjectFlipCard";

const CARD_W = 168;
const CARD_H = 96;
const GAP = 18;

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
}) {
  const reduceMotion = useReducedMotion();
  const items = carouselProjects;
  if (!items.length) return null;

  const scale = Math.min(1, Math.max(0.82, layoutScale));
  const cardW = Math.round(CARD_W * scale);
  const cardH = Math.round(CARD_H * scale);
  const gap = Math.round(GAP * scale);
  const duration = Math.max(28, items.length * 4.2);

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
      <div
        className={
          reduceMotion
            ? "project-dock__mask project-dock__mask--static"
            : "project-dock__mask"
        }
      >
        <div
          className={
            reduceMotion
              ? "project-dock__track project-dock__track--static"
              : "project-dock__track"
          }
          style={{
            "--dock-duration": `${duration}s`,
            "--dock-gap": `${gap}px`,
          }}
        >
          <DockSet
            items={items}
            cardW={cardW}
            cardH={cardH}
            gap={gap}
            scale={scale}
            copy={false}
          />
          {reduceMotion ? null : (
            <DockSet
              items={items}
              cardW={cardW}
              cardH={cardH}
              gap={gap}
              scale={scale}
              copy
            />
          )}
        </div>
      </div>
    </nav>
  );
}
