"use client";

import { CRT_BEZEL_RADIUS } from "@/lib/crtBezel";

const BEZEL_RADIUS = 80;
/** Quarter-circle hole in each cap: a few px larger than the bezel arc so black doesn’t eat the frame edge */
const CORNER_MASK_RADIUS = BEZEL_RADIUS + 8;

export default function CRTOverlay() {
  return (
    <div
      className="crt-overlay"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* ─── CORNER CAPS — solid black fillers so rounded-bezel illusion
            doesn't leak the rectangular content past the curve. Painted
            FIRST so all other effects render on top of them too. ─── */}
      {[
        {
          top: 0,
          left: 0,
          background: `radial-gradient(circle at 100% 100%, transparent ${
            CORNER_MASK_RADIUS - 1
          }px, #000 ${CORNER_MASK_RADIUS}px)`,
        },
        {
          top: 0,
          right: 0,
          background: `radial-gradient(circle at 0% 100%, transparent ${
            CORNER_MASK_RADIUS - 1
          }px, #000 ${CORNER_MASK_RADIUS}px)`,
        },
        {
          bottom: 0,
          left: 0,
          background: `radial-gradient(circle at 100% 0%, transparent ${
            CORNER_MASK_RADIUS - 1
          }px, #000 ${CORNER_MASK_RADIUS}px)`,
        },
        {
          bottom: 0,
          right: 0,
          background: `radial-gradient(circle at 0% 0%, transparent ${
            CORNER_MASK_RADIUS - 1
          }px, #000 ${CORNER_MASK_RADIUS}px)`,
        },
      ].map((corner, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: BEZEL_RADIUS,
            height: BEZEL_RADIUS,
            zIndex: 5,
            ...corner,
          }}
        />
      ))}
      {/* ─── BEZEL FRAME — fewer inset shadows = cheaper full-viewport paint ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: CRT_BEZEL_RADIUS,
          pointerEvents: "none",
          boxShadow: [
            "inset 0 0 0 8px #050505",
            "inset 0 0 0 10px rgba(255, 122, 41, 0.16)",
            "inset 0 0 48px 10px rgba(0, 0, 0, 0.42)",
          ].join(", "),
        }}
      />

      {/* ─── VIGNETTE + WARM GLOW (one layer) ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: [
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.22) 88%, rgba(0,0,0,0.45) 100%)",
            "radial-gradient(ellipse at 50% 28%, rgba(255, 122, 41, 0.05) 0%, transparent 55%)",
          ].join(", "),
        }}
      />

      {/* ─── SCANLINES ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 2px, transparent 3px)",
          opacity: 0.5,
        }}
      />

      {/* ─── TOP GLASS REFLECTION — no mix-blend (was a full-screen compositor tax) ─── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "5%",
          right: "5%",
          height: "22%",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.045) 0%, transparent 100%)",
          borderRadius: "0 0 50% 50% / 0 0 100% 100%",
        }}
      />

      {/* ─── ROLLING TRACKING BAND — every ~14s, very subtle ─── */}
      <div
        className="crt-roll-band"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 80,
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
