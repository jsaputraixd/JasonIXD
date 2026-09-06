/**
 * Portfolio showcase puppeteer.
 *
 * DEFAULT — Live on your screen (best quality):
 *   1. Start a 4K screen recording (QuickTime / OBS) with system audio
 *   2. npm run dev
 *   3. npm run record:showcase
 *   A Chrome window opens fullscreen, counts down, then plays the storyboard.
 *   Stop your recorder when it says done.
 *
 * Optional headless capture (lower quality):
 *   CAPTURE=1 npm run record:showcase
 */

import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BASE = process.env.BASE || "http://127.0.0.1:3000";
const OUT_DIR = path.resolve(
  process.env.OUT || path.join(ROOT, "exports", "showcase")
);
/** Live on-screen performance by default. Set CAPTURE=1 for headless file capture. */
const LIVE = process.env.CAPTURE !== "1";
const FPS = 60;
const FRAME_MS = 1000 / FPS;
const SPEED = Number(process.env.SPEED || 1);
const COUNTDOWN_SEC = Number(process.env.COUNTDOWN || 5);

const PRESETS = {
  "1080p": { width: 1920, height: 1080, deviceScaleFactor: 1 },
  "1440p": { width: 2560, height: 1440, deviceScaleFactor: 1 },
};
let RES = {
  ...PRESETS[process.env.RES === "1440p" ? "1440p" : "1080p"],
};
const ACCENT = "#FF7A29";
const X264_CRF = Number(process.env.CRF || 12);
const X264_PRESET = process.env.X264_PRESET || "slow";
/**
 * Playwright video usually lags the live page/audio.
 * Positive = push audio later so it matches picture (ms).
 */
const AUDIO_DELAY_MS = Number(process.env.AUDIO_DELAY_MS || 1200);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isNavContextError(err) {
  const msg = String(err?.message || err || "");
  return /Execution context was destroyed|most likely because of a navigation|Target closed|Frame was detached/i.test(
    msg
  );
}

/** page.evaluate that retries across Next.js HMR / soft navigations. */
async function safeEvaluate(page, fn, arg, { retries = 8, reinject = false } = {}) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      if (arg === undefined) return await page.evaluate(fn);
      return await page.evaluate(fn, arg);
    } catch (err) {
      lastErr = err;
      if (!isNavContextError(err)) throw err;
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
      await sleep(250);
      if (reinject) {
        try {
          await injectChrome(page);
        } catch {
          /* retry loop continues */
        }
      }
    }
  }
  throw lastErr;
}

function ms(n) {
  return Math.max(1, Math.round(n * SPEED));
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function cubicBezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x:
      u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x,
    y:
      u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y,
  };
}

function curveControls(from, to, arc) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const bulge = Math.min(36, dist * arc);
  return {
    p1: {
      x: from.x + dx * 0.35 + nx * bulge,
      y: from.y + dy * 0.35 + ny * bulge,
    },
    p2: {
      x: from.x + dx * 0.7 + nx * bulge * 0.25,
      y: from.y + dy * 0.7 + ny * bulge * 0.25,
    },
  };
}

function computeCam(focus, { scale = 1.04, pan = 0.14 } = {}) {
  const { width: W, height: H } = RES;
  let tx = (W / 2 - focus.x) * pan;
  let ty = (H / 2 - focus.y) * pan;
  const needS = Math.max(
    scale,
    1 + (2 * Math.abs(tx)) / W + 0.002,
    1 + (2 * Math.abs(ty)) / H + 0.002
  );
  const s = Math.min(1.22, needS);
  const maxX = ((s - 1) * W) / 2;
  const maxY = ((s - 1) * H) / 2;
  return {
    x: clamp(tx, -maxX, maxX),
    y: clamp(ty, -maxY, maxY),
    s,
  };
}

const CAM_HOME = { x: 0, y: 0, s: 1 };

function screenToWorld(p, cam) {
  const ox = RES.width / 2;
  const oy = RES.height / 2;
  const s = cam.s || 1;
  return {
    x: ox + (p.x - ox - cam.x) / s,
    y: oy + (p.y - oy - cam.y) / s,
  };
}

