"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { playClick } from "@/lib/typingSound";
import {
  collectVaultKey,
  hasVaultKey,
  subscribeVaultKey,
} from "@/lib/mobileVaultKey";
import { skills } from "@/data/about";
import InteractiveAsciiGlobe, {
  SF_VAULT_KEY,
} from "./InteractiveAsciiGlobe";

const ACCENT = "#FF7A29";
/** Foreshortening of the orbit (0 = edge-on, 1 = flat circle). */
const ELLIPSE_Y_RATIO = 0.34;
const ORBIT_PERIOD_MS = 42000;
const GLOBE_Z = 3;

const SIZE = {
  mobile: {
    disc: 286,
    orbitExtra: 68,
    padX: 56,
    padY: 48,
    labelFont: 11,
    homeFont: 22,
    globeRows: 28,
    lowPower: true,
  },
  desktop: {
    disc: 500,
    orbitExtra: 0,
    padX: 16,
    padY: 16,
    labelFont: 12,
    homeFont: 18,
    globeRows: 30,
    lowPower: false,
  },
};

function sizeFromAnchor(px) {
  const disc = Math.max(96, Math.round(px));
  return {
    disc,
    orbitExtra: Math.round(disc * 0.08),
    padX: Math.round(disc * 0.92),
    padY: Math.round(disc * 0.68),
    labelFont: Math.max(11, Math.min(13, Math.round(disc * 0.068))),
    labelPadX: 12,
    labelPadY: 8,
    homeFont: 18,
    globeRows: 8,
    lowPower: true,
  };
}

/** Screen-filling desktop size from the stage viewport. */
function sizeForFullscreen(vw, vh) {
  const availW = Math.max(320, vw - 32);
  const availH = Math.max(320, vh - 64);
  const padX = Math.round(Math.min(48, availW * 0.03));
  const padY = Math.round(Math.min(36, availH * 0.025));
  const orbitRatio = 0.3;
  // boxW ≈ disc * (1 + 2 * orbitRatio) + padX
  // boxH ≈ disc * 1.32 + padY (disc + foreshortened orbit clearance)
  const disc = Math.max(
    280,
    Math.floor(
      Math.min(
        (availW - padX) / (1 + 2 * orbitRatio),
        (availH - padY) / 1.32
      )
    )
  );
  return {
    disc,
    orbitExtra: Math.round(disc * orbitRatio),
    padX,
    padY,
    labelFont: Math.max(12, Math.min(16, Math.round(disc * 0.036))),
    homeFont: 20,
    // Match idle desktop row count, scaling type is cheaper than remeshing.
    globeRows: SIZE.desktop.globeRows,
    lowPower: false,
  };
}

function globeBoxFromSize(size) {
  const discR = size.disc / 2;
  const orbitR = discR + size.orbitExtra;
  const boxW = Math.ceil(orbitR * 2) + size.padX;
  const boxH =
    Math.ceil(Math.max(discR * 2, orbitR * ELLIPSE_Y_RATIO * 2) + discR * 0.35) +
    size.padY;
  return { boxW, boxH, size };
}

/** Layout box for the idle desktop globe (centered decorative planet). */
export function desktopGlobeBox() {
  return globeBoxFromSize(SIZE.desktop);
}

/** Layout box for a skill orbit sized to a portrait (or other) disc. */
export function portraitOrbitBox(anchorSize) {
  return globeBoxFromSize(sizeFromAnchor(anchorSize));
}

