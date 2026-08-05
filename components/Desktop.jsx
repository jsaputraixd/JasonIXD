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
import ProjectViewLink from "@/components/ProjectViewLink";
import { projectHeroTransitionName } from "@/lib/viewTransition";
import DesktopIdleLayer from "./DesktopIdleLayer";
import SkillsPlanet, { desktopSkillsExpandedBox } from "./SkillsPlanet";
import { featuredProjects } from "@/data/projects";
import { about } from "@/data/about";
import WelcomeReadAloud from "@/components/WelcomeReadAloud";
import DesktopFolderIcon from "@/components/DesktopFolderIcon";
import OtherStuffFolder from "@/components/OtherStuffFolder";
import OtherProjectsFolder from "@/components/OtherProjectsFolder";
import ProjectFlipCard, { PROJECT_CARD_GRADIENTS } from "@/components/ProjectFlipCard";
import { otherStuff } from "@/data/otherStuff";
import { otherProjects } from "@/data/otherProjects";
import {
  DESKTOP_FOLDER_ICON_W,
  getDeterministicDesktopPositions,
  LEFT_COLUMN_INSET,
  PROJECT_WINDOW_GAP,
  RIGHT_RESERVE,
} from "@/lib/desktopWindowPlacement";
import { getProjectDesktopCards, projectGridMetrics } from "@/lib/projectDesktopCards";
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
import { incrementCoffeeCount } from "@/lib/coffeeCounter";
import { readIconOffset, writeIconOffset } from "@/lib/desktopIconPositions";
import WelcomeAsciiPortrait from "@/components/WelcomeAsciiPortrait";
import { TypedLine, FadeInLine, BlinkCursor } from "@/components/TypedLine";
import {
  DesktopVaultBreachOverlay,
  MobileVaultKeyhole,
  MobileVaultToast,
  useVaultKeyState,
} from "@/components/mobile/MobileVaultEasterEgg";

const ACCENT = "#FF7A29";
/** Brighter orange for small text, ~4.5:1 on dark window chrome. */
const ACCENT_DIM = "#FFB570";
const EASE = [0.16, 1, 0.3, 1];
/** Stay above bringToFront window stacking while the globe is zoomed. */
const SKILLS_FOCUS_BACKDROP_Z = 480;
const SKILLS_FOCUS_GLOBE_Z = 481;
const SKILLS_FOCUS_HINT_Z = 482;

const WELCOME_HEIGHT_GUESS = 380;