function worldToScreen(p, cam) {
  const ox = RES.width / 2;
  const oy = RES.height / 2;
  const s = cam.s || 1;
  return {
    x: ox + (p.x - ox) * s + cam.x,
    y: oy + (p.y - oy) * s + cam.y,
  };
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    child.stderr.on("data", (d) => {
      err += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}\n${err.slice(-2500)}`));
    });
  });
}

async function assertServer() {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    throw new Error(
      `Cannot reach ${BASE}. Start the site first:\n  npm run dev\n\n(${e.message})`
    );
  }
}

/** Pace a wall-clock action at ~60Hz without screenshot I/O. */
async function forDuration(durationMs, onTick) {
  const start = performance.now();
  let i = 0;
  for (;;) {
    const t = clamp((performance.now() - start) / durationMs, 0, 1);
    await onTick(t, i++);
    if (t >= 1) break;
    const due = start + i * FRAME_MS;
    const wait = due - performance.now();
    if (wait > 1) await sleep(wait);
  }
}

function audioTapInitScript() {
  return () => {
    try {
      sessionStorage.removeItem("portfolio-intro-seen");
      delete window.__portfolioBootDone;
    } catch {
      /* ignore */
    }

    const Native = window.AudioContext || window.webkitAudioContext;
    if (!Native || Native.__showcasePatched) return;
    Native.__showcasePatched = true;

    let singleton = null;
    let tap = null;
    const chunks = [];
    let sampleRate = 48000;

    function armTap(ctx) {
      if (tap) return;
      sampleRate = ctx.sampleRate || 48000;
      tap = ctx.createGain();
      tap.gain.value = 1;
      const mute = ctx.createGain();
      mute.gain.value = 0;
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      proc.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const copy = new Float32Array(input.length);
        copy.set(input);
        chunks.push(copy);
      };
      tap.connect(proc);
      proc.connect(mute);
      mute.connect(ctx.destination);
    }

    function SharedAudioContext(...args) {
      if (!singleton) {
        singleton = new Native(...args);
        armTap(singleton);
      }
      return singleton;
    }
    SharedAudioContext.prototype = Native.prototype;
    Object.setPrototypeOf(SharedAudioContext, Native);
    window.AudioContext = SharedAudioContext;
    window.webkitAudioContext = SharedAudioContext;

    const OrigConnect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (destination, ...rest) {
      const result = OrigConnect.call(this, destination, ...rest);
      try {
        if (tap && destination === this.context.destination) {
          OrigConnect.call(this, tap, ...rest);
        }
      } catch {
        /* ignore */
      }
      return result;
    };

    window.__showcaseUnlockAudio = async () => {
      const ctx = new SharedAudioContext();
      armTap(ctx);
      if (ctx.state === "suspended") await ctx.resume();
      const g = ctx.createGain();
      g.gain.value = 0.00001;
      const o = ctx.createOscillator();
      o.frequency.value = 40;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.02);
    };

    window.__showcaseClearAudio = () => {
      chunks.length = 0;
    };

    window.__showcaseExportWav = () => {
      if (!chunks.length) return null;
      let total = 0;
      for (const c of chunks) total += c.length;
      if (total < 2048) return null;

      const samples = new Float32Array(total);
      let off = 0;
      for (const c of chunks) {
        samples.set(c, off);
        off += c.length;
      }

      let peak = 0;
      for (let i = 0; i < samples.length; i++) {
        peak = Math.max(peak, Math.abs(samples[i]));
      }
      const gain = peak > 0.0005 ? Math.min(0.85 / peak, 12) : 1;

      const dataSize = samples.length * 2;
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);
      const str = (o, s) => {
        for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
      };
      str(0, "RIFF");
      view.setUint32(4, 36 + dataSize, true);
      str(8, "WAVE");
      str(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      str(36, "data");
      view.setUint32(40, dataSize, true);
      let o = 44;
      for (let i = 0; i < samples.length; i++) {
        const v = Math.max(-1, Math.min(1, samples[i] * gain));
        view.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
        o += 2;
      }

      const bytes = new Uint8Array(buffer);
      let bin = "";
      const step = 0x8000;
      for (let i = 0; i < bytes.length; i += step) {
        bin += String.fromCharCode.apply(
          null,
          bytes.subarray(i, Math.min(i + step, bytes.length))
        );
      }
      return {
        dataUrl: `data:audio/wav;base64,${btoa(bin)}`,
        sampleRate,
        samples: samples.length,
      };
    };
  };
}

function dataUrlToFile(dataUrl, filePath) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return false;
  fs.writeFileSync(filePath, Buffer.from(m[2], "base64"));
  return true;
}

const SHOWCASE_STYLE = `
  html, body, * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
  html, body {
    text-rendering: optimizeLegibility !important;
    -webkit-font-smoothing: antialiased !important;
    overflow: hidden !important;
  }
  *, *::before, *::after { cursor: none !important; }
  body > div[aria-hidden="true"][style*="70000"] { visibility: hidden !important; }

  /* Next.js dev indicator / issue pill (bottom-left) */
  nextjs-portal,
  nextjs-portal *,
  [data-next-badge],
  [data-next-badge-root],
  [data-nextjs-toast],
  [data-nextjs-dialog-overlay],
  [data-nextjs-dialog],
  #__next-build-watcher {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /*
   * Recording-only featured hover polish:
   * Site expand is ~150ms (≈4 frames at 25fps → looks like a pop).
   * Slow it + drop live blur so the recorder catches a smooth ramp.
   */
  .os-window-featured-zoom {
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) !important;
  }
  .desktop-stage:not(.desktop-stage--featured-hover-gated)
    .os-window--featured:not(.os-window--held):hover
    .os-window-featured-zoom {
    transform: scale(1.38) !important;
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1) !important;
  }
  .desktop-stage:not(.desktop-stage--featured-hover-gated)
    .os-window--featured:not(.os-window--held):hover
    .os-window-chrome {
    transition: box-shadow 0.55s ease !important;
  }
  .desktop-project-focus-scrim {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: rgba(8, 5, 4, 0.32) !important;
    transition: opacity 0.5s ease 0.05s !important;
  }
  .desktop-stage:not(.desktop-stage--featured-hover-gated):has(
      .os-window--featured:not(.os-window--held):hover
    )
    .desktop-project-focus-scrim {
    transition: opacity 0.5s ease 0.05s !important;
  }

  #showcase-cursor {
    position: fixed;
    top: 0; left: 0;
    width: 14px; height: 14px;
    margin: -7px 0 0 -7px;
    border-radius: 9999px;
    background: ${ACCENT};
    box-shadow:
      0 0 0 2px rgba(7, 4, 5, 0.55),
      0 0 18px rgba(255, 122, 41, 0.85),
      0 0 42px rgba(255, 122, 41, 0.35);
    pointer-events: none;
    z-index: 2147483646;
    mix-blend-mode: screen;
    will-change: transform;
    transform: translate3d(-100px, -100px, 0);
  }
  #showcase-cursor::after {
    content: "";
    position: absolute;
    inset: -10px;
    border-radius: inherit;
    border: 1px solid rgba(255, 122, 41, 0.35);
    opacity: 0.9;
  }
  #showcase-camera-root {
    transform-origin: 50% 50%;
    will-change: transform;
    transition: none;
  }
