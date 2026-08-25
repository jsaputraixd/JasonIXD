import { PROJECT_GRID_COLS } from "@/lib/projectDesktopCards";

/**
 * Fixed desktop window positions: welcome centered, project 2×3 grid centered,
 * satellite windows in stable slots (no random overlap).
 */

function titleBarH(layoutScale) {
  return Math.max(26, Math.round(28 * layoutScale));
}

/**
 * Layout height guesses for zoning (welcome / me / skills / contact / projects).
 * Keep pessimistic so bands don’t collide on real content.
 */
export function estDesktopWindowHeights(layoutScale, meWidth, maxProjectExtent = 0) {
  const tb = titleBarH(layoutScale);
  const s = layoutScale;
  const inset = Math.max(18, Math.round(26 * s));
  const inner = Math.max(
    Math.round(130 * s),
    Math.min(Math.round(252 * s), Math.max(80, meWidth - inset))
  );
  const meBody =
    Math.round(12 * s) +
    inner +
    Math.round(44 * s) +
    Math.round(144 * s);

  const proj =
    maxProjectExtent > 0
      ? maxProjectExtent
      : tb + Math.round(265 * s);

  return {
    welcome: tb + Math.round(420 * s),
    me: tb + meBody,
    /** Floating skills globe + orbit tags (top-right, no window chrome). */
    skills: Math.round(430 * s),
    otherStuffWindow: tb + Math.round(320 * s),
    otherProjectsWindow: tb + Math.round(420 * s),
    contact: tb + Math.round(310 * s),
    proj,
  };
}

export const BOTTOM_RESERVE = 60;
/** Lift the project grid from the bottom anchor (clears footer + corner icons). */
export const PROJECT_GRID_LIFT = 118;
export const RIGHT_RESERVE = 52;
/** Extra inset for me.txt / contact.msg (clears left chrome / edge). */
export const LEFT_COLUMN_INSET = 28;
const GAP = 16;
export const DESKTOP_FOLDER_ICON_W = 80;
export const DESKTOP_FOLDER_ICON_H = 96;
/** Gap between project windows in the 2×3 grid. */
export const PROJECT_WINDOW_GAP = 22;
/** Clearance between the left stack (me.txt / contact.msg) and the project grid. */
export const PROJECT_GRID_LEFT_GAP = 28;

/**
 * @returns {Record<string, { left: number, top: number }>}
 */
export function getDeterministicDesktopPositions({
  vw,
  vh,
  W,
  projectCards,
  projectGap,
  nProj,
  layoutScale,
  edge,
  g,
  topBand,
  leftColumnInset = 0,
  gridMinLeft,
  gridMaxRight,
}) {
  const cards = projectCards ?? [];
  const projGap = projectGap ?? g;
  const leftCol = edge + leftColumnInset;
  const cardW = cards[0]?.width ?? Math.round(180 * layoutScale);
  const cardH = cards[0]?.windowHeight ?? Math.round(200 * layoutScale);
  const cols = PROJECT_GRID_COLS;
  const rows = Math.ceil(nProj / cols);
  const gridW = cols * cardW + Math.max(0, cols - 1) * projGap;
  const gridH = rows * cardH + Math.max(0, rows - 1) * projGap;
  const maxProjectExtent = gridH;

  const H = estDesktopWindowHeights(layoutScale, W.me, maxProjectExtent);
  const pad = GAP;

  const regionLeft = Number.isFinite(gridMinLeft) ? gridMinLeft : 0;
  const regionRight = Number.isFinite(gridMaxRight) ? gridMaxRight : vw;
  const regionW = Math.max(0, regionRight - regionLeft);
  const gridLeft = Math.round(regionLeft + Math.max(0, (regionW - gridW) / 2));
  const gridTop = Math.round(
    vh - BOTTOM_RESERVE - gridH - Math.round(PROJECT_GRID_LIFT * layoutScale)
  );

  const pos = {};
  for (let i = 0; i < nProj; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    pos[`projSlot${i}`] = {
      left: gridLeft + col * (cardW + projGap),
      top: gridTop + row * (cardH + projGap),
    };
  }

  const projTop = gridTop;

  const meTop = topBand;
  pos.me = { left: leftCol, top: meTop };

  const meBottom = meTop + H.me;
  const contactGap = pad + Math.round(38 * layoutScale);
  let contactTop = meBottom + contactGap;
  const maxContactTop = projTop - pad - H.contact;
  if (contactTop > maxContactTop) {
    contactTop = Math.max(meBottom + pad, maxContactTop);
  }
  pos.contact = { left: leftCol, top: Math.round(contactTop) };

  const bandBottom = projTop - pad;
  let welcomeTop = Math.round((vh - H.welcome) / 2);
  welcomeTop = Math.max(
    topBand,
    Math.min(welcomeTop, Math.max(topBand, bandBottom - H.welcome))
  );
  let welcomeLeft = Math.round((vw - W.welcome) / 2);
  const meRight = leftCol + W.me + pad;
  if (welcomeLeft < meRight) {
    welcomeLeft = meRight;
  }
  const maxWelcomeLeft = vw - W.welcome - edge - RIGHT_RESERVE;
  welcomeLeft = Math.min(welcomeLeft, maxWelcomeLeft);
  welcomeLeft = Math.max(edge, welcomeLeft);

  if (welcomeTop + H.welcome > bandBottom) {
    welcomeTop = Math.max(topBand, bandBottom - H.welcome);
  }
  pos.welcome = { left: welcomeLeft, top: welcomeTop };

  // Decorative globe is centered in Desktop from desktopGlobeBox(), not this slot.
  pos.skills = {
    left: Math.round(vw / 2),
    top: Math.round(vh / 2),
  };

  const iconH = DESKTOP_FOLDER_ICON_H;

  // Bottom-anchored folder row — just above the status bar (108px clearance).
  const folderRowTop = Math.round(
    vh - iconH - Math.round((108 + 18) * layoutScale)
  );

  const folderIconGap = Math.round(6 * layoutScale);
  const folderIconW = 76;
  const folderIconH = DESKTOP_FOLDER_ICON_H;

  pos.folderIconRowTop = folderRowTop;

  pos.otherStuffIcon = {
    left: pos.contact.left,
    top: folderRowTop,
    width: folderIconW,
    height: folderIconH,
  };

  pos.otherProjectsIcon = {
    left: pos.contact.left + folderIconW + folderIconGap,
    top: folderRowTop,
    width: folderIconW,
    height: folderIconH,
  };

  const otherStuffTop = Math.round(
    Math.max(topBand, (vh - H.otherStuffWindow) / 2 - 20 * layoutScale)
  );
  pos.otherStuff = {
    left: Math.round((vw - W.otherStuff) / 2),
    top: otherStuffTop,
  };

  pos.otherProjects = {
    left: Math.round((vw - (W.otherProjects ?? W.otherStuff)) / 2),
    top: Math.round(
      Math.max(topBand, (vh - H.otherProjectsWindow) / 2 - 12 * layoutScale)
    ),
  };

  return pos;
}
