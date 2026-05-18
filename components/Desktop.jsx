"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Window from "./Window";
import StatusBar from "./StatusBar";
import IdleScreensaver, { IDLE_MS } from "./IdleScreensaver";
import RecycleBinIcon from "./RecycleBinIcon";
import SkillsPlanet from "./SkillsPlanet";
import { projects } from "@/data/projects";
import { about } from "@/data/about";
import WelcomeReadAloud from "@/components/WelcomeReadAloud";
import DesktopFolderIcon from "@/components/DesktopFolderIcon";
import OtherStuffFolder from "@/components/OtherStuffFolder";
import { otherStuff } from "@/data/otherStuff";
import {
  DESKTOP_FOLDER_ICON_W,
  getDeterministicDesktopPositions,
  LEFT_COLUMN_INSET,
  PROJECT_WINDOW_GAP,
} from "@/lib/desktopWindowPlacement";
import { getProjectDesktopCards } from "@/lib/projectDesktopCards";
import { markIntroSeen, shouldSkipIntro } from "@/lib/introSession";
import { playTypingClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const ACCENT_DIM = "rgba(255, 180, 112, 0.7)";
const EASE = [0.16, 1, 0.3, 1];

const WELCOME_HEIGHT_GUESS = 380;

const ASCII_PORTRAIT_SRC = "/images/ascii-portrait.png";
/** Intrinsic size from source PNG (next/image uses this for aspect ratio). */
const ASCII_PORTRAIT_W = 6591;
const ASCII_PORTRAIT_H = 6624;

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/** Reference width: at vw >= this, sizes match the original desktop design (scale 1). */
const LAYOUT_REF_W = 1280;

/** skills.log body + globe footprint (~50%); Window chrome title bar still uses `layoutScale` only. */
const SKILLS_WINDOW_BODY_SCALE = 0.5;

/** Viewport-aware sizes; positions are fixed zones (center welcome, grouped project row). */
function getDesktopLayout(vw, vh) {
  const nProj = projects.length;
  const edge = 12;
  const g = 10;
  const layoutScale = Math.min(1, vw / LAYOUT_REF_W);
  const u = clamp((vw - 880) / 420, 0.66, 1);

  const W0 = {
    welcome: Math.round(clamp(380, 540, 400 + 130 * u)),
    me: Math.round(clamp(208, 288, 218 + 70 * u)),
    skills: Math.round(clamp(300, 440, 330 + 100 * u)),
    otherStuff: Math.round(clamp(300, 380, 340 + 28 * u)),
    contact: Math.round(clamp(248, 298, 260 + 28 * u)),
  };

  let W = {
    welcome: Math.round(W0.welcome * layoutScale),
    me: Math.round(W0.me * layoutScale),
    skills: Math.max(
      200,
      Math.round(W0.skills * layoutScale * SKILLS_WINDOW_BODY_SCALE)
    ),
    otherStuff: Math.round(W0.otherStuff * layoutScale),
    contact: Math.round(W0.contact * layoutScale),
  };

  const skillsLeft = Math.max(edge, vw - W.skills - edge);
  const topBand = vh * 0.034;

  // Keep welcome + me widths reasonable on narrow viewports (avoid wider than usable band).
  const marginBeforeSkills = 18;
  const maxCluster = Math.max(220, skillsLeft - edge - marginBeforeSkills);
  let clusterW = W.welcome + g + W.me;
  if (clusterW > maxCluster && maxCluster > 0) {
    const ratio = maxCluster / clusterW;
    W.welcome = Math.max(280, Math.floor(W.welcome * ratio));
    W.me = Math.max(156, Math.floor(W.me * ratio));
    clusterW = W.welcome + g + W.me;
    if (clusterW > maxCluster) {
      const r2 = maxCluster / clusterW;
      W.welcome = Math.max(260, Math.floor(W.welcome * r2));
      W.me = Math.max(148, Math.floor(W.me * r2));
    }
  }

  const projectGap = Math.max(14, Math.round(PROJECT_WINDOW_GAP * layoutScale));
  let projectCards = getProjectDesktopCards(projects, layoutScale);

  const bandInner = Math.max(0, skillsLeft - edge - g);
  const rowW0 =
    projectCards.reduce((sum, c) => sum + c.width, 0) +
    Math.max(0, nProj - 1) * projectGap;
  if (rowW0 > bandInner && bandInner > 0 && rowW0 > 0) {
    const shrink = bandInner / rowW0;
    projectCards = projectCards.map((card) => {
      const width = Math.max(100, Math.round(card.width * shrink));
      const bodyHeight = Math.round(width / card.aspect);
      const tb = Math.max(26, Math.round(28 * layoutScale));
      return {
        ...card,
        width,
        bodyHeight,
        windowHeight: tb + bodyHeight,
      };
    });
  }

  // Same width as rendered `contact.msg`; required for accurate non-overlap packing.
  W.contact = W.me;

  const leftColumnInset = Math.round(LEFT_COLUMN_INSET * layoutScale);

  const pos = getDeterministicDesktopPositions({
    vw,
    vh,
    W,
    projectCards,
    projectGap,
    nProj,
    layoutScale,
    edge,
    g,
    topBand,
    leftColumnInset,
  });

  return { W, pos, projectCards, layoutScale };
}

const DESKTOP_PROJECT_SLOTS = projects.map((_, projectIndex) => ({
  slot: `projSlot${projectIndex}`,
  projectIndex,
  delay: 0.4 + projectIndex * 0.15,
  zBase: 14 + projectIndex,
}));

const PROJECT_GRADIENTS = [
  "linear-gradient(135deg, #4a1f0a 0%, #1a0a05 60%, #0a0505 100%)",
  "linear-gradient(135deg, #4a2818 0%, #1f0e08 60%, #0a0505 100%)",
  "linear-gradient(135deg, #4a3010 0%, #221305 60%, #0a0505 100%)",
  "linear-gradient(135deg, #3a3518 0%, #181505 60%, #0a0505 100%)",
];

export default function Desktop() {
  const stageRef = useRef(null);
  const [topZ, setTopZ] = useState(20);
  const [zMap, setZMap] = useState({});
  const [viewport, setViewport] = useState(null);

  // Boot/intro state machine:
  //   "waiting-boot"  → LoadingOverlay is still showing
  //   "intro-typing"  → big centered card, typing "WELCOME!"
  //   "intro-hold"    → fully typed, brief pause
  //   "expanding"     → card flies into welcome.exe slot (no other windows yet)
  //   "ready"         → welcome.exe body types in (Hello, name, role…)
  //   "dashboard"   → all other windows cascade in
  const introSkippedRef = useRef(
    typeof window !== "undefined" && shouldSkipIntro()
  );
  const [phase, setPhase] = useState(
    introSkippedRef.current ? "dashboard" : "waiting-boot"
  );
  const [welcomeTyped, setWelcomeTyped] = useState("");
  const [otherStuffOpen, setOtherStuffOpen] = useState(false);
  const [trashMessage, setTrashMessage] = useState(null);
  const trashMessageTimerRef = useRef(null);
  const welcomeDoneTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const read = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 1 || h < 1) return false;
      setViewport({ w, h });
      return true;
    };

    if (!read()) {
      let n = 0;
      const retry = () => {
        if (read() || n++ > 30) return;
        requestAnimationFrame(retry);
      };
      requestAnimationFrame(retry);
    }

    const onResize = () => {
      read();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (phase === "dashboard") markIntroSeen();
  }, [phase]);

  // Listen for the boot overlay completing its exit
  useEffect(() => {
    if (introSkippedRef.current) return;
    const handler = () => setPhase("intro-typing");
    window.addEventListener("boot:done", handler);
    if (typeof window !== "undefined" && window.__portfolioBootDone) {
      handler();
    }
    return () => window.removeEventListener("boot:done", handler);
  }, []);

  // Typewriter for "WELCOME!" during intro-typing
  useEffect(() => {
    if (phase !== "intro-typing") return;
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
      setTimeout(
        () => setPhase("intro-hold"),
        target.length * charMs + 280
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // intro-hold → expanding (brief beat)
  useEffect(() => {
    if (phase !== "intro-hold") return;
    const t = setTimeout(() => setPhase("expanding"), 820);
    return () => clearTimeout(t);
  }, [phase]);

  // expanding → ready (after flight; welcome body types next)
  useEffect(() => {
    if (phase !== "expanding") return;
    const t = setTimeout(() => setPhase("ready"), 780);
    return () => clearTimeout(t);
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

  const bringToFront = (id) => {
    setTopZ((z) => z + 1);
    setZMap((m) => ({ ...m, [id]: topZ + 1 }));
  };

  const zOf = (id, base) => zMap[id] ?? base;

  /** Subtle cursor parallax — normalized pointer offset from stage center. */
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!viewport || viewport.w < 900) return;
    const el = stageRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      setParallax({
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      });
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    return () => el.removeEventListener("mousemove", onMove);
  }, [viewport]);

  const vwSafe = viewport?.w ?? 1280;
  const vhSafe = viewport?.h ?? 800;
  const { W, pos, projectCards, layoutScale } = useMemo(
    () => getDesktopLayout(vwSafe, vhSafe),
    [vwSafe, vhSafe]
  );

  if (!viewport) {
    return <div style={{ width: "100%", height: "100vh" }} aria-hidden="true" />;
  }

  if (viewport.w < 900) {
    return <MobileDesktop />;
  }

  const { w: vw, h: vh } = viewport;

  const px = parallax.x;
  const py = parallax.y;

  // One convention for every window: pointer right/down → pane shifts left/up
  // (recessed plane / “looking past the glass”). Only depth (amount) differs.
  const yz = 0.78;
  const depth = {
    welcome: 8,
    me: 8,
    proj: 12,
    skills: 10,
    otherStuff: 9,
    otherStuffIcon: 7,
    trashIcon: 7,
    contact: 9,
  };
  const pShift = {
    welcome: { x: -px * depth.welcome, y: -py * depth.welcome * yz },
    me: { x: -px * depth.me, y: -py * depth.me * yz },
    proj: { x: -px * depth.proj, y: -py * depth.proj * yz },
    skills: { x: -px * depth.skills, y: -py * depth.skills * yz },
    otherStuff: { x: -px * depth.otherStuff, y: -py * depth.otherStuff * yz },
    otherStuffIcon: {
      x: -px * depth.otherStuffIcon,
      y: -py * depth.otherStuffIcon * yz,
    },
    trashIcon: {
      x: -px * depth.trashIcon,
      y: -py * depth.trashIcon * yz,
    },
    contact: { x: -px * depth.contact, y: -py * depth.contact * yz },
  };

  const screensaverActive = useIdleTimer(
    IDLE_MS,
    phase === "dashboard"
  );

  const showTrashBubble = useCallback(() => {
    if (trashMessageTimerRef.current) {
      clearTimeout(trashMessageTimerRef.current);
    }
    setTrashMessage(pickTrashMessage());
    trashMessageTimerRef.current = setTimeout(() => {
      setTrashMessage(null);
    }, 5000);
  }, []);

  useEffect(
    () => () => {
      if (trashMessageTimerRef.current) {
        clearTimeout(trashMessageTimerRef.current);
      }
    },
    []
  );

  const showIntroCard =
    phase === "intro-typing" ||
    phase === "intro-hold" ||
    phase === "expanding";
  const showOtherWindows = phase === "dashboard";
  const showRealWelcome =
    phase === "expanding" || phase === "ready" || phase === "dashboard";
  const cascadeDelay = (seconds) =>
    introSkippedRef.current ? 0 : seconds;
  const skipWelcomeTyping = phase === "dashboard";

  return (
    <div
      ref={stageRef}
      className="relative w-full"
      style={{ height: "100vh", overflow: "visible" }}
    >
      {phase === "waiting-boot" && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 15,
            pointerEvents: "none",
          }}
        >
          <p
            style={{
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
        </div>
      )}

      {/* WELCOME! intro card — types in, holds, then flies into welcome.exe slot */}
      <AnimatePresence>
        {showIntroCard && (
          <WelcomeIntroMorph
            key="welcome-intro-morph"
            phase={phase}
            typed={welcomeTyped}
            targetOffset={{
              x:
                pos.welcome.left + W.welcome / 2 - vw / 2,
              y:
                pos.welcome.top + WELCOME_HEIGHT_GUESS / 2 - vh / 2,
            }}
          />
        )}
      </AnimatePresence>

      {showRealWelcome && (
        <Window
          id="welcome"
          title="welcome.exe"
          titleBarExtra={<WelcomeReadAloud compact />}
          left={pos.welcome.left}
          top={pos.welcome.top}
          width={W.welcome}
          delay={0}
          playOpenSound={false}
          zIndex={zOf("welcome", 12)}
          onFocus={bringToFront}
          dragConstraints={stageRef}
          parallaxShift={pShift.welcome}
          uiScale={layoutScale}
        >
          <WelcomeBody
            layoutScale={layoutScale}
            skipTyping={skipWelcomeTyping}
            onTypingComplete={handleWelcomeTypingComplete}
          />
        </Window>
      )}

      {showOtherWindows && (
        <Window
          id="me"
          title="me.txt"
          titleUppercase={false}
          left={pos.me.left}
          top={pos.me.top}
          width={W.me}
          delay={cascadeDelay(0.45)}
          zIndex={zOf("me", 13)}
          onFocus={bringToFront}
          dragConstraints={stageRef}
          parallaxShift={pShift.me}
          uiScale={layoutScale}
        >
          <MeTxtBody frameWidth={W.me} layoutScale={layoutScale} />
        </Window>
      )}

      {showOtherWindows &&
        DESKTOP_PROJECT_SLOTS.map(({ slot, projectIndex, zBase }) => {
          const p = projects[projectIndex];
          const card = projectCards[projectIndex];
          const id = `proj-${projectIndex + 1}`;
          return (
            <Window
              key={id}
              id={id}
              title={p.title}
              left={pos[slot].left}
              top={pos[slot].top}
              width={card.width}
              height={card.windowHeight}
              delay={cascadeDelay(0.62 + projectIndex * 0.28)}
              zIndex={zOf(id, zBase)}
              onFocus={bringToFront}
              dragConstraints={stageRef}
              parallaxShift={pShift.proj}
              uiScale={layoutScale}
              clipContent={false}
            >
              <ProjectFlipCard
                project={p}
                gradient={
                  PROJECT_GRADIENTS[projectIndex % PROJECT_GRADIENTS.length]
                }
                layoutScale={layoutScale}
                frameWidth={card.width}
                frameHeight={card.bodyHeight}
                aspectRatio={card.aspect}
                onRequestFocus={() => bringToFront(id)}
              />
            </Window>
          );
        })}

      {showOtherWindows && (
        <DesktopFolderIcon
          label={otherStuff.label}
          iconSrc={otherStuff.icon}
          left={pos.otherStuffIcon.left}
          top={pos.otherStuffIcon.top}
          delay={cascadeDelay(2.05)}
          zIndex={zOf("otherStuffIcon", 15)}
          onFocus={() => bringToFront("otherStuffIcon")}
          onOpen={() => {
            bringToFront("otherStuff");
            setOtherStuffOpen(true);
          }}
          parallaxShift={pShift.otherStuffIcon}
          selected={otherStuffOpen}
        />
      )}

      {showOtherWindows && (
        <RecycleBinIcon
          left={pos.trashIcon.left}
          top={pos.trashIcon.top}
          delay={cascadeDelay(2.18)}
          zIndex={zOf("trashIcon", 15)}
          onFocus={() => bringToFront("trashIcon")}
          onActivate={showTrashBubble}
          parallaxShift={pShift.trashIcon}
        />
      )}

      <AnimatePresence>
        {trashMessage && showOtherWindows ? (
          <motion.div
            key="trash-bubble"
            role="status"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{
              position: "absolute",
              left: Math.max(
                12,
                Math.min(
                  pos.trashIcon.left - 40,
                  vw - 280
                )
              ),
              top: Math.max(12, pos.trashIcon.top - 88),
              width: 248,
              zIndex: zOf("trashIcon", 15) + 2,
              padding: "10px 12px",
              background: "rgba(14, 10, 6, 0.96)",
              border: "1px solid rgba(255, 122, 41, 0.55)",
              borderRadius: 3,
              boxShadow:
                "0 0 20px rgba(255, 122, 41, 0.18), 0 12px 32px rgba(0,0,0,0.5)",
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'VT323', monospace",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: ACCENT_DIM,
              }}
            >
              Recycle Bin
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                lineHeight: 1.45,
                color: "rgba(255, 255, 255, 0.88)",
              }}
            >
              {trashMessage}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showOtherWindows && otherStuffOpen && (
        <Window
          id="otherStuff"
          title={otherStuff.windowTitle}
          titleUppercase={false}
          left={Math.max(12, pos.otherStuffIcon.left)}
          top={Math.max(
            12,
            pos.otherStuffIcon.top - Math.round(320 * layoutScale)
          )}
          width={W.otherStuff}
          delay={0}
          zIndex={zOf("otherStuff", 22)}
          onFocus={bringToFront}
          onClose={() => setOtherStuffOpen(false)}
          dragConstraints={stageRef}
          parallaxShift={pShift.otherStuff}
          uiScale={layoutScale}
        >
          <OtherStuffFolder variant="desktop" layoutScale={layoutScale} />
        </Window>
      )}

      {showOtherWindows && (
        <Window
          id="skills"
          title="skills.log"
          left={pos.skills.left}
          top={pos.skills.top}
          width={W.skills}
          delay={cascadeDelay(2.45)}
          zIndex={zOf("skills", 16)}
          onFocus={bringToFront}
          dragConstraints={stageRef}
          parallaxShift={pShift.skills}
          uiScale={layoutScale}
        >
          <div
            style={{
              padding: `${Math.round(10 * layoutScale * SKILLS_WINDOW_BODY_SCALE)}px ${Math.round(12 * layoutScale * SKILLS_WINDOW_BODY_SCALE)}px ${Math.round(16 * layoutScale * SKILLS_WINDOW_BODY_SCALE)}px`,
            }}
          >
            <SkillsPlanet
              variant="desktop"
              layoutScale={layoutScale}
              globeScale={SKILLS_WINDOW_BODY_SCALE}
            />
          </div>
        </Window>
      )}

      {showOtherWindows && (
      <Window
        id="contact"
        title="contact.msg"
        left={pos.contact.left}
        top={pos.contact.top}
        width={W.contact}
        delay={cascadeDelay(2.85)}
        zIndex={zOf("contact", 17)}
        onFocus={bringToFront}
        dragConstraints={stageRef}
        parallaxShift={pShift.contact}
        uiScale={layoutScale}
      >
        <div
          style={{
            padding: `${Math.round(14 * layoutScale)}px ${Math.round(16 * layoutScale)}px ${Math.round(16 * layoutScale)}px`,
          }}
        >
          <p
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: Math.max(10, Math.round(12 * layoutScale)),
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: ACCENT_DIM,
              marginBottom: 4,
            }}
          >
            ▢ Get in touch
          </p>
          <a
            href={`mailto:${about.email}`}
            data-cursor="hover"
            style={{
              display: "block",
              fontFamily: "'VT323', monospace",
              fontSize: Math.max(14, Math.round(18 * layoutScale)),
              letterSpacing: "0.1em",
              color: "#fff",
              textShadow: "0 0 10px rgba(255, 122, 41, 0.4)",
            }}
          >
            {about.email}
          </a>
          <div
            style={{
              marginTop: Math.round(12 * layoutScale),
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              columnGap: Math.max(10, Math.round(18 * layoutScale)),
              rowGap: 8,
            }}
          >
            <a
              href={about.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              style={{
                flex: "0 0 auto",
                fontFamily: "'VT323', monospace",
                fontSize: Math.max(11, Math.round(14 * layoutScale)),
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: ACCENT,
                textShadow: "0 0 5px rgba(255,122,41,0.4)",
                whiteSpace: "nowrap",
              }}
            >
              LinkedIn
            </a>
            <span
              aria-hidden="true"
              style={{
                color: ACCENT_DIM,
                fontFamily: "'VT323', monospace",
                fontSize: Math.max(10, Math.round(13 * layoutScale)),
                opacity: 0.55,
                userSelect: "none",
              }}
            >
              ·
            </span>
            <a
              href={about.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              style={{
                flex: "0 0 auto",
                fontFamily: "'VT323', monospace",
                fontSize: Math.max(11, Math.round(14 * layoutScale)),
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: ACCENT,
                textShadow: "0 0 5px rgba(255,122,41,0.4)",
                whiteSpace: "nowrap",
              }}
            >
              Instagram
            </a>
          </div>
        </div>
      </Window>
      )}

      <NomineeTab />
      <StatusBar />
      <IdleScreensaver active={screensaverActive} />
    </div>
  );
}

