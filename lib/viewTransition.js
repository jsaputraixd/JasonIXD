/** Run navigation inside the View Transitions API when supported. */
export function withViewTransition(callback) {
  if (typeof document !== "undefined" && document.startViewTransition) {
    try {
      document.startViewTransition(callback);
      return;
    } catch {
      /* fall through */
    }
  }
  callback();
}

export function projectHeroTransitionName(slug) {
  return slug ? `project-hero-${slug}` : undefined;
}

export function projectTitleTransitionName(slug) {
  return slug ? `project-title-${slug}` : undefined;
}
