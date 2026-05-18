"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 90;
const REPEL_RADIUS = 140;
const REPEL_STRENGTH = 1.4;
const FRICTION = 0.93;

const GRADIENT =
  "radial-gradient(ellipse at 50% 35%, #1f1a2e 0%, #0e0c14 70%, #050405 100%)";

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
    const ctx = canvas.getContext("2d");
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

    const draw = () => {
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
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
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
