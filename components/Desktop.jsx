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
import DesktopIdleLayer from "./DesktopIdleLayer";
import SkillsPlanet, { desktopGlobeBox } from "./SkillsPlanet";
import ProjectHoverPeek from "./ProjectHoverPeek";
import { carouselProjects, desktopFeaturedProjects } from "@/data/projects";
import ProjectDockCarousel from "@/components/ProjectDockCarousel";
import { about } from "@/data/about";
import WelcomeReadAloud from "@/components/WelcomeReadAloud";
import DesktopFolderIcon from "@/components/DesktopFolderIcon";
import OtherStuffFolder from "@/components/OtherStuffFolder";
import OtherProjectsFolder from "@/components/OtherProjectsFolder";
import ProjectFlipCard, {
  PROJECT_CARD_GRADIENTS,
} from "@/components/ProjectFlipCard";
import { otherStuff } from "@/data/otherStuff";
import { otherProjects } from "@/data/otherProjects";
import {
  DESKTOP_FOLDER_ICON_W,
  getDeterministicDesktopPositions,
  identityWindowHeight,
  LEFT_COLUMN_INSET,
  PROJECT_DOCK_H,
  PROJECT_GRID_LEFT_GAP,
  PROJECT_WINDOW_GAP,
  RIGHT_RESERVE,
  STATUS_BAR_RESERVE,
} from "@/lib/desktopWindowPlacement";
import {
  fitProjectCardsToBounds,
  getProjectDesktopCards,
} from "@/lib/projectDesktopCards";
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
  playWindowClose,
  playWindowRestore,
  notePointerHover,
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

function isPointerOverFeaturedWindow(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!(el instanceof Element)) return false;
  return Boolean(el.closest(".os-window--featured"));
}

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
        return desktopFeaturedProjects[idx]?.title ?? id;
      }
      return id;
    }
  }
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/** Reference width: at vw >= this, sizes match the original desktop design (scale 1). */
const LAYOUT_REF_W = 1280;

/** Viewport-aware sizes; positions are fixed zones (center welcome, grouped project row). */
function getDesktopLayout(vw, vh) {
  const nProj = desktopFeaturedProjects.length;
  const edge = 12;
  const g = 10;
  const layoutScale = Math.min(1, vw / LAYOUT_REF_W);
  const u = clamp((vw - 880) / 420, 0.66, 1);

  const W0 = {
    welcome: Math.round(clamp(380, 540, 400 + 130 * u)),
    me: Math.round(clamp(208, 288, 218 + 70 * u)),
    otherStuff: Math.round(clamp(340, 520, 420 + 32 * u)),
    otherProjects: Math.round(clamp(460, 620, 520 + 40 * u)),
    contact: Math.round(clamp(248, 298, 260 + 28 * u)),
  };

  let W = {
    welcome: Math.round(W0.welcome * layoutScale),
    me: Math.round(W0.me * layoutScale),
    otherStuff: Math.round(W0.otherStuff * layoutScale),
    otherProjects: Math.round(W0.otherProjects * layoutScale),
    contact: Math.round(W0.contact * layoutScale),
  };

  const topBand = vh * 0.034;

  const maxCluster = Math.max(220, vw - 2 * edge - RIGHT_RESERVE);
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
  const leftColumnInset = Math.round(LEFT_COLUMN_INSET * layoutScale);
  const projectLeftGap = Math.max(
    20,
    Math.round(PROJECT_GRID_LEFT_GAP * layoutScale)
  );
  let projectCards = getProjectDesktopCards(desktopFeaturedProjects, layoutScale);

  const gridMinLeft = edge + leftColumnInset + W.me + projectLeftGap;
  const gridMaxRight = vw - edge - RIGHT_RESERVE;
  // Heroes sit in the mid band under the identity windows, so they can use
  // the full stage width instead of squeezing past me.txt.
  const maxGridW = Math.max(0, vw - 2 * edge - RIGHT_RESERVE);
  const identityH = identityWindowHeight(layoutScale);
  const maxGridH = Math.max(
    0,
    vh -
      STATUS_BAR_RESERVE -
      PROJECT_DOCK_H -
      identityH -
      topBand -
      12
  );
  projectCards = fitProjectCardsToBounds(projectCards, layoutScale, {
    maxGridW,
    maxGridH,
    projectGap,
  });

  // Same width as rendered `contact.msg`; required for accurate non-overlap packing.
  W.contact = W.me;

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
    gridMinLeft,
    gridMaxRight,
  });

  return { W, pos, projectCards, layoutScale };
}

