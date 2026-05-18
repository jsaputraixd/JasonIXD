"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const ACCENT_BRIGHT = "#ffb070";
const BG = "#060403";
const CHARS =
  "ｱｲｳｴｵｶｷｸｹｺ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}|/\\·:;+*#@DW";

const IDLE_MS = 60_000;

export { IDLE_MS };

export default function IdleScreensaver({ active }) {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active || reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let columns = [];
    let fontSize = 14;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = Math.max(12, Math.round(w / 90));
      ctx.font = `${fontSize}px "VT323", monospace`;
      const colCount = Math.ceil(w / fontSize);
      columns = Array.from({ length: colCount }, () => Math.random() * h);
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillStyle = "rgba(6, 4, 3, 0.12)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < columns.length; i++) {
        const x = i * fontSize;
        const y = columns[i] * fontSize;
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        const head = Math.random() > 0.96;
        ctx.fillStyle = head ? ACCENT_BRIGHT : ACCENT;
        ctx.globalAlpha = head ? 0.95 : 0.35 + Math.random() * 0.35;
        ctx.fillText(ch, x, y);
        ctx.globalAlpha = 1;

        if (y > h && Math.random() > 0.975) {
          columns[i] = 0;
        } else {
          columns[i] += 0.45 + Math.random() * 0.85;
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active, reduceMotion]);

  const wake = () => playClick();

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="idle-screensaver"
          role="dialog"
          aria-label="Screensaver — move pointer or press a key to continue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          tabIndex={-1}
          ref={(el) => el?.focus()}
          onPointerDown={wake}
          onKeyDown={wake}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 12000,
            background: reduceMotion
              ? "rgba(6, 4, 3, 0.92)"
              : "rgba(6, 4, 3, 0.55)",
            cursor: "none",
            outline: "none",
          }}
        >
          {!reduceMotion ? (
            <canvas
              ref={canvasRef}
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                display: "block",
              }}
            />
          ) : (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'VT323', monospace",
                fontSize: "clamp(28px, 6vw, 48px)",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: ACCENT,
                textShadow: "0 0 24px rgba(255, 122, 41, 0.45)",
              }}
            >
              Dream · Think · Build
            </motion.div>
          )}

          <p
            style={{
              position: "absolute",
              left: "50%",
              bottom: "max(24px, env(safe-area-inset-bottom, 0px))",
              transform: "translateX(-50%)",
              margin: 0,
              fontFamily: "'VT323', monospace",
              fontSize: 14,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255, 180, 112, 0.75)",
              textShadow: "0 0 10px rgba(255, 122, 41, 0.35)",
              pointerEvents: "none",
            }}
          >
            ▢ Move mouse to wake
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
