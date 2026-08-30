"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getQuoteOfDay } from "@/lib/quoteOfDay";
import { about } from "@/data/about";
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
      <motion.div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: isMobile ? "6px 10px" : "8px 16px",
          padding: isMobile ? "5px 10px" : "6px 16px",
          borderBottom: isMobile
            ? "1px solid rgba(255, 122, 41, 0.12)"
            : "1px solid rgba(255, 122, 41, 0.15)",
          background: "rgba(0, 0, 0, 0.25)",
          pointerEvents: "auto",
          fontFamily: "'VT323', monospace",
          fontSize: isMobile ? 12 : 14,
          letterSpacing: isMobile ? "0.14em" : "0.18em",
          textTransform: "uppercase",
          color: ACCENT,
          textShadow: "0 0 6px rgba(255, 122, 41, 0.45)",
        }}
      >
        <span>Jason Saputra</span>
        <span aria-hidden style={{ opacity: 0.45 }}>
          /
        </span>
        <span>Product + Interaction</span>
        <span aria-hidden style={{ opacity: 0.45 }}>
          /
        </span>
        <span>SF</span>
        {isMobile ? (
          <>
            <span aria-hidden style={{ opacity: 0.45 }}>
              ·
            </span>
            <a
              href={`mailto:${about.email}`}
              data-cursor="hover"
              style={{ color: ACCENT, textDecoration: "none" }}
            >
              Email
            </a>
            <span aria-hidden style={{ opacity: 0.45 }}>
              ·
            </span>
            <a
              href={about.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              style={{ color: ACCENT, textDecoration: "none" }}
            >
              LinkedIn
            </a>
            <span aria-hidden style={{ opacity: 0.45 }}>
              ·
            </span>
            <a
              href={about.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              style={{ color: ACCENT, textDecoration: "none" }}
            >
              Instagram
            </a>
          </>
        ) : null}
      </motion.div>

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
              fontSize: 13,
              lineHeight: 1.5,
              color: FOOTER_MUTED,
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontStyle: "normal",
                fontSize: 13,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: ACCENT,
                marginRight: "0.5em",
              }}
            >
              Quote ·
            </span>
            &ldquo;{quote.text}&rdquo;
            <span style={{ opacity: 0.72 }}> · {quote.author}</span>
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
