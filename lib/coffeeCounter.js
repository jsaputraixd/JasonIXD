const STORAGE_KEY = "portfolio-coffee-count";
export const COFFEE_BASE_COUNT = 1247;
const TICK_MS = 30000;

/** @type {Set<(n: number) => void>} */
const listeners = new Set();

export function getCoffeeCount() {
  if (typeof window === "undefined") return COFFEE_BASE_COUNT;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw == null) {
    localStorage.setItem(STORAGE_KEY, String(COFFEE_BASE_COUNT));
    return COFFEE_BASE_COUNT;
  }
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : COFFEE_BASE_COUNT;
}

export function setCoffeeCount(n) {
  if (typeof window === "undefined") return n;
  const safe = Math.max(0, Math.floor(n));
  localStorage.setItem(STORAGE_KEY, String(safe));
  listeners.forEach((fn) => fn(safe));
  return safe;
}

export function incrementCoffeeCount(delta = 1) {
  return setCoffeeCount(getCoffeeCount() + delta);
}

export function formatCoffeeCount(n) {
  return n.toLocaleString("en-US");
}

/** Slow drip while the site is open (+1 every 30s). Returns cleanup. */
export function startCoffeeCounter(onUpdate) {
  if (typeof window === "undefined") return () => {};

  onUpdate?.(getCoffeeCount());
  listeners.add(onUpdate);

  const id = window.setInterval(() => {
    onUpdate?.(incrementCoffeeCount(1));
  }, TICK_MS);

  return () => {
    window.clearInterval(id);
    listeners.delete(onUpdate);
  };
}
