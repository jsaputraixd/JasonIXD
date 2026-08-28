import { createHash } from "crypto";
import { about } from "./about.js";
import { projects } from "./projects.js";

/** Stable hash: regenerate audio when script copy changes. */
export function hashListenText(text) {
  return createHash("sha256")
    .update(String(text).trim())
    .digest("hex")
    .slice(0, 16);
}

function normalizeScript(parts) {
  return parts
    .filter(Boolean)
    .join(". ")
    .replace(/\s+/g, " ")
    .trim();
}

/** ~60s welcome intro for listen.exe */
export function buildWelcomeListenText() {
  if (about.listenScript) return about.listenScript.trim();
  return normalizeScript([
    "Hello.",
    about.name,
    about.title,
    about.lede,
    about.bioDesktop || about.bio,
  ]);
}

/** Short case-study summary for listen.exe (~45 to 90s). Override with project.listenScript. */
export function buildProjectListenText(project) {
  if (project.listenScript) return project.listenScript.trim();
  const scan = project.caseStudyRich?.scan;
  const tags = project.tags?.length ? project.tags.join(", ") : "";
  return normalizeScript([
    project.title,
    scan?.project || project.tagline,
    scan?.problem,
    scan?.role,
    scan?.hard,
    scan?.change,
    scan ? null : project.description,
    tags && !scan ? tags : null,
  ]);
}

/** Every clip the generator maintains under public/audio/listen/. */
export const listenCatalog = [
  { id: "welcome", text: buildWelcomeListenText() },
  ...projects.map((project) => ({
    id: project.slug,
    text: buildProjectListenText(project),
  })),
];

export function getListenCatalogEntry(id) {
  return listenCatalog.find((entry) => entry.id === id) ?? null;
}
