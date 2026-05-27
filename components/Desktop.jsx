"use client";

import Image from "next/image";
import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Window from "./Window";
import StatusBar from "./StatusBar";
import CoffeeSnakeGame from "./CoffeeSnakeGame";
import HiddenCoffeeIcon from "./HiddenCoffeeIcon";
import { MobileProjectPreviewPanel } from "@/components/ProjectPreviewPane";
import ProjectViewLink from "@/components/ProjectViewLink";
import { projectHeroTransitionName } from "@/lib/viewTransition";
import DesktopIdleLayer from "./DesktopIdleLayer";
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
  RIGHT_RESERVE,
} from "@/lib/desktopWindowPlacement";
import { getProjectDesktopCards, projectGridMetrics } from "@/lib/projectDesktopCards";
import { projectCardThumbSrc } from "@/lib/projectMedia";
import { preloadPortfolioAssets } from "@/lib/preloadPortfolio";
import {
  markIntroSeen,
  shouldSkipIntro,
  signalBootComplete,
} from "@/lib/introSession";
import {
  playClick,
  playTypingClick,
  playTypingClickThrottled,
  playWindowRestore,
} from "@/lib/typingSound";
import { pickTrashMessageForClick } from "@/lib/trashMessage";
import { incrementCoffeeCount } from "@/lib/coffeeCounter";
import { readIconOffset } from "@/lib/desktopIconPositions";

const ACCENT = "#FF7A29";
/** Brighter orange for small text — ~4.5:1 on dark window chrome. */
const ACCENT_DIM = "#FFB570";
const EASE = [0.16, 1, 0.3, 1];

const WELCOME_HEIGHT_GUESS = 380;

