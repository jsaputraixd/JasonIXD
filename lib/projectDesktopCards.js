/** Intrinsic width / height of each project thumb (hero). */
export const PROJECT_THUMB_ASPECT = {
  "dream-detective": 3846 / 2172,
  eleara: 8000 / 4500,
  kits: 3402 / 2048,
  pulse: 1920 / 1080,
  tama: 2400 / 1367,
  "dairy-delight": 661 / 372,
  pawfect: 3402 / 2048,
  "safe-space": 3402 / 2048,
  "shift-off": 3402 / 2048,
  "cca-pathfinding": 16 / 10,
  adherence: 16 / 9,
};

/** One shared card proportion on desktop — matches Kits (looks correct in windows + cursor). */
export const DESKTOP_PROJECT_CARD_ASPECT = PROJECT_THUMB_ASPECT.kits;

/** Uniform grid — no stagger offsets. */
const STAGGER_Y_BASE = [0, 0, 0, 0, 0, 0];

export const PROJECT_GRID_COLS = 3;
export const PROJECT_HERO_COLS = 3;
const MIN_CARD_W = 100;
const MIN_CARD_BODY_H = 56;

function titleBarH(layoutScale) {
  return Math.max(26, Math.round(28 * layoutScale));
}

/**
 * Fit hero in max box while preserving aspect (width / height).
 */
function fitThumbBox(aspect, layoutScale, { hero = false } = {}) {
  const s = layoutScale;
  const maxW = Math.round((hero ? 330 : 252) * s);
  const maxH = Math.round((hero ? 205 : 300) * s);
  const minW = Math.max(108, Math.round((hero ? 168 : 118) * s));

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
 * Shrink a uniform 2×3 grid to fit a width/height budget.
 * Gap is held constant so the solved card size actually fills the region.
 */
export function fitProjectCardsToBounds(
  cards,
  layoutScale,
  { maxGridW, maxGridH, projectGap }
) {
  if (!cards.length) return cards;

  const cols =
    cards.length <= PROJECT_HERO_COLS
      ? Math.max(1, cards.length)
      : PROJECT_GRID_COLS;
  const rows = Math.ceil(cards.length / cols);
  const gapX = Math.max(0, cols - 1) * projectGap;
  const gapY = Math.max(0, rows - 1) * projectGap;
  const tb = titleBarH(layoutScale);
  const aspect = cards[0].aspect;

  let width = cards[0].width;
  if (Number.isFinite(maxGridW) && maxGridW > gapX) {
    width = Math.min(width, Math.floor((maxGridW - gapX) / cols));
  }
  width = Math.max(MIN_CARD_W, width);

  let bodyHeight = Math.round(width / aspect);
  let windowHeight = tb + bodyHeight;

  if (Number.isFinite(maxGridH) && maxGridH > gapY) {
    const maxWindowH = Math.floor((maxGridH - gapY) / rows);
    if (windowHeight > maxWindowH) {
      bodyHeight = Math.max(MIN_CARD_BODY_H, maxWindowH - tb);
      width = Math.round(bodyHeight * aspect);
      if (Number.isFinite(maxGridW) && maxGridW > gapX) {
        width = Math.min(
          width,
          Math.max(MIN_CARD_W, Math.floor((maxGridW - gapX) / cols))
        );
      }
      width = Math.max(MIN_CARD_W, width);
      bodyHeight = Math.round(width / aspect);
      windowHeight = tb + bodyHeight;
    }
  }

  return cards.map((card) => ({
    ...card,
    width,
    bodyHeight,
    windowHeight,
    topOffset: 0,
  }));
}

/**
 * @param {Array<{ slug: string }>} projectList
 */
/** Uniform project window body size (desktop). */
export function getUniformProjectCardSize(layoutScale, { hero = false } = {}) {
  const tb = titleBarH(layoutScale);
  const { width, bodyHeight, aspect } = fitThumbBox(
    DESKTOP_PROJECT_CARD_ASPECT,
    layoutScale,
    { hero }
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
  const hero = (projectList?.length ?? 0) <= PROJECT_HERO_COLS;
  const { width, bodyHeight, windowHeight, aspect } =
    getUniformProjectCardSize(layoutScale, { hero });

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
  const cols =
    cards.length <= PROJECT_HERO_COLS
      ? Math.max(1, cards.length)
      : PROJECT_GRID_COLS;
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
