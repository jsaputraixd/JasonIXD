/**
 * Fixed desktop window positions: welcome centered, project row grouped and centered
 * at the bottom, satellite windows in stable slots (no random overlap).
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
    Math.round(112 * s);

  const proj =
    maxProjectExtent > 0
      ? maxProjectExtent
      : tb + Math.round(265 * s);

  return {
    welcome: tb + Math.round(420 * s),
    me: tb + meBody,
    skills: tb + Math.round(450 * s * 0.5),
    otherStuffWindow: tb + Math.round(320 * s),
    contact: tb + Math.round(290 * s),
    proj,
  };
}

const BOTTOM_RESERVE = 60;
/** Extra lift for the project window row from the bottom anchor (higher on screen). */
const PROJECT_ROW_LIFT = 150;
/** Extra downward nudge for dream-detective only (clears contact.msg). */
const DREAM_DETECTIVE_TOP_NUDGE = 28;
const RIGHT_RESERVE = 52;
/** Extra inset for me.txt / contact.msg (matches skills.log side padding). */
export const LEFT_COLUMN_INSET = 28;
const GAP = 16;
export const DESKTOP_FOLDER_ICON_W = 80;
export const DESKTOP_FOLDER_ICON_H = 96;
/** Pull bottom-corner folder/trash icons in from viewport edges. */
const DESKTOP_ICON_EDGE_INSET = 64;
/** Raise folder/trash slightly above the status bar. */
const DESKTOP_ICON_LIFT = 18;
/** Horizontal gap between project windows (wider than generic window gap). */
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
  const maxStaggerExtent =
    cards.length > 0
      ? Math.max(...cards.map((c) => c.topOffset + c.windowHeight), 0)
      : 0;
  const H = estDesktopWindowHeights(layoutScale, W.me, maxStaggerExtent);
  const pad = GAP;

  let projBaseTop = Math.round(
    vh - BOTTOM_RESERVE - maxStaggerExtent - PROJECT_ROW_LIFT
  );

  const rowW =
    cards.length > 0
      ? cards.reduce((sum, c) => sum + c.width, 0) +
        Math.max(0, cards.length - 1) * projGap
      : 0;
  const rowLeft = Math.round((vw - rowW) / 2);

  const pos = {};
  let cursorLeft = rowLeft;
  for (let i = 0; i < nProj; i++) {
    const card = cards[i];
    const w = card?.width ?? 180;
    pos[`projSlot${i}`] = {
      left: cursorLeft,
      top: projBaseTop + (card?.topOffset ?? 0),
    };
    cursorLeft += w + projGap;
  }

  if (pos.projSlot0) {
    pos.projSlot0.top += Math.round(DREAM_DETECTIVE_TOP_NUDGE * layoutScale);
  }

  let projTop = projBaseTop;

  const meTop = topBand;
  pos.me = { left: leftCol, top: meTop };

  const meBottom = meTop + H.me;
  let contactTop = meBottom + pad;
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
  const statusBarClearance = Math.round(80 + 12 * layoutScale);
  const iconLift = Math.round(DESKTOP_ICON_LIFT * layoutScale);
  const iconTop = Math.max(
    topBand,
    Math.round(vh - iconH - statusBarClearance - iconLift)
  );
  const iconInset = Math.round(DESKTOP_ICON_EDGE_INSET * layoutScale);

  pos.otherStuffIcon = {
    left: leftCol + iconInset,
    top: iconTop,
  };

  pos.trashIcon = {
    left: Math.round(vw - iconW - edge - RIGHT_RESERVE - iconInset),
    top: iconTop,
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
