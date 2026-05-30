import { featuredProjects, projects } from "@/data/projects";
import { projectCardThumbSrc } from "@/lib/projectMedia";

const ASCII_PORTRAIT = "/images/ascii-portrait.png";
const OTHER_STUFF_ICON = "/images/junk-folder-icon.png";
const TRASH_ICON = "/images/trash-bin-icon.png";

let started = false;

function preloadImage(src) {
  if (!src || typeof window === "undefined") return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
}

function preloadRoute(href) {
  if (typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  link.as = "document";
  document.head.appendChild(link);
}

function scheduleIdle(task) {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(task, { timeout: 2500 });
    return;
  }
  window.setTimeout(task, 120);
}

/** Warm critical images + case study routes during the boot overlay. */
export function preloadPortfolioAssets() {
  if (started || typeof window === "undefined") return;
  started = true;

  preloadImage(
    `/_next/image?url=${encodeURIComponent(ASCII_PORTRAIT)}&w=640&q=75`
  );
  preloadImage(OTHER_STUFF_ICON);
  preloadImage(TRASH_ICON);

  featuredProjects.forEach((p) => {
    const src = p.thumb ?? p.caseStudyHero ?? null;
    if (src) preloadImage(projectCardThumbSrc(src));
  });

  scheduleIdle(() => {
    projects.forEach((p) => {
      preloadRoute(`/work/${p.slug}`);
    });
  });
}