function getWindowTitle(id) {
  switch (id) {
    case "welcome":
      return "welcome.exe";
    case "me":
      return "me.txt";
    case "skills":
      return "skills.log";
    case "contact":
      return "contact.msg";
    case "otherStuff":
      return otherStuff.windowTitle;
    case "coffee-snake":
      return "coffee_snake.exe";
    default: {
      const m = /^proj-(\d+)$/.exec(id);
      if (m) {
        const idx = Number(m[1]) - 1;
        return projects[idx]?.title ?? id;
      }
      return id;
    }
  }
}

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
    otherStuff: Math.round(clamp(340, 520, 420 + 32 * u)),
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

  const maxGridW = Math.max(0, vw - 2 * edge - RIGHT_RESERVE);
  const bandInner = Math.max(0, skillsLeft - edge - g);
  const gridFitW = Math.min(maxGridW, bandInner > 0 ? bandInner : maxGridW);
  const { gridWidth: gridW0 } = projectGridMetrics(projectCards, projectGap);

  if (gridW0 > gridFitW && gridFitW > 0 && gridW0 > 0) {
    const shrink = gridFitW / gridW0;
    projectCards = projectCards.map((card) => {
      const width = Math.max(100, Math.round(card.width * shrink));
      const bodyHeight = Math.round(width / card.aspect);
      const tb = Math.max(26, Math.round(28 * layoutScale));
      return {
        ...card,
        width,
        bodyHeight,
        windowHeight: tb + bodyHeight,
        topOffset: 0,
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

  useLayoutEffect(() => {
    preloadPortfolioAssets();
  }, []);

  // Boot/intro state machine:
  //   "waiting-boot"  → LoadingOverlay is still showing
  //   "intro-typing"  → big centered card, typing "WELCOME!"
  //   "intro-hold"    → fully typed, brief pause
  //   "expanding"     → card flies into welcome.exe slot (no other windows yet)
  //   "ready"         → welcome.exe body types in (Hello, name, role…)
  //   "dashboard"   → all other windows cascade in
  const introSkippedRef = useRef(false);
  const bootHandledRef = useRef(false);
  const [phase, setPhase] = useState("waiting-boot");
  const [welcomeTyped, setWelcomeTyped] = useState("");
  const [otherStuffOpen, setOtherStuffOpen] = useState(false);
  const [otherStuffBrowsing, setOtherStuffBrowsing] = useState(false);
  const [coffeeSnakeOpen, setCoffeeSnakeOpen] = useState(false);
  const [minimizedIds, setMinimizedIds] = useState([]);
  const [trashMessage, setTrashMessage] = useState(null);
  const trashMessageTimerRef = useRef(null);
  const trashClickCountRef = useRef(0);
  const welcomeDoneTimerRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [iconOffsets, setIconOffsets] = useState(() => ({
    trashIcon: readIconOffset("trashIcon"),
  }));

  const handleIconOffset = useCallback((id, offset) => {
    setIconOffsets((prev) => ({ ...prev, [id]: offset }));
  }, []);

  useLayoutEffect(() => {
    if (shouldSkipIntro()) {
      introSkippedRef.current = true;
      setPhase("dashboard");
      signalBootComplete();
    }
  }, []);

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

  // Listen for the boot overlay completing its exit (once per visit).
  useEffect(() => {
    if (introSkippedRef.current) return;

    const startIntro = () => {
      if (bootHandledRef.current) return;
      bootHandledRef.current = true;
      setPhase((p) => (p === "waiting-boot" ? "intro-typing" : p));
    };

    window.addEventListener("boot:done", startIntro);
    if (typeof window !== "undefined" && window.__portfolioBootDone) {
      startIntro();
    }
    const fallback = setTimeout(() => {
      setPhase((p) => (p === "waiting-boot" ? "intro-typing" : p));
    }, 14000);
    return () => {
      clearTimeout(fallback);
      window.removeEventListener("boot:done", startIntro);
    };
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

  const bringToFront = useCallback((id) => {
    setTopZ((z) => {
      const next = z + 1;
      setZMap((m) => ({ ...m, [id]: next }));
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    if (coffeeSnakeOpen) bringToFront("coffee-snake");
  }, [coffeeSnakeOpen, bringToFront]);

  const openCoffeeSnake = useCallback(() => {
    playClick();
    incrementCoffeeCount(1);
    setCoffeeSnakeOpen(true);
  }, []);

  const minimizeWindow = useCallback((id) => {
    setMinimizedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const restoreWindow = useCallback((id) => {
    setMinimizedIds((prev) => prev.filter((x) => x !== id));
    playWindowRestore();
  }, []);

  const isMinimized = useCallback(
    (id) => minimizedIds.includes(id),
    [minimizedIds]
  );

  const minimizedTaskbarItems = useMemo(
    () => minimizedIds.map((id) => ({ id, title: getWindowTitle(id) })),
    [minimizedIds]
  );

  const zOf = (id, base) => zMap[id] ?? base;

  useEffect(() => {
    if (!viewport || viewport.w < 900 || phase !== "dashboard") return;
    const el = stageRef.current;
    if (!el) return;

    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));

      if (Math.abs(nx - lastX) < 0.028 && Math.abs(ny - lastY) < 0.028) return;

      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        lastX = nx;
        lastY = ny;
        startTransition(() => {
          setParallax({ x: nx, y: ny });
        });
      });
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [viewport, phase]);

  const vwSafe = viewport?.w ?? 1280;
  const vhSafe = viewport?.h ?? 800;

  const { W, pos, projectCards, layoutScale } = useMemo(
    () => getDesktopLayout(vwSafe, vhSafe),
    [vwSafe, vhSafe]
  );

  const otherStuffWindowWidth = otherStuffBrowsing
    ? Math.round(W.otherStuff * 1.55)
    : W.otherStuff;

  const otherStuffWindowTop = Math.max(
    12,
    pos.otherStuff?.top ??
      Math.round((vhSafe - Math.round(360 * layoutScale)) / 2)
  );
  const otherStuffWindowLeft = Math.max(
    12,
    Math.round((vwSafe - otherStuffWindowWidth) / 2)
  );

  useEffect(() => {
    if (!otherStuffOpen) setOtherStuffBrowsing(false);
  }, [otherStuffOpen]);

  const showTrashBubble = useCallback(() => {
    if (trashMessageTimerRef.current) {
      clearTimeout(trashMessageTimerRef.current);
    }
    trashClickCountRef.current += 1;
    setTrashMessage(
      pickTrashMessageForClick(trashClickCountRef.current)
    );
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
    coffeeIcon: 6,
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
    coffeeIcon: {
      x: -px * depth.coffeeIcon,
      y: -py * depth.coffeeIcon * yz,
    },
    contact: { x: -px * depth.contact, y: -py * depth.contact * yz },
  };

  const trashIconLeft = pos.trashIcon.left + iconOffsets.trashIcon.dx;
  const trashIconTop = pos.trashIcon.top + iconOffsets.trashIcon.dy;
  const snakeRevealed =
    Math.hypot(iconOffsets.trashIcon.dx, iconOffsets.trashIcon.dy) > 36;

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
      style={{ height: "100%", overflow: "hidden" }}
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
          minimized={isMinimized("welcome")}
          onMinimize={() => minimizeWindow("welcome")}
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
          minimized={isMinimized("me")}
          onMinimize={() => minimizeWindow("me")}
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
              minimized={isMinimized(id)}
              onMinimize={() => minimizeWindow(id)}
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
          stageRef={stageRef}
          onFocus={() => bringToFront("otherStuffIcon")}
          onOffsetChange={(offset) => handleIconOffset("otherStuffIcon", offset)}
          onOpen={() => {
            bringToFront("otherStuff");
            setOtherStuffOpen(true);
          }}
          parallaxShift={pShift.otherStuffIcon}
          selected={otherStuffOpen}
        />
      )}

      {showOtherWindows && (
        <HiddenCoffeeIcon
          left={pos.coffeeIcon.left}
          top={pos.coffeeIcon.top}
          delay={cascadeDelay(2.08)}
          zIndex={zOf("coffeeIcon", 13)}
          parallaxShift={pShift.coffeeIcon}
          revealed={snakeRevealed}
          selected={coffeeSnakeOpen}
          onOpen={openCoffeeSnake}
        />
      )}

      {showOtherWindows && (
        <RecycleBinIcon
          left={pos.trashIcon.left}
          top={pos.trashIcon.top}
          delay={cascadeDelay(2.18)}
          zIndex={zOf("trashIcon", 16)}
          stageRef={stageRef}
          onFocus={() => bringToFront("trashIcon")}
          onOffsetChange={(offset) => handleIconOffset("trashIcon", offset)}
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
                  trashIconLeft - 40,
                  vw - 280
                )
              ),
              top: Math.max(12, trashIconTop - 88),
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
          left={otherStuffWindowLeft}
          top={otherStuffWindowTop}
          width={otherStuffWindowWidth}
          delay={0}
          zIndex={zOf("otherStuff", 22)}
          onFocus={bringToFront}
          minimized={isMinimized("otherStuff")}
          onMinimize={() => minimizeWindow("otherStuff")}
          dragConstraints={stageRef}
          parallaxShift={pShift.otherStuff}
          uiScale={layoutScale}
        >
          <OtherStuffFolder
            variant="desktop"
            layoutScale={layoutScale}
            onBrowseChange={setOtherStuffBrowsing}
          />
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
          minimized={isMinimized("skills")}
          onMinimize={() => minimizeWindow("skills")}
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
        minimized={isMinimized("contact")}
        onMinimize={() => minimizeWindow("contact")}
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
      {coffeeSnakeOpen && showOtherWindows ? (
        <Window
          id="coffee-snake"
          title="coffee_snake.exe"
          left={Math.max(12, Math.round(vw / 2 - 210))}
          top={Math.max(12, Math.round(vh / 2 - 230))}
          width={420}
          height={438}
          zIndex={zOf("coffee-snake", 200)}
          onFocus={bringToFront}
          onMinimize={() => setCoffeeSnakeOpen(false)}
          dragConstraints={stageRef}
          uiScale={layoutScale}
          clipContent
        >
          <CoffeeSnakeGame onQuit={() => setCoffeeSnakeOpen(false)} />
        </Window>
      ) : null}
      <StatusBar
        minimizedWindows={minimizedTaskbarItems}
        onRestoreWindow={(id) => {
          restoreWindow(id);
          bringToFront(id);
        }}
      />
      {phase === "dashboard" && <DesktopIdleLayer />}
    </div>
  );
}

function ProjectCardHeroImage({ src, style, loading = "lazy" }) {
  const [displaySrc, setDisplaySrc] = useState(() => projectCardThumbSrc(src));

  useEffect(() => {
    setDisplaySrc(projectCardThumbSrc(src));
  }, [src]);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={displaySrc}
      alt=""
      aria-hidden
      loading={loading}
      decoding="async"
      style={style}
      onError={() => {
        const fallback = encodeURI(src);
        if (displaySrc !== fallback) setDisplaySrc(fallback);
      }}
    />
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
  const innerW = frameWidth ?? 268;
  const cardH =
    frameHeight ??
    Math.round(innerW / (aspectRatio ?? 4 / 5));

  const heroSrc = project.thumb ?? project.caseStudyHero ?? null;

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
      <div
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
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: gradient,
          }}
        >
          {heroSrc ? (
            <>
              <ProjectCardHeroImage
                src={heroSrc}
                loading="eager"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
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

        <div className="project-card-caption" aria-hidden="true">
          <p className="project-card-caption__title">{project.title}</p>
          <p className="project-card-caption__tagline">{project.tagline}</p>
          <span className="project-card-caption__cta">Case study →</span>
        </div>
      </div>
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
  const isDesktop = frameWidth != null;
  const inner =
    frameWidth != null
      ? Math.max(
          Math.round(118 * s),
          Math.min(Math.round(200 * s), frameWidth - inset)
        )
      : null;
  const box =
    inner != null
      ? { width: `${inner}px`, height: `${inner}px` }
      : { width: "min(220px, 72vw)", height: "min(220px, 72vw)" };
  const bioSize = isDesktop ? Math.max(10, Math.round(11.5 * s)) : 14;
  const bioPad = isDesktop ? Math.round(8 * s) : 12;

  return (
    <div
      style={{
        padding: `${Math.round(12 * s)}px ${Math.round(10 * s)}px ${Math.round(14 * s)}px`,
      }}
    >
      <div style={{ textAlign: "center" }}>
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
            margin: `${Math.round(10 * s)}px 0 0`,
            fontFamily: "'VT323', monospace",
            fontSize: Math.max(10, Math.round(13 * s)),
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: ACCENT,
            textShadow: "0 0 8px rgba(255, 122, 41, 0.38)",
          }}
        >
          It&apos;s me :D
        </p>
      </div>
      <p
        style={{
          margin: `${bioPad}px 0 0`,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: bioSize,
          lineHeight: 1.65,
          color: "rgba(255, 255, 255, 0.92)",
          textAlign: "left",
        }}
      >
        {about.bio}
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
        <FadeInLine delay={skipTyping ? 0 : 120}>
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
      ) : null}
    </div>
  );
}

