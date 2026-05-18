"use client";

import { useEffect, useRef, useState } from "react";

const ACCENT = "#FF7A29";

const VARIANTS = {
  default: { size: 12, opacity: 0.9, label: "" },
  hover: { size: 40, opacity: 0.4, label: "" },
  project: { size: 88, opacity: 0.95, label: "view all", labelFontSize: 10 },
  /** skills.log globe — opens zoom dialog */
  view: { size: 88, opacity: 0.95, label: "view", labelFontSize: 10 },
  enter: { size: 64, opacity: 0.95, label: "enter" },
};

export default function Cursor() {
  const [variant, setVariant] = useState("default");
  const [isTouch, setIsTouch] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const handleMove = (e) => {
      const node = wrapperRef.current;
      if (node) {
        node.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const el = e.target instanceof Element ? e.target : null;
      const hit = el?.closest("[data-cursor]");
      const next = hit?.getAttribute("data-cursor");
      const resolved = next && VARIANTS[next] ? next : "default";
      setVariant((cur) => (cur === resolved ? cur : resolved));
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isTouch]);

  if (isTouch) return null;

  const v = VARIANTS[variant];
  const size = v.size;
  const isDefault = variant === "default";

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        /** Above portaled modals (e.g. skills zoom at 8000); still below dev overlays. */
        zIndex: 50000,
        mixBlendMode: "screen",
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          transform: "translate(-50%, -50%)",
          borderRadius: 9999,
          border: isDefault ? "none" : `1px solid ${ACCENT}`,
          background: isDefault ? ACCENT : "rgba(255, 122, 41, 0.08)",
          boxShadow: isDefault
            ? "0 0 10px rgba(255, 122, 41, 0.6)"
            : "0 0 16px rgba(255, 122, 41, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ACCENT,
          fontFamily: "'VT323', monospace",
          fontSize: v.labelFontSize ?? 13,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          opacity: v.opacity,
          transition:
            "width 140ms ease, height 140ms ease, background 140ms ease, border 140ms ease, opacity 140ms ease",
        }}
      >
        {v.label}
      </div>
    </div>
  );
}
