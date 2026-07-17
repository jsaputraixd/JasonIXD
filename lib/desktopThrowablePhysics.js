import { clampIconPosition } from "@/lib/desktopIconPositions";

const GRAVITY = 2400;
const AIR_DRAG = 1.8;
const WALL_RESTITUTION = 0.62;
const FLOOR_RESTITUTION = 0.42;
const FLOOR_FRICTION = 0.68;
const GROUND_SLIDE_FRICTION = 0.88;
const MIN_BOUNCE_SPEED = 90;
const SETTLE_SPEED = 42;
const SETTLE_FRAMES = 10;
const MAX_DURATION_MS = 6000;
const STATUS_BAR_CLEARANCE = 108;

/**
 * @param {{ width: number, height: number, stageWidth: number, stageHeight: number }} bounds
 */
function clampToStage(left, top, bounds) {
  return clampIconPosition({
    left,
    top,
    width: bounds.width,
    height: bounds.height,
    stageWidth: bounds.stageWidth,
    stageHeight: bounds.stageHeight,
    statusBarClearance: STATUS_BAR_CLEARANCE,
  });
}

/**
 * Playful desktop physics — gravity, bounces, spin. No snap-to-target.
 * @param {{
 *   left: number,
 *   top: number,
 *   vx: number,
 *   vy: number,
 *   rotation?: number,
 *   angularVelocity?: number,
 *   bounds: { width: number, height: number, stageWidth: number, stageHeight: number },
 *   onFrame: (frame: { left: number, top: number, rotation: number, vx: number, vy: number }) => void,
 *   onSettle: (frame: { left: number, top: number, rotation: number }) => void,
 * }} options
 * @returns {() => void}
 */
export function runThrowablePhysics({
  left,
  top,
  vx,
  vy,
  rotation = 0,
  angularVelocity = 0,
  bounds,
  onFrame,
  onSettle,
}) {
  let x = left;
  let y = top;
  let rvx = vx;
  let rvy = vy;
  let rot = rotation;
  let spin = angularVelocity;

  const maxLeft = Math.max(0, bounds.stageWidth - bounds.width);
  const maxTop = Math.max(0, bounds.stageHeight - bounds.height - STATUS_BAR_CLEARANCE);

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;
  let settleCount = 0;
  let onFloor = false;

  const step = (now) => {
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    elapsed += dt * 1000;

    rvy += GRAVITY * dt;

    const drag = Math.exp(-AIR_DRAG * dt);
    rvx *= drag;
    rvy *= drag;

    x += rvx * dt;
    y += rvy * dt;
    rot += spin * dt;
    spin *= Math.exp(-2.8 * dt);

    onFloor = false;

    if (x <= 0) {
      x = 0;
      if (Math.abs(rvx) > MIN_BOUNCE_SPEED * 0.5) {
        rvx = Math.abs(rvx) * WALL_RESTITUTION;
        spin += rvx * 0.004;
      } else {
        rvx = 0;
      }
    } else if (x >= maxLeft) {
      x = maxLeft;
      if (Math.abs(rvx) > MIN_BOUNCE_SPEED * 0.5) {
        rvx = -Math.abs(rvx) * WALL_RESTITUTION;
        spin -= rvx * 0.004;
      } else {
        rvx = 0;
      }
    }

    if (y <= 0) {
      y = 0;
      if (Math.abs(rvy) > MIN_BOUNCE_SPEED * 0.5) {
        rvy = Math.abs(rvy) * WALL_RESTITUTION;
      } else {
        rvy = 0;
      }
    } else if (y >= maxTop) {
      y = maxTop;
      onFloor = true;
      if (Math.abs(rvy) > MIN_BOUNCE_SPEED) {
        rvy = -Math.abs(rvy) * FLOOR_RESTITUTION;
        rvx *= FLOOR_FRICTION;
        spin += rvx * 0.005;
      } else {
        rvy = 0;
        rvx *= GROUND_SLIDE_FRICTION;
        if (Math.abs(rvx) < 8) rvx = 0;
      }
    }

    const frame = { left: x, top: y, rotation: rot, vx: rvx, vy: rvy };
    onFrame(frame);

    const speed = Math.hypot(rvx, rvy);
    if (onFloor && speed < SETTLE_SPEED) {
      settleCount += 1;
    } else {
      settleCount = 0;
    }

    if (settleCount >= SETTLE_FRAMES || elapsed >= MAX_DURATION_MS) {
      const settled = clampToStage(x, y, bounds);
      onSettle({ left: settled.left, top: settled.top, rotation: rot });
      return;
    }

    raf = requestAnimationFrame(step);
  };

  onFrame({ left: x, top: y, rotation: rot, vx: rvx, vy: rvy });
  raf = requestAnimationFrame(step);

  return () => cancelAnimationFrame(raf);
}

/** Spawn point inside the bin opening. */
export function getBinSpawnPosition({ binLeft, binTop, binWidth, cupWidth, cupHeight }) {
  return {
    left: Math.round(binLeft + binWidth * 0.5 - cupWidth * 0.5),
    top: Math.round(binTop + cupHeight * 0.28),
  };
}

/** Initial velocity for ejecting the cup out of the recycle bin at a 45° up-left angle. */
export function getBinEjectVelocity() {
  const speed = 820 + (Math.random() - 0.5) * 80;
  const angle = (45 + (Math.random() - 0.5) * 6) * (Math.PI / 180);
  return {
    vx: -Math.cos(angle) * speed,
    vy: -Math.sin(angle) * speed,
    angularVelocity: -10 + (Math.random() - 0.5) * 18,
  };
}

const THROW_POWER = 1.05;
const MAX_THROW_SPEED = 1800;

/**
 * Derive throw velocity from recent pointer samples.
 * @param {{ x: number, y: number, t: number }[]} samples
 */
export function velocityFromPointerSamples(samples) {
  if (samples.length < 2) return { vx: 0, vy: 0 };

  const newest = samples[samples.length - 1];
  let oldest = samples[0];
  for (let i = samples.length - 2; i >= 0; i -= 1) {
    if (newest.t - samples[i].t >= 60) {
      oldest = samples[i];
      break;
    }
  }

  const dt = (newest.t - oldest.t) / 1000;
  if (dt < 0.012) return { vx: 0, vy: 0 };

  let vx = ((newest.x - oldest.x) / dt) * THROW_POWER;
  let vy = ((newest.y - oldest.y) / dt) * THROW_POWER;

  const speed = Math.hypot(vx, vy);
  if (speed > MAX_THROW_SPEED) {
    const scale = MAX_THROW_SPEED / speed;
    vx *= scale;
    vy *= scale;
  }

  return { vx, vy };
}
