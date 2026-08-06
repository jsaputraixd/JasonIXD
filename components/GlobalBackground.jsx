"use client";

/**
 * Static wallpaper only — animated particles were a permanent main-thread tax
 * under the CRT + globe stack. Atmosphere stays via CSS gradient + dots.
 */
const GRADIENT =
  "radial-gradient(ellipse at 50% 35%, #1f1a2e 0%, #0e0c14 70%, #050405 100%)";

export default function GlobalBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: GRADIENT,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255, 122, 41, 0.13) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0",
          opacity: 0.5,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
    </div>
  );
}
