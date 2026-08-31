import { PROJECT_GRID_COLS, PROJECT_HERO_COLS } from "@/lib/projectDesktopCards";

export { titleBarH as desktopTitleBarHeight };

/**
 * Fixed desktop window positions: welcome centered, featured project row centered,
 * satellite windows in stable slots (no random overlap).
 */

function titleBarH(layoutScale) {
  return Math.max(26, Math.round(28 * layoutScale));
}

/**
 * Layout height guesses for zoning (welcome / me / skills / contact / projects).
 * Keep pessimistic so bands don’t collide on real content.
 */
export function identityWindowHeight(layoutScale) {
  const tb = titleBarH(layoutScale);
  return tb + Math.round(248 * layoutScale);
}

export function estDesktopWindowHeights(layoutScale, _meWidth, maxProjectExtent = 0) {
  const tb = titleBarH(layoutScale);
  const s = layoutScale;
  const identity = identityWindowHeight(layoutScale);

  const proj =
    maxProjectExtent > 0
      ? maxProjectExtent
      : tb + Math.round(265 * s);

  return {
    welcome: identity,
    me: identity,
    /** Floating skills globe + orbit tags (top-right, no window chrome). */
    skills: Math.round(430 * s),
    otherStuffWindow: tb + Math.round(320 * s),
    otherProjectsWindow: tb + Math.round(420 * s),
    contact: tb + Math.round(340 * s),
    proj,
  };
}

/** Status bar band (name row + quote + clock). */
export const STATUS_BAR_RESERVE = 88;
/** Scrolling project dock above the OS bar. */
export const PROJECT_DOCK_H = 158;
export const BOTTOM_RESERVE = STATUS_BAR_RESERVE;
/** Lift the hero windows above the dock. */
export const PROJECT_GRID_LIFT = PROJECT_DOCK_H + 28;
export const RIGHT_RESERVE = 28;
/** Extra inset for me.txt / contact.msg (clears left chrome / edge). */
export const LEFT_COLUMN_INSET = 28;
const GAP = 16;
export const DESKTOP_FOLDER_ICON_W = 62;
export const DESKTOP_FOLDER_ICON_H = 78;
/** Gap between featured project windows. */
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
}) {
  const cards = projectCards ?? [];
  const projGap = projectGap ?? g;
  const leftCol = edge + leftColumnInset;
  const cardW = cards[0]?.width ?? Math.round(180 * layoutScale);
  const cardH = cards[0]?.windowHeight ?? Math.round(200 * layoutScale);
  const cols = nProj <= PROJECT_HERO_COLS ? Math.max(1, nProj) : PROJECT_GRID_COLS;
  const rows = Math.ceil(nProj / cols);
  const gridW = cols * cardW + Math.max(0, cols - 1) * projGap;
  const gridH = rows * cardH + Math.max(0, rows - 1) * projGap;
  const maxProjectExtent = gridH;

  const H = estDesktopWindowHeights(layoutScale, W.me, maxProjectExtent);
  const pad = GAP;

  const gridLeft = Math.round((vw - gridW) / 2);
  const dockTop = vh - STATUS_BAR_RESERVE - PROJECT_DOCK_H;
  const identityBottom = topBand + H.welcome;
  const midTop = identityBottom + pad;
  const midBottom = dockTop - pad;
  const midH = Math.max(0, midBottom - midTop);
  const gridTop = Math.round(midTop + Math.max(0, (midH - gridH) / 2));

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
  let welcomeTop = meTop;
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

  // Folder row shares the dock band, left of the scrolling cards.
  const folderRowTop = Math.round(
    vh - STATUS_BAR_RESERVE - DESKTOP_FOLDER_ICON_H - Math.round(28 * layoutScale)
  );

  const folderIconGap = Math.round(6 * layoutScale);
  const folderIconW = DESKTOP_FOLDER_ICON_W;
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
