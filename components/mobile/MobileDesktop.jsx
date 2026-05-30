"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import StatusBar from "@/components/StatusBar";
import SkillsPlanet from "@/components/SkillsPlanet";
import WelcomeReadAloud from "@/components/WelcomeReadAloud";
import OtherStuffFolder from "@/components/OtherStuffFolder";
import OtherProjectsFolder from "@/components/OtherProjectsFolder";
import { MobileProjectPreviewPanel } from "@/components/ProjectPreviewPane";
import ProjectViewLink from "@/components/ProjectViewLink";
import WelcomeAsciiPortrait from "@/components/WelcomeAsciiPortrait";
import {
  TypedLine,
  ScrollTypedLine,
  ScrollTypedParagraph,
  BlinkCursor,
  FadeInLine,
  ACCENT,
  EASE,
} from "@/components/TypedLine";
import { featuredProjects } from "@/data/projects";
import { about } from "@/data/about";
import {
  markIntroSeen,
  shouldSkipIntro,
  signalBootComplete,
} from "@/lib/introSession";
import { playClick, playTypingClick } from "@/lib/typingSound";
import { pickTrashMessage } from "@/lib/trashMessage";
import { projectCardThumbSrc } from "@/lib/projectMedia";
import { projectHeroTransitionName } from "@/lib/viewTransition";

const ACCENT_DIM = "#FFB570";

function MobileJourneyChapter({ children, scrollRoot, variant = "up" }) {
  return (
    <div className="mobile-journey-chapter">
      <MobileScrollReveal scrollRoot={scrollRoot} variant={variant} delay={0.02}>
        {children}
      </MobileScrollReveal>
    </div>
  );
}

function MobileWorkSection({ scrollRoot }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [focusStrength, setFocusStrength] = useState(0);
  const sectionRef = useRef(null);
  const project = featuredProjects[activeIdx] ?? featuredProjects[0];

  useEffect(() => {
    const root = scrollRoot?.current;
    const el = sectionRef.current;
    if (!root || !el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const ratio = entry.intersectionRatio;
        const strength = entry.isIntersecting
          ? Math.min(1, Math.max(0, (ratio - 0.02) / 0.28))
          : 0;
        setFocusStrength(strength);
      },
      { root, threshold: [0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [scrollRoot]);

  return (
    <motion.div ref={sectionRef} className="mobile-work-section" style={{ position: "relative" }}>
      <MobileSectionAnchor id="mobile-work" />
      <MobileScrollReveal scrollRoot={scrollRoot} variant="up" delay={0.04}>
        <MobileProjectsCarousel
          scrollRoot={scrollRoot}
          activeIdx={activeIdx}
          onActiveChange={setActiveIdx}
          focusStrength={focusStrength}
        />
      </MobileScrollReveal>
      <MobileScrollReveal scrollRoot={scrollRoot} variant="fade" delay={0.06}>
        <motion.div
          style={{
            margin: `8px ${MOBILE_CARD_INSET}px 0`,
            position: "relative",
            zIndex: 2,
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          <MobileProjectPreviewPanel project={project} />
        </motion.div>
      </MobileScrollReveal>
    </motion.div>
  );
}

function MobileJourneySectionLabel({ children, scrollRoot, skipTyping }) {
  return (
    <ScrollTypedLine
      scrollRoot={scrollRoot}
      text={typeof children === "string" ? children : ""}
      skipTyping={skipTyping}
      charMs={22}
      delay={80}
      amount={0.45}
      style={{
        margin: `0 ${MOBILE_CARD_INSET + 4}px 16px`,
        fontFamily: "'VT323', monospace",
        fontSize: 13,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: ACCENT_DIM,
        textShadow: "0 0 6px rgba(255, 122, 41, 0.32)",
        display: "block",
      }}
    />
  );
}

function MobileMeTxtJourney({ scrollRoot, skipTyping = false }) {
  const box = { width: "min(220px, 72vw)", height: "min(220px, 72vw)" };

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            ...box,
            margin: "0 auto",
            lineHeight: 0,
          }}
        >
          <WelcomeAsciiPortrait
            sizes="min(280px, 85vw)"
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "none",
            }}
          />
        </div>
        <ScrollTypedLine
          scrollRoot={scrollRoot}
          skipTyping={skipTyping}
          text="It's me :D"
          charMs={42}
          delay={200}
          amount={0.42}
          style={{
            margin: "12px 0 0",
            fontFamily: "'VT323', monospace",
            fontSize: 13,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: ACCENT_DIM,
            textShadow: "0 0 8px rgba(255, 122, 41, 0.38)",
            display: "block",
          }}
        />
        </div>
      <ScrollTypedParagraph
        scrollRoot={scrollRoot}
        skipTyping={skipTyping}
        text={about.bio}
        charMs={13}
        delay={380}
        style={{
          margin: "14px 0 0",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          lineHeight: 1.65,
          color: "rgba(255, 255, 255, 0.82)",
          textAlign: "left",
        }}
      />
    </div>
  );
}

const MOBILE_BLOCK_GAP = 40;
const MOBILE_CARD_INSET = 16;
const MOBILE_DOCK_HEIGHT = 44;

