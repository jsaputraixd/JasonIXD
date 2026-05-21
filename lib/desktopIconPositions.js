const STORAGE_KEY = "portfolio-desktop-icon-offsets";

/** @typedef {{ dx: number, dy: number }} IconOffset */

/** @returns {Record<string, IconOffset>} */
function readAll() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** @param {string} id */
export function readIconOffset(id) {
  const entry = readAll()[id];
  if (!entry || typeof entry !== "object") return { dx: 0, dy: 0 };
  const dx = Number(entry.dx);
  const dy = Number(entry.dy);
  return {
    dx: Number.isFinite(dx) ? dx : 0,
    dy: Number.isFinite(dy) ? dy : 0,
  };
}

/** @param {string} id @param {IconOffset} offset */
export function writeIconOffset(id, offset) {
  if (typeof window === "undefined") return;
  try {
    const all = readAll();
    all[id] = {
      dx: Math.round(offset.dx),
      dy: Math.round(offset.dy),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota / privacy mode */
  }
}

/**
 * @param {{ left: number, top: number, width: number, height: number, stageWidth: number, stageHeight: number, statusBarClearance?: number }}
 */
export function clampIconPosition({
  left,
  top,
  width,
  height,
  stageWidth,
  stageHeight,
  statusBarClearance = 108,
}) {
  const maxLeft = Math.max(0, stageWidth - width);
  const maxTop = Math.max(0, stageHeight - height - statusBarClearance);
  return {
    left: Math.max(0, Math.min(maxLeft, left)),
    top: Math.max(0, Math.min(maxTop, top)),
  };
}
