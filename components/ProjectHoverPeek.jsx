"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { projectCardRoleSummary } from "@/lib/projectCardMeta";

const ACCENT = "#FF7A29";
const EASE = [0.16, 1, 0.3, 1];
const GAP = 14;
const FOLLOW_X = 0.05;
const FOLLOW_Y = 0.16;
const LERP = 0.18;
const LEAVE_MS = 140;
const PEEK_W = 400;

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function peekSize(layoutScale) {
  const s = layoutScale;
  return {
    width: Math.round(PEEK_W * Math.min(1, Math.max(0.88, s))),
    title: Math.max(14, Math.round(16 * s)),
    body: Math.max(15, Math.round(16 * s)),
    tags: Math.max(12, Math.round(13 * s)),
    pad: Math.max(12, Math.round(14 * s)),
  };
}

function targetAboveCard(rect, cursor, width, height, vw, vh) {
  const followX = clamp(
    (cursor.x - (rect.left + rect.width / 2)) * FOLLOW_X,
    -12,
    12
  );
  const followY = clamp(
    (cursor.y - (rect.top + rect.height / 2)) * FOLLOW_Y,
    -10,
    10
  );

  let x = rect.left + (rect.width - width) / 2 + followX;
  let y = rect.top - GAP - height + followY;

  if (y < 10) {
    return targetBesideCard(rect, cursor, width, height, vw, vh);
  }

  x = clamp(x, 10, Math.max(10, vw - width - 10));
  y = clamp(y, 10, Math.max(10, vh - height - 10));

  return { x, y, placeRight: true, fromAbove: true };
}

function targetBesideCard(rect, cursor, width, height, vw, vh) {
  const spaceRight = vw - rect.right;
  const spaceLeft = rect.left;
  const placeRight = spaceRight >= width + GAP || spaceRight >= spaceLeft;

  const followX = clamp(
    (cursor.x - (rect.left + rect.width / 2)) * FOLLOW_X,
    -10,
    10
  );
  const followY = clamp(
    (cursor.y - (rect.top + rect.height / 2)) * FOLLOW_Y,
    -22,
    22
  );

  let x = placeRight
    ? rect.right + GAP + followX
    : rect.left - GAP - width + followX;
  let y = rect.top + (rect.height - height) / 2 + followY;

  x = clamp(x, 10, Math.max(10, vw - width - 10));
  y = clamp(y, 10, Math.max(10, vh - height - 10));

  return { x, y, placeRight };
}

