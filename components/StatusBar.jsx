"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getQuoteOfDay } from "@/lib/quoteOfDay";
import {
  CRT_BEZEL_RADIUS,
  CRT_FOOTER_BOTTOM_PAD,
  CRT_FOOTER_CORNER_INSET,
} from "@/lib/crtBezel";

const ACCENT = "#FF7A29";
const MOBILE_BREAK = 900;
const BUILD_LABEL = "JS-OS · v1.1";

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

/**
 * @param {{ id: string, title: string }[]} [minimizedWindows]
 * @param {(id: string) => void} [onRestoreWindow]
 */
export default function StatusBar({
  minimizedWindows = [],
  onRestoreWindow,
}) {
  const [time, setTime] = useState("--:--:--");
  const [isMobile, setIsMobile] = useState(false);
  const reduceMotion = useReducedMotion();
  const quote = useMemo(() => getQuoteOfDay(), []);

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
        backdropFilter: "blur(2px)",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <motion.div
        style={{
          padding: isMobile ? "3px 0" : "4px 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderBottom: isMobile
            ? "1px solid rgba(255, 122, 41, 0.12)"
            : "1px solid rgba(255, 122, 41, 0.15)",
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
      </motion.div>

      {minimizedWindows.length > 0 ? (
        <motion.div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: isMobile ? "6px 10px 5px" : "6px 12px 5px",
            borderBottom: "1px solid rgba(255, 122, 41, 0.2)",
            background: "rgba(0, 0, 0, 0.35)",
            overflowX: "auto",
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              fontFamily: "'VT323', monospace",
              fontSize: isMobile ? 10 : 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255, 122, 41, 0.7)",
            }}
          >
            ▢ Minimized
          </span>
          {minimizedWindows.map(({ id, title }) => (
            <button
              key={id}
              type="button"
              data-cursor="hover"
              onClick={() => onRestoreWindow?.(id)}
              style={{
                flexShrink: 0,
                margin: 0,
                padding: isMobile ? "3px 8px" : "4px 10px",
                border: "1px solid rgba(255, 122, 41, 0.45)",
                borderRadius: 2,
                background: "rgba(255, 122, 41, 0.12)",
                fontFamily: "'VT323', monospace",
                fontSize: isMobile ? 11 : 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: ACCENT,
                cursor: "pointer",
                textShadow: "0 0 6px rgba(255, 122, 41, 0.4)",
                maxWidth: isMobile ? 120 : 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </button>
          ))}
        </motion.div>
      ) : null}

      {!isMobile ? (
        <motion.div
          className="status-bar-quote-row"
          style={{
            padding: `5px ${CRT_FOOTER_CORNER_INSET} 4px`,
            borderBottom: "1px solid rgba(255, 122, 41, 0.12)",
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              lineHeight: 1.45,
              color: "rgba(255, 200, 160, 0.82)",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontStyle: "normal",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255, 122, 41, 0.85)",
                marginRight: "0.5em",
              }}
            >
              Quote ·
            </span>
            &ldquo;{quote.text}&rdquo;
            <span style={{ opacity: 0.65 }}> — {quote.author}</span>
          </p>
        </motion.div>
      ) : null}

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
            color: "rgba(255, 180, 112, 0.75)",
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
          <span style={{ flexShrink: 0, opacity: 0.82 }}>{BUILD_LABEL}</span>
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
            fontSize: 13,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255, 180, 112, 0.75)",
          }}
        >
          <span className="status-bar-bottom-row__side status-bar-bottom-row__side--left">
            ▢ Made in San Francisco // Bali
          </span>
          <span
            className="status-bar-bottom-row__center"
            style={{ color: ACCENT, textShadow: "0 0 6px rgba(255,122,41,0.5)" }}
          >
            ◉ Rec · {time}
          </span>
          <span className="status-bar-bottom-row__side status-bar-bottom-row__side--right">
            {BUILD_LABEL}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