function TypedLine({
  text,
  charMs = 40,
  delay = 0,
  skipTyping = false,
  enabled = true,
  soundEvery = 1,
  useThrottledSound = false,
  onComplete,
  as: Tag = "span",
  style,
}) {
  const [typed, setTyped] = useState(skipTyping ? text : "");
  const [done, setDone] = useState(skipTyping);

  useEffect(() => {
    if (!enabled) return;

    if (skipTyping) {
      setTyped(text);
      setDone(true);
      return;
    }

    setTyped("");
    setDone(false);
    const timers = [];
    const tickSound =
      useThrottledSound
        ? () => playTypingClickThrottled(58)
        : () => playTypingClick();

    timers.push(
      setTimeout(() => {
        for (let i = 1; i <= text.length; i++) {
          timers.push(
            setTimeout(() => {
              setTyped(text.slice(0, i));
              if (i % soundEvery === 0) tickSound();
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
  }, [
    text,
    charMs,
    delay,
    skipTyping,
    enabled,
    soundEvery,
    useThrottledSound,
    onComplete,
  ]);

  return (
    <Tag style={style}>
      {enabled || skipTyping ? typed : "\u00a0"}
      {enabled && !done && typed.length > 0 && <BlinkCursor />}
    </Tag>
  );
}

/** Starts typing when scrolled into the mobile column (once). */
function ScrollTypedLine({
  scrollRoot,
  amount = 0.38,
  ...typedProps
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, {
    root: scrollRoot ?? undefined,
    once: true,
    amount,
    margin: "0px 0px -8% 0px",
  });
  const active = reduceMotion || typedProps.skipTyping || inView;

  return (
    <span ref={ref} style={{ display: typedProps.style?.display ?? "block" }}>
      <TypedLine {...typedProps} enabled={active} />
    </span>
  );
}

function ScrollTypedParagraph({
  text,
  scrollRoot,
  skipTyping = false,
  charMs = 14,
  delay = 120,
  style,
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, {
    root: scrollRoot ?? undefined,
    once: true,
    amount: 0.32,
    margin: "0px 0px -6% 0px",
  });
  const active = reduceMotion || skipTyping || inView;

  return (
    <p ref={ref} style={style}>
      <TypedLine
        text={text}
        charMs={charMs}
        delay={delay}
        skipTyping={skipTyping}
        enabled={active}
        soundEvery={3}
        useThrottledSound
        style={{ display: "inline" }}
      />
    </p>
  );
}

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
  const project = projects[activeIdx] ?? projects[0];

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
      title="Open for work — view LinkedIn profile"
      aria-label="Open for work — view LinkedIn profile"
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
  const scrollRef = useRef(null);
  const activeSection = useMobileSectionSpy(scrollRef, showMobileRest);

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
        480 + (projects.length - 1) * 90 + 40
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
      {projects.map((p, i) => (
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
          {String(activeIdx + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>
        <motion.div
          style={{ display: "flex", gap: 6, alignItems: "center" }}
          aria-hidden
        >
          {projects.map((p, i) => (
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