function ProjectFlipCard({
  project,
  gradient,
  layoutScale = 1,
  frameWidth,
  frameHeight,
  aspectRatio,
  onRequestFocus,
}) {
  const reduceMotion = useReducedMotion();
  const innerW = frameWidth ?? 268;
  const cardH =
    frameHeight ??
    Math.round(innerW / (aspectRatio ?? 4 / 5));

  const heroSrc = project.thumb ?? project.caseStudyHero ?? null;
  const heroSrcEnc = heroSrc ? encodeURI(heroSrc) : null;

  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="project"
      data-project-slug={project.slug}
      aria-label={`Open ${project.title} case study`}
      onMouseEnter={() => onRequestFocus?.()}
      onFocus={() => onRequestFocus?.()}
      style={{
        display: "block",
        position: "relative",
        width: "100%",
        height: cardH,
        overflow: "hidden",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
        outline: "none",
      }}
    >
      <motion.div
        className="project-card-shell"
        style={{
          position: "relative",
          height: "100%",
          transformOrigin: "center center",
          borderRadius: 3,
          border: "1px solid rgba(255, 122, 41, 0.4)",
          overflow: "hidden",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45)",
        }}
        initial={false}
        whileHover={reduceMotion ? undefined : { scale: 1.1, zIndex: 4 }}
        transition={{ duration: 0.34, ease: EASE }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: gradient,
          }}
        >
          {heroSrcEnc ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroSrcEnc}
                alt=""
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(12, 8, 6, 0.08) 0%, rgba(8, 5, 4, 0.35) 100%)",
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
                "repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 1px, transparent 2px, transparent 4px)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        </div>

      </motion.div>
    </Link>
  );
}

