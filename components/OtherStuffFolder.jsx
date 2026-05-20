"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { otherStuff } from "@/data/otherStuff";
import {
  otherStuffLightboxSrc,
  otherStuffThumbSrc,
} from "@/lib/otherStuffMedia";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const ACCENT_DIM = "rgba(255, 180, 112, 0.7)";

function isVideoItem(item) {
  return item.type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(item.src);
}

export default function OtherStuffFolder({
  variant = "desktop",
  layoutScale = 1,
  onBrowseChange,
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const s = variant === "desktop" ? layoutScale : 1;

  const activeCategory = otherStuff.categories.find(
    (c) => c.id === activeCategoryId
  );
  const items = activeCategory?.items ?? [];
  const lightboxItem =
    lightboxIndex != null && items[lightboxIndex] ? items[lightboxIndex] : null;

  useEffect(() => {
    onBrowseChange?.(Boolean(activeCategoryId));
  }, [activeCategoryId, onBrowseChange]);

  const openCategory = (id) => {
    playClick();
    setActiveCategoryId(id);
    setLightboxIndex(null);
  };

  const closeCategory = () => {
    playClick();
    setActiveCategoryId(null);
    setLightboxIndex(null);
  };

  const openLightbox = (index) => {
    playClick();
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const stepLightbox = useCallback(
    (delta) => {
      if (lightboxIndex == null || items.length === 0) return;
      playClick();
      setLightboxIndex((i) => (i + delta + items.length) % items.length);
    },
    [lightboxIndex, items.length]
  );

  useEffect(() => {
    if (lightboxIndex == null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, stepLightbox]);

  const pad = variant === "desktop" ? Math.round(14 * s) : 14;
  const mono = variant === "desktop" ? Math.max(10, Math.round(11 * s)) : 11;
  const bio = variant === "desktop" ? Math.max(11, Math.round(12 * s)) : 13;

  return (
    <>
      <div
        className="other-stuff-body"
        style={{
          padding: pad,
          display: "flex",
          flexDirection: "column",
          gap: Math.round(10 * s),
          minHeight: 0,
        }}
      >
        {activeCategory ? (
          <>
            <button
              type="button"
              data-cursor="hover"
              onClick={closeCategory}
              className="other-stuff-back"
              style={{ fontSize: mono }}
            >
              ← Other stuff
            </button>
            <p className="other-stuff-category-title" style={{ fontSize: Math.max(12, Math.round(13 * s)) }}>
              {activeCategory.label}
              {items.length > 0 ? (
                <span className="other-stuff-category-count"> · {items.length}</span>
              ) : null}
            </p>
            {items.length > 0 ? (
              <div className="other-stuff-gallery">
                <div
                  className={`other-stuff-masonry${
                    variant === "desktop" ? " other-stuff-masonry--desktop" : ""
                  }`}
                >
                  {items.map((item, index) => (
                    <MasonryTile
                      key={item.id}
                      item={item}
                      onOpen={() => openLightbox(index)}
                    />
                  ))}
                </div>
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
            <div className="other-stuff-category-grid">
              {otherStuff.categories.map((cat) => (
                <CategoryFolderButton
                  key={cat.id}
                  category={cat}
                  layoutScale={s}
                  onOpen={() => openCategory(cat.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxItem && typeof document !== "undefined"
        ? createPortal(
            <MediaLightbox
              item={lightboxItem}
              index={lightboxIndex}
              total={items.length}
              onClose={closeLightbox}
              onPrev={() => stepLightbox(-1)}
              onNext={() => stepLightbox(1)}
            />,
            document.body
          )
        : null}
    </>
  );
}

function CategoryFolderButton({ category, layoutScale, onOpen }) {
  const count = category.items?.length ?? 0;

  return (
    <button
      type="button"
      data-cursor="hover"
      onClick={onOpen}
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
    </button>
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
    <div
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
    </div>
  );
}

function MasonryTile({ item, onOpen }) {
  const [src, setSrc] = useState(() => otherStuffThumbSrc(item.src));

  return (
    <button
      type="button"
      data-cursor="hover"
      onClick={onOpen}
      className="other-stuff-tile"
    >
      {isVideoItem(item) ? (
        <span className="other-stuff-tile__video">
          <span className="other-stuff-tile__video-placeholder" aria-hidden />
          <span className="other-stuff-tile__video-badge" aria-hidden>
            ▶
          </span>
        </span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="other-stuff-tile__img"
          onError={() => {
            const fallback = encodeURI(item.src);
            if (src !== fallback) setSrc(fallback);
          }}
        />
      )}
    </button>
  );
}

function LightboxImage({ src, itemId, onError }) {
  const frameRef = useRef(null);
  const [box, setBox] = useState(null);

  const fit = useCallback((img) => {
    const frame = frameRef.current;
    if (!frame || !img?.naturalWidth || !img?.naturalHeight) return;

    const styles = getComputedStyle(frame);
    const padX =
      parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const padY =
      parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const maxW = Math.max(1, frame.clientWidth - padX);
    const maxH = Math.max(1, frame.clientHeight - padY);
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);

    setBox({
      width: Math.max(1, Math.floor(img.naturalWidth * scale)),
      height: Math.max(1, Math.floor(img.naturalHeight * scale)),
    });
  }, []);

  useLayoutEffect(() => {
    setBox(null);
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new ResizeObserver(() => {
      const img = frame.querySelector("img");
      if (img?.complete && img.naturalWidth) fit(img);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [src, itemId, fit]);

  return (
    <div ref={frameRef} className="other-stuff-lightbox__frame">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={itemId}
        src={src}
        alt=""
        decoding="async"
        className="other-stuff-lightbox__media"
        style={
          box
            ? { width: box.width, height: box.height }
            : { maxWidth: "100%", maxHeight: "100%" }
        }
        onLoad={(e) => fit(e.currentTarget)}
        onError={onError}
      />
    </div>
  );
}

function MediaLightbox({ item, index, total, onClose, onPrev, onNext }) {
  const [lightboxSrc, setLightboxSrc] = useState(() =>
    otherStuffLightboxSrc(item.src)
  );

  useEffect(() => {
    setLightboxSrc(otherStuffLightboxSrc(item.src));
  }, [item.src]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const dismiss = () => {
    playClick();
    onClose();
  };

  const showNav = total > 1;
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={dismiss}
      className="other-stuff-lightbox"
      data-cursor="hover"
    >
      <div
        className="other-stuff-lightbox__stage"
        onClick={(e) => e.stopPropagation()}
      >
        {showNav ? (
          <button
            type="button"
            className="other-stuff-lightbox__nav other-stuff-lightbox__nav--prev"
            data-cursor="hover"
            aria-label="Previous"
            onClick={onPrev}
          >
            ←
          </button>
        ) : null}

        {isVideoItem(item) ? (
          <div className="other-stuff-lightbox__frame other-stuff-lightbox__frame--video">
            <video
              src={encodeURI(item.src)}
              controls
              autoPlay
              playsInline
              className="other-stuff-lightbox__media"
            />
          </div>
        ) : (
          <LightboxImage
            itemId={item.id}
            src={lightboxSrc}
            onError={() => {
              const fallback = encodeURI(item.src);
              if (lightboxSrc !== fallback) setLightboxSrc(fallback);
            }}
          />
        )}

        {showNav ? (
          <button
            type="button"
            className="other-stuff-lightbox__nav other-stuff-lightbox__nav--next"
            data-cursor="hover"
            aria-label="Next"
            onClick={onNext}
          >
            →
          </button>
        ) : null}
      </div>

      <div
        className="other-stuff-lightbox__bar"
        onClick={(e) => e.stopPropagation()}
      >
        {showNav ? (
          <span className="other-stuff-lightbox__counter">{counter}</span>
        ) : (
          <span />
        )}
        <button
          type="button"
          data-cursor="hover"
          onClick={dismiss}
          className="other-stuff-lightbox__close"
        >
          Close
        </button>
      </div>
    </div>
  );
}
