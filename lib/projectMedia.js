/** Desktop / mobile project card thumbs (~640px wide @ q70). */
const CARD_WIDTH = 640;
const CARD_QUALITY = 70;

/** Mobile orbit carousel — smaller payload for faster loads. */
const CAROUSEL_WIDTH = 420;
const CAROUSEL_QUALITY = 62;

/** Case study page hero — full width but capped. */
const CASE_STUDY_HERO_WIDTH = 1200;
const CASE_STUDY_HERO_QUALITY = 75;

export function projectCardThumbSrc(src) {
  if (!src) return "";
  return `/_next/image?url=${encodeURIComponent(src)}&w=${CARD_WIDTH}&q=${CARD_QUALITY}`;
}

export function projectCarouselThumbSrc(src) {
  if (!src) return "";
  return `/_next/image?url=${encodeURIComponent(src)}&w=${CAROUSEL_WIDTH}&q=${CAROUSEL_QUALITY}`;
}

export function projectCaseStudyHeroSrc(src) {
  if (!src) return "";
  return `/_next/image?url=${encodeURIComponent(src)}&w=${CASE_STUDY_HERO_WIDTH}&q=${CASE_STUDY_HERO_QUALITY}`;
}
