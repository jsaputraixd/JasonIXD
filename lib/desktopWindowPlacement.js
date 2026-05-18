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
export function estDesktopWindowHeights(layoutScale, projWidth, meWidth) {
  const tb = titleBarH(layoutScale);
  const s = layoutScale;
  const inset = Math.max(18, Math.round(26 * s));
  const inner = Math.max(
    Math.round(130 * s),
    Math.min(Math.round(252 * s), Math.max(80, meWidth - inset))
  );
  const meBody =
    Math.round(12 * s) + inner + Math.round(52 * s);

  return {
    welcome: tb + Math.round(540 * s),
    me: tb + meBody,
    skills: tb + Math.round(450 * s * 0.5),
    contact: tb + Math.round(290 * s),
    proj:
      tb + Math.max(Math.round(265 * s), Math.round(projWidth * 1.52)),
  };
}

const BOTTOM_RESERVE = 60;
/** Extra lift for the project window row from the bottom anchor (higher on screen). */
const PROJECT_ROW_LIFT = 150;
const RIGHT_RESERVE = 52;
const GAP = 16;

/**
 * @returns {Record<string, { left: number, top: number }>}
 */
export function getDeterministicDesktopPositions({
  vw,
  vh,
  W,
  projWidth,
  nProj,
  layoutScale,
  edge,
  g,
  topBand,
}) {
  const H = estDesktopWindowHeights(layoutScale, projWidth, W.me);
  const pad = GAP;

  let projTop = Math.round(
    vh - BOTTOM_RESERVE - H.proj - PROJECT_ROW_LIFT
  );
  const rowW = nProj * projWidth + Math.max(0, nProj - 1) * g;
  const rowLeft = Math.round((vw - rowW) / 2);

  const pos = {};
  for (let i = 0; i < nProj; i++) {
    pos[`projSlot${i}`] = {
      left: rowLeft + i * (projWidth + g),
      top: projTop,
    };
  }

  const meTop = topBand;
  pos.me = { left: edge, top: meTop };

  const meBottom = meTop + H.me;
  let contactTop = meBottom + pad;
  const maxContactTop = projTop - pad - H.contact;
  if (contactTop > maxContactTop) {
    contactTop = Math.max(meBottom + 8, maxContactTop);
  }
  pos.contact = { left: edge, top: Math.round(contactTop) };

  const bandBottom = projTop - pad;
  let welcomeTop = Math.round((vh - H.welcome) / 2);
  welcomeTop = Math.max(
    topBand,
    Math.min(welcomeTop, Math.max(topBand, bandBottom - H.welcome))
  );
  let welcomeLeft = Math.round((vw - W.welcome) / 2);
  const meRight = edge + W.me + pad;
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
