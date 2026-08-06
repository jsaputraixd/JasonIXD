"use client";

import { useEffect, useRef, useState } from "react";

const ACCENT = "#FF7A29";

const VARIANTS = {
  default: { size: 12, opacity: 0.9, label: "" },
  hover: { size: 40, opacity: 0.4, label: "" },
  view: { size: 56, opacity: 0.85, label: "view", labelFontSize: 11 },
  enter: { size: 64, opacity: 0.95, label: "enter" },
};

export default function Cursor() {
  const [variant, setVariant] = useState("default");
  const [isTouch, setIsTouch] = useState(false);
  const wrapperRef = useRef(null);
  const rafRef = useRef(0);
  const pendingRef = useRef(null);
  const variantRef = useRef("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  useEffect(() => {
    if (isTouch) return;

    const flush = () => {
      rafRef.current = 0;
      const e = pendingRef.current;
      if (!e) return;

      const node = wrapperRef.current;
      if (node) {
        node.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const el = e.target instanceof Element ? e.target : null;
      const hit = el?.closest("[data-cursor]");
      const next = hit?.getAttribute("data-cursor");
      const resolved = next && VARIANTS[next] ? next : "default";
      if (variantRef.current !== resolved) setVariant(resolved);
    };

    const handleMove = (e) => {
      pendingRef.current = e;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch]);

  if (isTouch) return null;

  const v = VARIANTS[variant] ?? VARIANTS.default;
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
        zIndex: 70000,
        mixBlendMode: "screen",
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: v.size,
          height: v.size,
          transform: "translate(-50%, -50%)",
          borderRadius: 9999,
          border: isDefault ? "none" : `1px solid rgba(255, 122, 41, 0.5)`,
          background: isDefault ? ACCENT : "rgba(255, 122, 41, 0.08)",
          boxShadow: isDefault
            ? "0 0 10px rgba(255, 122, 41, 0.6)"
            : "0 0 16px rgba(255, 122, 41, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: v.opacity,
        }}
      >
        {v.label ? (
          <span
            style={{
              color: ACCENT,
              fontFamily: "'VT323', monospace",
              fontSize: v.labelFontSize ?? 13,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            {v.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
