/** Intrinsic width / height of each project thumb (hero). */
export const PROJECT_THUMB_ASPECT = {
  "dream-detective": 3846 / 2172,
  eleara: 8000 / 4500,
  kits: 3402 / 2048,
  "dairy-delight": 661 / 372,
};

/** One shared card proportion on desktop — matches Kits (looks correct in windows + cursor). */
export const DESKTOP_PROJECT_CARD_ASPECT = PROJECT_THUMB_ASPECT.kits;

/** Uniform 2×2 grid — no stagger offsets. */
const STAGGER_Y_BASE = [0, 0, 0, 0];

export const PROJECT_GRID_COLS = 2;

function titleBarH(layoutScale) {
  return Math.max(26, Math.round(28 * layoutScale));
}

/**
 * Fit hero in max box while preserving aspect (width / height).
 */
function fitThumbBox(aspect, layoutScale) {
  const s = layoutScale;
  const maxW = Math.round(252 * s);
  const maxH = Math.round(280 * s);
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
/** Uniform project window body size (desktop). */
export function getUniformProjectCardSize(layoutScale) {
  const tb = titleBarH(layoutScale);
  const { width, bodyHeight, aspect } = fitThumbBox(
    DESKTOP_PROJECT_CARD_ASPECT,
    layoutScale
  );
  return {
    width,
    bodyHeight,
    windowHeight: tb + bodyHeight,
    titleBarHeight: tb,
    aspect,
  };
}

export function getProjectDesktopCards(projectList, layoutScale) {
  const { width, bodyHeight, windowHeight, aspect } =
    getUniformProjectCardSize(layoutScale);

  return projectList.map((p, i) => {
    const topOffset = Math.round((STAGGER_Y_BASE[i] ?? 0) * layoutScale);
    return {
      slug: p.slug,
      width,
      bodyHeight,
      windowHeight,
      topOffset,
      aspect,
    };
  });
}

export function projectGridMetrics(cards, gap) {
  if (!cards.length) {
    return { gridWidth: 0, gridHeight: 0, maxWindowHeight: 0 };
  }
  const w = cards[0].width;
  const h = cards[0].windowHeight;
  const cols = PROJECT_GRID_COLS;
  const rows = Math.ceil(cards.length / cols);
  return {
    gridWidth: cols * w + Math.max(0, cols - 1) * gap,
    gridHeight: rows * h + Math.max(0, rows - 1) * gap,
    maxWindowHeight: h,
  };
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
