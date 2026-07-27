/** Short labels for project cards (desktop hover + mobile detail). */
export function projectCardMeta(project) {
  const overview = project?.caseStudyRich?.overview;
  return {
    category: project?.category ?? null,
    role: overview?.role ?? null,
    timeline: overview?.timeline ?? null,
  };
}

/** Keep long role lines from overflowing card captions on hover. */
export function projectCardRoleSummary(role) {
  if (!role) return null;
  if (role.length <= 54) return role;
  const cut = role.slice(0, 54);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed =
    lastSpace > 28 ? cut.slice(0, lastSpace).trim() : cut.trim();
  return `${trimmed}…`;
}

export function projectCardMetaLine(project) {
  const { category, role, timeline } = projectCardMeta(project);
  const parts = [category, timeline, role].filter(Boolean);
  if (!parts.length) return null;
  return parts.join(" · ");
}