`;

async function injectChrome(page) {
  // Kill the Next.js red "N / Issue" dev badge so it never appears in the take.
  await safeEvaluate(page, () => {
    fetch("/__nextjs_disable_dev_indicator", { method: "POST" }).catch(() => {});
  });

  try {
    await page.addStyleTag({ content: SHOWCASE_STYLE });
  } catch (err) {
    if (!isNavContextError(err)) throw err;
    await page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
    await sleep(200);
    await page.addStyleTag({ content: SHOWCASE_STYLE });
  }

  await safeEvaluate(page, () => {
    if (!document.getElementById("showcase-cursor")) {
      const c = document.createElement("div");
      c.id = "showcase-cursor";
      document.documentElement.appendChild(c);
    }
    const stage = document.querySelector(".desktop-stage") || document.body;
    if (stage) stage.id = "showcase-camera-root";
    window.__showcaseCam = { x: 0, y: 0, s: 1 };
  });
}

async function applyFrame(page, cursor, cam) {
  try {
    await page.evaluate(
      ({ cursor, cam }) => {
        const el = document.getElementById("showcase-cursor");
        if (el) el.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
        const root = document.getElementById("showcase-camera-root");
        if (root) {
          window.__showcaseCam = cam;
          root.style.transform = `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s})`;
        }
      },
      { cursor, cam }
    );
  } catch (err) {
    if (!isNavContextError(err)) throw err;
    await page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
    await sleep(200);
    await injectChrome(page);
    await page.evaluate(
      ({ cursor, cam }) => {
        const el = document.getElementById("showcase-cursor");
        if (el) el.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
        const root = document.getElementById("showcase-camera-root");
        if (root) {
          window.__showcaseCam = cam;
          root.style.transform = `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.s})`;
        }
      },
      { cursor, cam }
    );
  }
  await page.mouse.move(cursor.x, cursor.y);
}

async function puppetTo(
  page,
  fromCursor,
  toWorld,
  camFrom,
  camTo,
  durationMs,
  { arc = 0.06, ease = easeInOutCubic } = {}
) {
  const fromWorld = screenToWorld(fromCursor, camFrom);
  const { p1, p2 } = curveControls(fromWorld, toWorld, arc);
  let cursor = worldToScreen(toWorld, camTo);
  let cam = { ...camTo };

  await forDuration(durationMs, async (t) => {
    const e = ease(t);
    const world = cubicBezier(fromWorld, p1, p2, toWorld, e);
    cam = {
      x: lerp(camFrom.x, camTo.x, e),
      y: lerp(camFrom.y, camTo.y, e),
      s: lerp(camFrom.s, camTo.s, e),
    };
    cursor = worldToScreen(world, cam);
    await applyFrame(page, cursor, cam);
  });

  return { cursor, cam };
}

async function moveDrag(
  page,
  from,
  to,
  cam,
  durationMs,
  ease = easeInOutCubic
) {
  let cursor = { ...to };
  await forDuration(durationMs, async (t) => {
    const e = ease(t);
    cursor = {
      x: lerp(from.x, to.x, e),
      y: lerp(from.y, to.y, e),
    };
    await applyFrame(page, cursor, cam);
  });
  return cursor;
}

async function hold(page, cursor, cam, durationMs) {
  await applyFrame(page, cursor, cam);
  await sleep(durationMs);
}

async function centerOf(locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element has no bounding box");
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
    box,
  };
}

async function worldCenter(locator, cam) {
  const screen = await centerOf(locator);
  return { ...screenToWorld(screen, cam), box: screen.box, screen };
}

async function waitForSplash(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  // Let Next hydrate / settle before touching the DOM (avoids HMR races).
  await page.waitForLoadState("load").catch(() => {});
  await sleep(600);
  await injectChrome(page);

  // Let Playwright's video pipeline start before we keep any audio samples.
  await sleep(450);
  await safeEvaluate(
    page,
    async () => {
      if (typeof window.__showcaseUnlockAudio === "function") {
        await window.__showcaseUnlockAudio();
      }
      if (typeof window.__showcaseClearAudio === "function") {
        window.__showcaseClearAudio();
      }
    },
    undefined,
    { reinject: true }
  );
  await page.mouse.click(20, 20);
  // Drop the unlock click blip so the bed starts with the real splash.
  await safeEvaluate(page, () => {
    if (typeof window.__showcaseClearAudio === "function") {
      window.__showcaseClearAudio();
    }
  });

  const splashMin = 320 + 4300 + 800 + 400;
  const started = Date.now();
  for (;;) {
    await sleep(50);
    let ready = false;
    try {
      ready = await page.evaluate(
        () => document.querySelectorAll(".os-window--featured").length >= 3
      );
    } catch (err) {
      if (!isNavContextError(err)) throw err;
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {});
      await sleep(300);
      await injectChrome(page).catch(() => {});
      continue;
    }
    const elapsed = Date.now() - started;
    if (ready && elapsed >= splashMin) break;
    if (elapsed > 100000) {
      throw new Error("Timed out waiting for featured desktop after splash");
    }
  }

  await injectChrome(page);
  await sleep(ms(900));
}

async function storyboard(page) {
  let cam = { ...CAM_HOME };

  const featured = page.locator(".os-window--featured");
  const count = Math.min(3, await featured.count());
  if (count < 1) throw new Error("No featured project windows found");

  const first = featured.nth(0);
  await first.waitFor({ state: "visible" });
  const firstFocus = await worldCenter(first, cam);
  const aboveFirst = {
    x: firstFocus.x,
    y: firstFocus.y - Math.max(70, firstFocus.box.height * 0.58),
  };

  let cursor = { ...aboveFirst };
  await hold(page, cursor, cam, ms(650));

  for (let i = 0; i < count; i++) {
    const card = featured.nth(i);
    await card.waitFor({ state: "visible" });
    const focus = await worldCenter(card, cam);
    const camTo = computeCam(focus, { scale: 1.04, pan: 0.1 });

    // 1) Drift to just above the card (not hovering yet).
    const preHover = {
      x: focus.x,
      y: focus.y - Math.max(48, focus.box.height * 0.42),
    };
    ({ cursor, cam } = await puppetTo(
      page,
      cursor,
      preHover,
      cam,
      camTo,
      ms(i === 0 ? 900 : 750),
      { arc: 0.04, ease: easeOutCubic }
    ));
    await hold(page, cursor, cam, ms(180));

    // 2) Ease into the card so expand starts mid-move and plays out fully.
    ({ cursor, cam } = await puppetTo(
      page,
      cursor,
      { x: focus.x, y: focus.y },
      cam,
      camTo,
      ms(720),
      { arc: 0.02, ease: easeOutCubic }
    ));
    await hold(page, cursor, cam, ms(1600));
  }

  ({ cursor, cam } = await puppetTo(
    page,
    cursor,
    { x: RES.width * 0.55, y: RES.height * 0.68 },
    cam,
    CAM_HOME,
    ms(700),
    { arc: 0.04 }
  ));
  await hold(page, cursor, cam, ms(320));

  const dock = page.locator(".project-dock__mask").first();
  await dock.waitFor({ state: "visible", timeout: 15000 });
  const dockFocus = await worldCenter(dock, cam);
  const dockCam = computeCam(dockFocus, { scale: 1.08, pan: 0.1 });

  ({ cursor, cam } = await puppetTo(
    page,
    cursor,
    { x: dockFocus.x, y: dockFocus.y },
    cam,
    dockCam,
    ms(900),
    { arc: 0.04 }
  ));
  await hold(page, cursor, cam, ms(280));

  const dockScreen = await centerOf(dock);
  const dragStart = {
    x: dockScreen.box.x + dockScreen.box.width * 0.72,
    y: dockScreen.y,
  };
  const dragEnd = {
    x: dockScreen.box.x + dockScreen.box.width * 0.22,
    y: dockScreen.y + 2,
  };

  cursor = await moveDrag(page, cursor, dragStart, cam, ms(420));
  await page.mouse.down();
  await sleep(80);
  cursor = await moveDrag(page, dragStart, dragEnd, cam, ms(1400));
  const coast = { x: dragEnd.x - 70, y: dragEnd.y };
  cursor = await moveDrag(page, dragEnd, coast, cam, ms(500), easeOutQuint);
  await page.mouse.up();
  await hold(page, cursor, cam, ms(1000));

  const bio = page.locator('[data-window-id="me"]').first();
  await bio.waitFor({ state: "visible", timeout: 15000 });
  ({ cursor, cam } = await puppetTo(
    page,
    cursor,
    screenToWorld({ x: cursor.x, y: Math.max(120, cursor.y - 80) }, cam),
    cam,
    CAM_HOME,
    ms(500),
    { arc: 0.02 }
  ));
  const bioFocus = await worldCenter(bio, cam);
  const bioCam = computeCam(bioFocus, { scale: 1.1, pan: 0.2 });

  ({ cursor, cam } = await puppetTo(
    page,
    cursor,
    { x: bioFocus.x, y: bioFocus.y },
    cam,
    bioCam,
    ms(1000),
    { arc: 0.03 }
  ));
  await hold(page, cursor, cam, ms(1500));

  const socials = page.locator(".contact-banner__icon");
  const socialCount = await socials.count();
  if (socialCount < 1) {
    throw new Error("No social icons found (.contact-banner__icon)");
  }

  for (let i = 0; i < socialCount; i++) {
    const icon = socials.nth(i);
    const focus = await worldCenter(icon, cam);
    const camTo = computeCam(focus, { scale: 1.08, pan: 0.16 });

    ({ cursor, cam } = await puppetTo(
      page,
      cursor,
      { x: focus.x, y: focus.y },
      cam,
      camTo,
      ms(i === 0 ? 800 : 600),
      { arc: 0.025 }
    ));
    await hold(page, cursor, cam, ms(700));
  }

  await hold(page, cursor, cam, ms(800));
  ({ cursor, cam } = await puppetTo(
    page,
    cursor,
    { x: RES.width * 0.5, y: RES.height * 0.48 },
    cam,
    CAM_HOME,
    ms(750),
    { arc: 0.03 }
  ));
  await hold(page, cursor, cam, ms(650));
}

async function encodeMaster(webmPath, wavPath, mp4Path, sampleRate = 48000) {
  const args = ["-y", "-i", webmPath];
  const hasAudio =
    wavPath && fs.existsSync(wavPath) && fs.statSync(wavPath).size > 1000;

  if (hasAudio) {
    // Delay audio so it doesn't lead the (slightly lagged) Playwright video.
    args.push("-itsoffset", (AUDIO_DELAY_MS / 1000).toFixed(3), "-i", wavPath);
    args.push(
      "-filter_complex",
      `[1:a]aformat=sample_fmts=fltp:sample_rates=${sampleRate},aresample=async=1:first_pts=0[a]`,
      "-map",
      "0:v",
      "-map",
      "[a]"
    );
  }

  args.push(
    "-c:v",
    "libx264",
    "-preset",
    X264_PRESET,
    "-crf",
    String(X264_CRF),
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-x264-params",
    "aq-mode=3:ref=5:me=umh:subme=9:trellis=1"
  );

  if (hasAudio) {
    args.push("-c:a", "aac", "-b:a", "256k", "-shortest");
  } else {
    args.push("-an");
  }

  args.push("-movflags", "+faststart", mp4Path);
  await run("ffmpeg", args);
}

async function showCountdown(page, seconds) {
  await safeEvaluate(page, async (sec) => {
    const el = document.createElement("div");
    el.id = "showcase-countdown";
    el.setAttribute(
      "style",
      [
        "position:fixed",
        "inset:0",
        "z-index:2147483647",
        "display:flex",
        "flex-direction:column",
        "align-items:center",
        "justify-content:center",
        "gap:28px",
        "background:#070405",
        "color:#FFE2C8",
        "font-family:VT323,monospace",
        "text-align:center",
      ].join(";")
    );
    const hint = document.createElement("div");
    hint.textContent = "Start your 4K screen recording now";
    hint.setAttribute(
      "style",
      "font-size:28px;letter-spacing:0.12em;text-transform:uppercase;color:#FF7A29"
    );
    const num = document.createElement("div");
    num.setAttribute("style", "font-size:min(28vw,220px);line-height:1;color:#fff");
    el.appendChild(hint);
    el.appendChild(num);
    document.documentElement.appendChild(el);
    for (let i = sec; i >= 1; i--) {
      num.textContent = String(i);
      await new Promise((r) => setTimeout(r, 1000));
    }
    hint.textContent = "";
    num.textContent = "GO";
    num.style.color = "#FF7A29";
    await new Promise((r) => setTimeout(r, 700));
    el.remove();
  }, seconds);
}

async function showDone(page) {
  await safeEvaluate(page, async () => {
    const el = document.createElement("div");
    el.setAttribute(
      "style",
      [
        "position:fixed",
        "inset:0",
        "z-index:2147483647",
        "display:flex",
        "flex-direction:column",
        "align-items:center",
        "justify-content:center",
        "gap:16px",
        "background:rgba(7,4,5,0.92)",
        "color:#FFE2C8",
        "font-family:VT323,monospace",
        "text-align:center",
      ].join(";")
    );
    el.innerHTML =
      '<div style="font-size:64px;color:#FF7A29;letter-spacing:0.14em">DONE</div>' +
      '<div style="font-size:28px;letter-spacing:0.08em">Stop your screen recorder</div>';
    document.documentElement.appendChild(el);
    await new Promise((r) => setTimeout(r, 4000));
  });
}

async function runLive() {
  await assertServer();

  console.log("\n══════════════════════════════════════════");
  console.log("  LIVE SHOWCASE — record your screen in 4K");
  console.log("══════════════════════════════════════════");
  console.log("1. Open QuickTime (File → New Screen Recording) or OBS");
  console.log("2. Enable Mac microphone/system audio if you want sound");
  console.log("3. A Chrome window will go fullscreen and count down");
  console.log(`4. Starting in a moment — countdown = ${COUNTDOWN_SEC}s`);
  console.log("   Tip: don’t save files mid-take (Next HMR can reload the page)\n");

  const browser = await chromium.launch({
    headless: false,
    channel: process.env.CHROME === "1" ? "chrome" : undefined,
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--start-fullscreen",
      "--kiosk",
      "--disable-infobars",
      "--hide-scrollbars",
    ],
  });

  const context = await browser.newContext({
    viewport: null,
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  await context.addInitScript(audioTapInitScript());
  const page = await context.newPage();

  try {
    // Size to the display so layout math matches what you see.
    const screen = await page.evaluate(() => ({
      width: window.screen.width,
      height: window.screen.height,
    }));
    RES = { width: screen.width, height: screen.height, deviceScaleFactor: 1 };
    await page.setViewportSize({
      width: screen.width,
      height: screen.height,
    });
    console.log(`Display ${screen.width}×${screen.height}`);

    await page.goto("about:blank");
    await showCountdown(page, COUNTDOWN_SEC);

    console.log("Playing splash + storyboard…");
    await waitForSplash(page);
    console.log("Splash done — featured / dock / bio / socials…");
    await storyboard(page);
    await showDone(page);
    console.log("\nLive run finished. Stop your screen recorder.");
  } finally {
    await browser.close();
  }
}

async function runCapture() {
  await assertServer();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const rawDir = path.join(OUT_DIR, `_raw-${stamp}`);
  fs.rmSync(rawDir, { recursive: true, force: true });
  fs.mkdirSync(rawDir, { recursive: true });

  console.log(`Headless capture ${RES.width}×${RES.height} + site audio`);
  console.log(`Audio delay compensation: ${AUDIO_DELAY_MS}ms`);
  console.log(`Base URL: ${BASE}`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--disable-lcd-text",
      "--hide-scrollbars",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: RES.width, height: RES.height },
    deviceScaleFactor: RES.deviceScaleFactor,
    colorScheme: "dark",
    reducedMotion: "no-preference",
    recordVideo: {
      dir: rawDir,
      size: { width: RES.width, height: RES.height },
    },
  });

  await context.addInitScript(audioTapInitScript());
  const page = await context.newPage();

  let audioExport = null;
  try {
    await waitForSplash(page);
    console.log("Splash complete — running storyboard at realtime…");
    await storyboard(page);
    audioExport = await page.evaluate(() => {
      if (typeof window.__showcaseExportWav !== "function") return null;
      return window.__showcaseExportWav();
    });
  } finally {
    try {
      await page.close();
    } catch {
      /* ignore */
    }
    await context.close();
    await browser.close();
  }

  const webms = fs.readdirSync(rawDir).filter((f) => f.endsWith(".webm"));
  if (!webms.length) throw new Error("No Playwright video produced");

  const webmOut = path.join(OUT_DIR, `showcase-${stamp}.webm`);
  const wavOut = path.join(OUT_DIR, `showcase-${stamp}.wav`);
  const mp4Out = path.join(OUT_DIR, `showcase-${stamp}-60fps.mp4`);
  fs.renameSync(path.join(rawDir, webms[0]), webmOut);
  fs.rmSync(rawDir, { recursive: true, force: true });

  if (fs.statSync(webmOut).size < 10_000) {
    throw new Error("Playwright video empty/corrupt");
  }

  let wavPath = null;
  let sampleRate = 48000;
  if (audioExport?.dataUrl && dataUrlToFile(audioExport.dataUrl, wavOut)) {
    wavPath = wavOut;
    sampleRate = audioExport.sampleRate || 48000;
    const sec = (audioExport.samples / sampleRate).toFixed(1);
    console.log(`Site audio captured (${sec}s @ ${sampleRate}Hz).`);
  } else {
    console.warn("Site audio tap empty — exporting video-only.");
  }

  console.log("Muxing master (picture timing preserved)…");
  await encodeMaster(webmOut, wavPath, mp4Out, sampleRate);

  console.log("\nDone.");
  if (wavPath) console.log(`  Audio: ${wavPath}`);
  console.log(`  Final: ${mp4Out}`);
}

async function main() {
  if (LIVE) await runLive();
  else await runCapture();
}

main().catch((err) => {
  console.error("\nShowcase failed:\n", err.message || err);
  process.exit(1);
});
