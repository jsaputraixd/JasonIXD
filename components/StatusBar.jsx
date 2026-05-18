"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ACCENT = "#FF7A29";
const MOBILE_BREAK = 900;

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
  const [isMobile, setIsMobile] = useState(false);
  const reduceMotion = useReducedMotion();

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

  useEffect(() => {
    const read = () => setIsMobile(window.innerWidth < MOBILE_BREAK);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const stream = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  const shellStyle = isMobile
    ? {
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 10,
        zIndex: 30,
      }
    : {
        position: "absolute",
        left: 90,
        right: 90,
        bottom: 14,
        zIndex: 30,
      };

  return (
    <motion.div
      aria-hidden="true"
      className={isMobile ? "status-bar status-bar--mobile" : "status-bar"}
      initial={isMobile ? { opacity: 0, y: 12 } : false}
      animate={isMobile ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        ...shellStyle,
        background:
          "linear-gradient(to top, rgba(10,6,4,0.95), rgba(10,6,4,0.6))",
        border: "1px solid rgba(255, 122, 41, 0.25)",
        borderRadius: 2,
        backdropFilter: "blur(2px)",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          padding: isMobile ? "3px 0" : "4px 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderBottom: "1px solid rgba(255, 122, 41, 0.15)",
          background: "rgba(0, 0, 0, 0.25)",
        }}
      >
        <motion.div
          animate={reduceMotion ? undefined : { x: ["0%", "-33.333%"] }}
          transition={{ duration: isMobile ? 28 : 32, repeat: Infinity, ease: "linear" }}
          style={{
            display: "inline-block",
            fontFamily: "'VT323', monospace",
            fontSize: isMobile ? 12 : 15,
            letterSpacing: isMobile ? "0.28em" : "0.4em",
            color: ACCENT,
            textShadow: "0 0 6px rgba(255, 122, 41, 0.45)",
            textTransform: "uppercase",
          }}
        >
          {stream.map((s, i) => (
            <span key={i} style={{ paddingRight: isMobile ? "1.1em" : "1.5em" }}>
              {s}
            </span>
          ))}
        </motion.div>
      </div>

      {isMobile ? (
        <motion.div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "8px 12px 10px",
            fontFamily: "'VT323', monospace",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255, 180, 112, 0.75)",
          }}
        >
          <span
            style={{
              textAlign: "center",
              letterSpacing: "0.26em",
              lineHeight: 1.35,
            }}
          >
            ▢ Made in San Francisco // Bali
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 12px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: ACCENT,
                textShadow: "0 0 6px rgba(255,122,41,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              ◉ Rec
            </span>
            <span style={{ textAlign: "right", whiteSpace: "nowrap" }}>☕ Cups</span>
            <span
              style={{
                color: ACCENT,
                textShadow: "0 0 6px rgba(255,122,41,0.5)",
                fontSize: 13,
                letterSpacing: "0.18em",
              }}
            >
              {time}
            </span>
            <span style={{ textAlign: "right", fontSize: 13, letterSpacing: "0.18em" }}>
              1,247
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
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
        </motion.div>
      )}
    </motion.div>
  );
}