function WelcomeIntroMorph({ phase, typed, targetOffset }) {
  // Single element that lives through all three intro phases. Always rendered
  // via a flex-centered wrapper so it starts at viewport center, and animates
  // to its target via transform-only (x, y, scale) — never reflows.
  const isTyping = phase === "intro-typing";
  const isFlying = phase === "expanding";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, x: 0, y: 0 }}
        animate={
          isFlying
            ? {
                opacity: 0,
                scale: 0.18,
                x: targetOffset.x,
                y: targetOffset.y,
              }
            : { opacity: 1, scale: 1, x: 0, y: 0 }
        }
        transition={
          isFlying
            ? {
                default: { duration: 0.65, ease: EASE },
                opacity: { duration: 0.55, delay: 0.12, ease: "easeIn" },
              }
            : { duration: 0.35, ease: EASE }
        }
        style={{
          padding: "28px 60px 32px",
          background: "rgba(18, 12, 8, 0.92)",
          border: "1px solid rgba(255, 122, 41, 0.6)",
          borderRadius: 3,
          boxShadow:
            "0 0 60px rgba(255, 122, 41, 0.32), 0 32px 80px rgba(0, 0, 0, 0.7)",
          fontFamily: "'Bonbon', cursive",
          fontSize: "clamp(72px, 11vw, 168px)",
          color: "#ffffff",
          textShadow: "0 0 32px rgba(255, 122, 41, 0.45)",
          lineHeight: 1,
          whiteSpace: "nowrap",
          willChange: "transform, opacity",
        }}
      >
        {typed || "\u00a0"}
        {isTyping && <BlinkCursor />}
      </motion.div>
    </div>
  );
}

