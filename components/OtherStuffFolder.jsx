"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { otherStuff } from "@/data/otherStuff";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const ACCENT_DIM = "rgba(255, 180, 112, 0.7)";
const EASE = [0.16, 1, 0.3, 1];

function isVideoItem(item) {
  return item.type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(item.src);
}

export default function OtherStuffFolder({ variant = "desktop", layoutScale = 1 }) {
  const reduceMotion = useReducedMotion();
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const s = variant === "desktop" ? layoutScale : 1;

  const activeCategory = otherStuff.categories.find(
    (c) => c.id === activeCategoryId
  );
  const items = activeCategory?.items ?? [];

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox]);

  const pad = variant === "desktop" ? Math.round(14 * s) : 14;
  const mono = variant === "desktop" ? Math.max(10, Math.round(11 * s)) : 11;
  const bio = variant === "desktop" ? Math.max(11, Math.round(12 * s)) : 13;

  return (
    <>
      <motion.div
        className="other-stuff-body"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        style={{
          padding: pad,
          display: "flex",
          flexDirection: "column",
          gap: Math.round(12 * s),
          minHeight: 0,
        }}
      >
        {activeCategory ? (
          <>
            <button
              type="button"
              data-cursor="hover"
              onClick={() => {
                playClick();
                setActiveCategoryId(null);
              }}
              style={{
                alignSelf: "flex-start",
                margin: 0,
                padding: "4px 8px",
                border: "1px solid rgba(255, 122, 41, 0.4)",
                borderRadius: 2,
                background: "rgba(255, 122, 41, 0.08)",
                fontFamily: "'VT323', monospace",
                fontSize: mono,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: ACCENT,
                cursor: "pointer",
              }}
            >
              ← Other stuff
            </button>
            <p
              style={{
                margin: 0,
                fontFamily: "'VT323', monospace",
                fontSize: Math.max(12, Math.round(13 * s)),
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: ACCENT,
                textShadow: "0 0 8px rgba(255, 122, 41, 0.4)",
              }}
            >
              {activeCategory.label}
            </p>
            {items.length > 0 ? (
              <div
                className={
                  variant === "mobile" ? "other-stuff-track" : "other-stuff-grid"
                }
                style={
                  variant === "mobile"
                    ? {
                        display: "flex",
                        gap: 10,
                        overflowX: "auto",
                        paddingBottom: 4,
                      }
                    : {
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: Math.round(8 * s),
                        overflowY: "auto",
                        alignContent: "start",
                      }
                }
              >
                {items.map((item, index) => (
                  <MediaTile
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
              <EmptyCategoryNote
                layoutScale={s}
                mono={mono}
                bio={bio}
                categoryId={activeCategory.id}
                categoryLabel={activeCategory.label}
              />
            )}
          </>
        ) : (
          <>
            <p
              style={{
                margin: 0,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: bio,
                lineHeight: 1.55,
                color: "rgba(255, 255, 255, 0.76)",
              }}
            >
              {otherStuff.blurb}
            </p>
            <motion.div
              className="other-stuff-category-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  variant === "mobile"
                    ? "repeat(2, minmax(0, 1fr))"
                    : "repeat(auto-fill, minmax(108px, 1fr))",
                gap: Math.round(14 * s),
              }}
            >
              {otherStuff.categories.map((cat, index) => (
                <CategoryFolderButton
                  key={cat.id}
                  category={cat}
                  index={index}
                  layoutScale={s}
                  onOpen={() => setActiveCategoryId(cat.id)}
                />
              ))}
            </motion.div>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {lightbox ? <MediaLightbox item={lightbox} onClose={closeLightbox} /> : null}
      </AnimatePresence>
    </>
  );
}

function CategoryFolderButton({ category, index, layoutScale, onOpen }) {
  const reduceMotion = useReducedMotion();
  const count = category.items?.length ?? 0;

  return (
    <motion.button
      type="button"
      data-cursor="hover"
      onClick={() => {
        playClick();
        onOpen();
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.32, ease: EASE }}
      style={{
        margin: 0,
        padding: "10px 8px 12px",
        border: "1px solid rgba(255, 122, 41, 0.38)",
        borderRadius: 2,
        background: "rgba(12, 8, 6, 0.75)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        textAlign: "center",
      }}
    >
      <span
        style={{
          position: "relative",
          width: Math.round(44 * layoutScale),
          height: Math.round(36 * layoutScale),
        }}
      >
        <Image
          src={otherStuff.icon}
          alt=""
          fill
          sizes="48px"
          style={{ objectFit: "contain", objectPosition: "center bottom" }}
        />
      </span>
      <span
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: Math.max(10, Math.round(11 * layoutScale)),
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: ACCENT,
          lineHeight: 1.2,
        }}
      >
        {category.label}
      </span>
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: Math.max(9, Math.round(10 * layoutScale)),
          color: ACCENT_DIM,
        }}
      >
        {count === 0 ? "ready" : `${count} file${count === 1 ? "" : "s"}`}
      </span>
    </motion.button>
  );
}