const MOBILE_NAV_SECTIONS = [
  { id: "mobile-about", label: "About" },
  { id: "mobile-work", label: "Work" },
  { id: "mobile-skills", label: "Skills" },
  { id: "mobile-more", label: "More" },
  { id: "mobile-contact", label: "Contact" },
];

/** Scroll-triggered entrance — uses the mobile column as intersection root. */
function MobileScrollReveal({
  children,
  scrollRoot,
  variant = "up",
  delay = 0,
  className,
  style,
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, {
    root: scrollRoot ?? undefined,
    once: true,
    amount: 0.18,
    margin: "0px 0px -10% 0px",
  });

  const variants = {
    up: {
      hidden: { opacity: 0, y: 36, scale: 0.94, filter: "blur(8px)" },
      visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    },
    left: {
      hidden: { opacity: 0, x: -28, y: 16, scale: 0.97 },
      visible: { opacity: 1, x: 0, y: 0, scale: 1 },
    },
    right: {
      hidden: { opacity: 0, x: 28, y: 16, scale: 0.97 },
      visible: { opacity: 1, x: 0, y: 0, scale: 1 },
    },
    fade: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    },
  };

  const v = variants[variant] ?? variants.up;
  const show = reduceMotion || inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={reduceMotion ? false : "hidden"}
      animate={show ? "visible" : "hidden"}
      variants={v}
      transition={{ duration: 0.72, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function MobileSectionRule() {
  return (
    <motion.div
      aria-hidden
      className="mobile-section-rule"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.85, ease: EASE }}
      style={{
        margin: `${MOBILE_BLOCK_GAP - 12}px ${MOBILE_CARD_INSET + 4}px 0`,
        height: 1,
        transformOrigin: "left center",
        background:
          "linear-gradient(90deg, rgba(255,122,41,0.55), rgba(255,122,41,0.12) 55%, transparent)",
        boxShadow: "0 0 12px rgba(255, 122, 41, 0.25)",
      }}
    />
  );
}

function MobileOpenForWorkStrip() {
  return (
    <a
      href={about.socials.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="mobile-open-strip"
      onClick={() => playClick()}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        margin: `0 ${MOBILE_CARD_INSET}px`,
        padding: "10px 14px",
        border: "1px solid rgba(255, 122, 41, 0.4)",
        borderRadius: 2,
        background:
          "linear-gradient(90deg, rgba(255,122,41,0.12), rgba(255,122,41,0.04), rgba(255,122,41,0.12))",
        fontFamily: "'VT323', monospace",
        fontSize: 13,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: ACCENT,
        textShadow: "0 0 8px rgba(255, 122, 41, 0.45)",
        textDecoration: "none",
      }}
    >
      <motion.span
        aria-hidden
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: ACCENT,
          boxShadow: "0 0 10px rgba(255, 122, 41, 0.8)",
        }}
      />
      J.S. · Open for work
    </a>
  );
}

function MobileSectionAnchor({ id }) {
  return (
    <motion.div
      id={id}
      aria-hidden
      className="mobile-section-anchor"
      style={{ height: 0, scrollMarginTop: MOBILE_DOCK_HEIGHT + 28 }}
    />
  );
}

function useMobileScrollProgress(scrollRoot, enabled) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const root = scrollRoot?.current;
    if (!root) return;

    const update = () => {
      const max = root.scrollHeight - root.clientHeight;
      setProgress(max <= 4 ? 0 : Math.min(1, root.scrollTop / max));
    };

    update();
    root.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(root);
    return () => {
      root.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [scrollRoot, enabled]);

  return progress;
}

function MobileDockNav({ scrollRoot, activeId, visible }) {
  const progress = useMobileScrollProgress(scrollRoot, visible);
  const reduceMotion = useReducedMotion();

  const scrollTo = (sectionId) => {
    const root = scrollRoot?.current;
    const target = document.getElementById(sectionId);
    if (!root || !target) return;
    playClick();
    const rootTop = root.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    root.scrollTo({
      top: root.scrollTop + targetTop - rootTop - (MOBILE_DOCK_HEIGHT + 20),
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.nav
          key="mobile-dock"
          className="mobile-dock-nav"
          aria-label="Jump to section"
          initial={reduceMotion ? false : { y: -22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.52, ease: EASE, delay: 0.1 }}
          style={{
            position: "absolute",
            top: "max(10px, env(safe-area-inset-top, 0px))",
            left: MOBILE_CARD_INSET,
            right: MOBILE_CARD_INSET,
            zIndex: 35,
            display: "flex",
            gap: 4,
            padding: 4,
            paddingBottom: 6,
            borderRadius: 3,
            border: "1px solid rgba(255, 122, 41, 0.35)",
            background: "rgba(10, 6, 4, 0.88)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 28px rgba(0, 0, 0, 0.45)",
            pointerEvents: "auto",
            overflow: "hidden",
          }}
        >
          {MOBILE_NAV_SECTIONS.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                type="button"
                className={
                  isActive
                    ? "mobile-dock-nav__btn mobile-dock-nav__btn--active"
                    : "mobile-dock-nav__btn"
                }
                onClick={() => scrollTo(id)}
                aria-current={isActive ? "true" : undefined}
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  margin: 0,
                  padding: "6px 2px",
                  border: isActive
                    ? "1px solid rgba(255, 122, 41, 0.65)"
                    : "1px solid transparent",
                  borderRadius: 2,
                  background: isActive
                    ? "rgba(255, 122, 41, 0.18)"
                    : "transparent",
                  fontFamily: "'VT323', monospace",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: isActive ? ACCENT : "rgba(255, 180, 112, 0.72)",
                  textShadow: isActive
                    ? "0 0 8px rgba(255, 122, 41, 0.5)"
                    : "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </button>
            );
          })}
          <div
            className="mobile-dock-progress-track"
            aria-hidden
            style={{
              position: "absolute",
              left: 6,
              right: 6,
              bottom: 3,
              height: 2,
              borderRadius: 1,
              background: "rgba(255, 122, 41, 0.14)",
              overflow: "hidden",
            }}
          >
            <motion.div
              className="mobile-dock-progress-fill"
              initial={false}
              animate={{ scaleX: progress }}
              transition={{ duration: 0.12, ease: "linear" }}
              style={{
                height: "100%",
                width: "100%",
                transformOrigin: "left center",
                background:
                  "linear-gradient(90deg, rgba(255,122,41,0.55), #ff7a29)",
                boxShadow: "0 0 10px rgba(255, 122, 41, 0.55)",
              }}
            />
          </div>
        </motion.nav>
      ) : null}
    </AnimatePresence>
  );
}