function getWindowTitle(id) {
  switch (id) {
    case "welcome":
      return "welcome.exe";
    case "me":
      return "me.txt";
    case "contact":
      return "contact.msg";
    case "otherStuff":
      return otherStuff.windowTitle;
    case "otherProjects":
      return otherProjects.windowTitle;
    case "coffee-snake":
      return "coffee_snake.exe";
    default: {
      const m = /^proj-(\d+)$/.exec(id);
      if (m) {
        const idx = Number(m[1]) - 1;
        return featuredProjects[idx]?.title ?? id;
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

/** Viewport-aware sizes; positions are fixed zones (center welcome, grouped project row). */
function getDesktopLayout(vw, vh) {
  const nProj = featuredProjects.length;
  const edge = 12;
  const g = 10;
  const layoutScale = Math.min(1, vw / LAYOUT_REF_W);
  const u = clamp((vw - 880) / 420, 0.66, 1);

  const W0 = {
    welcome: Math.round(clamp(380, 540, 400 + 130 * u)),
    me: Math.round(clamp(208, 288, 218 + 70 * u)),
    /** Floating skills globe footprint (top-right, no window chrome). */
    skills: Math.round(clamp(440, 520, 470 + 50 * u)),
    otherStuff: Math.round(clamp(340, 520, 420 + 32 * u)),
    otherProjects: Math.round(clamp(460, 620, 520 + 40 * u)),
    contact: Math.round(clamp(248, 298, 260 + 28 * u)),
  };

  let W = {
    welcome: Math.round(W0.welcome * layoutScale),
    me: Math.round(W0.me * layoutScale),
    skills: Math.max(400, Math.round(W0.skills * layoutScale)),
    otherStuff: Math.round(W0.otherStuff * layoutScale),
    otherProjects: Math.round(W0.otherProjects * layoutScale),
    contact: Math.round(W0.contact * layoutScale),
  };

  const skillsLeft = Math.max(edge, vw - W.skills - edge - RIGHT_RESERVE);
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
  let projectCards = getProjectDesktopCards(featuredProjects, layoutScale);

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

const DESKTOP_PROJECT_SLOTS = featuredProjects.map((_, projectIndex) => ({
  slot: `projSlot${projectIndex}`,
  projectIndex,
  delay: 0.4 + projectIndex * 0.15,
  zBase: 14 + projectIndex,
}));

const PROJECT_GRADIENTS = PROJECT_CARD_GRADIENTS;

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
  const [otherProjectsOpen, setOtherProjectsOpen] = useState(false);
  const [coffeeSnakeOpen, setCoffeeSnakeOpen] = useState(false);
  const [vaultBreachOpen, setVaultBreachOpen] = useState(false);
  const [skillsFocused, setSkillsFocused] = useState(false);
  const skillsFocusedRef = useRef(false);
  skillsFocusedRef.current = skillsFocused;
  const [skillsHovered, setSkillsHovered] = useState(false);
  const skillsPointerRef = useRef(null);
  const [minimizedIds, setMinimizedIds] = useState([]);
  const welcomeDoneTimerRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [iconOffsets, setIconOffsets] = useState(() => ({}));
  const { toastOpen, dismissToast } = useVaultKeyState();

  const openSkillsFocus = useCallback(() => {
    setSkillsFocused(true);
    playClick();
  }, []);

  const closeSkillsFocus = useCallback(() => {
    setSkillsFocused(false);
    setSkillsHovered(false);
    playClick();
  }, []);

  useEffect(() => {
    if (!skillsFocused) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape" && e.code !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      closeSkillsFocus();
    };
    // Capture so window/ESC handlers deeper in the tree don't swallow it.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [skillsFocused, closeSkillsFocus]);

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
    // Don't let title-bar focus punch windows through the zoomed globe overlay.
    if (skillsFocusedRef.current) return;
    setTopZ((z) => {
      const next = z + 1;
      setZMap((m) => ({ ...m, [id]: next }));
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    if (coffeeSnakeOpen) bringToFront("coffee-snake");
  }, [coffeeSnakeOpen, bringToFront]);

  const openVaultFromKeyhole = useCallback(() => {
    if (vaultBreachOpen || coffeeSnakeOpen) return;
    setVaultBreachOpen(true);
  }, [vaultBreachOpen, coffeeSnakeOpen]);

  const finishVaultBreach = useCallback(() => {
    setVaultBreachOpen(false);
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
    if (skillsFocused) return;
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
  }, [viewport, phase, skillsFocused]);

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

  const otherProjectsWindowLeft = Math.max(
    12,
    Math.round((vwSafe - W.otherProjects) / 2)
  );
  const otherProjectsWindowTop = Math.max(
    12,
    pos.otherProjects?.top ??
      Math.round((vhSafe - Math.round(420 * layoutScale)) / 2)
  );

  useLayoutEffect(() => {
    if (phase !== "dashboard") return;
    writeIconOffset("otherStuffIcon", { dx: 0, dy: 0 });
    writeIconOffset("otherProjectsIcon", { dx: 0, dy: 0 });
  }, [phase, pos.folderIconRowTop]);

  useEffect(() => {
    if (!otherStuffOpen) setOtherStuffBrowsing(false);
  }, [otherStuffOpen]);

  if (!viewport) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0604",
        }}
        aria-busy="true"
        aria-label="Loading desktop"
      >
        <p
          style={{
            fontFamily: "'VT323', monospace",
            color: "#FF7A29",
            letterSpacing: "0.2em",
            fontSize: 14,
          }}
        >
          LOADING JS-OS...
        </p>
      </div>
    );
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
    skills: 9,
    otherStuff: 9,
    otherStuffIcon: 7,
    otherProjects: 9,
    otherProjectsIcon: 7,
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
    otherProjects: { x: -px * depth.otherProjects, y: -py * depth.otherProjects * yz },
    otherProjectsIcon: {
      x: -px * depth.otherProjectsIcon,
      y: -py * depth.otherProjectsIcon * yz,
    },
    contact: { x: -px * depth.contact, y: -py * depth.contact * yz },
  };

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

  const skillsExpandedBox = skillsFocused
    ? desktopSkillsExpandedBox(vwSafe, vhSafe)
    : null;
  const skillsFloatW = skillsExpandedBox ? skillsExpandedBox.boxW : W.skills;
  const skillsFloatLeft = skillsFocused
    ? Math.round((vwSafe - skillsFloatW) / 2)
    : Math.round(vwSafe - skillsFloatW - pos.skills.right);
  const skillsFloatTop = skillsFocused
    ? Math.round((vhSafe - skillsExpandedBox.boxH) / 2)
    : pos.skills.top;

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

      {/* WELCOME! intro card, types in, holds, then flies into welcome.exe slot */}
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
          interactive={!skillsFocused}
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
            onVaultUnlock={openVaultFromKeyhole}
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
          interactive={!skillsFocused}
          minimized={isMinimized("me")}
          onMinimize={() => minimizeWindow("me")}
          dragConstraints={stageRef}
          parallaxShift={pShift.me}
          uiScale={layoutScale}
        >
          <MeTxtBody frameWidth={W.me} layoutScale={layoutScale} />
        </Window>
      )}

      {showOtherWindows && (
        <>
          <AnimatePresence>
            {skillsFocused ? (
              <motion.button
                key="skills-focus-backdrop"
                type="button"
                aria-label="Dismiss skills globe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                onClick={closeSkillsFocus}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: SKILLS_FOCUS_BACKDROP_Z,
                  margin: 0,
                  padding: 0,
                  border: "none",
                  cursor: "default",
                  // Soft vignette only, avoid a boxed modal plate behind the globe.
                  background:
                    "radial-gradient(ellipse at center, rgba(6, 4, 3, 0.18) 0%, rgba(6, 4, 3, 0.55) 55%, rgba(6, 4, 3, 0.72) 100%)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              />
            ) : null}
          </AnimatePresence>

          {skillsFocused ? (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                bottom: 28,
                transform: "translateX(-50%)",
                zIndex: SKILLS_FOCUS_HINT_Z,
                pointerEvents: "none",
                fontFamily: "'VT323', monospace",
                fontSize: 14,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(255, 180, 112, 0.72)",
                textShadow: "0 0 8px rgba(255, 122, 41, 0.35)",
              }}
            >
              esc to close
            </div>
          ) : null}

          <motion.div
            aria-label={
              skillsFocused
                ? "Skills globe expanded. Press Escape to close."
                : "Skills globe. Click to expand."
            }
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{
              opacity: 1,
              scale: skillsFocused ? 1 : skillsHovered ? 1.03 : 1,
              left: skillsFloatLeft,
              top: skillsFloatTop,
              x: skillsFocused ? 0 : pShift.skills.x,
              y: skillsFocused ? 0 : pShift.skills.y,
            }}
            transition={{ duration: 0.4, ease: EASE }}
            onHoverStart={() => {
              if (!skillsFocused) setSkillsHovered(true);
            }}
            onHoverEnd={() => setSkillsHovered(false)}
            onPointerDown={(e) => {
              skillsPointerRef.current = { x: e.clientX, y: e.clientY };
            }}
            onClickCapture={(e) => {
              if (skillsFocused) return;
              // Don't steal the SF vault pin, let it collect before expand.
              if (
                e.target instanceof Element &&
                e.target.closest(".globe-surface-pin")
              ) {
                return;
              }
              const origin = skillsPointerRef.current;
              if (
                origin &&
                Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > 10
              ) {
                return;
              }
              openSkillsFocus();
            }}
            style={{
              position: "absolute",
              width: skillsFloatW,
              zIndex: skillsFocused ? SKILLS_FOCUS_GLOBE_Z : 8,
              pointerEvents: "auto",
              overflow: "visible",
              cursor: skillsFocused ? "default" : "pointer",
              // No rectangular container chrome, glow lives on the globe rim.
              background: "transparent",
              boxShadow: "none",
              transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <SkillsPlanet
              variant="desktop"
              expanded={skillsFocused}
              glow={skillsFocused ? "none" : skillsHovered ? "hover" : "idle"}
              viewportWidth={vwSafe}
              viewportHeight={vhSafe}
            />
          </motion.div>
        </>
      )}

      {showOtherWindows &&
        DESKTOP_PROJECT_SLOTS.map(({ slot, projectIndex, zBase }) => {
          const p = featuredProjects[projectIndex];
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
              interactive={!skillsFocused}
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
          key={`other-stuff-${pos.folderIconRowTop}`}
          label={otherStuff.label}
          iconSrc={otherStuff.icon}
          left={pos.otherStuffIcon.left}
          top={pos.otherStuffIcon.top}
          width={pos.otherStuffIcon.width}
          height={pos.otherStuffIcon.height}
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
          interactive={!skillsFocused}
        />
      )}

      {showOtherWindows && (
        <DesktopFolderIcon
          key={`other-projects-${pos.folderIconRowTop}`}
          label={otherProjects.label}
          iconSrc={otherProjects.icon}
          iconId="otherProjectsIcon"
          left={pos.otherProjectsIcon.left}
          top={pos.otherProjectsIcon.top}
          width={pos.otherProjectsIcon.width}
          height={pos.otherProjectsIcon.height}
          delay={cascadeDelay(2.12)}
          zIndex={zOf("otherProjectsIcon", 15)}
          stageRef={stageRef}
          onFocus={() => bringToFront("otherProjectsIcon")}
          onOffsetChange={(offset) => handleIconOffset("otherProjectsIcon", offset)}
          onOpen={() => {
            bringToFront("otherProjects");
            setOtherProjectsOpen(true);
          }}
          parallaxShift={pShift.otherProjectsIcon}
          selected={otherProjectsOpen}
          interactive={!skillsFocused}
        />
      )}

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
          interactive={!skillsFocused}
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

      {showOtherWindows && otherProjectsOpen && (
        <Window
          id="otherProjects"
          title={otherProjects.windowTitle}
          titleUppercase={false}
          left={otherProjectsWindowLeft}
          top={otherProjectsWindowTop}
          width={W.otherProjects}
          delay={0}
          zIndex={zOf("otherProjects", 22)}
          onFocus={bringToFront}
          interactive={!skillsFocused}
          minimized={isMinimized("otherProjects")}
          onMinimize={() => minimizeWindow("otherProjects")}
          dragConstraints={stageRef}
          parallaxShift={pShift.otherProjects}
          uiScale={layoutScale}
        >
          <OtherProjectsFolder variant="desktop" layoutScale={layoutScale} />
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
        interactive={!skillsFocused}
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
            ▢ Say hi
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
      <MobileVaultToast open={toastOpen} onDone={dismissToast} />
      <DesktopVaultBreachOverlay
        open={vaultBreachOpen}
        onComplete={finishVaultBreach}
      />
      {coffeeSnakeOpen && showOtherWindows ? (
        <Window
          id="coffee-snake"
          title="coffee_snake.exe"
          left={Math.max(12, Math.round(vw / 2 - 210))}
          top={Math.max(12, Math.round(vh / 2 - 230))}
          width={420}
          height={438}
          zIndex={zOf("coffee-snake", SKILLS_FOCUS_HINT_Z + 20)}
          onFocus={bringToFront}
          interactive
          onMinimize={() => setCoffeeSnakeOpen(false)}
          dragConstraints={stageRef}
          uiScale={layoutScale}
          clipContent
        >
          <CoffeeSnakeGame
            variant="desktop"
            onQuit={() => setCoffeeSnakeOpen(false)}
          />
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

function WelcomeIntroMorph({ phase, typed, targetOffset }) {
  // Single element that lives through all three intro phases. Always rendered
  // via a flex-centered wrapper so it starts at viewport center, and animates
  // to its target via transform-only (x, y, scale), never reflows.
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
  const bioSize = isDesktop ? Math.max(13, Math.round(15 * s)) : 14;
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
        {about.bioDesktop ?? about.bio}
      </p>
    </div>
  );
}

function WelcomeBody({
  layoutScale = 1,
  skipTyping = false,
  onTypingComplete,
  onVaultUnlock,
}) {
  const s = layoutScale;
  const px = Math.round;
  const mono = px(16 * s);
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
        position: "relative",
        padding: `${px(20 * s)}px ${px(22 * s)}px ${px(22 * s)}px`,
      }}
    >
      <MobileVaultKeyhole onUnlock={onVaultUnlock} />
      <TypedLine
        text="▢ Hello, my name is…"
        charMs={42}
        delay={160}
        skipTyping={skipTyping}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: mono,
          letterSpacing: "0.24em",
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
        delay={1080}
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
        delay={2100}
        skipTyping={skipTyping}
        onComplete={skipTyping ? undefined : handleLinesComplete}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: mono,
          letterSpacing: "0.32em",
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
              letterSpacing: "0.28em",
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


function NomineeTab() {
  return (
    <a
      href="https://linkedin.com/in/jasonixd"
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="hover"
      title="LinkedIn · Jason Saputra"
      aria-label="Open Jason Saputra on LinkedIn"
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
      J.S. · Let's connect
    </a>
  );
}

