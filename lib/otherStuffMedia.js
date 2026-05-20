/** Allowed Next.js image optimizer sizes (w=180 / q=32 return 400). */
const THUMB_WIDTH = 256;
const THUMB_QUALITY = 70;
const LIGHTBOX_WIDTH = 1200;
const LIGHTBOX_QUALITY = 75;

/** Grid thumbs — never load multi-MB originals in the masonry view. */
export function otherStuffThumbSrc(src) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${THUMB_WIDTH}&q=${THUMB_QUALITY}`;
}

/** Lightbox — capped width/quality so view stays responsive. */
export function otherStuffLightboxSrc(src) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${LIGHTBOX_WIDTH}&q=${LIGHTBOX_QUALITY}`;
}
