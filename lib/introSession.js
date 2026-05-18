const INTRO_KEY = "portfolio-intro-seen";

/** True after the full first-visit intro finished this browser tab session. */
export function shouldSkipIntro() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* private mode / blocked storage */
  }
  window.__portfolioBootDone = true;
}
