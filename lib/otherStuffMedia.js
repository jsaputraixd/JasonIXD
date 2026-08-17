/**
 * Other Stuff grid uses pre-exported thumbs (~480px JPEG, ~20–90KB).
 * Originals stay in the same folder and only load in the lightbox.
 *
 * Thumbs live at: public/images/other-stuff/<category>/thumbs/<stem>.jpg
 * Regenerate with: python3 scripts/generate-other-stuff-thumbs.py
 */

export function otherStuffThumbSrc(src) {
  if (!src) return "";
  const lastSlash = src.lastIndexOf("/");
  if (lastSlash < 0) return src;
  const dir = src.slice(0, lastSlash);
  const file = src.slice(lastSlash + 1);
  const stem = file.replace(/\.[^.]+$/, "");
  return `${dir}/thumbs/${stem}.jpg`;
}

/** Lightbox always uses the original file. */
export function otherStuffLightboxSrc(src) {
  return src || "";
}