function WelcomeAsciiPortrait({ sizes, style, priority = false }) {
  return (
    <Image
      src={ASCII_PORTRAIT_SRC}
      alt="ASCII portrait of Jason Saputra"
      width={ASCII_PORTRAIT_W}
      height={ASCII_PORTRAIT_H}
      sizes={sizes}
      priority={priority}
      draggable={false}
      style={{
        display: "block",
        boxSizing: "border-box",
        maxWidth: "100%",
        objectFit: "contain",
        objectPosition: "top center",
        filter: "drop-shadow(0 0 12px rgba(255, 122, 41, 0.28))",
        ...style,
      }}
    />
  );
}

function MeTxtBody({ frameWidth, layoutScale = 1 }) {
  const s = layoutScale;
  const inset = Math.max(18, Math.round(26 * s));
  const inner =
    frameWidth != null
      ? Math.max(Math.round(130 * s), Math.min(Math.round(248 * s), frameWidth - inset))
      : null;
  const box =
    inner != null
      ? { width: `${inner}px`, height: `${inner}px` }
      : { width: "min(240px, 76vw)", height: "min(240px, 76vw)" };
  return (
    <div
      style={{
        padding: `${Math.round(12 * s)}px ${Math.round(10 * s)}px ${Math.round(14 * s)}px`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          ...box,
          margin: "0 auto",
          lineHeight: 0,
        }}
      >
        <WelcomeAsciiPortrait
          sizes={inner != null ? `${Math.ceil(inner * 1.2)}px` : "min(280px, 85vw)"}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "none",
          }}
        />
      </div>
      <p
        style={{
          margin: `${Math.round(11 * s)}px 0 0`,
          fontFamily: "'VT323', monospace",
          fontSize: Math.max(10, Math.round(13 * s)),
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: ACCENT_DIM,
          textShadow: "0 0 8px rgba(255, 122, 41, 0.38)",
        }}
      >
        It&apos;s me :D
      </p>
    </div>
  );
}

