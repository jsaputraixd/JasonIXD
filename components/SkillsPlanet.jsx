"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { playClick } from "@/lib/typingSound";
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
const EASE = [0.16, 1, 0.3, 1];

function skillOrbitPoint(box, orbitR, index, total) {
  const angleDeg = (index * 360) / total - 90;
  const rad = (angleDeg * Math.PI) / 180;
  const cx = box / 2;
  const cy = box / 2;
  return {
    x: cx + Math.cos(rad) * orbitR,
    y: cy + Math.sin(rad) * orbitR,
  };
}

/** Spoke from globe rim to orbit node — stays behind the disc, not through it. */
function skillSpokeSegment(box, orbitR, discR, index, total) {
  const { x, y } = skillOrbitPoint(box, orbitR, index, total);
  const cx = box / 2;
  const cy = box / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const rim = discR + 6;
  return {
    x1: cx + (dx / dist) * rim,
    y1: cy + (dy / dist) * rim,
    x2: x,
    y2: y,
  };
}

function pulseSkill() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }
}

function OurHomeLabel({ fontSize, margin }) {
  return (
    <button
      type="button"
      data-cursor="hover"
      aria-label="our home"
      onClick={() => playClick()}
      style={{
        display: "block",
        width: "100%",
        margin,
        padding: "2px 8px 4px",
        textAlign: "center",
        fontFamily: "'Bonbon', cursive",
        fontSize,
        color: "rgba(255, 180, 140, 0.95)",
        textShadow: "0 0 14px rgba(255, 122, 41, 0.35)",
        lineHeight: 1.2,
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      our home {"<3"}
    </button>
  );
}

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
  const [activeSkill, setActiveSkill] = useState(null);
  const [constellationDrawn, setConstellationDrawn] = useState(false);

  const openModal = useCallback(() => {
    playClick();
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    playClick();
    setModalOpen(false);
  }, []);
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
        const next = entry.isIntersecting && entry.intersectionRatio > 0.25;
        setExpanded(next);
        if (next && !constellationDrawn) setConstellationDrawn(true);
      },
      { root, threshold: [0, 0.15, 0.25, 0.4] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [variant, scrollRootSelector, constellationDrawn]);

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
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

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
          onClick={closeModal}
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
                onClick={closeModal}
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

            <OurHomeLabel
              fontSize={isMobile ? 22 : 26}
              margin="12px 4px 0"
            />
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
          {isMobile ? (
            <svg
              aria-hidden
              width={box}
              height={box}
              viewBox={`0 0 ${box} ${box}`}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
                overflow: "visible",
              }}
            >
              {skills.map((_, i) => {
                const { x1, y1, x2, y2 } = skillSpokeSegment(
                  box,
                  orbitR,
                  discR,
                  i,
                  skills.length
                );
                const len = Math.hypot(x2 - x1, y2 - y1);
                return (
                  <motion.line
                    key={`spoke-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(255, 122, 41, 0.32)"
                    strokeWidth={1}
                    strokeDasharray={len}
                    initial={{ strokeDashoffset: len, opacity: 0 }}
                    animate={{
                      strokeDashoffset: expanded ? 0 : len,
                      opacity: expanded ? 0.7 : 0,
                    }}
                    transition={{
                      duration: 0.55,
                      delay: constellationDrawn ? i * 0.045 : 0,
                      ease: EASE,
                    }}
                  />
                );
              })}
              {skills.map((_, i) => {
                const a = skillOrbitPoint(box, orbitR, i, skills.length);
                const b = skillOrbitPoint(
                  box,
                  orbitR,
                  (i + 1) % skills.length,
                  skills.length
                );
                const len = Math.hypot(b.x - a.x, b.y - a.y);
                return (
                  <motion.line
                    key={`ring-${i}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(255, 122, 41, 0.18)"
                    strokeWidth={1}
                    strokeDasharray={len}
                    initial={{ strokeDashoffset: len, opacity: 0 }}
                    animate={{
                      strokeDashoffset: expanded ? 0 : len,
                      opacity: expanded ? 0.55 : 0,
                    }}
                    transition={{
                      duration: 0.65,
                      delay: constellationDrawn ? 0.18 + i * 0.04 : 0,
                      ease: EASE,
                    }}
                  />
                );
              })}
            </svg>
          ) : null}

          <motion.div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 3,
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
                openModal();
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
                background: "rgba(0,0,0,0.92)",
                cursor: isMobile ? "pointer" : "none",
                lineHeight: 0,
                position: "relative",
                boxShadow: "0 0 0 2px rgba(12, 10, 8, 0.95)",
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
          </motion.div>

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
              zIndex: 4,
            }}
          >
            {skills.map((skill, i) => {
              const angle = (i * 360) / skills.length;
              const isActive = activeSkill === i;
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
                    zIndex: isActive ? 6 : 3,
                  }}
                >
                  {isMobile ? (
                    <motion.button
                      type="button"
                      className={expanded ? "skills-orbit-label" : ""}
                      aria-label={`Skill: ${skill}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        playClick();
                        pulseSkill();
                        setActiveSkill(i);
                      }}
                      animate={{
                        scale: isActive ? [1, 1.1, 1] : 1,
                        boxShadow: isActive
                          ? "0 0 18px rgba(255, 122, 41, 0.75)"
                          : "0 0 0 rgba(255, 122, 41, 0)",
                      }}
                      transition={{ duration: 0.35, ease: EASE }}
                      style={{
                        display: "inline-block",
                        transform: "translate(-50%, -50%)",
                        fontFamily: "'VT323', monospace",
                        fontSize: labelFont,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: ACCENT,
                        textShadow: "0 0 8px rgba(255, 122, 41, 0.55)",
                        padding: "2px 8px",
                        border: `1px solid rgba(255, 122, 41, ${isActive ? 0.85 : 0.5})`,
                        background: "rgba(12, 10, 8, 0.96)",
                        borderRadius: 2,
                        whiteSpace: "nowrap",
                        opacity: expanded ? 1 : 0,
                        pointerEvents: expanded ? "auto" : "none",
                        cursor: "pointer",
                        transition: "opacity 0.35s ease, border-color 0.2s ease",
                        transitionDelay:
                          expanded ? `${i * 35}ms` : "0ms",
                      }}
                    >
                      {skill}
                    </motion.button>
                  ) : (
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
                  )}
                </div>
              );
            })}
          </div>

        </div>

        <OurHomeLabel
          fontSize={isMobile ? 22 : Math.max(18, Math.round(26 * inlineS))}
          margin="8px 6px 0"
        />

        {!isMobile ? (
          <div className="skills-tag-row" aria-label="Skills">
            {skills.map((skill) => (
              <span key={skill} className="skills-tag-row__chip">
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {typeof document !== "undefined" &&
        createPortal(modalContent, document.body)}
    </>
  );
}
