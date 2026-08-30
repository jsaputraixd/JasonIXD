"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function CaseStudyZoomOverlay({
  open,
  src,
  alt = "",
  onClose,
  onPrev,
  onNext,
  caption,
}) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const showNav = Boolean(onPrev || onNext);
  const visible = Boolean(open && src);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [visible, onClose, onPrev, onNext]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="case-study-zoom"
          role="dialog"
          aria-modal="true"
          aria-label={caption || alt || "Zoomed image"}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
        >
          {showNav ? (
            <button
              type="button"
              className="case-study-zoom__nav case-study-zoom__nav--prev"
              data-cursor="hover"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                onPrev?.();
              }}
            >
              ‹
            </button>
          ) : null}
          <motion.img
            key={src}
            className="case-study-zoom__img"
            src={encodeURI(src)}
            alt={alt}
            initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduceMotion ? undefined : { scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          />
          {showNav ? (
            <button
              type="button"
              className="case-study-zoom__nav case-study-zoom__nav--next"
              data-cursor="hover"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                onNext?.();
              }}
            >
              ›
            </button>
          ) : null}
          <button
            type="button"
            className="case-study-zoom__close"
            data-cursor="hover"
            onClick={onClose}
          >
            Close
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export default function CaseStudyZoomImage({
  src,
  alt = "",
  displaySrc,
  className = "",
  style,
  imgClassName = "",
  imgStyle,
  children,
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (!src) return null;

  const thumb = displaySrc ?? encodeURI(src);

  return (
    <>
      <button
        type="button"
        className={`case-study-zoom-trigger ${className}`.trim()}
        style={style}
        data-cursor="view"
        aria-label={alt ? `View ${alt}` : "View image"}
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={imgClassName}
          src={thumb}
          alt={alt}
          style={imgStyle}
        />
        {children}
      </button>
      <CaseStudyZoomOverlay src={src} alt={alt} open={open} onClose={close} />
    </>
  );
}
