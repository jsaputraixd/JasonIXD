/** Run navigation inside the View Transitions API when supported (mobile polish). */
export function withViewTransition(callback) {
  if (typeof document !== "undefined" && document.startViewTransition) {
    document.startViewTransition(callback);
    return;
  }
  callback();
}

export function projectHeroTransitionName(slug) {
  return slug ? `project-hero-${slug}` : undefined;
}

export function projectTitleTransitionName(slug) {
  return slug ? `project-title-${slug}` : undefined;
}
