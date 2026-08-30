"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function normalize(entry) {
  if (typeof entry === "string") {
    return { src: entry, alt: "", caption: "" };
  }
  return {
    src: entry.src,
    alt: entry.alt ?? "",
    caption: entry.caption ?? "",
  };
}

export default function CaseStudyImageGallery({ images }) {
  const items = (images ?? []).map(normalize).filter((item) => item.src);
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (dir) => {
      setOpenIndex((i) => {
        if (i == null) return i;
        return (i + dir + items.length) % items.length;
      });
    },
    [items.length]
  );

  useEffect(() => {
    if (openIndex == null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, step]);

  if (!items.length) return null;

  const active = openIndex == null ? null : items[openIndex];

  const overlay = mounted
    ? createPortal(
        <AnimatePresence>
          {active ? (
            <motion.div
              className="other-stuff-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={active.caption || active.alt || "Gallery image"}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              onClick={close}
            >
              <div className="other-stuff-lightbox__stage">
                {items.length > 1 ? (
                  <button
                    type="button"
                    className="other-stuff-lightbox__nav"
                    data-cursor="hover"
                    aria-label="Previous image"
                    onClick={(e) => {
                      e.stopPropagation();
                      step(-1);
                    }}
                  >
                    ‹
                  </button>
                ) : null}
                <div
                  className="other-stuff-lightbox__frame"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="other-stuff-lightbox__media"
                    src={encodeURI(active.src)}
                    alt={active.alt}
                  />
                </div>
                {items.length > 1 ? (
                  <button
                    type="button"
                    className="other-stuff-lightbox__nav"
                    data-cursor="hover"
                    aria-label="Next image"
                    onClick={(e) => {
                      e.stopPropagation();
                      step(1);
                    }}
                  >
                    ›
                  </button>
                ) : null}
              </div>
              <div
                className="other-stuff-lightbox__bar"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="other-stuff-lightbox__counter">
                  {String(openIndex + 1).padStart(2, "0")} /{" "}
                  {String(items.length).padStart(2, "0")}
                  {active.caption ? `  ·  ${active.caption}` : ""}
                </p>
                <button
                  type="button"
                  className="other-stuff-lightbox__close"
                  data-cursor="hover"
                  onClick={close}
                >
                  Close
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      <div className="case-study-gallery">
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            className="case-study-gallery__tile"
            data-cursor="hover"
            onClick={() => setOpenIndex(i)}
          >
            <span className="case-study-gallery__frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={encodeURI(item.src)} alt="" />
            </span>
            <span className="case-study-gallery__caption">
              {item.caption || `Image ${i + 1}`}
            </span>
          </button>
        ))}
      </div>
      {overlay}
    </>
  );
}
