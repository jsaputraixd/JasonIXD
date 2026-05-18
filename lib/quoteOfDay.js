import { quotes } from "@/data/quotes";

/** Stable index for a calendar day (local timezone). */
function dayIndex(date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  let hash = (y * 372 + m * 31 + d) | 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d);
  hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b);
  hash ^= hash >>> 16;
  return Math.abs(hash) % quotes.length;
}

/** @param {Date} [date] */
export function getQuoteOfDay(date = new Date()) {
  return quotes[dayIndex(date)];
}
