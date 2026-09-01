"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CRT_BEZEL_RADIUS,
  CRT_FOOTER_BOTTOM_PAD,
  CRT_FOOTER_CORNER_INSET,
} from "@/lib/crtBezel";

const ACCENT = "#FF7A29";
const FOOTER_MUTED = "#FFC896";
const MOBILE_BREAK = 900;
const BUILD_LABEL = "JS-OS · v1.6";

export default function StatusBar() {
  const [time, setTime] = useState("--:--:--");
  const [isMobile, setIsMobile] = useState(false);

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
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
      };

  const desktopFooterRadius = `0 0 ${CRT_BEZEL_RADIUS} ${CRT_BEZEL_RADIUS}`;

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
        borderRadius: isMobile ? 2 : desktopFooterRadius,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {isMobile ? (
        <motion.div
          className="status-bar-mobile-footer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "6px 12px max(8px, env(safe-area-inset-bottom, 0px))",
            pointerEvents: "none",
            fontFamily: "'VT323', monospace",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: FOOTER_MUTED,
          }}
        >
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            SF // Bali
          </span>
          <span
            style={{
              color: ACCENT,
              textShadow: "0 0 6px rgba(255,122,41,0.5)",
              flexShrink: 0,
            }}
          >
            {time}
          </span>
          <span style={{ flexShrink: 0, opacity: 0.92 }}>{BUILD_LABEL}</span>
        </motion.div>
      ) : (
        <motion.div
          className="status-bar-bottom-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            columnGap: 12,
            paddingTop: 5,
            paddingLeft: CRT_FOOTER_CORNER_INSET,
            paddingRight: CRT_FOOTER_CORNER_INSET,
            paddingBottom: CRT_FOOTER_BOTTOM_PAD,
            pointerEvents: "none",
            fontFamily: "'VT323', monospace",
            fontSize: 14,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: FOOTER_MUTED,
          }}
        >
          <span className="status-bar-bottom-row__side status-bar-bottom-row__side--left">
            ▢ Made in San Francisco // Bali
          </span>
          <span
            className="status-bar-bottom-row__center"
            style={{ color: ACCENT, textShadow: "0 0 6px rgba(255,122,41,0.5)" }}
          >
            ◉ {time}
          </span>
          <span className="status-bar-bottom-row__side status-bar-bottom-row__side--right">
            {BUILD_LABEL}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
