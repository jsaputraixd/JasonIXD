/** Short labels for project cards (desktop hover + mobile detail). */
export function projectCardMeta(project) {
  const overview = project?.caseStudyRich?.overview;
  return {
    category: project?.category ?? null,
    role: overview?.role ?? null,
    timeline: overview?.timeline ?? null,
  };
}

export function projectCardMetaLine(project) {
  const { category, role, timeline } = projectCardMeta(project);
  const parts = [category, timeline, role].filter(Boolean);
  if (!parts.length) return null;
  return parts.join(" · ");
}
