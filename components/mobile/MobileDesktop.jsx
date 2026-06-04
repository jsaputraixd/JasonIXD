"use client";

import Link from "next/link";
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
import MobileOrbitCarousel, {
  MOBILE_CAROUSEL_EASE,
  MOBILE_CAROUSEL_TRANSITION_MS,
  carouselDirection,
} from "@/components/mobile/MobileOrbitCarousel";
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

const ACCENT_DIM = "#FFB570";

const MOBILE_BLOCK_GAP = 40;
const MOBILE_CARD_INSET = 16;
const MOBILE_DOCK_HEIGHT = 46;
/** Space below the fixed dock nav where section titles should land. */
const MOBILE_NAV_CLEARANCE_FALLBACK = MOBILE_DOCK_HEIGHT + 24;

function getMobileNavClearance(root) {
  const nav = root?.parentElement?.querySelector(".mobile-dock-nav");
  if (!nav) return MOBILE_NAV_CLEARANCE_FALLBACK;
  const rootRect = root.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();
  return Math.max(56, Math.round(navRect.bottom - rootRect.top + 10));
}

function getSectionScrollTarget(root, element) {
  const clearance = getMobileNavClearance(root);
  const rootRect = root.getBoundingClientRect();
  const elRect = element.getBoundingClientRect();
  const desired = root.scrollTop + (elRect.top - rootRect.top) - clearance;
  const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
  return Math.min(Math.max(0, desired), maxScroll);
}

function scrollMobileSection(root, sectionId) {
  const target = document.getElementById(sectionId);
  if (!root || !target) return false;
  const top = getSectionScrollTarget(root, target);
  root.scrollTo({ top, behavior: "smooth" });
  return true;
}

function useMobileScrollEndSpacer(scrollRoot, spacerRef, enabled) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const root = scrollRoot?.current;
    const spacer = spacerRef?.current;
    if (!root || !spacer) return;

    const sync = () => {
      const spacerEl = spacerRef.current;
      if (!spacerEl) return;

      const lastSection = MOBILE_NAV_SECTIONS[MOBILE_NAV_SECTIONS.length - 1];
      const last = lastSection ? document.getElementById(lastSection.id) : null;
      if (!last) return;

      spacerEl.style.height = "0px";
      const neededScroll = getSectionScrollTarget(root, last);
      const currentMax = Math.max(0, root.scrollHeight - root.clientHeight);
      const deficit = neededScroll - currentMax;
      spacerEl.style.height = `${Math.max(32, Math.ceil(deficit + 48))}px`;
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(root);
    for (const { id } of MOBILE_NAV_SECTIONS) {
      const el = document.getElementById(id);
      if (el) ro.observe(el);
    }
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [scrollRoot, spacerRef, enabled]);
}

const MOBILE_NAV_SECTIONS = [
  {
    id: "mobile-work",
    label: "Work",
    path: "~/work/",
    hint: "Featured projects · swipe carousel",
  },
  {
    id: "mobile-skills",
    label: "Skills",
    path: "~/skills.log",
    hint: "Tap a node on the globe",
  },
  {
    id: "mobile-more-projects",
    label: "Archive",
    path: "~/archive/",
    hint: "More case studies",
  },
  {
    id: "mobile-more",
    label: "Art",
    path: "~/other/",
    hint: "Illustration, photo & motion",
  },
  {
    id: "mobile-about",
    label: "About",
    path: "~/me.txt",
    hint: "Bio & open for work",
  },
  {
    id: "mobile-contact",
    label: "Contact",
    path: "~/contact.msg",
    hint: "Email & social links",
  },
];

function MobileJourneyChapter({
  children,
  scrollRoot,
  variant = "up",
  sectionId,
}) {
  return (
    <div className="mobile-journey-chapter" id={sectionId}>
      <MobileScrollReveal scrollRoot={scrollRoot} variant={variant} delay={0.02}>
        {children}
      </MobileScrollReveal>
    </div>
  );
}

const MOBILE_WORK_TINTS = [
  "rgba(255, 122, 41, 0.14)",
  "rgba(255, 105, 48, 0.11)",
  "rgba(255, 145, 55, 0.12)",
  "rgba(120, 90, 200, 0.1)",
];

