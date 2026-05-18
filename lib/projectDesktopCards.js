/** Intrinsic width / height of each project thumb (hero). */
export const PROJECT_THUMB_ASPECT = {
  "dream-detective": 3846 / 2172,
  eleara: 8000 / 4500,
  kits: 3402 / 2048,
  "dairy-delight": 1460 / 2320,
};

/** Subtle vertical offsets (px at layoutScale 1) — deterministic, not random. */
const STAGGER_Y_BASE = [0, 28, 12, 40];

function titleBarH(layoutScale) {
  return Math.max(26, Math.round(28 * layoutScale));
}

/**
 * Fit hero in max box while preserving aspect (width / height).
 */
function fitThumbBox(aspect, layoutScale) {
  const s = layoutScale;
  const maxW = Math.round(228 * s);
  const maxH = Math.round(268 * s);
  const minW = Math.max(108, Math.round(118 * s));

  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  if (w < minW) {
    w = minW;
    h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
  }

  return {
    width: Math.round(w),
    bodyHeight: Math.round(h),
    aspect,
  };
}

/**
 * @param {Array<{ slug: string }>} projectList
 */
export function getProjectDesktopCards(projectList, layoutScale) {
  const tb = titleBarH(layoutScale);

  return projectList.map((p, i) => {
    const aspect = PROJECT_THUMB_ASPECT[p.slug] ?? 4 / 5;
    const { width, bodyHeight } = fitThumbBox(aspect, layoutScale);
    const topOffset = Math.round((STAGGER_Y_BASE[i] ?? 0) * layoutScale);
    return {
      slug: p.slug,
      width,
      bodyHeight,
      windowHeight: tb + bodyHeight,
      topOffset,
      aspect,
    };
  });
}

export function projectRowMetrics(cards, gap) {
  const rowWidth =
    cards.reduce((sum, c) => sum + c.width, 0) +
    Math.max(0, cards.length - 1) * gap;
  const maxWindowHeight = Math.max(...cards.map((c) => c.windowHeight), 0);
  const maxStaggerExtent = Math.max(
    ...cards.map((c) => c.topOffset + c.windowHeight),
    0
  );
  return { rowWidth, maxWindowHeight, maxStaggerExtent };
}