function useMobileSectionSpy(scrollRoot, enabled) {
  const [activeId, setActiveId] = useState(MOBILE_NAV_SECTIONS[0].id);

  useEffect(() => {
    if (!enabled) return;
    const root = scrollRoot?.current;
    if (!root) return;

    const targets = MOBILE_NAV_SECTIONS.map(({ id }) =>
      document.getElementById(id)
    ).filter(Boolean);
    if (targets.length === 0) return;

    const ratios = new Map();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.intersectionRatio);
        });
        let bestId = MOBILE_NAV_SECTIONS[0].id;
        let bestRatio = 0;
        MOBILE_NAV_SECTIONS.forEach(({ id }) => {
          const ratio = ratios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestRatio > 0.08) {
          setActiveId((prev) => (prev === bestId ? prev : bestId));
        }
      },
      { root, threshold: [0, 0.12, 0.25, 0.4, 0.55] }
    );

    targets.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [scrollRoot, enabled]);

  return activeId;
}

function MobileProjectOverlay({ project, isActive = true, size = "card" }) {
  const titleSize = size === "hero" ? "clamp(22px, 6vw, 30px)" : "clamp(15px, 4.2vw, 19px)";
  const tagSize = size === "hero" ? 13 : 11;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isActive ? 1 : 0.88 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: size === "hero" ? "18px 16px 16px" : "12px 12px 11px",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(8, 5, 4, 0.35) 35%, rgba(6, 4, 3, 0.88) 100%)",
        pointerEvents: "none",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "'VT323', monospace",
          fontSize: titleSize,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#fff",
          textShadow: "0 0 14px rgba(255, 122, 41, 0.35)",
          lineHeight: 1.1,
        }}
      >
        {project.title}
      </p>
      <p
        style={{
          margin: "6px 0 0",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: tagSize,
          lineHeight: 1.35,
          color: "rgba(255, 220, 190, 0.9)",
        }}
      >
        {project.tagline}
      </p>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: 10,
          fontFamily: "'VT323', monospace",
          fontSize: size === "hero" ? 13 : 12,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: ACCENT,
          textShadow: "0 0 8px rgba(255, 122, 41, 0.45)",
        }}
      >
        Case study →
      </span>
    </motion.div>
  );
}