function WelcomeBody({
  layoutScale = 1,
  skipTyping = false,
  onTypingComplete,
}) {
  const s = layoutScale;
  const px = Math.round;
  const mono = px(14 * s);
  const bio = Math.max(11, Math.round(13 * s));
  const [typingDone, setTypingDone] = useState(skipTyping);

  useEffect(() => {
    if (skipTyping) setTypingDone(true);
  }, [skipTyping]);

  const handleLinesComplete = useCallback(() => {
    setTypingDone(true);
    onTypingComplete?.();
  }, [onTypingComplete]);

  return (
    <div
      style={{
        padding: `${px(20 * s)}px ${px(22 * s)}px ${px(22 * s)}px`,
      }}
    >
      <TypedLine
        text="▢ Hello."
        charMs={48}
        delay={160}
        skipTyping={skipTyping}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: mono,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: ACCENT,
          textShadow: "0 0 8px rgba(255, 122, 41, 0.45)",
          marginBottom: px(12 * s),
          display: "block",
        }}
      />
      <TypedLine
        as="h1"
        text="Jason Saputra"
        charMs={72}
        delay={580}
        skipTyping={skipTyping}
        style={{
          fontFamily: "'Bonbon', cursive",
          fontSize: `clamp(${px(44 * s)}px, 4.8vw, ${px(68 * s)}px)`,
          lineHeight: 0.95,
          color: "#ffffff",
          textShadow: "0 0 22px rgba(255, 122, 41, 0.2)",
          margin: 0,
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
          fontSize: mono,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: ACCENT,
          textShadow: "0 0 8px rgba(255, 122, 41, 0.45)",
          marginTop: px(12 * s),
          display: "block",
        }}
      />
      {typingDone ? (
        <>
          <FadeInLine delay={skipTyping ? 0 : 120}>
            <p
              className="mt-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: bio,
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.7,
                maxWidth: px(420 * s),
                margin: `${px(16 * s)}px 0 0`,
              }}
            >
              {about.bio}
            </p>
          </FadeInLine>
          <FadeInLine delay={skipTyping ? 80 : 420}>
            <p
              className="mt-4"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: Math.max(10, px(13 * s)),
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: ACCENT_DIM,
                margin: `${px(16 * s)}px 0 0`,
              }}
            >
              ─ Dream · Think · Build ─
            </p>
          </FadeInLine>
        </>
      ) : null}
    </div>
  );
}

