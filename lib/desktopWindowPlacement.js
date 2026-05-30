/**
 * Fixed desktop window positions: welcome centered, project 2×2 grid centered,
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
    skills: tb + Math.round(450 * s * 0.5),
    otherStuffWindow: tb + Math.round(320 * s),
    otherProjectsWindow: tb + Math.round(420 * s),
    contact: tb + Math.round(310 * s),
    proj,
  };
}

const BOTTOM_RESERVE = 60;
/** Lift the project grid from the bottom anchor (clears footer + corner icons). */
const PROJECT_GRID_LIFT = 118;
const PROJECT_GRID_COLS = 2;
export const RIGHT_RESERVE = 52;
/** Extra inset for me.txt / contact.msg (matches skills.log side padding). */
export const LEFT_COLUMN_INSET = 28;
const GAP = 16;
export const DESKTOP_FOLDER_ICON_W = 80;
export const DESKTOP_FOLDER_ICON_H = 96;
/** Pull bottom-corner folder/trash icons in from viewport edges. */
const DESKTOP_ICON_EDGE_INSET = 64;
/** Raise folder/trash above the status bar (full-width footer). */
const DESKTOP_ICON_LIFT = 44;
/** Gap between project windows in the 2×2 grid. */
export const PROJECT_WINDOW_GAP = 22;

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
  const cols = PROJECT_GRID_COLS;
  const rows = Math.ceil(nProj / cols);
  const gridW = cols * cardW + Math.max(0, cols - 1) * projGap;
  const gridH = rows * cardH + Math.max(0, rows - 1) * projGap;
  const maxProjectExtent = gridH;

  const H = estDesktopWindowHeights(layoutScale, W.me, maxProjectExtent);
  const pad = GAP;

  const gridLeft = Math.round((vw - gridW) / 2);
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
  const contactGap = pad + Math.round(34 * layoutScale);
  let contactTop = meBottom + contactGap;
  const maxContactTop = projTop - pad - H.contact;
  if (contactTop > maxContactTop) {
    contactTop = Math.max(meBottom + 8, maxContactTop);
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

  const skillsLeft = Math.round(vw - W.skills - edge - RIGHT_RESERVE);
  let skillsTop = topBand;
  pos.skills = { left: skillsLeft, top: skillsTop };

  const iconW = DESKTOP_FOLDER_ICON_W;
  const iconH = DESKTOP_FOLDER_ICON_H;
  const statusBarClearance = Math.round(108 + 14 * layoutScale);
  const iconLift = Math.round(DESKTOP_ICON_LIFT * layoutScale);
  const iconTop = Math.max(
    topBand,
    Math.round(vh - iconH - statusBarClearance - iconLift)
  );
  const iconInset = Math.round(DESKTOP_ICON_EDGE_INSET * layoutScale);

  const contactBottom = pos.contact.top + H.contact;
  const folderRowGap = Math.round(14 * layoutScale);
  const folderRowTop = Math.round(contactBottom + folderRowGap);
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

  pos.trashIcon = {
    left: Math.round(vw - iconW - edge - RIGHT_RESERVE - iconInset),
    top: iconTop,
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

  const skillsBottom = skillsTop + H.skills;
  const welcomeBottom = welcomeTop + H.welcome;
  if (
    skillsLeft < welcomeLeft + W.welcome + pad &&
    skillsBottom + pad > welcomeTop &&
    skillsTop < welcomeBottom + pad
  ) {
    const altTop = Math.round(welcomeBottom + pad);
    if (altTop + H.skills + BOTTOM_RESERVE < vh) {
      pos.skills.top = altTop;
    }
  }

  return pos;
}