function MobileWorkSection({ scrollRoot }) {
  const count = featuredProjects.length;
  const prevIdxRef = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [flipDir, setFlipDir] = useState(1);
  const project = featuredProjects[activeIdx] ?? featuredProjects[0];
  const workTint = MOBILE_WORK_TINTS[activeIdx % MOBILE_WORK_TINTS.length];

  const handleActiveChange = useCallback(
    (idx) => {
      const next = ((idx % count) + count) % count;
      setFlipDir(carouselDirection(prevIdxRef.current, next, count));
      prevIdxRef.current = next;
      setActiveIdx(next);
    },
    [count]
  );

  return (
    <div
      className="mobile-work-section"
      style={{
        position: "relative",
        margin: `0 ${MOBILE_CARD_INSET}px`,
        padding: "8px 0 4px",
        borderRadius: 3,
        transition: `background ${MOBILE_CAROUSEL_TRANSITION_MS}ms ${MOBILE_CAROUSEL_EASE}`,
        background: `linear-gradient(165deg, ${workTint} 0%, transparent 58%)`,
      }}
    >
      <MobileScrollReveal scrollRoot={scrollRoot} variant="up" delay={0.04}>
        <MobileOrbitCarousel
          activeIdx={activeIdx}
          onActiveChange={handleActiveChange}
        />
      </MobileScrollReveal>
      <MobileScrollReveal scrollRoot={scrollRoot} variant="fade" delay={0.06}>
        <div
          style={{
            margin: "8px 0 0",
            position: "relative",
            zIndex: 2,
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          <MobileProjectPreviewPanel project={project} direction={flipDir} />
        </div>
      </MobileScrollReveal>
    </div>
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
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: -16, y: 8 },
      visible: { opacity: 1, x: 0, y: 0 },
    },
    right: {
      hidden: { opacity: 0, x: 16, y: 8 },
      visible: { opacity: 1, x: 0, y: 0 },
    },
    fade: {
      hidden: { opacity: 0, y: 8 },
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
      transition={{ duration: 0.45, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function MobileSectionRule() {
  return (
    <div
      aria-hidden
      className="mobile-section-rule"
      style={{
        margin: `${MOBILE_BLOCK_GAP - 12}px ${MOBILE_CARD_INSET + 4}px 0`,
        height: 1,
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

function MobileDockNav({ scrollRoot, activeId, visible }) {
  const reduceMotion = useReducedMotion();
  const [pulseWork, setPulseWork] = useState(false);
  const activeIndex = Math.max(
    0,
    MOBILE_NAV_SECTIONS.findIndex((s) => s.id === activeId)
  );

  useEffect(() => {
    if (!visible || reduceMotion) return;
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem("js-os-mobile-dock-hint")) return;
    sessionStorage.setItem("js-os-mobile-dock-hint", "1");
    setPulseWork(true);
    const t = setTimeout(() => setPulseWork(false), 3600);
    return () => clearTimeout(t);
  }, [visible, reduceMotion]);

  const scrollTo = (sectionId) => {
    const root = scrollRoot?.current;
    const target = document.getElementById(sectionId);
    if (!root || !target) return;
    playClick();
    target.classList.remove("mobile-journey-chapter--nav-flash");
    void target.offsetWidth;
    target.classList.add("mobile-journey-chapter--nav-flash");
    window.setTimeout(() => {
      target.classList.remove("mobile-journey-chapter--nav-flash");
    }, 720);
    scrollMobileSection(root, sectionId);
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
            flexDirection: "column",
            gap: 5,
            padding: "5px 4px 5px",
            borderRadius: 3,
            border: "1px solid rgba(255, 122, 41, 0.35)",
            background: "rgba(10, 6, 4, 0.88)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 28px rgba(0, 0, 0, 0.45)",
            pointerEvents: "auto",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 3,
              width: "100%",
            }}
          >
            {MOBILE_NAV_SECTIONS.map(({ id, label }) => {
              const isActive = activeId === id;
              const shouldPulse = pulseWork && id === "mobile-work";
              return (
                <button
                  key={id}
                  type="button"
                  className={
                    isActive
                      ? "mobile-dock-nav__btn mobile-dock-nav__btn--active"
                      : shouldPulse
                        ? "mobile-dock-nav__btn mobile-dock-nav__btn--pulse"
                        : "mobile-dock-nav__btn"
                  }
                  onClick={() => scrollTo(id)}
                  aria-current={isActive ? "true" : undefined}
                  style={{
                    flex: "1 1 0",
                    minWidth: 0,
                    margin: 0,
                    padding: "5px 1px",
                    border: isActive
                      ? "1px solid rgba(255, 122, 41, 0.65)"
                      : "1px solid transparent",
                    borderRadius: 2,
                    background: isActive
                      ? "rgba(255, 122, 41, 0.18)"
                      : "transparent",
                    fontFamily: "'VT323', monospace",
                    fontSize: 10,
                    letterSpacing: "0.1em",
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
          </div>

          <div
            className="mobile-dock-segments"
            aria-hidden
            style={{
              display: "flex",
              gap: 3,
              width: "100%",
              padding: "0 2px",
            }}
          >
            {MOBILE_NAV_SECTIONS.map(({ id }, i) => (
              <div
                key={id}
                className={
                  i <= activeIndex
                    ? "mobile-dock-segment mobile-dock-segment--on"
                    : "mobile-dock-segment"
                }
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 1,
                  background:
                    i <= activeIndex
                      ? "linear-gradient(90deg, rgba(255,122,41,0.55), #ff7a29)"
                      : "rgba(255, 122, 41, 0.14)",
                  boxShadow:
                    i === activeIndex
                      ? "0 0 10px rgba(255, 122, 41, 0.55)"
                      : "none",
                  transition: "background 0.25s ease, box-shadow 0.25s ease",
                }}
              />
            ))}
          </div>
        </motion.nav>
      ) : null}
    </AnimatePresence>
  );
}

/** How far above the scroll viewport bottom a section top must be before it registers. */
const MOBILE_SECTION_PEEK_INSET = 88;

function getActiveSectionFromBottomPeek(root) {
  const rootRect = root.getBoundingClientRect();
  const peekLine = rootRect.bottom - MOBILE_SECTION_PEEK_INSET;
  const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);

  if (root.scrollTop >= maxScroll - 6) {
    return (
      MOBILE_NAV_SECTIONS[MOBILE_NAV_SECTIONS.length - 1]?.id ??
      MOBILE_NAV_SECTIONS[0].id
    );
  }

  let activeId = MOBILE_NAV_SECTIONS[0].id;
  for (const { id } of MOBILE_NAV_SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= peekLine) {
      activeId = id;
    }
  }
  return activeId;
}

function useMobileSectionSpy(scrollRoot, enabled) {
  const [activeId, setActiveId] = useState(MOBILE_NAV_SECTIONS[0].id);

  useEffect(() => {
    if (!enabled) return;
    const root = scrollRoot?.current;
    if (!root) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const bestId = getActiveSectionFromBottomPeek(root);
      setActiveId((prev) => (prev === bestId ? prev : bestId));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollRoot, enabled]);

  return activeId;
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
  const scrollRef = useRef(null);
  const scrollEndSpacerRef = useRef(null);
  const activeSection = useMobileSectionSpy(scrollRef, showMobileRest);
  useMobileScrollEndSpacer(scrollRef, scrollEndSpacerRef, showMobileRest);

  return (
    <div className="mobile-os">
      <MobileDockNav
        scrollRoot={scrollRef}
        activeId={activeSection}
        visible={showMobileRest}
      />

      <div
        ref={scrollRef}
        data-mobile-scroll
        className="mobile-os-scroll"
        style={{
          paddingTop: MOBILE_DOCK_HEIGHT + 24,
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
            <MobileJourneyChapter
              scrollRoot={scrollRef}
              variant="right"
              sectionId="mobile-work"
            >
              <MobileWorkSection scrollRoot={scrollRef} />
            </MobileJourneyChapter>

            <MobileSectionRule />

            <MobileJourneyChapter
              scrollRoot={scrollRef}
              variant="left"
              sectionId="mobile-skills"
            >
              <MobileJourneySectionLabel scrollRoot={scrollRef} skipTyping={skipWelcomeTyping}>
                ▢ Skills · tap a node
              </MobileJourneySectionLabel>
              <motion.div className="mobile-skills-wrap">
                <SkillsPlanet variant="mobile" scrollRootSelector="[data-mobile-scroll]" />
              </motion.div>
            </MobileJourneyChapter>

            <MobileSectionRule />

            <MobileJourneyChapter scrollRoot={scrollRef} sectionId="mobile-more-projects">
              <MobileJourneySectionLabel scrollRoot={scrollRef} skipTyping={skipWelcomeTyping}>
                ▢ Other projects
              </MobileJourneySectionLabel>
              <MobileCard title="Other projects" titleUppercase={false} compactBody>
                <OtherProjectsFolder variant="mobile" />
              </MobileCard>
            </MobileJourneyChapter>

            <MobileSectionRule />

            <MobileJourneyChapter scrollRoot={scrollRef} sectionId="mobile-more">
              <MobileJourneySectionLabel scrollRoot={scrollRef} skipTyping={skipWelcomeTyping}>
                ▢ Other stuff
              </MobileJourneySectionLabel>
              <MobileCard title="Other stuff" titleUppercase={false} compactBody>
                <OtherStuffFolder variant="mobile" />
              </MobileCard>
            </MobileJourneyChapter>

            <MobileSectionRule />

            <MobileJourneyChapter scrollRoot={scrollRef} sectionId="mobile-about">
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

            <MobileJourneyChapter scrollRoot={scrollRef} sectionId="mobile-contact">
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

            <div
              ref={scrollEndSpacerRef}
              className="mobile-scroll-end-spacer"
              aria-hidden
            />
          </>
        ) : null}
      </div>

      {showMobileRest ? <MobileRecycleDock /> : null}
      <StatusBar />
    </div>
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
