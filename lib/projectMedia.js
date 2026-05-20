/** Desktop / mobile project card thumbs (~640px wide @ q70). */
const CARD_WIDTH = 640;
const CARD_QUALITY = 70;

/** Case study page hero — full width but capped. */
const CASE_STUDY_HERO_WIDTH = 1200;
const CASE_STUDY_HERO_QUALITY = 75;

export function projectCardThumbSrc(src) {
  if (!src) return "";
  return `/_next/image?url=${encodeURIComponent(src)}&w=${CARD_WIDTH}&q=${CARD_QUALITY}`;
}

export function projectCaseStudyHeroSrc(src) {
  if (!src) return "";
  return `/_next/image?url=${encodeURIComponent(src)}&w=${CASE_STUDY_HERO_WIDTH}&q=${CASE_STUDY_HERO_QUALITY}`;
}
