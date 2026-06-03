/** Desktop / mobile project card thumbs (~640px wide @ q70). */
const CARD_WIDTH = 640;
const CARD_QUALITY = 70;

/** Mobile cover carousel — sized for ~280px cards; keep light for swipe perf. */
const CAROUSEL_WIDTH = 280;
const CAROUSEL_QUALITY = 52;

/** Case study page hero — full width but capped. */
const CASE_STUDY_HERO_WIDTH = 1200;
const CASE_STUDY_HERO_QUALITY = 75;

export function projectCardThumbSrc(src) {
  if (!src) return "";
  return `/_next/image?url=${encodeURIComponent(src)}&w=${CARD_WIDTH}&q=${CARD_QUALITY}`;
}

export function projectCarouselThumbSrc(src) {
  if (!src) return "";
  // Pre-exported carousel assets are already web-sized — skip the optimizer.
  if (/-carousel-thumb\.(jpe?g|webp|png)$/i.test(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${CAROUSEL_WIDTH}&q=${CAROUSEL_QUALITY}`;
}

/** Prefer a pre-exported mobile thumb when the full hero is huge (e.g. Eleara deck slide). */
export function resolveProjectCarouselSrc(project) {
  return project?.mobileCarouselThumb ?? project?.thumb ?? project?.caseStudyHero ?? "";
}

export function projectCaseStudyHeroSrc(src) {
  if (!src) return "";
  return `/_next/image?url=${encodeURIComponent(src)}&w=${CASE_STUDY_HERO_WIDTH}&q=${CASE_STUDY_HERO_QUALITY}`;
}
