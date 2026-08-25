"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MASK_SRC = "/textures/earth-water-mask.png";
const FONT_FAMILY = "'VT323', ui-monospace, monospace";
const PROBE_SIZE = 24;

// Shading ramps (sparse → dense). Ocean stays subtle; land reads as terrain.
const OCEAN = [" ", "·", ".", ":", "-", "="];
const LAND = ["+", "*", "o", "e", "a", "g", "0", "M", "W"];

/** ~0.0022 rad/frame at 60fps, expressed as rad/ms so throttled FPS still spins correctly. */
const AUTO_SPIN_RAD_PER_MS = 0.0022 / (1000 / 60);
const DRAG_TO_SPIN = 0.006;
const DRAG_TO_TILT = 0.006;
const TILT_LIMIT = 1.15;
const RESUME_DELAY_MS = 900;

const DEG = 180 / Math.PI;

/** Measure rendered VT323 cell size so the orthographic disc reads round. */
async function measureFontCell() {
  if (typeof document === "undefined") {
    return { wRatio: 0.57, hRatio: 1 };
  }

  try {
    await document.fonts.load(`${PROBE_SIZE}px VT323`);
    await document.fonts.ready;
  } catch {
    /* fall back to whatever is available */
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { wRatio: 0.57, hRatio: 1 };

  ctx.font = `${PROBE_SIZE}px ${FONT_FAMILY}`;
  const w =
    ctx.measureText("MMMMMMMMMM").width / 10 / PROBE_SIZE;
  const probe = document.createElement("pre");
  probe.style.cssText =
    "position:absolute;visibility:hidden;margin:0;padding:0;line-height:1;white-space:pre;";
  probe.style.font = `${PROBE_SIZE}px ${FONT_FAMILY}`;
  probe.textContent = "M\nM";
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height / 2 / PROBE_SIZE;
  document.body.removeChild(probe);
  return {
    wRatio: Number.isFinite(w) && w > 0 ? w : 0.57,
    hRatio: Number.isFinite(h) && h > 0 ? h : 1,
  };
}

/** Column count so the character grid is square in *pixel* space. */
function colsForSquareGrid(rows, wRatio, hRatio) {
  if (rows < 2) return 12;
  return Math.max(
    12,
    Math.round((rows - 1) * (hRatio / wRatio) + 1)
  );
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function prefersCoarsePointer() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 820px)").matches
  );
}

/**
 * Fully coded, interactive ASCII globe. Samples an equirectangular land mask
 * for accurate continents, spins on its own, and can be click-dragged to rotate
 * around both axes. Auto-spin resumes shortly after release.
 *
 * Perf: static cell geometry is precomputed; RAF pauses off-screen / when the
 * tab is hidden; frame rate is throttled (especially on lowPower / mobile).
 */
/** San Francisco, default vault-key pin on the mobile Skills globe. */
export const SF_VAULT_KEY = { lat: 37.7749, lon: -122.4194 };

/**
 * Project a lat/lon onto the orthographic disc used by the ASCII globe.
 * Returns null when the point is on the far side.
 */
function projectLatLon(latDeg, lonDeg, spin, tilt) {
  const lat = latDeg / DEG;
  const lonLocal = lonDeg / DEG - spin;
  const cosLat = Math.cos(lat);
  const gy = Math.sin(lat);
  const vx = cosLat * Math.sin(lonLocal);
  const gz0 = cosLat * Math.cos(lonLocal);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const vy = gy * cosT - gz0 * sinT;
  const vz = gy * sinT + gz0 * cosT;
  if (vz <= 0.06) return null;
  return { ux: vx, uy: -vy, vz };
}