function EmptyCategoryNote({
  layoutScale,
  mono,
  bio,
  categoryId,
  categoryLabel,
}) {
  const folderPath = `public/images/other-stuff/${categoryId}/`;

  return (
    <motion.div
      style={{
        padding: `${Math.round(16 * layoutScale)}px 10px`,
        border: "1px dashed rgba(255, 122, 41, 0.35)",
        borderRadius: 2,
        textAlign: "center",
        background: "rgba(255, 122, 41, 0.04)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "'VT323', monospace",
          fontSize: mono,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: ACCENT_DIM,
        }}
      >
        ▢ {categoryLabel} — ready for files
      </p>
      <p
        style={{
          margin: "10px 0 0",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: Math.max(11, bio - 1),
          lineHeight: 1.55,
          color: "rgba(255, 255, 255, 0.55)",
        }}
      >
        Drop images in{" "}
        <code style={{ color: ACCENT, fontSize: "0.92em" }}>{folderPath}</code>
        , then list them in{" "}
        <code style={{ color: ACCENT }}>data/otherStuff.js</code>.
      </p>
    </motion.div>
  );
}

function MediaTile({ item, index, variant, layoutScale, onOpen }) {
  const reduceMotion = useReducedMotion();
  const tileW = variant === "mobile" ? "min(72vw, 220px)" : "100%";

  return (
    <motion.button
      type="button"
      data-cursor="hover"
      onClick={() => {
        playClick();
        onOpen();
      }}
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
      }}
    >
      <div style={{ position: "relative", aspectRatio: "1 / 1", width: "100%" }}>
        {isVideoItem(item) ? (
          <video
            src={encodeURI(item.src)}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={item.alt ?? item.caption ?? "Video"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "#0a0806",
            }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={encodeURI(item.src)}
            alt={item.alt ?? item.caption ?? "Media item"}
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        {isVideoItem(item) ? (
          <span
            aria-hidden
            style={{
              position: "absolute",
              right: 6,
              bottom: 6,
              fontFamily: "'VT323', monospace",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: ACCENT,
              padding: "2px 5px",
              border: "1px solid rgba(255, 122, 41, 0.5)",
              background: "rgba(10, 6, 4, 0.85)",
            }}
          >
            ▶
          </span>
        ) : null}
      </div>
      {item.caption ? (
        <p
          style={{
            margin: 0,
            padding: "6px 8px 8px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: Math.max(10, Math.round(11 * layoutScale)),
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

function MediaLightbox({ item, onClose }) {
  const dismiss = () => {
    playClick();
    onClose();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={dismiss}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(920px, 100%)",
          border: "1px solid rgba(255, 122, 41, 0.5)",
          borderRadius: 3,
          background: "rgba(18, 12, 8, 0.96)",
          overflow: "hidden",
        }}
      >
        {isVideoItem(item) ? (
          <video
            src={encodeURI(item.src)}
            controls
            autoPlay
            playsInline
            style={{
              display: "block",
              width: "100%",
              maxHeight: "72vh",
              margin: "0 auto",
              background: "#0a0806",
            }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={encodeURI(item.src)}
            alt={item.alt ?? item.caption ?? ""}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "72vh",
              margin: "0 auto",
            }}
          />
        )}
        <motion.div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 12px",
            borderTop: "1px solid rgba(255, 122, 41, 0.35)",
          }}
        >
          <button
            type="button"
            data-cursor="hover"
            onClick={dismiss}
            style={{
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
