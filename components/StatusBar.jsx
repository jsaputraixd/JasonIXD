"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ACCENT = "#FF7A29";

const MARQUEE_ITEMS = [
  "Dream",
  "★",
  "Think",
  "★",
  "Build",
  "★",
  "Interaction design",
  "★",
  "Visual design",
  "★",
  "Available for hire",
  "★",
];

export default function StatusBar() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const stream = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        bottom: 14,
        zIndex: 30,
        background:
          "linear-gradient(to top, rgba(10,6,4,0.95), rgba(10,6,4,0.6))",
        border: "1px solid rgba(255, 122, 41, 0.25)",
        borderRadius: 2,
        backdropFilter: "blur(2px)",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Marquee strip */}
      <div
        style={{
          padding: "4px 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderBottom: "1px solid rgba(255, 122, 41, 0.15)",
          background: "rgba(0, 0, 0, 0.25)",
        }}
      >
        <motion.div
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          style={{
            display: "inline-block",
            fontFamily: "'VT323', monospace",
            fontSize: 15,
            letterSpacing: "0.4em",
            color: ACCENT,
            textShadow: "0 0 6px rgba(255, 122, 41, 0.45)",
            textTransform: "uppercase",
          }}
        >
          {stream.map((s, i) => (
            <span key={i} style={{ paddingRight: "1.5em" }}>
              {s}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Info row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px 16px",
          fontFamily: "'VT323', monospace",
          fontSize: 13,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "rgba(255, 180, 112, 0.75)",
        }}
      >
        <span>▢ Made in San Francisco // Bali</span>
        <span style={{ color: ACCENT, textShadow: "0 0 6px rgba(255,122,41,0.5)" }}>
          ◉ Rec · {time}
        </span>
        <span>☕ Cups · 1,247</span>
      </div>
    </div>
  );
}