export default function InteractiveAsciiGlobe({
  rows = 44,
  className = "",
  style = {},
  interactive = true,
  ariaLabel = "Interactive globe. Drag to rotate.",
  /** Prefer lower FPS + lighter paint (mobile Skills, etc.). */
  lowPower = false,
  /** >1 grows the ASCII disc to fill its circular frame (closes the dark rim gap). */
  fillScale = 1,
  /** Multiplier on idle spin. 1 = default, lower is slower. */
  spinSpeed = 1,
  /** Quieter paint for a background globe (no orange glyph glow). */
  muted = false,
  /**
   * Optional surface pin (e.g. SF vault key).
   * { lat, lon, collected, onCollect, glyph? }
   */
  surfacePin = null,
}) {
  const containerRef = useRef(null);
  const preRef = useRef(null);
  const pinRef = useRef(null);
  const pinCollectedRef = useRef(false);
  const surfacePinRef = useRef(surfacePin);

  // Start with California roughly facing the camera so the SF pin is findable.
  const rotRef = useRef({ spin: -2.12, tilt: 0.18 });
  const dragRef = useRef(null);
  const draggingRef = useRef(false);
  const resumeAtRef = useRef(0);
  const visibleRef = useRef(true);
  const pinDragRef = useRef(null);
  const spinSpeedRef = useRef(spinSpeed);
  spinSpeedRef.current = spinSpeed;

  pinCollectedRef.current = Boolean(surfacePin?.collected);
  surfacePinRef.current = surfacePin;

  const maskRef = useRef(null); // { data: Uint8Array, w, h }
  const [maskReady, setMaskReady] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [cellMetrics, setCellMetrics] = useState({ wRatio: 0.57, hRatio: 1 });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  const cols = colsForSquareGrid(rows, cellMetrics.wRatio, cellMetrics.hRatio);
  const useLowPower = lowPower || coarsePointer;

  useLayoutEffect(() => {
    let cancelled = false;
    measureFontCell().then((metrics) => {
      if (!cancelled) setCellMetrics(metrics);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqCoarse = window.matchMedia("(pointer: coarse), (max-width: 820px)");
    setReduceMotion(mqMotion.matches);
    setCoarsePointer(mqCoarse.matches);
    const onMotion = () => setReduceMotion(mqMotion.matches);
    const onCoarse = () => setCoarsePointer(mqCoarse.matches);
    mqMotion.addEventListener?.("change", onMotion);
    mqCoarse.addEventListener?.("change", onCoarse);
    return () => {
      mqMotion.removeEventListener?.("change", onMotion);
      mqCoarse.removeEventListener?.("change", onCoarse);
    };
  }, []);

  // Size type so the orthographic disc diameter matches the square container.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { wRatio, hRatio } = cellMetrics;
    const measure = () => {
      // Use layout size (not getBoundingClientRect) so a parent CSS scale
      // doesn't double-apply and shrink/grow the ASCII vs its rim.
      const d = Math.min(el.clientWidth, el.clientHeight);
      if (d <= 0) return;
      const denom = Math.min((cols - 1) * wRatio, (rows - 1) * hRatio);
      if (denom <= 0) return;
      const boost = Number.isFinite(fillScale) && fillScale > 0 ? fillScale : 1;
      // Slight sub-pixel precision; avoid coarse rounding that leaves a dark rim gap.
      const next = Math.max(6, Math.round(((d * boost) / denom) * 100) / 100);
      setFontSize((prev) => (Math.abs(prev - next) < 0.08 ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows, cols, cellMetrics, fillScale]);

  // Load + decode the land mask once (downscaled on low-power devices).
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.src = MASK_SRC;
    img.onload = () => {
      if (cancelled) return;
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const maxDim = prefersCoarsePointer() || lowPower ? 512 : 768;
      const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
      const w = Math.max(1, Math.round(srcW * scale));
      const h = Math.max(1, Math.round(srcH * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const { data: px } = ctx.getImageData(0, 0, w, h);

      // First pass: fraction of dark pixels. Land is the minority class (~29%).
      let dark = 0;
      const n = w * h;
      for (let i = 0; i < n; i++) {
        if (px[i * 4] < 128) dark++;
      }
      const landIsDark = dark / n < 0.5;

      const mask = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const isDark = px[i * 4] < 128;
        mask[i] = (landIsDark ? isDark : !isDark) ? 1 : 0;
      }
      maskRef.current = { data: mask, w, h };
      setMaskReady(true);
    };
    img.onerror = () => {
      /* leave maskReady false, component renders empty rather than crashing */
    };
    return () => {
      cancelled = true;
    };
  }, [lowPower]);

  useEffect(() => {
    if (!maskReady) return;
    const pre = preRef.current;
    const container = containerRef.current;
    if (!pre || !container) return;

    const mask = maskRef.current;
    const maskW = mask.w;
    const maskH = mask.h;
    const maskData = mask.data;
    const cw = fontSize * cellMetrics.wRatio;
    const ch = fontSize * cellMetrics.hRatio;
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const R = Math.min(cx * cw, cy * ch);
    const Rlim = R * R;

    // Light from upper-left-front for a soft terminator.
    const ll = -0.5;
    const lm = 0.55;
    const ln = 0.66;
    const llen = Math.hypot(ll, lm, ln);
    const lx = ll / llen;
    const ly = lm / llen;
    const lz = ln / llen;

    // Static per-cell geometry + shading; only lat/lon change each frame.
    const totalLen = rows * cols + (rows - 1);
    const chars = new Array(totalLen);
    const active = [];
    let p = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dx = (col - cx) * cw;
        const dy = (row - cy) * ch;
        if (dx * dx + dy * dy > Rlim) {
          chars[p++] = " ";
          continue;
        }
        const ux = dx / R;
        const uy = dy / R;
        const uz = Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy));
        const vx = ux;
        const vy = -uy;
        const vz = uz;

        let bright = vx * lx + vy * ly + vz * lz;
        bright = clamp(bright * 0.85 + 0.15, 0, 1);
        const rCell = Math.sqrt(dx * dx + dy * dy) / R;
        if (rCell > 0.92) bright *= 1 - ((rCell - 0.92) / 0.08) * 0.6;

        const li = clamp(Math.floor(bright * LAND.length), 0, LAND.length - 1);
        const oi = clamp(Math.floor(bright * OCEAN.length), 0, OCEAN.length - 1);
        chars[p] = OCEAN[oi];
        active.push({
          i: p,
          vx,
          vy,
          vz,
          landCh: LAND[li],
          oceanCh: OCEAN[oi],
        });
        p++;
      }
      if (row < rows - 1) chars[p++] = "\n";
    }

    const sampleLand = (latDeg, lonDeg) => {
      let u = (lonDeg + 180) / 360;
      u = u - Math.floor(u);
      let v = (90 - latDeg) / 180;
      if (v < 0) v = 0;
      else if (v > 1) v = 1;
      const mx = (u * maskW) | 0;
      const my = (v * maskH) | 0;
      return maskData[my * maskW + (mx < maskW ? mx : maskW - 1)] === 1;
    };

    let lastSpin = NaN;
    let lastTilt = NaN;
    let lastPinCollected = pinCollectedRef.current;

    const render = (force = false) => {
      const { spin, tilt } = rotRef.current;
      const pinCollected = pinCollectedRef.current;
      if (
        !force &&
        spin === lastSpin &&
        tilt === lastTilt &&
        pinCollected === lastPinCollected
      ) {
        return;
      }
      lastSpin = spin;
      lastTilt = tilt;
      lastPinCollected = pinCollected;

      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const spinDeg = spin * DEG;
      const n = active.length;

      const pin = surfacePinRef.current;
      const pinActive = Boolean(pin) && !pinCollectedRef.current;
      let bestPinIdx = -1;
      let bestPinDist = Infinity;

      if (pinActive) {
        for (let a = 0; a < n; a++) {
          const cell = active[a];
          const gy = cell.vy * cosT + cell.vz * sinT;
          const gz = -cell.vy * sinT + cell.vz * cosT;
          const lat = Math.asin(clamp(gy, -1, 1)) * DEG;
          const lon = Math.atan2(cell.vx, gz) * DEG + spinDeg;
          chars[cell.i] = sampleLand(lat, lon) ? cell.landCh : cell.oceanCh;
          const vzView = gy * sinT + gz * cosT;
          if (vzView > 0.08) {
            let dLon = lon - pin.lon;
            dLon = ((dLon + 540) % 360) - 180;
            const dLat = lat - pin.lat;
            const dist = dLat * dLat + dLon * dLon;
            if (dist < bestPinDist) {
              bestPinDist = dist;
              bestPinIdx = cell.i;
            }
          }
        }
        if (bestPinIdx >= 0 && bestPinDist < 40) {
          chars[bestPinIdx] = pin.glyph || "*";
        }
      } else {
        // No pin: skip SF distance work every frame.
        for (let a = 0; a < n; a++) {
          const cell = active[a];
          const gy = cell.vy * cosT + cell.vz * sinT;
          const gz = -cell.vy * sinT + cell.vz * cosT;
          const lat = Math.asin(clamp(gy, -1, 1)) * DEG;
          const lon = Math.atan2(cell.vx, gz) * DEG + spinDeg;
          chars[cell.i] = sampleLand(lat, lon) ? cell.landCh : cell.oceanCh;
        }
      }

      // Text node update avoids wiping <pre> layout each frame.
      let textNode = pre.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
        pre.textContent = "";
        textNode = document.createTextNode("");
        pre.appendChild(textNode);
      }
      textNode.nodeValue = chars.join("");

      // Orange surface pin overlay, track via DOM only (don't fight React styles).
      const pinEl = pinRef.current;
      if (pinEl) {
        const proj =
          pinActive ? projectLatLon(pin.lat, pin.lon, spin, tilt) : null;
        if (!proj) {
          pinEl.classList.remove("globe-surface-pin--live");
          pinEl.style.pointerEvents = "none";
        } else {
          pinEl.classList.add("globe-surface-pin--live");
          pinEl.style.pointerEvents = "auto";
          // % here is vs the globe container (left/top), not the 44px button.
          pinEl.style.left = `calc(50% + ${proj.ux * 50}%)`;
          pinEl.style.top = `calc(50% + ${proj.uy * 50}%)`;
        }
      }
    };

    const idleFps = useLowPower ? 16 : 22;
    const dragFps = useLowPower ? 28 : 40;
    const idleInterval = 1000 / idleFps;
    const dragInterval = 1000 / dragFps;

    let raf = 0;
    let running = false;
    let lastTs = 0;
    let lastPaint = 0;

    const tick = (now) => {
      if (!running) return;

      if (!visibleRef.current || document.hidden) {
        running = false;
        raf = 0;
        return;
      }

      const dt = lastTs ? Math.min(48, now - lastTs) : 16.67;
      lastTs = now;

      if (
        !draggingRef.current &&
        !reduceMotion &&
        now >= resumeAtRef.current
      ) {
        rotRef.current.spin += AUTO_SPIN_RAD_PER_MS * spinSpeedRef.current * dt;
      }

      const interval = draggingRef.current ? dragInterval : idleInterval;
      if (now - lastPaint >= interval) {
        render();
        lastPaint = now;
      }

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      if (!visibleRef.current || document.hidden) return;
      running = true;
      lastTs = 0;
      lastSpin = NaN;
      lastTilt = NaN;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current =
          entry.isIntersecting && entry.intersectionRatio > 0.02;
        if (visibleRef.current) start();
        else stop();
      },
      { threshold: [0, 0.02, 0.1, 0.25] }
    );
    io.observe(container);
    document.addEventListener("visibilitychange", onVisibility);

    render();
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    maskReady,
    fontSize,
    cols,
    rows,
    reduceMotion,
    cellMetrics,
    useLowPower,
  ]);

  const onPointerDown = (e) => {
    if (!interactive) return;
    draggingRef.current = true;
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e) => {
    if (!interactive || !draggingRef.current || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
    rotRef.current.spin -= dx * DRAG_TO_SPIN;
    rotRef.current.tilt = clamp(
      rotRef.current.tilt + dy * DRAG_TO_TILT,
      -TILT_LIMIT,
      TILT_LIMIT
    );
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    dragRef.current = null;
    resumeAtRef.current = performance.now() + RESUME_DELAY_MS;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPinPointerDown = (e) => {
    // Allow a short tap to collect without stealing globe drags.
    pinDragRef.current = { x: e.clientX, y: e.clientY, moved: false };
    e.stopPropagation();
  };

  const onPinPointerMove = (e) => {
    const d = pinDragRef.current;
    if (!d) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) d.moved = true;
  };

  const onPinPointerUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const d = pinDragRef.current;
    pinDragRef.current = null;
    if (!d || d.moved) return;
    if (pinCollectedRef.current) return;
    surfacePinRef.current?.onCollect?.();
  };

  const showPin = Boolean(surfacePin) && !surfacePin.collected;
  const pinGlyph = surfacePin?.glyph ?? "*";

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: interactive ? "none" : undefined,
        cursor: interactive ? "grab" : "default",
        // Avoid paint containment so the SF pin overlay isn't clipped oddly.
        contain: "layout size",
        ...style,
      }}
      role={interactive ? "application" : undefined}
      aria-label={interactive ? ariaLabel : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <pre
        ref={preRef}
        aria-hidden="true"
        style={{
          margin: 0,
          padding: 0,
          fontFamily: FONT_FAMILY,
          fontSize,
          lineHeight: 1,
          letterSpacing: 0,
          color: muted
            ? "rgba(196, 194, 186, 0.72)"
            : "rgba(212, 210, 200, 0.94)",
          // text-shadow is expensive on mobile GPUs, keep glow on desktop only
          textShadow:
            useLowPower || muted
              ? "none"
              : "0 0 10px rgba(255, 122, 41, 0.22), 0 0 2px rgba(0,0,0, 0.85)",
          background: "transparent",
          userSelect: "none",
          whiteSpace: "pre",
        }}
      />
      {showPin ? (
        <button
          ref={pinRef}
          type="button"
          className="globe-surface-pin"
          aria-label="Strange signal over San Francisco"
          onPointerDown={onPinPointerDown}
          onPointerMove={onPinPointerMove}
          onPointerUp={onPinPointerUp}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerCancel={() => {
            pinDragRef.current = null;
          }}
        >
          <span className="globe-surface-pin__glow" aria-hidden />
          <span className="globe-surface-pin__dot" aria-hidden />
          <span className="globe-surface-pin__glyph" aria-hidden>
            {pinGlyph}
          </span>
        </button>
      ) : null}
    </div>
  );
}
