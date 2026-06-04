import { clampIconPosition } from "@/lib/desktopIconPositions";

const GRAVITY = 1650;
const MAX_DURATION_MS = 2800;
const AIR_DRAG = 4.5;
const GROUND_FRICTION = 0.48;
const REST_SPEED = 28;
const REST_DISTANCE = 14;

/**
 * Pop coffee out of the bin, arc toward a landing slot, friction + small bounces — no snap.
 * @param {{
 *   spawn: { left: number, top: number },
 *   target: { left: number, top: number },
 *   bounds: { width: number, height: number, stageWidth: number, stageHeight: number },
 *   onFrame: (pos: { left: number, top: number }) => void,
 *   onComplete: (pos: { left: number, top: number }) => void,
 * }} options
 * @returns {() => void} cancel
 */
export function runCoffeeRevealPhysics({
  spawn,
  target,
  bounds,
  onFrame,
  onComplete,
}) {
  let x = spawn.left;
  let y = spawn.top;

  const dx = target.left - spawn.left;
  const dy = target.top - spawn.top;
  const dist = Math.max(40, Math.hypot(dx, dy));

  // Arc toward the slot beside the bin — not a flat slide across the desktop.
  let vx = (dx / dist) * 220;
  let vy = -Math.min(460, 300 + dist * 0.55);

  let bounces = 0;
  const maxBounces = 2;

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;

  const step = (now) => {
    const dt = Math.min(0.028, (now - last) / 1000);
    last = now;
    elapsed += dt * 1000;

    vy += GRAVITY * dt;
    x += vx * dt;
    y += vy * dt;

    const drag = Math.exp(-AIR_DRAG * dt);
    vx *= drag;
    vy *= drag;

    const clamped = clampIconPosition({
      left: x,
      top: y,
      width: bounds.width,
      height: bounds.height,
      stageWidth: bounds.stageWidth,
      stageHeight: bounds.stageHeight,
    });

    if (clamped.left !== x) {
      x = clamped.left;
      vx *= -0.18;
    }
    if (clamped.top !== y) {
      y = clamped.top;
      vy *= -0.18;
    }

    const nearSlot =
      Math.abs(x - target.left) < 36 && y >= target.top - 6;
    const falling = vy > 0;

    if (nearSlot && falling && bounces < maxBounces) {
      y = target.top;
      vy = -Math.abs(vy) * 0.22;
      vx *= GROUND_FRICTION;
      bounces += 1;
    }

    const frame = { left: x, top: y };
    onFrame(frame);

    const speed = Math.hypot(vx, vy);
    const distToTarget = Math.hypot(x - target.left, y - target.top);
    const settled = distToTarget < REST_DISTANCE && speed < REST_SPEED;
    const timedOut = elapsed >= MAX_DURATION_MS;

    if (settled || timedOut) {
      onComplete(frame);
      return;
    }

    raf = requestAnimationFrame(step);
  };

  onFrame({ left: x, top: y });
  raf = requestAnimationFrame(step);

  return () => cancelAnimationFrame(raf);
}