function TypedLine({
  text,
  charMs = 40,
  delay = 0,
  skipTyping = false,
  onComplete,
  as: Tag = "span",
  style,
}) {
  const [typed, setTyped] = useState(skipTyping ? text : "");
  const [done, setDone] = useState(skipTyping);

  useEffect(() => {
    if (skipTyping) {
      setTyped(text);
      setDone(true);
      return;
    }

    setTyped("");
    setDone(false);
    const timers = [];
    timers.push(
      setTimeout(() => {
        for (let i = 1; i <= text.length; i++) {
          timers.push(
            setTimeout(() => {
              setTyped(text.slice(0, i));
              playTypingClick();
            }, i * charMs)
          );
        }
        timers.push(
          setTimeout(() => {
            setDone(true);
            onComplete?.();
          }, text.length * charMs + 80)
        );
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [text, charMs, delay, skipTyping, onComplete]);

  return (
    <Tag style={style}>
      {typed}
      {!done && typed.length > 0 && <BlinkCursor />}
    </Tag>
  );
}

function FadeInLine({ delay = 0, children, style: motionStyle }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={motionStyle}
    >
      {children}
    </motion.div>
  );
}

function NomineeTab() {
  return (
    <a
      href="https://linkedin.com/in/jasonixd"
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="hover"
      style={{
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 30,
        writingMode: "vertical-rl",
        background: "#0a0a0a",
        color: ACCENT,
        fontFamily: "'VT323', monospace",
        fontSize: 13,
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        padding: "16px 6px",
        borderLeft: "1px solid rgba(255, 122, 41, 0.4)",
        borderTop: "1px solid rgba(255, 122, 41, 0.4)",
        borderBottom: "1px solid rgba(255, 122, 41, 0.4)",
        borderRadius: "4px 0 0 4px",
        textShadow: "0 0 6px rgba(255, 122, 41, 0.5)",
        textDecoration: "none",
      }}
    >
      J.S. · Open for work
    </a>
  );
}

function BlinkCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1,
        times: [0, 0.5, 0.5, 1],
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        display: "inline-block",
        width: "0.55em",
        marginLeft: 4,
        background: ACCENT,
        height: "1em",
        verticalAlign: "-0.12em",
        boxShadow: "0 0 8px rgba(255, 122, 41, 0.6)",
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              MOBILE EXPERIENCE                             */
/* -------------------------------------------------------------------------- */

const MOBILE_BLOCK_GAP = 44;
const MOBILE_CARD_INSET = 18;

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

function MobileDesktop() {
  const introSkippedRef = useRef(
    typeof window !== "undefined" && shouldSkipIntro()
  );
  const [phase, setPhase] = useState(
    introSkippedRef.current ? "dashboard" : "waiting-boot"
  );
  const [welcomeTyped, setWelcomeTyped] = useState("");
  const welcomeDoneTimerRef = useRef(null);

  useEffect(() => {
    if (phase === "dashboard") markIntroSeen();
  }, [phase]);

  useEffect(() => {
    if (introSkippedRef.current) return;
    const handler = () => setPhase("intro");
    window.addEventListener("boot:done", handler);
    if (typeof window !== "undefined" && window.__portfolioBootDone) {
      handler();
    }
    return () => window.removeEventListener("boot:done", handler);
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

  return (
    <motion.div
      className="mobile-os"
      style={{ position: "relative", height: "100vh" }}
    >
      <motion.div
        ref={scrollRef}
        data-mobile-scroll
        className="mobile-os-scroll"
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          paddingTop: 20,
          paddingBottom: 140,
        }}
      >
        <MobileScrollReveal scrollRoot={scrollRef} variant="fade" delay={0.05}>
          <MobileCard title="welcome.exe" titleExtra={<WelcomeReadAloud compact />}>
            <MobileWelcomeMorph
              phase={phase}
              typed={welcomeTyped}
              skipTyping={skipWelcomeTyping}
              onTypingComplete={handleWelcomeTypingComplete}
            />
          </MobileCard>
        </MobileScrollReveal>

        {showMobileRest ? (
          <>
        <MobileSectionRule />

        <MobileScrollReveal scrollRoot={scrollRef} variant="left" delay={0.04}>
          <SectionLabel>▢ Selected work · swipe →</SectionLabel>
        </MobileScrollReveal>
        <MobileScrollReveal scrollRoot={scrollRef} variant="up" delay={0.1}>
          <MobileProjectsCarousel scrollRoot={scrollRef} />
        </MobileScrollReveal>

        <MobileSectionRule />

        <MobileScrollReveal scrollRoot={scrollRef} variant="right" delay={0.04}>
          <SectionLabel>▢ Skills · orbiting</SectionLabel>
        </MobileScrollReveal>
        <MobileScrollReveal scrollRoot={scrollRef} variant="up" delay={0.12}>
          <motion.div
            style={{
              padding: "8px 14px 28px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <SkillsPlanet variant="mobile" scrollRootSelector="[data-mobile-scroll]" />
          </motion.div>
        </MobileScrollReveal>

        <MobileSectionRule />

        <MobileScrollReveal scrollRoot={scrollRef} variant="left" delay={0.06}>
          <MobileCard title="me.txt" titleUppercase={false}>
            <MeTxtBody />
          </MobileCard>
        </MobileScrollReveal>

        <MobileSectionRule />

        <MobileScrollReveal scrollRoot={scrollRef} variant="right" delay={0.05}>
          <SectionLabel>▢ Other stuff · photos & sketches</SectionLabel>
        </MobileScrollReveal>
        <MobileScrollReveal scrollRoot={scrollRef} variant="up" delay={0.1}>
          <MobileCard title="Other stuff" titleUppercase={false}>
            <OtherStuffFolder variant="mobile" />
          </MobileCard>
        </MobileScrollReveal>

        <MobileScrollReveal scrollRoot={scrollRef} variant="fade" delay={0.08}>
          <MobileOpenForWorkStrip />
        </MobileScrollReveal>

        <MobileScrollReveal scrollRoot={scrollRef} variant="right" delay={0.1}>
          <MobileCard title="contact.msg">
            <MobileContact />
          </MobileCard>
        </MobileScrollReveal>
          </>
        ) : null}
      </motion.div>

      <StatusBar />
    </motion.div>
  );
}

function MobileCard({ title, children, titleUppercase = true, titleExtra }) {
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
      <div style={{ padding: "16px 16px 18px", position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </section>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        margin: `${MOBILE_BLOCK_GAP}px ${MOBILE_CARD_INSET + 4}px 14px`,
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
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {about.bio}
        </p>
      </FadeInLine>
      <FadeInLine delay={skipTyping ? 80 : 420}>
        <p
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 13,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: ACCENT_DIM,
            margin: "18px 0 0",
          }}
        >
          ─ Dream · Think · Build ─
        </p>
      </FadeInLine>
        </>
      ) : null}
    </div>
  );
}

function MobileProjectsCarousel({ scrollRoot }) {
  const carouselRef = useRef(null);
  const cardsRef = useRef([]);
  const dragRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, {
    root: scrollRoot ?? undefined,
    once: true,
    amount: 0.15,
  });

  const syncActiveFromScroll = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const centerX = carousel.scrollLeft + carousel.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });
    setActiveIdx((prev) => (prev === bestIdx ? prev : bestIdx));
  }, []);

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

  const showCards = reduceMotion || sectionInView;

  return (
    <motion.div ref={sectionRef} style={{ marginBottom: 4 }}>
      <motion.div
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
        padding: "18px 14vw 32px",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x",
        overscrollBehaviorX: "contain",
        width: "100%",
        maxWidth: "100%",
        minHeight: 0,
      }}
    >
      {projects.map((p, i) => {
        const isActive = i === activeIdx;
        return (
          <motion.div
            key={p.id}
            ref={(el) => (cardsRef.current[i] = el)}
            data-idx={i}
            style={{
              flex: "0 0 68vw",
              maxWidth: 360,
              aspectRatio: "1 / 1",
              scrollSnapAlign: "center",
              willChange: "transform, opacity",
            }}
            initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.88 }}
            animate={{
              opacity: showCards ? (isActive ? 1 : 0.52) : 0,
              y: showCards ? (isActive ? 0 : 8) : 36,
              scale: showCards ? (isActive ? 1 : 0.86) : 0.88,
            }}
            transition={{
              opacity: {
                duration: 0.45,
                delay: showCards ? i * 0.09 : 0,
              },
              y: { duration: 0.62, ease: EASE, delay: showCards ? i * 0.09 : 0 },
              scale: {
                duration: isActive ? 0.34 : 0.62,
                ease: EASE,
                delay: showCards ? i * 0.09 : 0,
              },
            }}
          >
            <MobileProjectCard
              project={p}
              gradient={PROJECT_GRADIENTS[i % PROJECT_GRADIENTS.length]}
            />
          </motion.div>
        );
      })}
      </motion.div>
    </motion.div>
  );
}

