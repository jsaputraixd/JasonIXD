"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 90;
const REPEL_RADIUS = 140;
const REPEL_STRENGTH = 1.4;
const FRICTION = 0.93;
const MAX_METEORS = 2;
const METEOR_GAP_MIN_MS = 4200;
const METEOR_GAP_MAX_MS = 12000;

const GRADIENT =
  "radial-gradient(ellipse at 50% 35%, #1f1a2e 0%, #0e0c14 70%, #050405 100%)";

function nextMeteorDelay() {
  return METEOR_GAP_MIN_MS + Math.random() * (METEOR_GAP_MAX_MS - METEOR_GAP_MIN_MS);
}

function spawnMeteor(w, h) {
  // Mostly down-right streaks; occasional down-left for variety.
  const downRight = Math.random() < 0.72;
  const angle = downRight
    ? Math.PI * (0.18 + Math.random() * 0.22)
    : Math.PI * (0.78 + Math.random() * 0.18);
  const speed = 7.5 + Math.random() * 9;
  const len = 70 + Math.random() * 120;
  const startX = downRight
    ? -40 + Math.random() * w * 0.75
    : w * 0.25 + Math.random() * (w * 0.75 + 40);
  const startY = -30 - Math.random() * h * 0.25;

  return {
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    len,
    life: 1,
    decay: 0.0065 + Math.random() * 0.006,
    width: 1.1 + Math.random() * 1.6,
    color: Math.random() < 0.75 ? "255, 122, 41" : "255, 220, 180",
  };
}

export default function GlobalBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (coarse || reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    // desynchronized: let the browser composite without blocking the main thread as hard.
    const ctx =
      canvas.getContext("2d", { alpha: true, desynchronized: true }) ||
      canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeParticles = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const arr = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const orange = Math.random() < 0.45;
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1 + Math.random() * 2,
          speed: 0.2 + Math.random() * 0.6,
          vx: 0,
          vy: 0,
          baseOpacity: orange
            ? 0.25 + Math.random() * 0.25
            : 0.3 + Math.random() * 0.3,
          color: orange ? "255, 122, 41" : "255, 255, 255",
        });
      }
      return arr;
    };

    resize();
    let particles = makeParticles();
    /** @type {ReturnType<typeof spawnMeteor>[]} */
    let meteors = [];
    let nextMeteorAt = performance.now() + nextMeteorDelay() * 0.45;
    let running = false;

    const onResize = () => {
      resize();
      particles = makeParticles();
    };
    window.addEventListener("resize", onResize);

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);

    const draw = (now) => {
      if (!running) return;
      if (document.hidden) {
        running = false;
        rafRef.current = 0;
        return;
      }

      rafRef.current = requestAnimationFrame(draw);

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const m = mouseRef.current;
      for (const p of particles) {
        let vy = -p.speed + p.vy;
        let vx = p.vx;

        if (m.active) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_RADIUS && dist > 0.1) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx *= FRICTION;
        p.vy *= FRICTION;

        p.x += vx;
        p.y += vy;

        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
          p.vx = 0;
          p.vy = 0;
        }
        if (p.y > h + 6) p.y = -4;
        if (p.x < -8) p.x = w + 8;
        if (p.x > w + 8) p.x = -8;

        let alpha = p.baseOpacity;
        if (m.active) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_RADIUS) {
            alpha = Math.min(1, alpha + (1 - dist / REPEL_RADIUS) * 0.6);
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();
      }

      if (meteors.length < MAX_METEORS && now >= nextMeteorAt) {
        meteors.push(spawnMeteor(w, h));
        nextMeteorAt = now + nextMeteorDelay();
      }

      if (meteors.length > 0) {
        const alive = [];
        for (const meteor of meteors) {
          meteor.x += meteor.vx;
          meteor.y += meteor.vy;
          meteor.life -= meteor.decay;

          const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
          const tx = (meteor.vx / speed) * meteor.len;
          const ty = (meteor.vy / speed) * meteor.len;
          const x0 = meteor.x - tx;
          const y0 = meteor.y - ty;
          const fade = Math.max(0, Math.min(1, meteor.life));
          const head = Math.min(1, fade * 1.15);

          const grad = ctx.createLinearGradient(x0, y0, meteor.x, meteor.y);
          grad.addColorStop(0, `rgba(${meteor.color}, 0)`);
          grad.addColorStop(0.55, `rgba(${meteor.color}, ${0.22 * fade})`);
          grad.addColorStop(0.88, `rgba(${meteor.color}, ${0.55 * head})`);
          grad.addColorStop(1, `rgba(255, 245, 220, ${0.85 * head})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = meteor.width;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(meteor.x, meteor.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(meteor.x, meteor.y, meteor.width * 1.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 240, 210, ${0.7 * head})`;
          ctx.fill();

          const onScreen =
            meteor.x > -120 &&
            meteor.x < w + 120 &&
            meteor.y > -120 &&
            meteor.y < h + 120;
          if (meteor.life > 0 && onScreen) alive.push(meteor);
        }
        meteors = alive;
      }
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      rafRef.current = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: GRADIENT,
      }}
    >
      {/* Subtle dotted grid wallpaper */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255, 122, 41, 0.13) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0",
          opacity: 0.5,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