const DESKTOP_PROJECT_SLOTS = desktopFeaturedProjects.map((_, projectIndex) => ({
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
  const [peekDismissEpoch, setPeekDismissEpoch] = useState(0);
  const [featuredHoverGated, setFeaturedHoverGated] = useState(false);
  const featuredHoverGatedRef = useRef(false);
  const featuredPointerInitRef = useRef(false);
  const [minimizedIds, setMinimizedIds] = useState([]);
  const welcomeDoneTimerRef = useRef(null);
  const [iconOffsets, setIconOffsets] = useState(() => ({}));
  const { toastOpen, dismissToast } = useVaultKeyState();

  useEffect(() => {
    const dismissPeek = () => setPeekDismissEpoch((n) => n + 1);
    window.addEventListener("blur", dismissPeek);
    document.documentElement.addEventListener("mouseleave", dismissPeek);
    return () => {
      window.removeEventListener("blur", dismissPeek);
      document.documentElement.removeEventListener("mouseleave", dismissPeek);
    };
  }, []);

  // If the cursor is already over a hero window on first paint, hold zoom until
  // they leave and hover again. Otherwise :hover zoom is immediate.
  useEffect(() => {
    if (phase !== "dashboard") {
      featuredPointerInitRef.current = false;
      featuredHoverGatedRef.current = false;
      setFeaturedHoverGated(false);
      return undefined;
    }
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(pointer: coarse)").matches) return undefined;

    const sample = (x, y) => {
      const overFeatured = isPointerOverFeaturedWindow(x, y);
      if (!featuredPointerInitRef.current) {
        featuredPointerInitRef.current = true;
        if (overFeatured) {
          featuredHoverGatedRef.current = true;
          setFeaturedHoverGated(true);
        }
        return;
      }
      if (featuredHoverGatedRef.current && !overFeatured) {
        featuredHoverGatedRef.current = false;
        setFeaturedHoverGated(false);
      }
    };

    const onPointerSample = (e) => sample(e.clientX, e.clientY);

    window.addEventListener("pointermove", onPointerSample, { passive: true });
    window.addEventListener("pointerover", onPointerSample, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerSample);
      window.removeEventListener("pointerover", onPointerSample);
    };
  }, [phase]);

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

  const toggleFolderWindow = useCallback(
    (windowId, isOpen, setOpen) => {
      if (!isOpen) {
        setOpen(true);
        bringToFront(windowId);
        return;
      }
      if (minimizedIds.includes(windowId)) {
        restoreWindow(windowId);
        bringToFront(windowId);
        return;
      }
      setOpen(false);
      playWindowClose();
    },
    [bringToFront, minimizedIds, restoreWindow]
  );

  const isMinimized = useCallback(
    (id) => minimizedIds.includes(id),
    [minimizedIds]
  );

  const zOf = (id, base) => zMap[id] ?? base;

  const featuredFocusSlugs = useMemo(
    () => new Set(desktopFeaturedProjects.map((p) => p.slug)),
    []
  );

  useEffect(() => {
    if (!viewport || viewport.w < 900 || phase !== "dashboard") return;
    const el = stageRef.current;
    if (!el) return;

    // CSS-var parallax: update the stage without re-rendering every window.
    el.style.setProperty("--desk-px", "0");
    el.style.setProperty("--desk-py", "0");

    let raf = 0;
    let lastX = 0;
    let lastY = 0;
    let pendingX = 0;
    let pendingY = 0;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      pendingX = Math.max(
        -1,
        Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2)
      );
      pendingY = Math.max(
        -1,
        Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2)
      );

      if (Math.abs(pendingX - lastX) < 0.028 && Math.abs(pendingY - lastY) < 0.028) {
        return;
      }

      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        lastX = pendingX;
        lastY = pendingY;
        el.style.setProperty("--desk-px", String(pendingX));
        el.style.setProperty("--desk-py", String(pendingY));
      });
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
      el.style.setProperty("--desk-px", "0");
      el.style.setProperty("--desk-py", "0");
    };
  }, [viewport, phase]);

  const vwSafe = viewport?.w ?? 1280;
  const vhSafe = viewport?.h ?? 800;

  const { W, pos, projectCards, layoutScale } = useMemo(
    () => getDesktopLayout(vwSafe, vhSafe),
    [vwSafe, vhSafe]
  );
  const identityH = identityWindowHeight(layoutScale);

  const otherStuffWindowWidth = otherStuffBrowsing
    ? Math.round(W.otherStuff * 1.55)
    : W.otherStuff;

  const otherStuffWindowTop = Math.max(
    12,
    otherStuffBrowsing
      ? Math.round(vhSafe * 0.05)
      : pos.otherStuff?.top ??
          Math.round((vhSafe - Math.round(360 * layoutScale)) / 2)
  );
  const otherStuffMaxBodyHeight = Math.max(
    240,
    vhSafe - otherStuffWindowTop - Math.round(56 * layoutScale)
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

  // Parallax depth (px). Actual shift is applied via --desk-px / --desk-py CSS vars.
  const depth = {
    welcome: 4,
    me: 4,
    proj: 5,
    skills: 4,
    otherStuff: 4,
    otherStuffIcon: 3,
    otherProjects: 4,
    otherProjectsIcon: 3,
    contact: 4,
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

  const globeBox = desktopGlobeBox();
  const skillsFloatW = Math.min(
    globeBox.boxW,
    Math.max(280, vwSafe - 40)
  );
  const skillsFloatH = globeBox.boxH * (skillsFloatW / globeBox.boxW);
  const skillsFloatLeft = Math.round((vwSafe - skillsFloatW) / 2);
  const skillsFloatTop = Math.round((vhSafe - skillsFloatH) / 2);

  const crtFrameInset = 10;
  const contactBannerW = Math.round(clamp(184 * layoutScale, 168, 200));
  const welcomeRight = pos.welcome.left + W.welcome;
  const canvasRight = vw - crtFrameInset;
  const contactGap = canvasRight - welcomeRight;
  const contactBannerLeft = Math.round(
    welcomeRight + (contactGap - contactBannerW) / 2
  );

  const folderGalleryOpen =
    (otherStuffOpen && !isMinimized("otherStuff")) ||
    (otherProjectsOpen && !isMinimized("otherProjects"));
  const blockFeaturedZoom = featuredHoverGated || folderGalleryOpen;

  return (
    <div
      ref={stageRef}
      className={[
        "relative w-full desktop-stage",
        blockFeaturedZoom ? "desktop-stage--featured-hover-gated" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ height: "100%", overflow: "hidden" }}
    >
      {showOtherWindows ? (
        <div className="desktop-project-focus-scrim" aria-hidden />
      ) : null}

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
                pos.welcome.top + identityH / 2 - vh / 2,
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
          height={identityH}
          delay={0}
          playOpenSound={false}
          zIndex={zOf("welcome", 12)}
          onFocus={bringToFront}
          interactive
          minimized={isMinimized("welcome")}
          onMinimize={() => minimizeWindow("welcome")}
          dragConstraints={stageRef}
          parallaxDepth={depth.welcome}
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
          height={identityH}
          delay={cascadeDelay(0.45)}
          zIndex={zOf("me", 13)}
          onFocus={bringToFront}
          interactive
          minimized={isMinimized("me")}
          onMinimize={() => minimizeWindow("me")}
          dragConstraints={stageRef}
          parallaxDepth={depth.me}
          uiScale={layoutScale}
          clipContent={false}
        >
          <MeTxtBody
            frameWidth={W.me}
            frameHeight={identityH}
            layoutScale={layoutScale}
          />
        </Window>
      )}

      {showOtherWindows && (
        <motion.div
          aria-label="Decorative globe. Drag to rotate."
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{
            opacity: 1,
            scale: 1,
            left: skillsFloatLeft,
            top: skillsFloatTop,
          }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{
            position: "absolute",
            width: skillsFloatW,
            zIndex: 5,
            pointerEvents: "none",
            overflow: "visible",
            background: "transparent",
            boxShadow: "none",
          }}
        >
          <div
            style={{
              transform: `translate3d(calc(var(--desk-px, 0) * ${-depth.skills} * 1px), calc(var(--desk-py, 0) * ${-depth.skills * 0.78} * 1px), 0)`,
            }}
          >
            <SkillsPlanet variant="desktop" showGlobe orbitActive={false} />
          </div>
        </motion.div>
      )}

      {showOtherWindows &&
        DESKTOP_PROJECT_SLOTS.map(({ slot, projectIndex, zBase }) => {
          const p = desktopFeaturedProjects[projectIndex];
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
              interactive
              minimized={isMinimized(id)}
              onMinimize={() => minimizeWindow(id)}
              dragConstraints={stageRef}
              parallaxDepth={depth.proj}
              uiScale={layoutScale}
              clipContent={false}
              growOnHover
              featuredProject
              dataProjectSlug={p.slug}
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
                hoverScale={false}
                motionPreview
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
          onOpen={() =>
            toggleFolderWindow("otherStuff", otherStuffOpen, setOtherStuffOpen)
          }
          windowOpen={otherStuffOpen}
          windowMinimized={isMinimized("otherStuff")}
          parallaxDepth={depth.otherStuffIcon}
          selected={otherStuffOpen}
          interactive
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
          onOpen={() =>
            toggleFolderWindow(
              "otherProjects",
              otherProjectsOpen,
              setOtherProjectsOpen
            )
          }
          windowOpen={otherProjectsOpen}
          windowMinimized={isMinimized("otherProjects")}
          parallaxDepth={depth.otherProjectsIcon}
          selected={otherProjectsOpen}
          interactive
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
          interactive
          onMinimize={() => setOtherStuffOpen(false)}
          dragConstraints={stageRef}
          parallaxDepth={depth.otherStuff}
          uiScale={layoutScale}
        >
          <OtherStuffFolder
            variant="desktop"
            layoutScale={layoutScale}
            onBrowseChange={setOtherStuffBrowsing}
            maxBodyHeight={otherStuffMaxBodyHeight}
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
          interactive
          onMinimize={() => setOtherProjectsOpen(false)}
          dragConstraints={stageRef}
          parallaxDepth={depth.otherProjects}
          uiScale={layoutScale}
        >
          <OtherProjectsFolder variant="desktop" layoutScale={layoutScale} />
        </Window>
      )}

      {showOtherWindows ? (
        <ContactPorts left={contactBannerLeft} width={contactBannerW} />
      ) : null}
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
      {showOtherWindows ? (
        <ProjectDockCarousel
          leftInset={
            pos.otherProjectsIcon.left + pos.otherProjectsIcon.width + 12
          }
          layoutScale={layoutScale}
        />
      ) : null}
      {showOtherWindows ? (
        <ProjectHoverPeek
          projects={[...desktopFeaturedProjects, ...carouselProjects]}
          enabled={phase === "dashboard"}
          layoutScale={layoutScale}
          focusSlugs={featuredFocusSlugs}
          dismissEpoch={peekDismissEpoch}
        />
      ) : null}
      <StatusBar />
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

function MeTxtBody({ frameWidth, frameHeight, layoutScale = 1 }) {
  const s = layoutScale;
  const inset = Math.max(18, Math.round(26 * s));
  const isDesktop = frameWidth != null;
  const titleBar = Math.max(26, Math.round(28 * s));
  const padY = Math.round(12 * s) + Math.round(14 * s);
  const captionH = Math.round(28 * s);
  const maxPortrait =
    frameHeight != null
      ? Math.max(96, frameHeight - titleBar - padY - captionH)
      : Math.round(200 * s);
  const inner =
    frameWidth != null
      ? Math.max(
          Math.round(118 * s),
          Math.min(maxPortrait, frameWidth - inset)
        )
      : null;
  const box =
    inner != null
      ? { width: `${inner}px`, height: `${inner}px` }
      : { width: "min(220px, 72vw)", height: "min(220px, 72vw)" };
  const bioSize = isDesktop ? Math.max(13, Math.round(15 * s)) : 14;
  const bioPad = isDesktop ? Math.round(10 * s) : 12;

  return (
    <div
      className="me-txt-body"
      style={{
        padding: `${Math.round(12 * s)}px ${Math.round(10 * s)}px ${Math.round(14 * s)}px`,
      }}
    >
      <div className="me-txt-portrait-wrap" style={{ overflow: "visible" }}>
        <div
          style={{
            ...box,
            margin: "0 auto",
            lineHeight: 0,
            position: "relative",
            overflow: "visible",
            zIndex: 2,
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
            margin: `${Math.round(8 * s)}px 0 0`,
            flexShrink: 0,
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
      <div className="me-txt-drawer">
        <div className="me-txt-drawer__panel">
          <p
            style={{
              margin: 0,
              padding: `${bioPad}px ${Math.round(12 * s)}px ${Math.round(12 * s)}px`,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: bioSize,
              lineHeight: 1.6,
              color: "rgba(255, 255, 255, 0.92)",
              textAlign: "left",
            }}
          >
            {about.bioDesktop ?? about.bio}
          </p>
        </div>
      </div>
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
        boxSizing: "border-box",
        height: "100%",
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
        text={about.title}
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
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: Math.max(12, px(14 * s)),
              lineHeight: 1.5,
              color: "rgba(255, 226, 200, 0.88)",
              margin: `${px(14 * s)}px 0 0`,
              maxWidth: "36em",
            }}
          >
            {about.lede}
          </p>
        </FadeInLine>
      ) : null}
    </div>
  );
}


