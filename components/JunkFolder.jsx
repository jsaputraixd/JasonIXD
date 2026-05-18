"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { junkFolder, JUNK_KIND_LABELS } from "@/data/junk";

const ACCENT = "#FF7A29";
const ACCENT_DIM = "rgba(255, 180, 112, 0.7)";
const EASE = [0.16, 1, 0.3, 1];

function kindLabel(kind) {
  return JUNK_KIND_LABELS[kind] ?? JUNK_KIND_LABELS.other;
}

export default function JunkFolder({ variant = "desktop", layoutScale = 1 }) {
  const reduceMotion = useReducedMotion();
  const [lightbox, setLightbox] = useState(null);
  const s = variant === "desktop" ? layoutScale : 1;
  const items = junkFolder.items;
  const hasItems = items.length > 0;

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox]);

  const pad = variant === "desktop" ? Math.round(12 * s) : 14;
  const mono = variant === "desktop" ? Math.max(10, Math.round(11 * s)) : 11;
  const bio = variant === "desktop" ? Math.max(11, Math.round(12 * s)) : 13;

  return (
    <>
      <motion.div
        className="junk-folder-body"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        style={{
          padding: `${pad}px`,
          display: "flex",
          flexDirection: "column",
          gap: Math.round(10 * s),
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: Math.round(10 * s),
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: variant === "mobile" ? 52 : Math.round(48 * s),
              height: variant === "mobile" ? 44 : Math.round(40 * s),
              position: "relative",
            }}
          >
            <Image
              src={junkFolder.icon}
              alt=""
              fill
              sizes={variant === "mobile" ? "52px" : "48px"}
              style={{ objectFit: "contain", objectPosition: "left center" }}
              priority={variant === "desktop"}
            />
          </div>
          <p
            style={{
              margin: 0,
              flex: 1,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: bio,
              lineHeight: 1.55,
              color: "rgba(255, 255, 255, 0.78)",
            }}
          >
            {junkFolder.blurb}
          </p>
        </div>

        {hasItems ? (
          <div
            className={
              variant === "mobile" ? "junk-folder-track" : "junk-folder-grid"
            }
            style={
              variant === "mobile"
                ? {
                    display: "flex",
                    gap: 10,
                    overflowX: "auto",
                    overflowY: "hidden",
                    paddingBottom: 4,
                    margin: "0 -4px",
                    WebkitOverflowScrolling: "touch",
                  }
                : {
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: Math.round(8 * s),
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    alignContent: "start",
                  }
            }
          >
            {items.map((item, index) => (
              <JunkTile
                key={item.id}
                item={item}
                index={index}
                variant={variant}
                layoutScale={s}
                onOpen={() => setLightbox(item)}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 8,
              padding: `${Math.round(16 * s)}px 8px`,
              border: "1px dashed rgba(255, 122, 41, 0.35)",
              borderRadius: 2,
              background: "rgba(255, 122, 41, 0.04)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'VT323', monospace",
                fontSize: mono,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: ACCENT_DIM,
              }}
            >
              ▢ Folder empty
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: Math.max(11, bio - 1),
                lineHeight: 1.5,
                color: "rgba(255, 255, 255, 0.55)",
                maxWidth: 220,
              }}
            >
              Drop images in{" "}
              <code style={{ color: ACCENT, fontSize: "0.92em" }}>
                public/images/junk/
              </code>{" "}
              and list them in{" "}
              <code style={{ color: ACCENT, fontSize: "0.92em" }}>
                data/junk.js
              </code>
              .
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {lightbox ? (
          <JunkLightbox item={lightbox} onClose={closeLightbox} />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function JunkTile({ item, index, variant, layoutScale, onOpen }) {
  const reduceMotion = useReducedMotion();
  const tileW =
    variant === "mobile" ? "min(72vw, 220px)" : "100%";
  const aspect = variant === "mobile" ? "4 / 5" : "1 / 1";

  return (
    <motion.button
      type="button"
      data-cursor="hover"
      onClick={onOpen}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.35, ease: EASE }}
      style={{
        flex: variant === "mobile" ? `0 0 ${tileW}` : undefined,
        width: variant === "mobile" ? tileW : "100%",
        margin: 0,
        padding: 0,
        border: "1px solid rgba(255, 122, 41, 0.4)",
        borderRadius: 2,
        background: "rgba(12, 8, 6, 0.9)",
        cursor: "pointer",
        overflow: "hidden",
        textAlign: "left",
        position: "relative",
      }}
    >
      <div style={{ position: "relative", aspectRatio: aspect, width: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={encodeURI(item.src)}
          alt={item.alt ?? item.caption ?? "Junk folder item"}
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            padding: "2px 6px",
            fontFamily: "'VT323', monospace",
            fontSize: Math.max(9, Math.round(10 * layoutScale)),
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: ACCENT,
            background: "rgba(12, 8, 6, 0.88)",
            border: "1px solid rgba(255, 122, 41, 0.45)",
            borderRadius: 2,
          }}
        >
          {kindLabel(item.kind)}
        </span>
      </div>
      {item.caption ? (
        <p
          style={{
            margin: 0,
            padding: "6px 8px 8px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: Math.max(10, Math.round(11 * layoutScale)),
            lineHeight: 1.35,
            color: "rgba(255, 255, 255, 0.75)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.caption}
        </p>
      ) : null}
    </motion.button>
  );
}

function JunkLightbox({ item, onClose }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt ?? item.caption ?? "Artwork preview"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(6, 4, 3, 0.88)",
        backdropFilter: "blur(6px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(920px, 100%)",
          maxHeight: "min(85vh, 100%)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          border: "1px solid rgba(255, 122, 41, 0.5)",
          borderRadius: 3,
          background: "rgba(18, 12, 8, 0.96)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.65)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            maxHeight: "72vh",
            background: "#0a0604",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={encodeURI(item.src)}
            alt={item.alt ?? item.caption ?? ""}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "72vh",
              width: "auto",
              height: "auto",
              margin: "0 auto",
              objectFit: "contain",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 14px 12px",
            borderTop: "1px solid rgba(255, 122, 41, 0.35)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            {item.caption ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.88)",
                }}
              >
                {item.caption}
              </p>
            ) : null}
            <p
              style={{
                margin: item.caption ? "4px 0 0" : 0,
                fontFamily: "'VT323', monospace",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: ACCENT_DIM,
              }}
            >
              {kindLabel(item.kind)}
            </p>
          </div>
          <button
            type="button"
            data-cursor="hover"
            onClick={onClose}
            style={{
              flexShrink: 0,
              fontFamily: "'VT323', monospace",
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: ACCENT,
              background: "transparent",
              border: "1px solid rgba(255, 122, 41, 0.45)",
              borderRadius: 2,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
