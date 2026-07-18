"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MASK_SRC = "/textures/earth-water-mask.png";
const FONT_FAMILY = "'VT323', ui-monospace, monospace";
const PROBE_SIZE = 24;

// Shading ramps (sparse → dense). Ocean stays subtle; land reads as terrain.
const OCEAN = [" ", "·", ".", ":", "-", "="];
const LAND = ["+", "*", "o", "e", "a", "g", "0", "M", "W"];

const AUTO_SPIN = 0.0022; // radians per frame
const DRAG_TO_SPIN = 0.006;
const DRAG_TO_TILT = 0.006;
const TILT_LIMIT = 1.15;
const RESUME_DELAY_MS = 900;

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

/**
 * Fully coded, interactive ASCII globe. Samples an equirectangular land mask
 * for accurate continents, spins on its own, and can be click-dragged to rotate
 * around both axes. Auto-spin resumes shortly after release.
 */
export default function InteractiveAsciiGlobe({
  rows = 44,
  className = "",
  style = {},
  interactive = true,
  ariaLabel = "Interactive globe — drag to rotate",
}) {
  const containerRef = useRef(null);
  const preRef = useRef(null);

  const rotRef = useRef({ spin: -1.4, tilt: 0.12 });
  const dragRef = useRef(null);
  const draggingRef = useRef(false);
  const resumeAtRef = useRef(0);

  const maskRef = useRef(null); // { data: Uint8Array, w, h }
  const [maskReady, setMaskReady] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [cellMetrics, setCellMetrics] = useState({ wRatio: 0.57, hRatio: 1 });
  const [reduceMotion, setReduceMotion] = useState(false);

  const cols = colsForSquareGrid(rows, cellMetrics.wRatio, cellMetrics.hRatio);

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
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Size type so the orthographic disc diameter matches the square container.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { wRatio, hRatio } = cellMetrics;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const d = Math.min(rect.width, rect.height);
      if (d <= 0) return;
      const denom = Math.min((cols - 1) * wRatio, (rows - 1) * hRatio);
      setFontSize(Math.max(6, d / denom));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows, cols, cellMetrics]);

  // Load + decode the land mask once.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = MASK_SRC;
    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
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
      /* leave maskReady false — component renders empty rather than crashing */
    };
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!maskReady) return;
    const pre = preRef.current;
    if (!pre) return;

    const mask = maskRef.current;
    const cw = fontSize * cellMetrics.wRatio;
    const ch = fontSize * cellMetrics.hRatio;
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const R = Math.min(cx * cw, cy * ch) * 0.995;
    const Rlim = R * R;

    // Light from upper-left-front for a soft terminator.
    const ll = -0.5;
    const lm = 0.55;
    const ln = 0.66;
    const llen = Math.hypot(ll, lm, ln);
    const lx = ll / llen;
    const ly = lm / llen;
    const lz = ln / llen;

    const sampleLand = (latDeg, lonDeg) => {
      let lon = lonDeg;
      while (lon > 180) lon -= 360;
      while (lon < -180) lon += 360;
      const u = (lon + 180) / 360;
      const v = (90 - latDeg) / 180;
      const mx = clamp(Math.floor(u * mask.w), 0, mask.w - 1);
      const my = clamp(Math.floor(v * mask.h), 0, mask.h - 1);
      return mask.data[my * mask.w + mx] === 1;
    };

    const render = () => {
      const { spin, tilt } = rotRef.current;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      let out = "";

      for (let row = 0; row < rows; row++) {
        let line = "";
        for (let col = 0; col < cols; col++) {
          const dx = (col - cx) * cw;
          const dy = (row - cy) * ch;
          if (dx * dx + dy * dy > Rlim) {
            line += " ";
            continue;
          }
          const ux = dx / R;
          const uy = dy / R;
          const uz = Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy));

          // View space: right = +x, up = +y, toward viewer = +z.
          const vx = ux;
          const vy = -uy;
          const vz = uz;

          // Undo tilt (rotate about X) to reach geographic coordinates.
          const gx = vx;
          const gy = vy * cosT + vz * sinT;
          const gz = -vy * sinT + vz * cosT;

          const lat = Math.asin(clamp(gy, -1, 1)) * (180 / Math.PI);
          const lon = Math.atan2(gx, gz) * (180 / Math.PI) + spin * (180 / Math.PI);

          const land = sampleLand(lat, lon);

          // Diffuse shading via surface normal (== view vector on unit sphere).
          let bright = vx * lx + vy * ly + vz * lz;
          bright = clamp(bright * 0.85 + 0.15, 0, 1);

          const rCell = Math.sqrt(dx * dx + dy * dy) / R;
          if (rCell > 0.92) bright *= 1 - (rCell - 0.92) / 0.08 * 0.6;

          if (land) {
            const li = clamp(Math.floor(bright * LAND.length), 0, LAND.length - 1);
            line += LAND[li];
          } else {
            const oi = clamp(Math.floor(bright * OCEAN.length), 0, OCEAN.length - 1);
            line += OCEAN[oi];
          }
        }
        out += row < rows - 1 ? line + "\n" : line;
      }
      pre.textContent = out;
    };

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      if (
        !draggingRef.current &&
        !reduceMotion &&
        now >= resumeAtRef.current
      ) {
        rotRef.current.spin += AUTO_SPIN;
      }
      render();
      raf = requestAnimationFrame(tick);
    };

    render();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [maskReady, fontSize, cols, rows, reduceMotion, cellMetrics]);

  const onPointerDown = (e) => {
    if (!interactive) return;
    draggingRef.current = true;
    dragRef.current = { x: e.clientX, y: e.clientY };
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
    dragRef.current = { x: e.clientX, y: e.clientY };
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

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: interactive ? "none" : undefined,
        cursor: interactive ? "grab" : "default",
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
          color: "rgba(212, 210, 200, 0.94)",
          textShadow:
            "0 0 10px rgba(255, 122, 41, 0.22), 0 0 2px rgba(0,0,0,0.85)",
          background: "transparent",
          userSelect: "none",
          whiteSpace: "pre",
        }}
      />
    </div>
  );
}