export default function ProjectHoverPeek({
  projects,
  enabled = true,
  layoutScale = 1,
  focusSlugs,
  dismissEpoch = 0,
}) {
  const reduceMotion = useReducedMotion();
  const size = peekSize(layoutScale);
  const bySlug = useMemo(() => {
    const map = new Map();
    for (const p of projects ?? []) map.set(p.slug, p);
    return map;
  }, [projects]);

  const [slug, setSlug] = useState(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const boxRef = useRef(null);
  const displayed = useRef({ x: 0, y: 0, ready: false });
  const target = useRef({ x: 0, y: 0, placeRight: true });
  const originRef = useRef("left center");
  const rafRef = useRef(0);
  const leaveTimer = useRef(0);
  const slugRef = useRef(null);
  const openRef = useRef(false);
  slugRef.current = slug;
  openRef.current = open;
  const focusSlugsRef = useRef(focusSlugs);
  focusSlugsRef.current = focusSlugs;

  const project = slug ? bySlug.get(slug) : null;
  const line = project?.cardLine || project?.tagline || "";
  const role =
    project?.caseStudyRich?.scan?.role ||
    projectCardRoleSummary(project?.caseStudyRich?.overview?.role);
  const tags = (project?.tags || []).slice(0, 3).join(" · ");

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;
    if (window.matchMedia("(pointer: coarse)").matches) return undefined;

    const measureHeight = () =>
      boxRef.current?.offsetHeight || Math.round(148 * layoutScale);

    const closeNow = () => {
      if (leaveTimer.current) {
        window.clearTimeout(leaveTimer.current);
        leaveTimer.current = 0;
      }
      setOpen(false);
      setSlug(null);
      displayed.current.ready = false;
    };

    const scheduleLeave = (nextSlug) => {
      const focus = Boolean(nextSlug && focusSlugsRef.current?.has(nextSlug));
      if (focus) {
        closeNow();
        return;
      }
      if (leaveTimer.current) return;
      leaveTimer.current = window.setTimeout(() => {
        leaveTimer.current = 0;
        closeNow();
      }, LEAVE_MS);
    };

    const hitFromPoint = (x, y) => {
      const el = document.elementFromPoint(x, y);
      if (!(el instanceof Element)) return null;
      const hit = el.closest("[data-project-slug]");
      if (!hit || hit.getAttribute("data-peek") === "off") return null;
      const next = hit.getAttribute("data-project-slug");
      if (!next || !bySlug.has(next)) return null;
      return hit;
    };

    const openFromHit = (hit, clientX, clientY) => {
      const next = hit.getAttribute("data-project-slug");
      if (leaveTimer.current) {
        window.clearTimeout(leaveTimer.current);
        leaveTimer.current = 0;
      }

      const rect = hit.getBoundingClientRect();
      const preferAbove = hit.getAttribute("data-peek-placement") === "above";
      const nextTarget = preferAbove
        ? targetAboveCard(
            rect,
            { x: clientX, y: clientY },
            size.width,
            measureHeight(),
            window.innerWidth,
            window.innerHeight
          )
        : targetBesideCard(
            rect,
            { x: clientX, y: clientY },
            size.width,
            measureHeight(),
            window.innerWidth,
            window.innerHeight
          );
      target.current = nextTarget;
      originRef.current = nextTarget.fromAbove
        ? "bottom center"
        : nextTarget.placeRight
          ? "left center"
          : "right center";

      if (slugRef.current !== next) {
        setSlug(next);
        setOpen(true);
      } else if (!openRef.current) {
        setOpen(true);
      }
    };

    const onPointerMove = (e) => {
      const hit = hitFromPoint(e.clientX, e.clientY);
      if (!hit) {
        scheduleLeave(slugRef.current);
        return;
      }
      openFromHit(hit, e.clientX, e.clientY);
    };

    const onPointerOut = (e) => {
      const from =
        e.target instanceof Element
          ? e.target.closest("[data-project-slug]")
          : null;
      if (!from) return;
      const to =
        e.relatedTarget instanceof Element
          ? e.relatedTarget.closest("[data-project-slug]")
          : null;
      if (from === to) return;
      // Hit-test the event point. A stale in-bounds sample would keep zoom stuck.
      const still = hitFromPoint(e.clientX, e.clientY);
      if (still) {
        openFromHit(still, e.clientX, e.clientY);
        return;
      }
      scheduleLeave(from.getAttribute("data-project-slug"));
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut);
    window.addEventListener("blur", closeNow);
    document.documentElement.addEventListener("mouseleave", closeNow);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", closeNow);
      document.documentElement.removeEventListener("mouseleave", closeNow);
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, [enabled, bySlug, layoutScale, size.width]);

  useEffect(() => {
    if (!dismissEpoch) return;
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = 0;
    }
    setOpen(false);
    setSlug(null);
    displayed.current.ready = false;
  }, [dismissEpoch]);

  useEffect(() => {
    if (!open || reduceMotion) {
      const node = wrapRef.current;
      if (node && target.current) {
        node.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0)`;
      }
      return undefined;
    }

    let running = true;
    const tick = () => {
      if (!running) return;
      const node = wrapRef.current;
      const t = target.current;
      const d = displayed.current;
      if (node) {
        if (!d.ready) {
          d.x = t.x;
          d.y = t.y;
          d.ready = true;
        } else {
          d.x += (t.x - d.x) * LERP;
          d.y += (t.y - d.y) * LERP;
        }
        node.style.transform = `translate3d(${d.x}px, ${d.y}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, reduceMotion]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {open && project ? (
        <div
          ref={wrapRef}
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 240,
            width: size.width,
            pointerEvents: "none",
            willChange: "transform",
          }}
        >
          <motion.div
            ref={boxRef}
            initial={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.92 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0, scale: 1 }
                : { opacity: 0, scale: 0.94 }
            }
            transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: EASE }}
            style={{
              transformOrigin: originRef.current,
              background: "rgba(18, 12, 8, 0.96)",
              border: "1px solid rgba(255, 122, 41, 0.58)",
              borderRadius: 3,
              boxShadow:
                "0 0 22px rgba(255, 122, 41, 0.16), 0 18px 40px rgba(0, 0, 0, 0.55)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "5px 10px",
                background:
                  "linear-gradient(to bottom, rgba(255, 122, 41, 0.2), rgba(255, 122, 41, 0.08))",
                borderBottom: "1px solid rgba(255, 122, 41, 0.45)",
                fontFamily: "'VT323', monospace",
                fontSize: size.title,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: ACCENT,
                textShadow: "0 0 6px rgba(255, 122, 41, 0.5)",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {project.title}
              </span>
            </div>
            <div style={{ padding: size.pad }}>
              {line ? (
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: size.body,
                    lineHeight: 1.45,
                    color: "rgba(255, 226, 200, 0.92)",
                  }}
                >
                  {line}
                </p>
              ) : null}
              {role ? (
                <p
                  style={{
                    margin: line ? "8px 0 0" : 0,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: size.body,
                    lineHeight: 1.4,
                    color: "#FFB570",
                  }}
                >
                  {role}
                </p>
              ) : null}
              {tags ? (
                <p
                  style={{
                    margin: line || role ? "8px 0 0" : 0,
                    fontFamily: "'VT323', monospace",
                    fontSize: size.tags,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#FF9F5A",
                    textShadow: "0 0 6px rgba(255, 122, 41, 0.35)",
                  }}
                >
                  {tags}
                </p>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