function ContactPorts({ left, width }) {
  const reduceMotion = useReducedMotion();
  const [hotId, setHotId] = useState(null);
  const ports = [
    {
      id: "mail",
      plate: about.email,
      icon: "/images/Icons/mail.png",
      href: `mailto:${about.email}`,
      aria: `Email ${about.email}`,
    },
    {
      id: "li",
      plate: "/in/jasonixd",
      icon: "/images/Icons/linkedin.png",
      href: about.socials.linkedin,
      external: true,
      aria: "Jason Saputra on LinkedIn",
    },
    {
      id: "ig",
      plate: "@jason.iv_s",
      icon: "/images/Icons/instagram.png",
      href: about.socials.instagram,
      external: true,
      aria: "Jason Saputra on Instagram",
    },
  ];
  const hot = ports.find((port) => port.id === hotId) ?? null;

  return (
    <nav
      className={`contact-banner${hot ? " is-hot" : ""}`}
      aria-label="Contact"
      style={{ left, width }}
      onMouseLeave={() => setHotId(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHotId(null);
      }}
    >
      <div className="contact-banner__icons">
        {ports.map((port) => (
          <a
            key={port.id}
            className={`contact-banner__icon${hotId === port.id ? " is-hot" : ""}`}
            href={port.href}
            target={port.external ? "_blank" : undefined}
            rel={port.external ? "noopener noreferrer" : undefined}
            data-cursor="hover"
            aria-label={port.aria}
            title={port.plate}
            onPointerDown={playClick}
            onMouseEnter={(e) => {
              notePointerHover(e.currentTarget);
              setHotId(port.id);
            }}
            onFocus={() => setHotId(port.id)}
          >
            <span className="contact-banner__led" aria-hidden="true" />
            <Image
              src={port.icon}
              alt=""
              width={40}
              height={40}
              className="contact-banner__glyph"
            />
          </a>
        ))}
      </div>
      <div className="contact-banner__readout">
        <div className="contact-banner__readout-inner">
          <AnimatePresence mode="wait" initial={false}>
            {hot ? (
              <motion.span
                key={hot.id}
                className="contact-banner__text"
                initial={reduceMotion ? false : { opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 3 }}
                transition={{ duration: reduceMotion ? 0 : 0.14 }}
              >
                {hot.plate}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