function MobileRecycleDock() {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const activate = () => {
    playClick();
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(pickTrashMessage());
    timerRef.current = setTimeout(() => setMessage(null), 4800);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return (
    <motion.div
      className="mobile-recycle-dock"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
      style={{
        position: "absolute",
        right: MOBILE_CARD_INSET,
        bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        zIndex: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {message ? (
          <motion.div
            key="trash-msg"
            role="status"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{
              maxWidth: 220,
              padding: "10px 12px",
              border: "1px solid rgba(255, 122, 41, 0.55)",
              borderRadius: 3,
              background: "rgba(14, 10, 6, 0.96)",
              boxShadow: "0 0 20px rgba(255, 122, 41, 0.18)",
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                lineHeight: 1.45,
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {message}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        className="mobile-recycle-dock__btn"
        aria-label="Recycle Bin"
        onClick={activate}
        style={{
          pointerEvents: "auto",
          margin: 0,
          padding: "6px 8px 8px",
          border: "1px solid rgba(255, 122, 41, 0.45)",
          borderRadius: 3,
          background: "rgba(10, 6, 4, 0.92)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/trash-bin-icon.png"
          alt=""
          width={32}
          height={28}
          style={{ objectFit: "contain" }}
          draggable={false}
        />
        <span
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: ACCENT,
          }}
        >
          Bin
        </span>
      </button>
    </motion.div>
  );
}

function MobileBootReady({ show }) {
  const [dismissed, setDismissed] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!show) return;
    setDismissed(false);
    const t = setTimeout(() => setDismissed(true), reduceMotion ? 1200 : 2200);
    return () => clearTimeout(t);
  }, [show, reduceMotion]);

  return (
    <AnimatePresence>
      {show && !dismissed ? (
        <motion.p
          key="boot-ready"
          className="mobile-boot-ready"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.42, ease: EASE, delay: 0.18 }}
          aria-live="polite"
          style={{
            position: "absolute",
            top: "calc(max(10px, env(safe-area-inset-top, 0px)) + 52px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 34,
            margin: 0,
            padding: "4px 12px",
            borderRadius: 2,
            border: "1px solid rgba(255, 122, 41, 0.4)",
            background: "rgba(10, 6, 4, 0.9)",
            fontFamily: "'VT323', monospace",
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: ACCENT_DIM,
            textShadow: "0 0 8px rgba(255, 122, 41, 0.35)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          ▢ Boot complete · scroll to explore
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function MobileDesktop() {
  const introSkippedRef = useRef(false);
  const bootHandledRef = useRef(false);
  const [phase, setPhase] = useState("waiting-boot");
  const [welcomeTyped, setWelcomeTyped] = useState("");
  const welcomeDoneTimerRef = useRef(null);

  useLayoutEffect(() => {
    if (shouldSkipIntro()) {
      introSkippedRef.current = true;
      setPhase("dashboard");
      signalBootComplete();
    }
  }, []);

  useEffect(() => {
    if (phase === "dashboard") markIntroSeen();
  }, [phase]);

  useEffect(() => {
    if (introSkippedRef.current) return;

    const startIntro = () => {
      if (bootHandledRef.current) return;
      bootHandledRef.current = true;
      setPhase((p) => (p === "waiting-boot" ? "intro" : p));
    };

    window.addEventListener("boot:done", startIntro);
    if (typeof window !== "undefined" && window.__portfolioBootDone) {
      startIntro();
    }
    return () => window.removeEventListener("boot:done", startIntro);
  }, []);

  useEffect(() => {
    if (phase !== "intro") return;
    const target = "WELCOME!";
    const charMs = 130;
    const timers = [];
    for (let i = 1; i <= target.length; i++) {
      timers.push(
        setTimeout(() => {
          setWelcomeTyped(target.slice(0, i));
          playTypingClick();
        }, i * charMs)
      );
    }
    timers.push(
      setTimeout(() => setPhase("ready"), target.length * charMs + 780)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handleWelcomeTypingComplete = useCallback(() => {
    if (welcomeDoneTimerRef.current) {
      clearTimeout(welcomeDoneTimerRef.current);
    }
    welcomeDoneTimerRef.current = setTimeout(() => {
      setPhase("dashboard");
    }, 640);
  }, []);

  useEffect(
    () => () => {
      if (welcomeDoneTimerRef.current) {
        clearTimeout(welcomeDoneTimerRef.current);
      }
    },
    []
  );

  const showMobileRest = phase === "dashboard";
  const skipWelcomeTyping = phase === "dashboard";
  const [belowFoldReady, setBelowFoldReady] = useState(false);
  const scrollRef = useRef(null);
  const activeSection = useMobileSectionSpy(scrollRef, showMobileRest);

  useEffect(() => {
    if (!showMobileRest) {
      setBelowFoldReady(false);
      return;
    }
    let cancelled = false;
    const mount = () => {
      if (!cancelled) setBelowFoldReady(true);
    };
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(mount, { timeout: 500 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(mount, 48);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [showMobileRest]);

  return (
    <motion.div className="mobile-os">
      <MobileDockNav
        scrollRoot={scrollRef}
        activeId={activeSection}
        visible={showMobileRest}
      />
      <MobileBootReady show={showMobileRest} />

      <motion.div
        ref={scrollRef}
        data-mobile-scroll
        className="mobile-os-scroll"
        style={{
          paddingTop: showMobileRest ? MOBILE_DOCK_HEIGHT + 24 : 20,
        }}
      >
        <MobileJourneyChapter scrollRoot={scrollRef} variant="fade">
          <MobileCard title="welcome.exe" titleExtra={<WelcomeReadAloud compact />}>
            <MobileWelcomeMorph
              phase={phase}
              typed={welcomeTyped}
              skipTyping={skipWelcomeTyping}
              onTypingComplete={handleWelcomeTypingComplete}
            />
          </MobileCard>
        </MobileJourneyChapter>

        {showMobileRest ? (
          <>
            <MobileJourneyChapter scrollRoot={scrollRef}>
              <MobileSectionAnchor id="mobile-about" />
              <MobileJourneySectionLabel scrollRoot={scrollRef} skipTyping={skipWelcomeTyping}>
                ▢ About
              </MobileJourneySectionLabel>
              <MobileCard title="me.txt" titleUppercase={false}>
                <MobileMeTxtJourney
                  scrollRoot={scrollRef}
                  skipTyping={skipWelcomeTyping}
                />
              </MobileCard>
              <div style={{ marginTop: 18 }}>
                <MobileOpenForWorkStrip />
              </div>
            </MobileJourneyChapter>

            <MobileSectionRule />

            <MobileJourneyChapter scrollRoot={scrollRef} variant="right">
              <MobileWorkSection scrollRoot={scrollRef} />
            </MobileJourneyChapter>

            <MobileSectionRule />

            {belowFoldReady ? (
              <>
            <MobileJourneyChapter scrollRoot={scrollRef} variant="left">
              <MobileSectionAnchor id="mobile-skills" />
              <MobileJourneySectionLabel scrollRoot={scrollRef} skipTyping={skipWelcomeTyping}>
                ▢ Skills · tap a node
              </MobileJourneySectionLabel>
              <motion.div className="mobile-skills-wrap">
                <SkillsPlanet variant="mobile" scrollRootSelector="[data-mobile-scroll]" />
              </motion.div>
            </MobileJourneyChapter>

            <MobileSectionRule />

            <MobileJourneyChapter scrollRoot={scrollRef}>
              <MobileSectionAnchor id="mobile-more-projects" />
              <MobileJourneySectionLabel scrollRoot={scrollRef} skipTyping={skipWelcomeTyping}>
                ▢ Other projects
              </MobileJourneySectionLabel>
              <MobileCard title="Other projects" titleUppercase={false} compactBody>
                <OtherProjectsFolder variant="mobile" />
              </MobileCard>
            </MobileJourneyChapter>

            <MobileSectionRule />

            <MobileJourneyChapter scrollRoot={scrollRef}>
              <MobileSectionAnchor id="mobile-more" />
              <MobileJourneySectionLabel scrollRoot={scrollRef} skipTyping={skipWelcomeTyping}>
                ▢ Other stuff
              </MobileJourneySectionLabel>
              <MobileCard title="Other stuff" titleUppercase={false} compactBody>
                <OtherStuffFolder variant="mobile" />
              </MobileCard>
            </MobileJourneyChapter>

            <MobileSectionRule />

            <MobileJourneyChapter scrollRoot={scrollRef}>
              <MobileSectionAnchor id="mobile-contact" />
              <MobileJourneySectionLabel scrollRoot={scrollRef} skipTyping={skipWelcomeTyping}>
                ▢ Contact
              </MobileJourneySectionLabel>
              <MobileCard title="contact.msg">
                <MobileContact
                  scrollRoot={scrollRef}
                  skipTyping={skipWelcomeTyping}
                />
              </MobileCard>
            </MobileJourneyChapter>
              </>
            ) : null}
          </>
        ) : null}
      </motion.div>

      {showMobileRest ? <MobileRecycleDock /> : null}
      <StatusBar />
    </motion.div>
  );
}

function MobileCard({
  title,
  children,
  titleUppercase = true,
  titleExtra,
  compactBody = false,
}) {
  return (
    <section
      className="mobile-window-card"
      style={{
        margin: `0 ${MOBILE_CARD_INSET}px`,
        background: "rgba(18, 12, 8, 0.82)",
        border: "1px solid rgba(255, 122, 41, 0.48)",
        borderRadius: 3,
        boxShadow:
          "0 0 32px rgba(255, 122, 41, 0.12), 0 12px 40px rgba(0, 0, 0, 0.45)",
      }}
    >
      <div aria-hidden className="mobile-window-scanlines" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background:
            "linear-gradient(to bottom, rgba(255,122,41,0.18), rgba(255,122,41,0.08))",
          borderBottom: "1px solid rgba(255, 122, 41, 0.45)",
          padding: "5px 12px",
          fontFamily: "'VT323', monospace",
          fontSize: 13,
          letterSpacing: "0.22em",
          textTransform: titleUppercase ? "uppercase" : "none",
          color: ACCENT,
          textShadow: "0 0 6px rgba(255, 122, 41, 0.55)",
        }}
      >
        <span className="mobile-window-dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span
          style={{
            flex: "1 1 0%",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        {titleExtra ? (
          <span style={{ flexShrink: 0, display: "inline-flex" }}>{titleExtra}</span>
        ) : null}
      </div>
      <div
        className={
          compactBody
            ? "mobile-window-body mobile-window-body--compact"
            : "mobile-window-body"
        }
        style={{ position: "relative", zIndex: 1 }}
      >
        {children}
      </div>
    </section>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      className="mobile-section-label"
      style={{
        margin: `${MOBILE_BLOCK_GAP}px ${MOBILE_CARD_INSET + 4}px 12px`,
        fontFamily: "'VT323', monospace",
        fontSize: 13,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: ACCENT_DIM,
        textShadow: "0 0 6px rgba(255, 122, 41, 0.32)",
      }}
    >
      {children}
    </p>
  );
}

function MobileWelcomeMorph({
  phase,
  typed,
  skipTyping = false,
  onTypingComplete,
}) {
  const showWaiting = phase === "waiting-boot";
  const showIntro = phase === "intro";
  const showReady =
    phase === "ready" || phase === "dashboard";

  return (
    <div style={{ position: "relative", minHeight: 260 }}>
      {showWaiting && (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 220,
            fontFamily: "'VT323', monospace",
            fontSize: 14,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: ACCENT_DIM,
            textShadow: "0 0 8px rgba(255, 122, 41, 0.35)",
            margin: 0,
          }}
        >
          ▢ Booting…
        </p>
      )}
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            key="welcome-intro"
            initial={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.55,
              transition: { duration: 0.55, ease: EASE },
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
              fontFamily: "'Bonbon', cursive",
              fontSize: "clamp(64px, 16vw, 120px)",
              color: "#ffffff",
              textShadow: "0 0 24px rgba(255, 122, 41, 0.42)",
              lineHeight: 1,
              whiteSpace: "nowrap",
              willChange: "transform, opacity",
            }}
          >
            {typed || "\u00a0"}
            {typed.length < 8 && <BlinkCursor />}
          </motion.div>
        )}
        {showReady && (
          <motion.div
            key="welcome-ready"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <MobileWelcomeBody
              skipTyping={skipTyping}
              onTypingComplete={onTypingComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileWelcomeBody({ skipTyping = false, onTypingComplete }) {
  const [typingDone, setTypingDone] = useState(skipTyping);

  useEffect(() => {
    if (skipTyping) setTypingDone(true);
  }, [skipTyping]);

  const handleLinesComplete = useCallback(() => {
    setTypingDone(true);
    onTypingComplete?.();
  }, [onTypingComplete]);

  return (
    <div>
      <TypedLine
        text="▢ Hello."
        charMs={48}
        delay={160}
        skipTyping={skipTyping}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 14,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: ACCENT,
          textShadow: "0 0 8px rgba(255, 122, 41, 0.5)",
          display: "block",
        }}
      />
      <TypedLine
        as="h1"
        text={about.name}
        charMs={72}
        delay={580}
        skipTyping={skipTyping}
        style={{
          fontFamily: "'Bonbon', cursive",
          fontSize: "clamp(48px, 13vw, 72px)",
          lineHeight: 0.92,
          color: "#ffffff",
          textShadow: "0 0 22px rgba(255, 122, 41, 0.22)",
          margin: "8px 0 12px",
          display: "block",
        }}
      />
      <TypedLine
        text="Interaction · Visual · Designer"
        charMs={30}
        delay={1580}
        skipTyping={skipTyping}
        onComplete={skipTyping ? undefined : handleLinesComplete}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 14,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: ACCENT,
          textShadow: "0 0 8px rgba(255, 122, 41, 0.45)",
          margin: "0 0 16px",
          display: "block",
        }}
      />
      {typingDone ? (
        <>
          <FadeInLine delay={skipTyping ? 0 : 120}>
            <p
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: 13,
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: ACCENT_DIM,
                margin: "14px 0 0",
              }}
            >
              ─ Dream · Think · Build ─
            </p>
          </FadeInLine>
          {!skipTyping ? (
            <motion.p
              className="mobile-scroll-hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0.35, 0.85, 0.35], y: 0 }}
              transition={{
                opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 0.5, delay: 0.35 },
              }}
              style={{
                margin: "28px 0 0",
                textAlign: "center",
                fontFamily: "'VT323', monospace",
                fontSize: 12,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(255, 180, 112, 0.55)",
              }}
            >
              ▼ scroll to explore
            </motion.p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function getCarouselMetrics(focusStrength) {
  const focus = Math.min(1, Math.max(0, focusStrength));
  return {
    focus,
    activeScale: 1 + 0.07 * focus,
    inactiveScale: 0.86 - 0.04 * focus,
    inactiveOpacity: 0.52 - 0.18 * focus,
    yLift: 8 + 4 * focus,
  };
}

function applyCarouselCardVisuals(cards, focuses, showCards, metrics) {
  const { activeScale, inactiveScale, inactiveOpacity, yLift } = metrics;
  cards.forEach((el, i) => {
    if (!el) return;
    if (!showCards) {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0, 36px, 0) scale(0.88)";
      return;
    }
    const f = focuses[i] ?? 0;
    const scale = inactiveScale + (activeScale - inactiveScale) * f;
    const opacity = inactiveOpacity + (1 - inactiveOpacity) * f;
    const y = (1 - f) * yLift;
    el.style.opacity = String(opacity);
    el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
  });
}

function cardFocusFromScroll(carousel, cards) {
  if (!carousel) return { focuses: [], bestIdx: 0 };
  const centerX = carousel.scrollLeft + carousel.clientWidth / 2;
  const focuses = cards.map((el) => {
    if (!el) return 0;
    const cardCenter = el.offsetLeft + el.offsetWidth / 2;
    const dist = Math.abs(cardCenter - centerX);
    const falloff = el.offsetWidth * 1.05;
    return Math.max(0, Math.min(1, 1 - dist / falloff));
  });
  let bestIdx = 0;
  let best = -1;
  focuses.forEach((f, i) => {
    if (f > best) {
      best = f;
      bestIdx = i;
    }
  });
  return { focuses, bestIdx };
}

function MobileProjectsCarousel({
  scrollRoot,
  activeIdx: controlledIdx,
  onActiveChange,
  focusStrength = 0,
}) {
  const carouselRef = useRef(null);
  const cardShellRefs = useRef([]);
  const dragRef = useRef(null);
  const revealStartedRef = useRef(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [internalIdx, setInternalIdx] = useState(0);
  const activeIdx = controlledIdx ?? internalIdx;
  const setActiveIdx = onActiveChange ?? setInternalIdx;
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, {
    root: scrollRoot ?? undefined,
    once: true,
    amount: 0.15,
  });

  const showCards = reduceMotion || sectionInView;

  const syncActiveFromScroll = useCallback(() => {
    const carousel = carouselRef.current;
    const cards = cardShellRefs.current;
    if (!carousel) return;
    const { focuses, bestIdx } = cardFocusFromScroll(carousel, cards);
    applyCarouselCardVisuals(
      cards,
      focuses,
      showCards,
      getCarouselMetrics(focusStrength)
    );
    setActiveIdx((prev) => (prev === bestIdx ? prev : bestIdx));
  }, [setActiveIdx, showCards, focusStrength]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncActiveFromScroll);
    };

    carousel.addEventListener("scroll", onScroll, { passive: true });
    carousel.addEventListener("scrollend", syncActiveFromScroll);
    syncActiveFromScroll();

    return () => {
      cancelAnimationFrame(raf);
      carousel.removeEventListener("scroll", onScroll);
      carousel.removeEventListener("scrollend", syncActiveFromScroll);
    };
  }, [syncActiveFromScroll]);

  useEffect(() => {
    if (!showCards) return;
    syncActiveFromScroll();
  }, [showCards, focusStrength, syncActiveFromScroll]);

  useLayoutEffect(() => {
    if (!showCards || revealStartedRef.current) return;
    revealStartedRef.current = true;

    const cards = cardShellRefs.current;
    const finishReveal = () => {
      cards.forEach((el) => {
        if (el) el.classList.add("mobile-carousel-card--scroll");
      });
      setHasRevealed(true);
      syncActiveFromScroll();
    };

    if (reduceMotion) {
      finishReveal();
      return;
    }

    cards.forEach((el) => {
      if (!el) return;
      el.style.transition = "none";
      el.style.opacity = "0";
      el.style.transform = "translate3d(0, 36px, 0) scale(0.88)";
    });

    requestAnimationFrame(() => {
      const metrics = getCarouselMetrics(focusStrength);
      const { focuses } = cardFocusFromScroll(
        carouselRef.current,
        cards
      );
      cards.forEach((el, i) => {
        if (!el) return;
        const delay = i * 90;
        el.style.transition = `transform 480ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 480ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
      });
      applyCarouselCardVisuals(cards, focuses, true, metrics);
      window.setTimeout(
        finishReveal,
        480 + (featuredProjects.length - 1) * 90 + 40
      );
    });
  }, [showCards, reduceMotion, focusStrength, syncActiveFromScroll]);

  const onCarouselPointerDown = (e) => {
    const el = carouselRef.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: el.scrollLeft,
    };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onCarouselPointerMove = (e) => {
    const el = carouselRef.current;
    const d = dragRef.current;
    if (!el || !d || e.pointerId !== d.pointerId) return;
    el.scrollLeft = d.startScroll - (e.clientX - d.startX);
  };

  const endCarouselDrag = (e) => {
    const el = carouselRef.current;
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div ref={sectionRef} style={{ marginBottom: 4 }}>
      <div
        ref={carouselRef}
        className="project-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected projects — swipe horizontally"
      onPointerDown={onCarouselPointerDown}
      onPointerMove={onCarouselPointerMove}
      onPointerUp={endCarouselDrag}
      onPointerCancel={endCarouselDrag}
      style={{
        overflowX: "auto",
        overflowY: "hidden",
        scrollSnapType: "x mandatory",
        scrollPaddingInline: "14vw",
        display: "flex",
        gap: "7vw",
        padding: "12px 12vw 20px",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x",
        overscrollBehaviorX: "contain",
        width: "100%",
        maxWidth: "100%",
        minHeight: 0,
      }}
    >
      {featuredProjects.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => {
            cardShellRefs.current[i] = el;
          }}
          data-idx={i}
          className={
            hasRevealed
              ? "mobile-carousel-card mobile-carousel-card--scroll"
              : "mobile-carousel-card"
          }
        >
          <MobileProjectCard
            project={p}
            gradient={PROJECT_GRADIENTS[i % PROJECT_GRADIENTS.length]}
            isActive={i === activeIdx}
            showOverlay={false}
            imageLoading="eager"
          />
        </div>
      ))}
      </div>
      <div
        className="mobile-carousel-meta"
        aria-live="polite"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "0 16px 8px",
        }}
      >
        <span
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 12,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: ACCENT,
            textShadow: "0 0 6px rgba(255, 122, 41, 0.4)",
          }}
        >
          {String(activeIdx + 1).padStart(2, "0")} / {String(featuredProjects.length).padStart(2, "0")}
        </span>
        <motion.div
          style={{ display: "flex", gap: 6, alignItems: "center" }}
          aria-hidden
        >
          {featuredProjects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="mobile-carousel-dot"
              aria-label={`Go to ${p.title}`}
              onClick={() => {
                const el = cardsRef.current[i];
                const carousel = carouselRef.current;
                if (!el || !carousel) return;
                playClick();
                const target =
                  el.offsetLeft - (carousel.clientWidth - el.offsetWidth) / 2;
                carousel.scrollTo({ left: target, behavior: "smooth" });
              }}
              style={{
                width: i === activeIdx ? 18 : 7,
                height: 7,
                margin: 0,
                padding: 0,
                border: "none",
                borderRadius: 1,
                background:
                  i === activeIdx
                    ? ACCENT
                    : "rgba(255, 122, 41, 0.28)",
                boxShadow:
                  i === activeIdx
                    ? "0 0 10px rgba(255, 122, 41, 0.65)"
                    : "none",
                cursor: "pointer",
                transition: "width 0.25s ease, background 0.25s ease",
              }}
            />
          ))}
        </motion.div>
      </div>
      <p
        style={{
          margin: "0 0 4px",
          textAlign: "center",
          fontFamily: "'VT323', monospace",
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255, 180, 112, 0.55)",
        }}
      >
        Swipe for more →
      </p>
    </motion.div>
  );
}

const MobileProjectCard = memo(function MobileProjectCard({
  project,
  gradient,
  size = "card",
  isActive = true,
  showOverlay = true,
  imageLoading = "lazy",
}) {
  const heroSrc = project.thumb ?? project.caseStudyHero ?? null;
  const isHero = size === "hero";

  return (
    <ProjectViewLink
      href={`/work/${project.slug}`}
      prefetch
      className={isHero ? "mobile-project-card mobile-project-card--hero" : "mobile-project-card"}
      aria-label={`Open case study: ${project.title}`}
      onClick={() => playClick()}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        height: isHero ? undefined : "100%",
        aspectRatio: isHero ? "4 / 5" : undefined,
        maxHeight: isHero ? "min(72vh, 520px)" : undefined,
        overflow: "hidden",
        borderRadius: 3,
        border: `1px solid rgba(255, 122, 41, ${isActive ? 0.55 : 0.35})`,
        boxShadow: isActive
          ? "0 12px 36px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 122, 41, 0.14)"
          : "0 8px 24px rgba(0, 0, 0, 0.5)",
        cursor: "pointer",
        color: "inherit",
        textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: gradient,
          viewTransitionName: isActive
            ? projectHeroTransitionName(project.slug)
            : undefined,
        }}
      >
        {heroSrc ? (
          <>
            <ProjectCardHeroImage
              src={heroSrc}
              loading={imageLoading}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(12, 8, 6, 0.12) 0%, rgba(8, 5, 4, 0.45) 100%)",
                pointerEvents: "none",
              }}
            />
          </>
        ) : null}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.045) 0px, rgba(255, 255, 255, 0.045) 1px, transparent 2px, transparent 4px)",
            pointerEvents: "none",
          }}
        />
      </div>
      {showOverlay ? (
        <MobileProjectOverlay project={project} isActive={isActive} size={size} />
      ) : null}
    </ProjectViewLink>
  );
});

function MobileScrollTypedMailto({ scrollRoot, skipTyping = false }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, {
    root: scrollRoot ?? undefined,
    once: true,
    amount: 0.35,
  });
  const active = reduceMotion || skipTyping || inView;

  return (
    <Link
      ref={ref}
      href={`mailto:${about.email}`}
      style={{
        display: "block",
        fontFamily: "'VT323', monospace",
        fontSize: "clamp(20px, 5vw, 26px)",
        letterSpacing: "0.12em",
        color: "#fff",
        textShadow: "0 0 10px rgba(255, 122, 41, 0.45)",
        wordBreak: "break-word",
        textDecoration: "none",
      }}
    >
      <TypedLine
        text={about.email}
        charMs={20}
        delay={480}
        skipTyping={skipTyping}
        enabled={active}
        soundEvery={2}
        useThrottledSound
        as="span"
        style={{ display: "block" }}
      />
    </Link>
  );
}

function MobileContact({ scrollRoot, skipTyping = false }) {
  return (
    <div style={{ paddingTop: 4 }}>
      <ScrollTypedLine
        scrollRoot={scrollRoot}
        skipTyping={skipTyping}
        text="▢ Get in touch"
        charMs={28}
        delay={100}
        amount={0.4}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 13,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: ACCENT_DIM,
          marginBottom: 16,
          display: "block",
        }}
      />
      <MobileScrollTypedMailto scrollRoot={scrollRoot} skipTyping={skipTyping} />
      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: 12,
          rowGap: 10,
        }}
      >
        <a
          href={about.socials.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: "0 0 auto",
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            color: ACCENT,
            textShadow: "0 0 6px rgba(255,122,41,0.45)",
            border: "1px solid rgba(255,122,41,0.5)",
            padding: "4px 12px",
            borderRadius: 2,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          LinkedIn
        </a>
        <span
          aria-hidden="true"
          style={{
            color: ACCENT_DIM,
            opacity: 0.55,
            fontFamily: "'VT323', monospace",
          }}
        >
          ·
        </span>
        <a
          href={about.socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: "0 0 auto",
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            color: ACCENT,
            textShadow: "0 0 6px rgba(255,122,41,0.45)",
            border: "1px solid rgba(255,122,41,0.5)",
            padding: "4px 12px",
            borderRadius: 2,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Instagram
        </a>
      </div>
    </div>
  );
}

export default MobileDesktop;
