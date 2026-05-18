"use client";

const BEZEL_RADIUS = 80;
/** Quarter-circle hole in each cap: a few px larger than the bezel arc so black doesn’t eat the frame edge */
const CORNER_MASK_RADIUS = BEZEL_RADIUS + 8;

export default function CRTOverlay() {
  return (
    <div
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
      {/* ─── BEZEL FRAME — rounded "TV body" + glass curve, lighter ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "min(80px, 5.5vmin)",
          pointerEvents: "none",
          boxShadow: [
            // Outer-most pitch-black bezel (TV chassis)
            "inset 0 0 0 8px #050505",
            // Subtle gloss inside the bezel
            "inset 0 0 0 9px rgba(40, 28, 18, 0.85)",
            // Faint orange rim from phosphor glow
            "inset 0 0 0 10px rgba(255, 122, 41, 0.18)",
            // Glass-curve darkening — softened so content is still readable
            "inset 0 0 40px 8px rgba(0, 0, 0, 0.55)",
            "inset 0 0 140px 30px rgba(0, 0, 0, 0.28)",
            // Outer halo on the bezel
            "0 0 50px rgba(255, 122, 41, 0.04)",
          ].join(", "),
        }}
      />

      {/* ─── PHOSPHOR FALLOFF — softer, more readable ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.22) 88%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* ─── WARM SCREEN GLOW — focused upper-third ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 28%, rgba(255, 122, 41, 0.05) 0%, transparent 55%)",
        }}
      />

      {/* ─── SCANLINES — horizontal, slightly lighter ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 2px, transparent 3px)",
          opacity: 0.55,
        }}
      />

      {/* ─── APERTURE GRILLE — vertical sub-pixel tint ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255, 122, 41, 0.025) 0px, rgba(255, 255, 255, 0.014) 1px, rgba(45, 212, 191, 0.02) 2px)",
          mixBlendMode: "overlay",
          opacity: 0.55,
        }}
      />

      {/* ─── CHROMATIC ABERRATION — edges only, lighter ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255, 50, 50, 0.035) 0%, transparent 8%, transparent 92%, rgba(50, 220, 255, 0.035) 100%)",
          mixBlendMode: "screen",
        }}
      />

      {/* ─── TOP GLASS REFLECTION — implies curved face ─── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "5%",
          right: "5%",
          height: "22%",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
          mixBlendMode: "screen",
          borderRadius: "0 0 50% 50% / 0 0 100% 100%",
        }}
      />

      {/* ─── BOTTOM GLASS REFLECTION (curve back-light) ─── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: "8%",
          background:
            "linear-gradient(to top, rgba(255,255,255,0.025) 0%, transparent 100%)",
          mixBlendMode: "screen",
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
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
            "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.022) 50%, transparent 100%)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
