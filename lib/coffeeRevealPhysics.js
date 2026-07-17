const GRAVITY = 2100;
const MAX_DURATION_MS = 4200;
const AIR_DRAG = 0.9;
const WALL_RESTITUTION = 0.66;
const FLOOR_RESTITUTION = 0.52;
const GROUND_FRICTION = 0.7;
const REST_SPEED = 26;
const THROW_SPEED = 1150;
const STATUS_BAR_CLEARANCE = 108;

/**
 * Fling the coffee out of the bin at a 45° up-and-to-the-left angle, then let
 * it bounce off the screen edges and floor with real restitution until it
 * settles. No snap to a target slot — it lands wherever the physics take it.
 * @param {{
 *   spawn: { left: number, top: number },
 *   bounds: { width: number, height: number, stageWidth: number, stageHeight: number },
 *   onFrame: (pos: { left: number, top: number }) => void,
 *   onComplete: (pos: { left: number, top: number }) => void,
 * }} options
 * @returns {() => void} cancel
 */
export function runCoffeeRevealPhysics({ spawn, bounds, onFrame, onComplete }) {
  let x = spawn.left;
  let y = spawn.top;

  const minLeft = 0;
  const maxLeft = Math.max(0, bounds.stageWidth - bounds.width);
  const minTop = 0;
  const maxTop = Math.max(
    0,
    bounds.stageHeight - bounds.height - STATUS_BAR_CLEARANCE
  );

  // 45° up and to the left.
  const angle = (Math.PI / 180) * 135; // measured from +x axis, pointing up-left
  let vx = Math.cos(angle) * THROW_SPEED;
  let vy = Math.sin(angle) * -THROW_SPEED; // screen y grows downward, so up is negative

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;
  let restedFrames = 0;

  const step = (now) => {
    const dt = Math.min(0.026, (now - last) / 1000);
    last = now;
    elapsed += dt * 1000;

    vy += GRAVITY * dt;

    const drag = Math.exp(-AIR_DRAG * dt);
    vx *= drag;
    vy *= drag;

    x += vx * dt;
    y += vy * dt;

    // Side walls.
    if (x <= minLeft) {
      x = minLeft;
      vx = Math.abs(vx) * WALL_RESTITUTION;
    } else if (x >= maxLeft) {
      x = maxLeft;
      vx = -Math.abs(vx) * WALL_RESTITUTION;
    }

    // Ceiling.
    if (y <= minTop) {
      y = minTop;
      vy = Math.abs(vy) * WALL_RESTITUTION;
    }

    // Floor.
    let onFloor = false;
    if (y >= maxTop) {
      y = maxTop;
      onFloor = true;
      if (vy > 0) {
        vy = -vy * FLOOR_RESTITUTION;
      }
      vx *= GROUND_FRICTION;
    }

    onFrame({ left: x, top: y });

    const speed = Math.hypot(vx, vy);
    if (onFloor && speed < REST_SPEED) {
      restedFrames += 1;
    } else {
      restedFrames = 0;
    }

    const settled = restedFrames >= 3;
    const timedOut = elapsed >= MAX_DURATION_MS;

    if (settled || timedOut) {
      const finalPos = { left: Math.round(x), top: Math.round(maxTop) };
      onFrame(finalPos);
      onComplete(finalPos);
      return;
    }

    raf = requestAnimationFrame(step);
  };

  onFrame({ left: x, top: y });
  raf = requestAnimationFrame(step);

  return () => cancelAnimationFrame(raf);
}
