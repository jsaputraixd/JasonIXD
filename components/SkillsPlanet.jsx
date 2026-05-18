"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { skills } from "@/data/about";
import AsciiGlobe, {
  colsForSquareGlobeGrid,
  globeDiscRadiusPx,
} from "./AsciiGlobe";

const ACCENT = "#FF7A29";

/** VP9 + alpha; falls back to ASCII if unsupported or on error. */
const SKILLS_ORBIT_VIDEO_SRC = "/videos/earth-skills-loop.webm";

const ROWS_DESK = 21;
const FS_DESK = 10;

const ROWS_MOB = 17;
const FS_MOB = 9;

const ORBIT_EXTRA_REST = 26;
const ORBIT_EXTRA_HOVER = 58;

export default function SkillsPlanet({
  variant = "desktop",
  scrollRootSelector,
  layoutScale = 1,
  /** Desktop only: multiplies globe/orbit/inline type (e.g. 0.5 for a smaller skills.log body). Title bar unaffected — set on Window. Zoom modal still uses full `layoutScale`. */
  globeScale = 1,
}) {
  const isMobile = variant === "mobile";
  const chromeS = isMobile ? 1 : layoutScale;
  const inlineS = isMobile ? 1 : layoutScale * globeScale;
  const rows = isMobile ? ROWS_MOB : ROWS_DESK;
  const fontSize = isMobile ? FS_MOB : Math.max(7, FS_DESK * inlineS);
  const cols = colsForSquareGlobeGrid(rows, 1);

  const discR = useMemo(
    () => globeDiscRadiusPx(cols, rows, fontSize, 1),
    [cols, rows, fontSize]
  );

  const modalZoom = isMobile ? 1.52 : 2.05;
  const zoomBodyFont = isMobile ? FS_MOB : Math.max(7, FS_DESK * chromeS);
  const modalFontSize = Math.max(
    isMobile ? 11 : 9,
    Math.round(zoomBodyFont * modalZoom)
  );
  const modalDiscR = useMemo(
    () => globeDiscRadiusPx(cols, rows, modalFontSize, 1),
    [cols, rows, modalFontSize]
  );
  const modalOrbitPad =
    (ORBIT_EXTRA_HOVER + 36) * (isMobile ? 1 : Math.max(1, chromeS));
  const modalOrbitR = modalDiscR + modalOrbitPad;
  const modalBox = Math.ceil(modalOrbitR * 2) + (isMobile ? 52 : 68);

  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [useAsciiFallback, setUseAsciiFallback] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const videoModalRef = useRef(null);

  const orbitR =
    discR +
    (isMobile
      ? (expanded ? ORBIT_EXTRA_HOVER : ORBIT_EXTRA_REST)
      : ORBIT_EXTRA_REST) *
      inlineS;
  const box = Math.ceil(orbitR * 2) + Math.round(48 * inlineS);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useLayoutEffect(() => {
    if (variant !== "mobile" || !scrollRootSelector) return;
    const root =
      typeof document !== "undefined"
        ? document.querySelector(scrollRootSelector)
        : null;
    const el = wrapRef.current;
    if (!root || !el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        setExpanded(entry.isIntersecting && entry.intersectionRatio > 0.25);
      },
      { root, threshold: [0, 0.15, 0.25, 0.4] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [variant, scrollRootSelector]);

  const showVideo = !reduceMotion && !useAsciiFallback;

  useLayoutEffect(() => {
    if (!showVideo || modalOpen) return;
    const el = wrapRef.current;
    const vid = videoRef.current;
    if (!el || !vid) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      },
      { threshold: 0.08, rootMargin: "64px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [showVideo, variant, modalOpen]);

  useLayoutEffect(() => {
    const inline = videoRef.current;
    const modalV = videoModalRef.current;
    if (modalOpen) {
      inline?.pause();
      if (showVideo && modalV) void modalV.play().catch(() => {});
    } else {
      modalV?.pause();
      if (showVideo && inline) void inline.play().catch(() => {});
    }
  }, [modalOpen, showVideo]);

  useLayoutEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const labelFont = isMobile ? 10 : Math.max(9, Math.round(11 * inlineS));
  const modalLabelFont = isMobile ? 12 : Math.max(11, Math.round(14 * chromeS));

  const modalContent = (
    <AnimatePresence>
      {modalOpen ? (
        <motion.div
          key="skills-zoom-shell"
          role="dialog"
          aria-modal="true"
          aria-labelledby="skills-zoom-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 8000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(4, 3, 2, 0.82)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(96vmin, 720px)",
              border: "1px solid rgba(255, 122, 41, 0.55)",
              borderRadius: 4,
              background: "rgba(14, 10, 6, 0.95)",
              boxShadow:
                "0 0 40px rgba(255, 122, 41, 0.2), 0 24px 64px rgba(0,0,0,0.65)",
              padding: "14px 14px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 10,
                borderBottom: "1px solid rgba(255, 122, 41, 0.25)",
                paddingBottom: 8,
              }}
            >
              <p
                id="skills-zoom-title"
                style={{
                  margin: 0,
                  fontFamily: "'VT323', monospace",
                  fontSize: 13,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: ACCENT,
                  textShadow: "0 0 8px rgba(255, 122, 41, 0.45)",
                }}
              >
                skills.log — zoom
              </p>
              <button
                type="button"
                data-cursor="hover"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
                style={{
                  flexShrink: 0,
                  background: "transparent",
                  border: "none",
                  color: ACCENT,
                  fontFamily: "'VT323', monospace",
                  fontSize: 22,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: "0 6px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                position: "relative",
                width: modalBox,
                height: modalBox,
                margin: "0 auto",
              }}
            >
              <div
                className={reduceMotion ? "" : "skills-orbit-rotor"}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: modalBox - 8,
                  height: modalBox - 8,
                  marginLeft: -(modalBox - 8) / 2,
                  marginTop: -(modalBox - 8) / 2,
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                {skills.map((skill, i) => {
                  const angle = (i * 360) / skills.length;
                  return (
                    <div
                      key={`m-${skill}`}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: `rotate(${angle}deg) translate(0, -${modalOrbitR}px) rotate(-${angle}deg)`,
                      }}
                    >
                      <span
                        className={reduceMotion ? "" : "skills-orbit-label"}
                        style={{
                          display: "inline-block",
                          transform: "translate(-50%, -50%)",
                          fontFamily: "'VT323', monospace",
                          fontSize: modalLabelFont,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: ACCENT,
                          textShadow: "0 0 10px rgba(255, 122, 41, 0.55)",
                          padding: "3px 9px",
                          border: "1px solid rgba(255, 122, 41, 0.55)",
                          background: "rgba(12, 10, 8, 0.96)",
                          borderRadius: 2,
                          whiteSpace: "nowrap",
                          opacity: 1,
                        }}
                      >
                        {skill}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 4,
                }}
              >
                <div
                  style={{
                    width: modalDiscR * 2 + Math.round(10 * (isMobile ? 1 : chromeS)),
                    height: modalDiscR * 2 + Math.round(10 * (isMobile ? 1 : chromeS)),
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "rgba(0,0,0,0.18)",
                    position: "relative",
                    boxShadow: "0 0 28px rgba(255, 122, 41, 0.15)",
                  }}
                >
                  {showVideo ? (
                    <video
                      ref={videoModalRef}
                      src={SKILLS_ORBIT_VIDEO_SRC}
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="auto"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        lineHeight: 1,
                      }}
                    >
                      <AsciiGlobe
                        cols={cols}
                        rows={rows}
                        fontSize={modalFontSize}
                        lineHeight={1}
                        spinning={!reduceMotion}
                        speed={0.00018}
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p
              style={{
                margin: "12px 4px 0",
                textAlign: "center",
                fontFamily: "'Bonbon', cursive",
                fontSize: isMobile ? 22 : 26,
                color: "rgba(255, 180, 140, 0.95)",
                textShadow: "0 0 14px rgba(255, 122, 41, 0.35)",
              }}
            >
              our home {'<3'}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: box,
          marginLeft: "auto",
          marginRight: "auto",
          paddingBottom: 6,
        }}
      >
        <div
          style={{
            position: "relative",
            width: box,
            height: box,
            margin: "0 auto",
          }}
        >
          <div
            className={isMobile && expanded ? "skills-orbit-rotor" : ""}
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: box - 8,
              height: box - 8,
              marginLeft: -(box - 8) / 2,
              marginTop: -(box - 8) / 2,
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            {skills.map((skill, i) => {
              const angle = (i * 360) / skills.length;
              return (
                <div
                  key={skill}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${angle}deg) translate(0, -${orbitR}px) rotate(-${angle}deg)`,
                    transition: isMobile
                      ? "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)"
                      : undefined,
                  }}
                >
                  <span
                    className={
                      isMobile && expanded ? "skills-orbit-label" : ""
                    }
                    style={{
                      display: "inline-block",
                      transform: "translate(-50%, -50%)",
                      fontFamily: "'VT323', monospace",
                      fontSize: labelFont,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: ACCENT,
                      textShadow: "0 0 8px rgba(255, 122, 41, 0.55)",
                      padding: "1px 7px",
                      border: "1px solid rgba(255, 122, 41, 0.5)",
                      background: "rgba(12, 10, 8, 0.96)",
                      borderRadius: 2,
                      whiteSpace: "nowrap",
                      opacity: isMobile ? (expanded ? 1 : 0) : 0,
                      pointerEvents: "none",
                      transition: isMobile ? "opacity 0.35s ease" : undefined,
                      transitionDelay:
                        isMobile && expanded ? `${i * 35}ms` : "0ms",
                    }}
                  >
                    {skill}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 4,
            }}
          >
            <button
              type="button"
              data-cursor={variant === "desktop" ? "view" : undefined}
              aria-label="Open skills planet zoom"
              aria-expanded={modalOpen}
              aria-haspopup="dialog"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              style={{
                display: "block",
                width: discR * 2 + Math.round(8 * inlineS),
                height: discR * 2 + Math.round(8 * inlineS),
                borderRadius: "50%",
                overflow: "hidden",
                border: "none",
                padding: 0,
                margin: 0,
                background: "rgba(0,0,0,0.15)",
                cursor: isMobile ? "pointer" : "none",
                lineHeight: 0,
                position: "relative",
              }}
            >
              {showVideo ? (
                <video
                  ref={videoRef}
                  src={SKILLS_ORBIT_VIDEO_SRC}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  onError={() => setUseAsciiFallback(true)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                  }}
                />
              ) : (
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    lineHeight: 1,
                  }}
                >
                  <AsciiGlobe
                    cols={cols}
                    rows={rows}
                    fontSize={fontSize}
                    lineHeight={1}
                    spinning={!reduceMotion}
                    speed={expanded ? 0.00011 : 0.00024}
                  />
                </span>
              )}
            </button>
          </div>
        </div>

        <p
          style={{
            margin: "8px 6px 0",
            textAlign: "center",
            fontFamily: "'Bonbon', cursive",
            fontSize: isMobile ? 22 : Math.max(18, Math.round(26 * inlineS)),
            color: "rgba(255, 180, 140, 0.95)",
            textShadow: "0 0 14px rgba(255, 122, 41, 0.35)",
            lineHeight: 1.2,
          }}
        >
          our home {'<3'}
        </p>
      </div>

      {typeof document !== "undefined" &&
        createPortal(modalContent, document.body)}
    </>
  );
}
