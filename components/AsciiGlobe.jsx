"use client";

/**
 * ASCII Earth: continent mask + orthographic circle in *pixel* space so the
 * silhouette reads round (monospace cells are non-square).
 * @see https://github.com/adamsky/globe
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const CHAR_W = 0.57;
const CHAR_H = 1;

const OCEAN = [".", ":", ";", "'", "·"];
const LAND = ["v", "w", "o", "e", "g", "Y", "0", "M"];

function normDegLon(lon) {
  let L = lon;
  while (L > 180) L -= 360;
  while (L < -180) L += 360;
  return L;
}

function inEllipseDeg(lat, lon, cLat, cLon, semiLat, semiLon) {
  const L = normDegLon(lon);
  const dl = normDegLon(L - cLon);
  const dlat = lat - cLat;
  const x = dl / semiLon;
  const y = dlat / semiLat;
  return x * x + y * y <= 1;
}

export function isLandApprox(degLat, degLon) {
  const L = normDegLon(degLon);

  if (degLat <= -62) return true;

  let land = false;

  if (inEllipseDeg(degLat, L, 38, 92, 48, 70)) land = true;
  if (degLat >= 18 && degLat <= 55 && L >= 38 && L <= 148) land = true;
  if (degLat >= 42 && degLat <= 78 && L >= 28 && L <= 180) land = true;
  if (degLat >= 42 && degLat <= 72 && L >= -180 && L <= -168) land = true;
  if (inEllipseDeg(degLat, L, 22, 78, 16, 14)) land = true;
  if (inEllipseDeg(degLat, L, 4, 108, 18, 24)) land = true;
  if (inEllipseDeg(degLat, L, 38, 138, 9, 10)) land = true;
  if (inEllipseDeg(degLat, L, 54, 12, 18, 28)) land = true;
  if (inEllipseDeg(degLat, L, 50,25, 10, 12)) land = true;
  if (inEllipseDeg(degLat, L, 7, 18, 52, 28)) land = true;
  if (inEllipseDeg(degLat, L, 48, -100, 34, 42)) land = true;
  if (inEllipseDeg(degLat, L, 12, -85, 18, 20)) land = true;
  if (inEllipseDeg(degLat, L, 72, -42, 14, 18)) land = true;
  if (inEllipseDeg(degLat, L, -12, -60, 38, 26)) land = true;
  if (inEllipseDeg(degLat, L, -24, 134, 20, 28)) land = true;
  if (inEllipseDeg(degLat, L, -41, 172, 9, 11)) land = true;
  if (inEllipseDeg(degLat, L, 54, -4, 8, 7)) land = true;
  if (inEllipseDeg(degLat, L, 65, -18, 6, 10)) land = true;

  if (!land) return false;

  if (degLat >= 10 && degLat <= 28 && L >= -88 && L <= -58) return false;
  if (degLat >= 14 && degLat <= 31 && L >= 32 && L <= 43) return false;
  if (inEllipseDeg(degLat, L, 37, 16, 7, 16)) return false;
  if (inEllipseDeg(degLat, L, 44, 32, 9, 12)) return false;
  if (degLat >= 52 && degLat <= 70 && L >= -92 && L <= -72) return false;
  if (degLat >= 52 && degLat <= 66 && L >= 18 && L <= 30) return false;
  if (degLat >= 60 && degLat <= 68 && L >= -180 && L <= -168) return false;
  if (degLat >= 60 && degLat <= 68 && L >= 168 && L <= 180) return false;

  return true;
}

function landTextureNorm(latRad, lonRad) {
  const v =
    Math.sin(latRad * 3.2 + lonRad * 2.1) * 0.5 +
    Math.cos(lonRad * 4.5 - latRad * 1.8) * 0.25 +
    0.5;
  return Math.max(0, Math.min(1, v));
}

function oceanTextureNorm(latRad, lonRad) {
  const v = Math.sin(latRad * 5.1) * Math.cos(lonRad * 3.4) * 0.5 + 0.5;
  return Math.max(0, Math.min(1, v));
}

/**
 * Column count so the character grid is ~square in pixel space (monospace cells
 * are wider than tall via CHAR_W), keeping the orthographic rim visually round.
 */
export function colsForSquareGlobeGrid(rows, lineHeight = 1) {
  if (rows < 2) return 12;
  return Math.max(
    12,
    Math.round((rows - 1) * ((lineHeight * CHAR_H) / CHAR_W) + 1)
  );
}

/** Physical radius (px) of the inscribed orthographic disc. */
export function globeDiscRadiusPx(cols, rows, fontSize, lineHeight = 1) {
  const cw = fontSize * CHAR_W;
  const ch = fontSize * lineHeight * CHAR_H;
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  return Math.min(cx * cw, cy * ch) * 0.995;
}

function buildGlobe(rotation, cols, rows, fontSize, lineHeight = 1) {
  const cw = fontSize * CHAR_W;
  const ch = fontSize * lineHeight * CHAR_H;
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const R = globeDiscRadiusPx(cols, rows, fontSize, lineHeight);
  const Rlim = R * R;
  const lines = [];

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
      const lon = Math.atan2(ux, uz) + rotation;
      const lat = Math.asin(Math.max(-1, Math.min(1, uy)));

      const degLat = lat * (180 / Math.PI);
      const degLon = normDegLon((lon * 180) / Math.PI);
      const land = isLandApprox(degLat, degLon);

      const rCell = Math.sqrt(dx * dx + dy * dy) / R;

      let chOut;
      if (land) {
        const t = landTextureNorm(lat, lon);
        const li = Math.min(LAND.length - 1, Math.floor(t * LAND.length));
        chOut = LAND[li];
      } else {
        const t = oceanTextureNorm(lat, lon);
        const oi = Math.min(OCEAN.length - 1, Math.floor(t * OCEAN.length));
        chOut = OCEAN[oi];
      }

      if (rCell > 0.9) {
        const rim = (rCell - 0.9) / 0.1;
        const h = Math.sin(lat * 18 + lon * 11) * 0.5 + 0.5;
        if (h < rim * 0.6) chOut = land ? "·" : "'";
      }

      line += chOut;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export default function AsciiGlobe({
  cols = 40,
  rows = 20,
  fontSize = 10,
  lineHeight = 1,
  spinning = true,
  speed = 0.00028,
  className = "",
  style = {},
}) {
  const preRef = useRef(null);
  const rotRef = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useLayoutEffect(() => {
    const el = preRef.current;
    if (!el) return;
    el.textContent = buildGlobe(rotRef.current, cols, rows, fontSize, lineHeight);
  }, [cols, rows, fontSize, lineHeight]);

  useEffect(() => {
    if (!spinning || reduceMotion) return;
    let id;
    const tick = () => {
      rotRef.current += speed;
      const el = preRef.current;
      if (el)
        el.textContent = buildGlobe(
          rotRef.current,
          cols,
          rows,
          fontSize,
          lineHeight
        );
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [spinning, reduceMotion, speed, cols, rows, fontSize, lineHeight]);

  return (
    <pre
      ref={preRef}
      className={className}
      aria-hidden="true"
      style={{
        margin: 0,
        padding: 0,
        fontFamily: "'VT323', ui-monospace, monospace",
        fontSize,
        lineHeight,
        letterSpacing: 0,
        color: "rgba(212, 210, 200, 0.93)",
        textShadow:
          "0 0 10px rgba(255, 122, 41, 0.2), 0 0 2px rgba(0,0,0,0.85)",
        background: "transparent",
        overflow: "visible",
        maxWidth: "100%",
        userSelect: "none",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