/** Layout box for the screen-filling expanded globe (keeps blur margins clickable). */
export function desktopSkillsExpandedBox(vw, vh) {
  return globeBoxFromSize(sizeForFullscreen(vw, vh));
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

/**
 * Project a unit orbit angle onto a tilted ellipse.
 * θ = 0 → right; θ = π/2 → front (closest, bottom of ellipse).
 * depth ∈ [-1, 1] where +1 is in front of the globe.
 */
function projectOrbit(θ, cx, cy, rx, ry) {
  const cos = Math.cos(θ);
  const sin = Math.sin(θ);
  return {
    x: cx + cos * rx,
    y: cy + sin * ry,
    depth: sin,
  };
}

function rimPoint(θ, cx, cy, discR, ryRatio) {
  const cos = Math.cos(θ);
  const sin = Math.sin(θ);
  return {
    x: cx + cos * discR,
    y: cy + sin * discR * Math.max(0.55, ryRatio + 0.25),
  };
}

/**
 * ASCII globe with a tilted elliptical skill orbit.
 * Mobile: scroll-revealed constellation around the globe.
 * Desktop: globe is decorative; skill orbit attaches to me.txt.
 */
export default function SkillsPlanet({
  variant = "desktop",
  scrollRootSelector,
  expanded = false,
  /** Desktop: skill chips orbit when true. Mobile uses scroll reveal. */
  orbitActive = false,
  /** When false, only the orbit layer renders (portrait attach). */
  showGlobe = true,
  /** Portrait (or other) disc in px. Drives a tight orbit around that anchor. */
  anchorSize = null,
  /** idle | hover | focus, circumferential rim glow (desktop). */
  glow = "idle",
  viewportWidth,
  viewportHeight,
}) {
  const isMobile = variant === "mobile";
  const size = useMemo(() => {
    if (Number.isFinite(anchorSize) && anchorSize > 0) {
      return sizeFromAnchor(anchorSize);
    }
    if (isMobile) return SIZE.mobile;
    if (
      expanded &&
      Number.isFinite(viewportWidth) &&
      Number.isFinite(viewportHeight)
    ) {
      return sizeForFullscreen(viewportWidth, viewportHeight);
    }
    return SIZE.desktop;
  }, [isMobile, expanded, viewportWidth, viewportHeight, anchorSize]);
  const [mobileConstellationOpen, setMobileConstellationOpen] = useState(
    !isMobile
  );
  const [activeSkill, setActiveSkill] = useState(null);
  const [stageScale, setStageScale] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [keyCollected, setKeyCollected] = useState(false);
  const wrapRef = useRef(null);
  const labelRefs = useRef([]);
  const backSpokeRefs = useRef([]);
  const frontSpokeRefs = useRef([]);
  const backFlowRefs = useRef([]);
  const frontFlowRefs = useRef([]);
  const pingRefs = useRef([]);
  const angleRef = useRef(0);
  const activeSkillRef = useRef(null);
  activeSkillRef.current = activeSkill;
  const constellationOpen = isMobile ? mobileConstellationOpen : orbitActive;
  const showOrbitLayer = isMobile || constellationOpen;

  useEffect(() => {
    setKeyCollected(hasVaultKey());
    return subscribeVaultKey(setKeyCollected);
  }, []);

  const handleVaultKeyCollect = useCallback(() => {
    setKeyCollected((already) => {
      if (already) return already;
      playClick();
      pulseSkill();
      if (collectVaultKey()) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([12, 40, 18]);
        }
        return true;
      }
      return already;
    });
  }, []);

  const surfacePin = useMemo(
    () => ({
      ...SF_VAULT_KEY,
      collected: keyCollected,
      onCollect: handleVaultKeyCollect,
      glyph: "*",
    }),
    [keyCollected, handleVaultKeyCollect]
  );

  const discR = size.disc / 2;
  const orbitR = discR + size.orbitExtra;
  const rx = orbitR;
  const ry = orbitR * ELLIPSE_Y_RATIO;
  const boxW = Math.ceil(rx * 2) + size.padX;
  const boxH = Math.ceil(Math.max(discR * 2, ry * 2) + discR * 0.35) + size.padY;
  const cx = boxW / 2;
  const cy = boxH / 2;
  const n = skills.length;
  const pingGradId = `skills-ping-grad-${variant}`;

  useLayoutEffect(() => {
    if (!isMobile || !scrollRootSelector) return;
    const root =
      typeof document !== "undefined"
        ? document.querySelector(scrollRootSelector)
        : null;
    const el = wrapRef.current;
    if (!root || !el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        setMobileConstellationOpen(
          entry.isIntersecting && entry.intersectionRatio > 0.25
        );
      },
      { root, threshold: [0, 0.15, 0.25, 0.4] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isMobile, scrollRootSelector]);

  useLayoutEffect(() => {
    // Expanded desktop: always render at native size (parent grows to fit).
    // Fitting-to-container here undoes the expand, width animates up from the corner.
    if (!isMobile && expanded) {
      setStageScale(1);
      return undefined;
    }
    const el = wrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      const available = el.getBoundingClientRect().width;
      if (available <= 0) return;
      // Always fit the full orbit box so skill labels don't clip off-screen.
      setStageScale(Math.min(1, available / boxW));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [boxW, expanded, isMobile]);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Drive elliptical 3D orbit via RAF (DOM writes, no React re-render per frame).
  useEffect(() => {
    const paint = (baseAngle) => {
      for (let i = 0; i < n; i++) {
        const θ = baseAngle + (i / n) * Math.PI * 2;
        const { x, y, depth } = projectOrbit(θ, cx, cy, rx, ry);
        const rim = rimPoint(θ, cx, cy, discR + 5, ELLIPSE_Y_RATIO);
        const t = (depth + 1) / 2; // 0 back → 1 front
        const scale = 0.72 + t * 0.36;
        const opacity = 0.38 + t * 0.62;
        const inFront = depth >= 0;
        const z = inFront ? GLOBE_Z + 2 : 1;

        const label = labelRefs.current[i];
        if (label) {
          label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
          label.style.opacity = String(constellationOpen ? opacity : 0);
          label.style.zIndex = String(
            activeSkillRef.current === i ? GLOBE_Z + 3 : z
          );
          label.style.pointerEvents =
            constellationOpen && showGlobe ? "auto" : "none";
          label.dataset.depth = inFront ? "front" : "back";
        }

        const applySpoke = (line, flow, show) => {
          if (line) {
            line.setAttribute("x1", String(rim.x));
            line.setAttribute("y1", String(rim.y));
            line.setAttribute("x2", String(x));
            line.setAttribute("y2", String(y));
            line.setAttribute(
              "opacity",
              show && constellationOpen ? (inFront ? "0.7" : "0.35") : "0"
            );
          }
          if (flow) {
            flow.setAttribute("x1", String(rim.x));
            flow.setAttribute("y1", String(rim.y));
            flow.setAttribute("x2", String(x));
            flow.setAttribute("y2", String(y));
            flow.setAttribute(
              "opacity",
              show && constellationOpen ? (inFront ? "0.85" : "0.25") : "0"
            );
          }
        };

        applySpoke(
          backSpokeRefs.current[i],
          backFlowRefs.current[i],
          !inFront
        );
        applySpoke(
          frontSpokeRefs.current[i],
          frontFlowRefs.current[i],
          inFront
        );

        const ping = pingRefs.current[i];
        if (ping) {
          ping.setAttribute("cx", String(x));
          ping.setAttribute("cy", String(y));
          ping.setAttribute(
            "opacity",
            constellationOpen ? String(0.2 + t * 0.55) : "0"
          );
        }
      }
    };

    const startAngle = angleRef.current
      ? angleRef.current - Math.PI / 2
      : -Math.PI / 2;
    paint(startAngle);

    if (!constellationOpen || reduceMotion) {
      return undefined;
    }

    let raf = 0;
    let lastPaint = 0;
    let running = false;
    // Orbit labels don't need 60fps, saves main-thread time for the ASCII globe.
    const interval = expanded ? 1000 / 30 : 1000 / 18;
    const start =
      performance.now() - (angleRef.current / (Math.PI * 2)) * ORBIT_PERIOD_MS;

    const tick = (now) => {
      if (!running) return;
      if (document.hidden) {
        running = false;
        raf = 0;
        return;
      }
      if (now - lastPaint >= interval) {
        const turn = ((now - start) % ORBIT_PERIOD_MS) / ORBIT_PERIOD_MS;
        const baseAngle = turn * Math.PI * 2 - Math.PI / 2;
        angleRef.current = baseAngle + Math.PI / 2;
        paint(baseAngle);
        lastPaint = now;
      }
      raf = requestAnimationFrame(tick);
    };

    const begin = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const halt = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => {
      if (document.hidden) halt();
      else begin();
    };

    document.addEventListener("visibilitychange", onVisibility);
    begin();
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      halt();
    };
  }, [
    constellationOpen,
    reduceMotion,
    n,
    cx,
    cy,
    rx,
    ry,
    discR,
    expanded,
    showGlobe,
  ]);

  const ellipsePathOpacity = constellationOpen ? 0.55 : 0;

  return (
    <div
      ref={wrapRef}
      className={
        constellationOpen
          ? "skills-constellation skills-constellation--live skills-constellation--orbit3d"
          : "skills-constellation skills-constellation--orbit3d"
      }
      style={{
        position: "relative",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        paddingBottom: isMobile ? 6 : 2,
        pointerEvents: "none",
      }}
    >
      {isMobile ? (
        <OurHomeLabel
          fontSize={size.homeFont}
          margin="0 6px 10px"
        />
      ) : null}

      <div
        style={{
          position: "relative",
          width: boxW * stageScale,
          height: boxH * stageScale,
          margin: "0 auto",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "relative",
            width: boxW,
            height: boxH,
            transform: stageScale < 1 ? `scale(${stageScale})` : undefined,
            transformOrigin: "top left",
            overflow: "visible",
          }}
        >
          {showOrbitLayer ? (
          <>
          <svg
            aria-hidden
            width={boxW}
            height={boxH}
            viewBox={`0 0 ${boxW} ${boxH}`}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            <defs>
              <radialGradient id={pingGradId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 122, 41, 0.5)" />
                <stop offset="100%" stopColor="rgba(255, 122, 41, 0)" />
              </radialGradient>
            </defs>

            {showGlobe ? (
              <>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke="rgba(255, 122, 41, 0.22)"
                  strokeWidth={1}
                  strokeDasharray="4 8"
                  className="skills-range-ring"
                  opacity={ellipsePathOpacity}
                  style={{ transition: "opacity 0.4s ease" }}
                />
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx * 0.62}
                  ry={ry * 0.62}
                  fill="none"
                  stroke="rgba(255, 122, 41, 0.12)"
                  strokeWidth={1}
                  strokeDasharray="3 7"
                  className="skills-range-ring"
                  opacity={ellipsePathOpacity}
                  style={{ transition: "opacity 0.4s ease" }}
                />
              </>
            ) : null}

            {skills.map((_, i) => (
              <g key={`back-spoke-${i}`}>
                <line
                  ref={(el) => {
                    backSpokeRefs.current[i] = el;
                  }}
                  stroke="rgba(255, 122, 41, 0.28)"
                  strokeWidth={1}
                  opacity={0}
                />
                <line
                  ref={(el) => {
                    backFlowRefs.current[i] = el;
                  }}
                  className="skills-spoke-flow"
                  stroke="rgba(255, 180, 120, 0.55)"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  strokeDasharray="5 28"
                  style={{ ["--flow-delay"]: `${i * 0.28}s` }}
                  opacity={0}
                />
                <circle
                  ref={(el) => {
                    pingRefs.current[i] = el;
                  }}
                  className="skills-node-ping"
                  r={9}
                  fill={`url(#${pingGradId})`}
                  opacity={0}
                  style={{ ["--ping-delay"]: `${0.2 + i * 0.45}s` }}
                />
              </g>
            ))}
          </svg>

          {skills.map((skill, i) => {
            const isActive = activeSkill === i;
            const LabelTag = showGlobe ? "button" : "span";
            return (
              <div
                key={skill}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  opacity: 0,
                  pointerEvents: "none",
                  willChange: "transform, opacity",
                }}
              >
                <LabelTag
                  type={showGlobe ? "button" : undefined}
                  className={
                    showGlobe && constellationOpen
                      ? "skills-orbit-label skills-orbit-label--live"
                      : showGlobe
                        ? "skills-orbit-label"
                        : "skills-orbit-label skills-orbit-label--portrait-in"
                  }
                  aria-label={`Skill: ${skill}`}
                  onClick={
                    showGlobe
                      ? (e) => {
                          e.stopPropagation();
                          playClick();
                          pulseSkill();
                          setActiveSkill(i);
                        }
                      : undefined
                  }
                  style={{
                    display: "inline-block",
                    appearance: "none",
                    pointerEvents: showGlobe ? "auto" : "none",
                    fontFamily: "'VT323', monospace",
                    fontSize: size.labelFont,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: ACCENT,
                    textShadow: "0 0 8px rgba(255, 122, 41, 0.55)",
                    padding: showGlobe
                      ? `${size.labelPadY ?? 3}px ${size.labelPadX ?? 7}px`
                      : 0,
                    border: showGlobe
                      ? `1px solid rgba(255, 122, 41, ${isActive ? 0.9 : 0.5})`
                      : "none",
                    background: showGlobe
                      ? "rgba(12, 10, 8, 0.96)"
                      : "transparent",
                    borderRadius: showGlobe ? 2 : 0,
                    whiteSpace: "nowrap",
                    cursor: showGlobe ? "pointer" : "default",
                    boxShadow:
                      showGlobe && isActive
                        ? "0 0 16px rgba(255, 122, 41, 0.65)"
                        : "none",
                    ["--label-delay"]: `${i * 0.4}s`,
                    ["--label-in-delay"]: `${i * 38}ms`,
                  }}
                >
                  {skill}
                </LabelTag>
              </div>
            );
          })}
          </>
          ) : null}

          {showGlobe ? (
            <div
              className={
                isMobile
                  ? glow === "hover"
                    ? "skills-globe-disc skills-globe-halo skills-globe-halo--hover"
                    : "skills-globe-disc skills-globe-halo"
                  : "skills-globe-disc"
              }
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: GLOBE_Z,
                width: discR * 2,
                height: discR * 2,
                borderRadius: "50%",
                overflow: "hidden",
                background: "transparent",
                pointerEvents: "auto",
                boxShadow: "none",
                opacity: isMobile ? 1 : 0.44,
              }}
            >
              <InteractiveAsciiGlobe
                rows={size.globeRows}
                lowPower={size.lowPower}
                fillScale={1}
                spinSpeed={isMobile ? 1 : 0.55}
                ariaLabel="Decorative globe. Drag to rotate. Watch for a signal over SF."
                style={{ opacity: 1, pointerEvents: "auto" }}
                muted={!isMobile}
                surfacePin={surfacePin}
              />
            </div>
          ) : null}

          {showOrbitLayer ? (
          <svg
            aria-hidden
            width={boxW}
            height={boxH}
            viewBox={`0 0 ${boxW} ${boxH}`}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: GLOBE_Z + 1,
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            {skills.map((_, i) => (
              <g key={`front-spoke-${i}`}>
                <line
                  ref={(el) => {
                    frontSpokeRefs.current[i] = el;
                  }}
                  stroke="rgba(255, 122, 41, 0.4)"
                  strokeWidth={1.1}
                  opacity={0}
                />
                <line
                  ref={(el) => {
                    frontFlowRefs.current[i] = el;
                  }}
                  className="skills-spoke-flow"
                  stroke="rgba(255, 180, 120, 0.9)"
                  strokeWidth={1.35}
                  strokeLinecap="round"
                  strokeDasharray="5 28"
                  style={{ ["--flow-delay"]: `${i * 0.28}s` }}
                  opacity={0}
                />
              </g>
            ))}
          </svg>
          ) : null}
        </div>
      </div>

      {isMobile ? (
        <p
          style={{
            margin: "10px 8px 0",
            textAlign: "center",
            fontFamily: "'VT323', monospace",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255, 180, 112, 0.55)",
          }}
        >
          Drag to spin · look for a glow on the coast
        </p>
      ) : null}
    </div>
  );
}
