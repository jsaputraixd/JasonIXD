"use client";

import InteractiveAsciiGlobe from "./InteractiveAsciiGlobe";

/**
 * Large, centered globe that sits behind the desktop windows. Fully coded ASCII
 * (no video) — samples a land mask for real continents and is click-draggable
 * to rotate. A dark disc behind it lifts contrast against the wallpaper.
 */
export default function DesktopGlobeBackdrop({
  parallaxShift = { x: 0, y: 0 },
  diameter = "min(58.5vh, 58.5vw)",
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate3d(calc(-50% + ${parallaxShift.x}px), calc(-50% - 3.5vh + ${parallaxShift.y}px), 0)`,
        width: diameter,
        height: diameter,
        maxWidth: "69vw",
        maxHeight: "69vh",
        aspectRatio: "1 / 1",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 48%, rgba(6, 4, 3, 0.94) 0%, rgba(4, 3, 2, 0.98) 72%, rgba(2, 2, 2, 1) 100%)",
          boxShadow:
            "0 0 0 1px rgba(255, 122, 41, 0.08), 0 0 48px rgba(0, 0, 0, 0.55)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          opacity: 0.72,
          pointerEvents: "auto",
          filter: "drop-shadow(0 0 40px rgba(255, 122, 41, 0.14))",
        }}
      >
        <InteractiveAsciiGlobe />
      </div>
    </div>
  );
}