function MobileProjectCard({ project, gradient }) {
  const heroSrc = project.thumb ?? project.caseStudyHero ?? null;
  const heroSrcEnc = heroSrc ? encodeURI(heroSrc) : null;

  return (
    <Link
      href={`/work/${project.slug}`}
      prefetch
      aria-label={`Open case study: ${project.title}`}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid rgba(255, 122, 41, 0.45)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
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
        }}
      >
        {heroSrcEnc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrcEnc}
              alt=""
              aria-hidden
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
    </Link>
  );
}

function MobileContact() {
  return (
    <div style={{ paddingTop: 4 }}>
      <p
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 13,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: ACCENT_DIM,
          marginBottom: 16,
        }}
      >
        ▢ Get in touch
      </p>
      <a
        href={`mailto:${about.email}`}
        style={{
          display: "block",
          fontFamily: "'VT323', monospace",
          fontSize: "clamp(20px, 5vw, 26px)",
          letterSpacing: "0.12em",
          color: "#fff",
          textShadow: "0 0 10px rgba(255, 122, 41, 0.45)",
          wordBreak: "break-word",
        }}
      >
        {about.email}
      </a>
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
      <p
        style={{
          marginTop: 28,
          fontFamily: "'VT323', monospace",
          fontSize: 13,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: ACCENT_DIM,
        }}
      >
        ─ Currently open for work ─
      </p>
    </div>
  );
}
